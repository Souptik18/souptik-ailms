import {
  getCookieOptions,
  HEARTBEAT_MIN_INTERVAL_MS,
  SESSION_COOKIE_NAME,
} from '../../server/config.js'
import { getAdminAuth } from '../../server/firebaseAdmin.js'
import { createSession, deleteSession, getSession, resolveUserRole, touchSession } from '../../server/sessionStore.js'

const cookieOptions = getCookieOptions()

function buildCookie(name, value, options = {}) {
  const attributes = [`${name}=${value}`]

  if (options.path) attributes.push(`Path=${options.path}`)
  if (typeof options.maxAge === 'number') attributes.push(`Max-Age=${Math.floor(options.maxAge / 1000)}`)
  if (options.httpOnly) attributes.push('HttpOnly')
  if (options.secure) attributes.push('Secure')
  if (options.sameSite) attributes.push(`SameSite=${options.sameSite}`)

  return attributes.join('; ')
}

function clearSessionCookieValue() {
  return `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=${cookieOptions.sameSite}${cookieOptions.secure ? '; Secure' : ''}`
}

function setSessionCookieValue(sessionId) {
  return buildCookie(SESSION_COOKIE_NAME, sessionId, cookieOptions)
}

function normalizeHeaders(headers = {}) {
  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]),
  )
}

function parseCookies(headers = {}) {
  const cookieHeader = headers.cookie || ''
  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separatorIndex = part.indexOf('=')
        if (separatorIndex === -1) return [part, '']
        return [part.slice(0, separatorIndex), decodeURIComponent(part.slice(separatorIndex + 1))]
      }),
  )
}

function createRequestContext(event) {
  const headers = normalizeHeaders(event.headers)

  return {
    headers,
    cookies: parseCookies(headers),
  }
}

function json(statusCode, body, extra = {}) {
  const setCookieValues = extra.multiValueHeaders?.['Set-Cookie']
  const setCookieHeader = Array.isArray(setCookieValues) && setCookieValues.length > 0
    ? setCookieValues[0]
    : undefined

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      ...(setCookieHeader ? { 'Set-Cookie': setCookieHeader } : {}),
      ...extra.headers,
    },
    ...(extra.multiValueHeaders ? { multiValueHeaders: extra.multiValueHeaders } : {}),
    body: JSON.stringify(body),
  }
}

export async function readAuthenticatedSession(event) {
  const request = createRequestContext(event)
  const sessionId = request.cookies?.[SESSION_COOKIE_NAME]
  if (!sessionId) {
    return { request, session: null, clearCookie: false }
  }

  const session = await getSession(sessionId, request)
  if (!session || !session.role) {
    await deleteSession(sessionId)
    return { request, session: null, clearCookie: true }
  }

  return { request, session, clearCookie: false }
}

export async function handleSessionLogin(event) {
  try {
    const { idToken, role } = JSON.parse(event.body || '{}')
    if (!idToken || typeof idToken !== 'string') {
      return json(400, { error: 'idToken is required.' })
    }

    const request = createRequestContext(event)
    const decodedToken = await getAdminAuth().verifyIdToken(idToken, true)
    const resolvedRole = await resolveUserRole(decodedToken.uid, role)
    const { sessionId, user } = await createSession({
      request,
      uid: decodedToken.uid,
      email: decodedToken.email ?? null,
      role: resolvedRole,
    })

    return json(200, { user }, {
      multiValueHeaders: {
        'Set-Cookie': [setSessionCookieValue(sessionId)],
      },
    })
  } catch (error) {
    return json(401, {
      error: error instanceof Error ? error.message : 'Authentication failed.',
    })
  }
}

export async function handleSessionMe(event) {
  try {
    const { session, clearCookie } = await readAuthenticatedSession(event)
    if (!session) {
      return json(401, { authenticated: false }, clearCookie
        ? { multiValueHeaders: { 'Set-Cookie': [clearSessionCookieValue()] } }
        : {})
    }

    return json(200, {
      authenticated: true,
      user: {
        uid: session.uid,
        email: session.email,
        role: session.role,
      },
    })
  } catch {
    return json(500, { error: 'Unable to read session.' })
  }
}

export async function handleSessionHeartbeat(event) {
  try {
    const { request, session, clearCookie } = await readAuthenticatedSession(event)
    if (!session) {
      return json(401, { authenticated: false }, clearCookie
        ? { multiValueHeaders: { 'Set-Cookie': [clearSessionCookieValue()] } }
        : {})
    }

    if (Date.now() - session.lastActivityAt < HEARTBEAT_MIN_INTERVAL_MS) {
      return json(200, { ok: true, skipped: true })
    }

    const refreshedSession = await touchSession(session, request)
    if (!refreshedSession) {
      return json(401, { authenticated: false }, {
        multiValueHeaders: {
          'Set-Cookie': [clearSessionCookieValue()],
        },
      })
    }

    return json(200, { ok: true }, refreshedSession.sessionId !== session.sessionId
      ? {
          multiValueHeaders: {
            'Set-Cookie': [setSessionCookieValue(refreshedSession.sessionId)],
          },
        }
      : {})
  } catch {
    return json(500, { error: 'Unable to refresh session.' })
  }
}

export async function handleSessionLogout(event) {
  try {
    const request = createRequestContext(event)
    const sessionId = request.cookies?.[SESSION_COOKIE_NAME]
    if (sessionId) {
      await deleteSession(sessionId)
    }

    return json(200, { ok: true }, {
      multiValueHeaders: {
        'Set-Cookie': [clearSessionCookieValue()],
      },
    })
  } catch {
    return json(500, { error: 'Unable to end session.' })
  }
}
