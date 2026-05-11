import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

function loadServerEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env.server')

  if (!fs.existsSync(envPath)) return

  const raw = fs.readFileSync(envPath, 'utf8')
  const lines = raw.split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex <= 0) continue

    const key = trimmed.slice(0, separatorIndex).trim()
    if (!key || process.env[key] !== undefined) continue

    let value = trimmed.slice(separatorIndex + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    process.env[key] = value.replace(/\\n/g, '\n')
  }
}

loadServerEnvFile()

export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'kiitx_session'
export const SESSION_COLLECTION = process.env.FIRESTORE_SESSION_COLLECTION || 'auth_sessions'
export const USER_ROLE_COLLECTION = process.env.FIRESTORE_USER_ROLE_COLLECTION || 'user_roles'
export const SESSION_INACTIVITY_LIMIT_MS = 60 * 60 * 1000
export const SESSION_ABSOLUTE_LIMIT_MS = 12 * 60 * 60 * 1000
export const HEARTBEAT_MIN_INTERVAL_MS = 60 * 1000
export const SESSION_ROTATION_INTERVAL_MS = 30 * 60 * 1000
export const SERVICE_ACCOUNT_KEY_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json'

function readPrivateKey() {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
  return privateKey ? privateKey.replace(/\\n/g, '\n') : undefined
}

export function getFirebaseServiceAccount() {
  if (fs.existsSync(SERVICE_ACCOUNT_KEY_PATH)) {
    const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_KEY_PATH, 'utf8'))
    return {
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = readPrivateKey()

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      `Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY, or place a service account JSON at ${SERVICE_ACCOUNT_KEY_PATH}.`,
    )
  }

  return {
    projectId,
    clientEmail,
    privateKey,
  }
}

export function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production'
  const configuredSameSite = String(process.env.SESSION_COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax')).toLowerCase()
  let sameSite = ['strict', 'lax', 'none'].includes(configuredSameSite) ? configuredSameSite : 'lax'
  if (!isProduction && sameSite === 'none') {
    sameSite = 'lax'
  }
  const secure = isProduction || sameSite === 'none'

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: '/',
    maxAge: SESSION_INACTIVITY_LIMIT_MS,
  }
}

export function getServerPort() {
  return Number.parseInt(process.env.API_PORT || '4001', 10)
}

function normalizeOrigin(value) {
  const rawValue = String(value ?? '').trim().replace(/\/+$/, '')
  if (!rawValue) return ''

  try {
    const url = new URL(rawValue)
    const port = url.port ? `:${url.port}` : ''
    return `${url.protocol}//${url.hostname.toLowerCase()}${port}`
  } catch {
    return rawValue.toLowerCase()
  }
}

export function getAllowedOrigins() {
  const configuredOrigins = String(process.env.APP_ORIGIN || 'http://localhost:4000')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean)

  const allowLocalOrigins = process.env.ALLOW_LOCAL_ORIGINS !== 'false'
  const localOrigins = allowLocalOrigins
    ? [
      'http://localhost:4000',
      'http://127.0.0.1:4000',
      'http://localhost:4173',
      'http://127.0.0.1:4173',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ].map(normalizeOrigin)
    : []

  const allowedOrigins = [...new Set([...configuredOrigins, ...localOrigins])]

  if (allowedOrigins.length > 0) {
    return allowedOrigins
  }

  return [normalizeOrigin('http://localhost:4000')]
}

export function createSessionId() {
  return crypto.randomBytes(32).toString('hex')
}

export function getSessionSigningSecret() {
  return (
    process.env.SESSION_COOKIE_SECRET
    || readPrivateKey()
    || `${process.env.FIREBASE_PROJECT_ID || 'kiitx'}:${SESSION_COOKIE_NAME}`
  )
}

export function getYouTubeApiKey() {
  return String(process.env.YOUTUBE_API_KEY || process.env.VITE_YOUTUBE_API_KEY || '').trim()
}
