import {
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getRedirectResult,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth'
import { auth, googleProvider } from './config'

const GOOGLE_REDIRECT_ROLE_KEY = 'kiitx-google-redirect-role'
const GOOGLE_REDIRECT_MODE_KEY = 'kiitx-google-redirect-mode'
const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '')
const shouldUseLocalApi =
  import.meta.env.DEV
  && typeof window !== 'undefined'
  && ['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname)
  && import.meta.env.VITE_FORCE_REMOTE_API !== 'true'
const ACTIVE_API_BASE_URL = shouldUseLocalApi ? '' : API_BASE_URL
const SESSION_API_BASE = ACTIVE_API_BASE_URL ? `${ACTIVE_API_BASE_URL}/api/session` : '/api/session'
const HEALTH_ENDPOINT = ACTIVE_API_BASE_URL ? `${ACTIVE_API_BASE_URL}/api/health` : '/api/health'
let sessionApiReachable = true

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

async function fetchSession(path, options = {}) {
  if (!sessionApiReachable && typeof navigator !== 'undefined' && navigator.onLine === false) {
    if (path === '/me') {
      return { authenticated: false, user: null }
    }
    if (path === '/logout') {
      return { success: true }
    }
  }

  const retryDelaysMs = [1200, 2200, 3500]
  let attempt = 0
  let lastError = null

  while (attempt <= retryDelaysMs.length) {
    try {
      const response = await fetch(`${SESSION_API_BASE}${path}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers ?? {}),
        },
        ...options,
      })
      sessionApiReachable = true

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        const error = new Error(payload.error || 'Session request failed.')
        error.status = response.status

        const shouldRetry = response.status >= 500
        if (!shouldRetry || attempt >= retryDelaysMs.length) {
          throw error
        }

        lastError = error
        await wait(retryDelaysMs[attempt])
        attempt += 1
        continue
      }

      return payload
    } catch (error) {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        sessionApiReachable = false
      }
      const shouldRetry = !('status' in (error ?? {}))
      if (!shouldRetry || attempt >= retryDelaysMs.length) {
        throw error
      }
      lastError = error
      await wait(retryDelaysMs[attempt])
      attempt += 1
    }
  }

  if (lastError) throw lastError
  throw new Error('Session request failed.')
}

async function exchangeFirebaseSession(user, role) {
  const idToken = await user.getIdToken(true)
  const payload = await fetchSession('/login', {
    method: 'POST',
    body: JSON.stringify({ idToken, role }),
  })

  await signOut(auth)
  return payload
}

function getStoredGoogleRedirectRole() {
  if (typeof window === 'undefined') return 'student'
  return window.sessionStorage.getItem(GOOGLE_REDIRECT_ROLE_KEY) || 'student'
}

function getStoredGoogleRedirectMode() {
  if (typeof window === 'undefined') return 'login'
  return window.sessionStorage.getItem(GOOGLE_REDIRECT_MODE_KEY) || 'login'
}

function storeGoogleRedirectState(role, mode) {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(GOOGLE_REDIRECT_ROLE_KEY, role || 'student')
  window.sessionStorage.setItem(GOOGLE_REDIRECT_MODE_KEY, mode || 'login')
}

function clearGoogleRedirectState() {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(GOOGLE_REDIRECT_ROLE_KEY)
  window.sessionStorage.removeItem(GOOGLE_REDIRECT_MODE_KEY)
}

export async function initializeAuthPersistence() {
  await setPersistence(auth, browserSessionPersistence)
}

export async function warmSessionApi() {
  try {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      sessionApiReachable = false
      return
    }

    await fetch(HEALTH_ENDPOINT, { method: 'GET', credentials: 'include' })
    sessionApiReachable = true
  } catch {
    sessionApiReachable = false
  }
}

export async function signInWithGoogle(role, mode = 'login') {
  await initializeAuthPersistence()

  try {
    const credential = await signInWithPopup(auth, googleProvider)
    return exchangeFirebaseSession(credential.user, role)
  } catch (error) {
    const code = String(error?.code ?? '')
    const shouldFallbackToRedirect =
      code.includes('popup-blocked')
      || code.includes('operation-not-supported-in-this-environment')

    if (!shouldFallbackToRedirect) {
      throw error
    }

    storeGoogleRedirectState(role, mode)
    await signInWithRedirect(auth, googleProvider)
    return { pendingRedirect: true }
  }
}

export async function consumeGoogleRedirectSession() {
  await initializeAuthPersistence()
  const credential = await getRedirectResult(auth)
  if (!credential?.user) return null

  const authMode = getStoredGoogleRedirectMode()
  try {
    const session = await exchangeFirebaseSession(credential.user, getStoredGoogleRedirectRole())
    return { ...session, authMode }
  } finally {
    clearGoogleRedirectState()
  }
}

export async function signUpWithEmail(email, password, role) {
  await initializeAuthPersistence()
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  return exchangeFirebaseSession(credential.user, role)
}

export async function signInWithEmail(email, password, role) {
  await initializeAuthPersistence()
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return exchangeFirebaseSession(credential.user, role)
}

export async function getCurrentSession() {
  return fetchSession('/me', { method: 'GET' })
}

export async function heartbeatSession() {
  return fetchSession('/heartbeat', { method: 'POST', body: JSON.stringify({}) })
}

export async function logoutUser() {
  await signOut(auth).catch(() => {})
  return fetchSession('/logout', { method: 'POST', body: JSON.stringify({}) })
}
