import {
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { auth, googleProvider } from './config'

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '')
const SESSION_API_BASE = API_BASE_URL ? `${API_BASE_URL}/api/session` : '/api/session'
const HEALTH_ENDPOINT = API_BASE_URL ? `${API_BASE_URL}/api/health` : '/api/health'

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

async function fetchSession(path, options = {}) {
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

export async function initializeAuthPersistence() {
  await setPersistence(auth, browserSessionPersistence)
}

export async function warmSessionApi() {
  try {
    await fetch(HEALTH_ENDPOINT, { method: 'GET', credentials: 'include' })
  } catch {
    // Ignore warmup failures; fetchSession has retry logic for cold starts.
  }
}

export async function signInWithGoogle(role) {
  await initializeAuthPersistence()
  const credential = await signInWithPopup(auth, googleProvider)
  return exchangeFirebaseSession(credential.user, role)
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
