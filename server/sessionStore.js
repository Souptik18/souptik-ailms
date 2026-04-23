import crypto from 'node:crypto'
import {
  SESSION_ABSOLUTE_LIMIT_MS,
  SESSION_INACTIVITY_LIMIT_MS,
  SESSION_ROTATION_INTERVAL_MS,
  getSessionSigningSecret,
} from './config.js'

const ALLOWED_ROLES = new Set(['student', 'instructor', 'admin'])

function sanitizeRole(role) {
  return ALLOWED_ROLES.has(role) ? role : null
}

function fingerprintValue(request) {
  const userAgent = String(request.headers['user-agent'] || '').trim().toLowerCase()
  const acceptLanguage = String(request.headers['accept-language'] || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 2)
    .join(',')

  const source = [userAgent, acceptLanguage].join('|')

  return crypto.createHash('sha256').update(source).digest('hex')
}

function encodePayload(payload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

function decodePayload(value) {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'))
}

function signValue(value) {
  return crypto.createHmac('sha256', getSessionSigningSecret()).update(value).digest('base64url')
}

function createSignedSession(payload) {
  const encodedPayload = encodePayload(payload)
  const signature = signValue(encodedPayload)
  return `${encodedPayload}.${signature}`
}

function parseSignedSession(sessionId) {
  if (!sessionId || typeof sessionId !== 'string') return null

  const separatorIndex = sessionId.lastIndexOf('.')
  if (separatorIndex <= 0) return null

  const encodedPayload = sessionId.slice(0, separatorIndex)
  const providedSignature = sessionId.slice(separatorIndex + 1)
  const expectedSignature = signValue(encodedPayload)

  const providedBuffer = Buffer.from(providedSignature)
  const expectedBuffer = Buffer.from(expectedSignature)
  if (
    providedBuffer.length !== expectedBuffer.length
    || !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null
  }

  try {
    return decodePayload(encodedPayload)
  } catch {
    return null
  }
}

function validateSessionLifetime(session) {
  const now = Date.now()
  const createdAtMs = Number(session?.createdAtMs ?? 0)
  const lastActivityAt = Number(session?.lastActivityAt ?? 0)

  if (!createdAtMs || !lastActivityAt) {
    return { valid: false, now }
  }

  if (now - createdAtMs > SESSION_ABSOLUTE_LIMIT_MS) {
    return { valid: false, now }
  }

  if (now - lastActivityAt > SESSION_INACTIVITY_LIMIT_MS) {
    return { valid: false, now }
  }

  return { valid: true, now }
}

function buildSessionPayload({ request, uid, email = null, role, createdAtMs, rotatedAtMs, lastActivityAt }) {
  const issuedAt = Date.now()

  return {
    uid,
    email,
    role,
    fingerprint: fingerprintValue(request),
    createdAtMs: createdAtMs ?? issuedAt,
    rotatedAtMs: rotatedAtMs ?? issuedAt,
    lastActivityAt: lastActivityAt ?? issuedAt,
  }
}

export async function resolveUserRole(_uid, requestedRole) {
  const nextRole = sanitizeRole(requestedRole)
  if (!nextRole) {
    throw new Error('A valid role is required.')
  }

  return nextRole
}

export async function createSession({ request, uid, email = null, role }) {
  const payload = buildSessionPayload({ request, uid, email, role })
  const sessionId = createSignedSession(payload)

  return {
    sessionId,
    user: {
      uid,
      email,
      role,
    },
  }
}

export async function getSession(sessionId, request) {
  const session = parseSignedSession(sessionId)
  if (!session) return null

  const lifetime = validateSessionLifetime(session)
  if (!lifetime.valid) {
    return null
  }

  const role = sanitizeRole(session.role)
  const fingerprint = fingerprintValue(request)
  if (!role || session.fingerprint !== fingerprint) {
    return null
  }

  return {
    sessionId,
    uid: session.uid,
    email: session.email ?? null,
    role,
    lastActivityAt: Number(session.lastActivityAt),
    createdAtMs: Number(session.createdAtMs),
    rotatedAtMs: Number(session.rotatedAtMs ?? session.createdAtMs),
  }
}

export async function rotateSession(session, request) {
  if (!session?.uid || !session?.role) return null

  const now = Date.now()
  const payload = buildSessionPayload({
    request,
    uid: session.uid,
    email: session.email ?? null,
    role: session.role,
    createdAtMs: session.createdAtMs,
    rotatedAtMs: now,
    lastActivityAt: now,
  })

  return {
    sessionId: createSignedSession(payload),
    uid: session.uid,
    email: session.email ?? null,
    role: session.role,
    createdAtMs: session.createdAtMs,
    rotatedAtMs: now,
    lastActivityAt: now,
  }
}

export async function touchSession(session, request) {
  if (!session?.sessionId) return null

  const currentSession = await getSession(session.sessionId, request)
  if (!currentSession) return null

  const now = Date.now()

  if (now - currentSession.rotatedAtMs >= SESSION_ROTATION_INTERVAL_MS) {
    return rotateSession(currentSession, request)
  }

  const payload = buildSessionPayload({
    request,
    uid: currentSession.uid,
    email: currentSession.email,
    role: currentSession.role,
    createdAtMs: currentSession.createdAtMs,
    rotatedAtMs: currentSession.rotatedAtMs,
    lastActivityAt: now,
  })

  return {
    ...currentSession,
    sessionId: createSignedSession(payload),
    lastActivityAt: now,
  }
}

export async function deleteSession(_sessionId) {}
