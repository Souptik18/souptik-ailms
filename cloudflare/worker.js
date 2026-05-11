const LMS_VIDEO_CATEGORIES = {
  computerscience: {
    label: 'Computer Science',
    subcategories: {
      programming: {
        label: 'Programming',
        queries: ['programming fundamentals full course', 'python programming full course', 'java programming full course'],
        filters: {
          foundations: { label: 'Programming foundations', queries: ['programming fundamentals full course computer science'] },
          python: { label: 'Python programming', queries: ['python programming full course computer science projects'] },
          java: { label: 'Java programming', queries: ['java programming full course object oriented programming'] },
          placements: { label: 'Programming for placements', queries: ['programming interview preparation coding questions'] },
        },
        fallbackVideos: [
          { youtubeId: 'rfscVS0vtbw', title: 'Learn Python - Full Course for Beginners', channelTitle: 'freeCodeCamp.org', durationSeconds: 15900, viewCount: 44000000 },
          { youtubeId: 'grEKMHGYyns', title: 'Java Tutorial for Beginners', channelTitle: 'Programming with Mosh', durationSeconds: 9120, viewCount: 9800000 },
          { youtubeId: 'KJgsSFOSQv0', title: 'C Programming Tutorial for Beginners', channelTitle: 'freeCodeCamp.org', durationSeconds: 13680, viewCount: 12000000 },
        ],
      },
      dataStructuresAlgorithms: {
        label: 'Data Structures & Algorithms',
        queries: ['data structures and algorithms full course', 'algorithms lecture course', 'dsa interview preparation full course'],
        filters: {
          theory: { label: 'DSA theory', queries: ['data structures algorithms theory lectures'] },
          problems: { label: 'Problem solving', queries: ['data structures algorithms problem solving full course'] },
          placements: { label: 'DSA for placements', queries: ['dsa interview preparation placement full course'] },
          advanced: { label: 'Advanced algorithms', queries: ['advanced algorithms dynamic programming graph algorithms'] },
        },
        fallbackVideos: [
          { youtubeId: '8hly31xKli0', title: 'Data Structures Easy to Advanced Course', channelTitle: 'freeCodeCamp.org', durationSeconds: 28800, viewCount: 7300000 },
          { youtubeId: 'RBSGKlAvoiM', title: 'Data Structures and Algorithms in JavaScript', channelTitle: 'freeCodeCamp.org', durationSeconds: 52200, viewCount: 3600000 },
          { youtubeId: '09_LlHjoEiY', title: 'Algorithms Course - Graphs and Dynamic Programming', channelTitle: 'freeCodeCamp.org', durationSeconds: 14400, viewCount: 2200000 },
        ],
      },
      operatingSystems: {
        label: 'Operating Systems',
        queries: ['operating systems full course', 'operating system lectures', 'process memory file systems lecture'],
        filters: {
          theory: { label: 'Operating systems theory', queries: ['operating systems theory lectures process memory file system'] },
          practical: { label: 'Operating system practicals', queries: ['operating system practical linux process scheduling memory management'] },
          placements: { label: 'Operating systems for placements', queries: ['operating system interview questions placement preparation'] },
          linux: { label: 'Linux internals', queries: ['linux operating system internals full course'] },
        },
        fallbackVideos: [
          { youtubeId: '26QPDBe-NB8', title: 'Operating Systems: Crash Course Computer Science', channelTitle: 'CrashCourse', durationSeconds: 780, viewCount: 2300000 },
          { youtubeId: 'yK1uBHPdp30', title: 'Operating Systems Full Course', channelTitle: 'Gate Smashers', durationSeconds: 36000, viewCount: 2600000 },
          { youtubeId: 'xw_OuOhjauw', title: 'Operating System Concepts', channelTitle: 'Neso Academy', durationSeconds: 2100, viewCount: 900000 },
        ],
      },
      computerNetworks: {
        label: 'Computer Networks',
        queries: ['computer networks full course', 'networking fundamentals full course', 'tcp ip networking lecture'],
        filters: {
          theory: { label: 'Networking theory', queries: ['computer networks theory lectures osi tcp ip'] },
          practical: { label: 'Networking practicals', queries: ['computer networking practical packet tracer wireshark'] },
          placements: { label: 'Networks for placements', queries: ['computer networks interview questions placement preparation'] },
          security: { label: 'Network security', queries: ['network security fundamentals computer science'] },
        },
        fallbackVideos: [
          { youtubeId: '3QhU9jd03a0', title: 'Computer Networking Course - Network Engineering', channelTitle: 'freeCodeCamp.org', durationSeconds: 33120, viewCount: 5400000 },
          { youtubeId: 'qiQR5rTSshw', title: 'Computer Networks Full Course', channelTitle: 'Gate Smashers', durationSeconds: 28800, viewCount: 1900000 },
          { youtubeId: 'IPvYjXCsTg8', title: 'TCP/IP and Networking Fundamentals', channelTitle: 'Practical Networking', durationSeconds: 5400, viewCount: 1600000 },
        ],
      },
      databases: {
        label: 'Databases',
        queries: ['database management systems full course', 'sql full course', 'dbms lectures normalization transactions'],
        filters: {
          dbms: { label: 'DBMS theory', queries: ['dbms theory lectures normalization transactions indexing'] },
          sql: { label: 'SQL practice', queries: ['sql full course database practice queries'] },
          placements: { label: 'DBMS for placements', queries: ['dbms interview questions placement preparation'] },
          design: { label: 'Database design', queries: ['database design er model normalization full course'] },
        },
        fallbackVideos: [
          { youtubeId: 'HXV3zeQKqGY', title: 'SQL Tutorial - Full Database Course', channelTitle: 'freeCodeCamp.org', durationSeconds: 14400, viewCount: 19000000 },
          { youtubeId: 'ztHopE5Wnpc', title: 'Database Management Systems Full Course', channelTitle: 'Gate Smashers', durationSeconds: 36000, viewCount: 2800000 },
          { youtubeId: '4cWkVbC2bNE', title: 'DBMS Normalization and Transactions', channelTitle: 'Neso Academy', durationSeconds: 3600, viewCount: 780000 },
        ],
      },
      artificialIntelligence: {
        label: 'AI & Machine Learning',
        queries: ['machine learning full course', 'artificial intelligence full course', 'deep learning full course'],
        filters: {
          ml: { label: 'Machine learning', queries: ['machine learning full course computer science'] },
          deepLearning: { label: 'Deep learning', queries: ['deep learning neural networks full course'] },
          genai: { label: 'Generative AI', queries: ['generative ai llm full course'] },
          placements: { label: 'AI for placements', queries: ['machine learning interview questions placement preparation'] },
        },
        fallbackVideos: [
          { youtubeId: 'GwIo3gDZCVQ', title: 'Machine Learning Full Course', channelTitle: 'freeCodeCamp.org', durationSeconds: 32400, viewCount: 8300000 },
          { youtubeId: 'aircAruvnKk', title: 'But what is a neural network?', channelTitle: '3Blue1Brown', durationSeconds: 1140, viewCount: 16000000 },
          { youtubeId: 'JMUxmLyrhSk', title: 'Artificial Intelligence Full Course', channelTitle: 'Simplilearn', durationSeconds: 36000, viewCount: 3200000 },
        ],
      },
      webDevelopment: {
        label: 'Web Development',
        queries: ['web development full course', 'react full course', 'javascript full course'],
        filters: {
          frontend: { label: 'Frontend', queries: ['frontend development react javascript full course'] },
          backend: { label: 'Backend', queries: ['backend development node js express database full course'] },
          fullstack: { label: 'Full stack', queries: ['full stack web development full course'] },
          placements: { label: 'Web dev for placements', queries: ['web developer interview preparation javascript react'] },
        },
        fallbackVideos: [
          { youtubeId: 'nu_pCVPKzTk', title: 'Full Stack Web Development for Beginners', channelTitle: 'freeCodeCamp.org', durationSeconds: 28800, viewCount: 4100000 },
          { youtubeId: 'bMknfKXIFA8', title: 'React Course - Beginner Tutorial', channelTitle: 'freeCodeCamp.org', durationSeconds: 39600, viewCount: 9000000 },
          { youtubeId: 'PkZNo7MFNFg', title: 'JavaScript Tutorial for Beginners', channelTitle: 'freeCodeCamp.org', durationSeconds: 12480, viewCount: 16000000 },
        ],
      },
      cybersecurity: {
        label: 'Cybersecurity',
        queries: ['cybersecurity full course', 'ethical hacking full course', 'network security lecture'],
        filters: {
          fundamentals: { label: 'Security fundamentals', queries: ['cyber security fundamentals full course'] },
          ethicalHacking: { label: 'Ethical hacking', queries: ['ethical hacking full course penetration testing'] },
          appsec: { label: 'Application security', queries: ['application security web security full course'] },
          placements: { label: 'Security for placements', queries: ['cyber security interview questions placement preparation'] },
        },
        fallbackVideos: [
          { youtubeId: 'inWWhr5tnEA', title: 'Cyber Security Full Course for Beginners', channelTitle: 'Simplilearn', durationSeconds: 36000, viewCount: 4200000 },
          { youtubeId: '3Kq1MIfTWCE', title: 'Ethical Hacking Full Course', channelTitle: 'freeCodeCamp.org', durationSeconds: 54000, viewCount: 6200000 },
          { youtubeId: 'U_P23SqJaDc', title: 'Network Security Fundamentals', channelTitle: 'edureka!', durationSeconds: 7200, viewCount: 900000 },
        ],
      },
    },
  },
}

const DEFAULT_LMS_CATEGORY = 'computerscience'
const FALLBACK_LESSON_PREFIXES = [
  'Foundations',
  'Core Concepts',
  'Hands-on Practice',
  'Interview Patterns',
  'Project Walkthrough',
  'Advanced Review',
  'Implementation Lab',
  'System Design Context',
]

function getDefaultSubcategoryKey(categoryKey = DEFAULT_LMS_CATEGORY) {
  const category = LMS_VIDEO_CATEGORIES[categoryKey] ?? LMS_VIDEO_CATEGORIES[DEFAULT_LMS_CATEGORY]
  return Object.keys(category.subcategories)[0]
}

function formatDuration(totalSeconds = 0) {
  const seconds = Math.max(0, Number(totalSeconds) || 0)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

function flattenFallbackVideos(categoryKey = DEFAULT_LMS_CATEGORY, subcategoryKey) {
  const category = LMS_VIDEO_CATEGORIES[categoryKey] ?? LMS_VIDEO_CATEGORIES[DEFAULT_LMS_CATEGORY]
  const resolvedSubcategoryKey = subcategoryKey && category.subcategories[subcategoryKey]
    ? subcategoryKey
    : getDefaultSubcategoryKey(categoryKey)
  const subcategory = category.subcategories[resolvedSubcategoryKey]
  const seedVideos = subcategory?.fallbackVideos ?? []
  const expandedVideos = Array.from({ length: 48 }, (_, index) => {
    const seedVideo = seedVideos[index % seedVideos.length]
    const moduleNumber = Math.floor(index / Math.max(1, seedVideos.length)) + 1
    const lessonNumber = index + 1
    const prefix = FALLBACK_LESSON_PREFIXES[index % FALLBACK_LESSON_PREFIXES.length]
    return {
      ...seedVideo,
      youtubeId: seedVideo.youtubeId,
      title: moduleNumber === 1 ? seedVideo.title : `${prefix}: ${seedVideo.title} - Lesson ${lessonNumber}`,
      viewCount: Math.max(0, Number(seedVideo.viewCount ?? 0) - (lessonNumber * 371)),
      durationSeconds: seedVideo.durationSeconds,
    }
  })

  return expandedVideos.map((video) => ({
    ...video,
    categoryKey,
    categoryLabel: category.label,
    subcategoryKey: resolvedSubcategoryKey,
    subcategoryLabel: subcategory.label,
    duration: formatDuration(video.durationSeconds),
  }))
}

const SESSION_COOKIE_NAME = 'kiitx_session'
const SESSION_INACTIVITY_LIMIT_MS = 60 * 60 * 1000
const HEARTBEAT_MIN_INTERVAL_MS = 60 * 1000
const SESSION_ROTATION_INTERVAL_MS = 30 * 60 * 1000
const SESSION_ABSOLUTE_LIMIT_MS = 12 * 60 * 60 * 1000
const MIN_DURATION_SECONDS = 5 * 60
const FIREBASE_PROJECT_ID = 'e-kiitx'
const FIREBASE_TOKEN_ISSUER_BASE = 'https://securetoken.google.com'
const FIREBASE_JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
const DEFAULT_APP_ORIGINS = [
  'https://souptik-ailms.vercel.app',
]

const CURATED_CHANNEL_IDS = [
  'UCEBb1b_L6zDS3xTUrIALZOw', // NPTEL
  'UC640y4UvDAlya_WOj5U4pfA', // MIT OpenCourseWare
  'UC8butISFwT-Wl7EV0hUK0BQ', // freeCodeCamp
  'UCBa5G_ESCn8Yd4vw5U-gIcg', // CS50
]

function isProviderAuthFailure(status) {
  return status === 401 || status === 403
}

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'to', 'of', 'in', 'on', 'for', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'as',
  'at', 'it', 'this', 'that', 'from', 'into', 'about', 'what', 'which', 'when', 'where', 'who', 'why', 'how', 'can',
  'could', 'would', 'should', 'do', 'does', 'did', 'have', 'has', 'had', 'i', 'you', 'we', 'they', 'he', 'she', 'my',
  'your', 'our', 'their', 'me', 'us', 'them', 'if', 'then', 'than', 'so', 'also', 'not', 'only',
])

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
  })
}

function base64UrlEncode(bytes) {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4)
  const binary = atob(normalized + padding)
  const output = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) output[i] = binary.charCodeAt(i)
  return output
}

function base64UrlDecodeJson(value) {
  return JSON.parse(textDecoder.decode(base64UrlDecode(value)))
}

function parseCookies(request) {
  const headerValue = request.headers.get('Cookie') || ''
  const pairs = headerValue.split(';')
  const map = {}
  for (const pair of pairs) {
    const separator = pair.indexOf('=')
    if (separator <= 0) continue
    const key = pair.slice(0, separator).trim()
    const value = pair.slice(separator + 1).trim()
    if (!key) continue
    map[key] = decodeURIComponent(value)
  }
  return map
}

function buildCookie(value, { maxAge = SESSION_INACTIVITY_LIMIT_MS, sameSite = 'None', secure = true } = {}) {
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    `SameSite=${sameSite}`,
    `Max-Age=${Math.floor(maxAge / 1000)}`,
  ]
  if (secure) parts.push('Secure')
  return parts.join('; ')
}

function buildClearCookie({ sameSite = 'None', secure = true } = {}) {
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    `SameSite=${sameSite}`,
    'Max-Age=0',
  ]
  if (secure) parts.push('Secure')
  return parts.join('; ')
}

function sanitizeRole(role) {
  const normalized = String(role || '').trim().toLowerCase()
  if (normalized === 'student' || normalized === 'instructor' || normalized === 'admin') return normalized
  return null
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

function getAllowedOrigins(env) {
  const configured = String(env.APP_ORIGIN || '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean)

  const local = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    'http://localhost:4000',
    'http://127.0.0.1:4000',
  ].map(normalizeOrigin)

  return new Set([...DEFAULT_APP_ORIGINS.map(normalizeOrigin), ...configured, ...local])
}

function isAllowedVercelPreviewOrigin(origin, env) {
  if (!origin) return false
  let hostname = ''
  try {
    hostname = new URL(origin).hostname.toLowerCase()
  } catch {
    return false
  }
  if (!hostname.endsWith('.vercel.app')) return false
  const configuredProject = String(env.VERCEL_PROJECT_SLUG || 'souptik-ailms').trim().toLowerCase()
  if (!configuredProject) return false
  return hostname === `${configuredProject}.vercel.app` || hostname.startsWith(`${configuredProject}-`)
}

function corsHeaders(request, env) {
  const origin = normalizeOrigin(request.headers.get('Origin') || '')
  const allowed = getAllowedOrigins(env)
  if (!origin) return {}
  if (!allowed.has(origin) && !isAllowedVercelPreviewOrigin(origin, env)) return {}
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  }
}

function applySecurityHeaders(response) {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  return response
}

function sanitizeText(value, maxLength = 6000) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

function fingerprintValue(request) {
  const userAgent = sanitizeText(request.headers.get('user-agent') || '', 300).toLowerCase()
  const acceptLanguage = sanitizeText(request.headers.get('accept-language') || '', 120).toLowerCase().split(',').slice(0, 2).join(',')
  return `${userAgent}|${acceptLanguage}`
}

async function signPayload(env, payloadString) {
  const secret = String(env.SESSION_COOKIE_SECRET || env.FIREBASE_PROJECT_ID || 'kiitx').trim()
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, textEncoder.encode(payloadString))
  return base64UrlEncode(new Uint8Array(signature))
}

async function createSessionToken(env, payload) {
  const payloadBytes = textEncoder.encode(JSON.stringify(payload))
  const encodedPayload = base64UrlEncode(payloadBytes)
  const signature = await signPayload(env, encodedPayload)
  return `${encodedPayload}.${signature}`
}

async function parseSessionToken(env, token) {
  if (!token || typeof token !== 'string') return null
  const separator = token.lastIndexOf('.')
  if (separator <= 0) return null
  const encodedPayload = token.slice(0, separator)
  const signature = token.slice(separator + 1)
  const expected = await signPayload(env, encodedPayload)
  if (signature !== expected) return null
  try {
    const bytes = base64UrlDecode(encodedPayload)
    return JSON.parse(textDecoder.decode(bytes))
  } catch {
    return null
  }
}

function isSessionValid(session, request) {
  if (!session || !session.uid || !session.role) return false
  const now = Date.now()
  const createdAtMs = Number(session.createdAtMs || 0)
  const lastActivityAt = Number(session.lastActivityAt || 0)
  if (!createdAtMs || !lastActivityAt) return false
  if (now - createdAtMs > SESSION_ABSOLUTE_LIMIT_MS) return false
  if (now - lastActivityAt > SESSION_INACTIVITY_LIMIT_MS) return false
  return session.fingerprint === fingerprintValue(request)
}

async function readAuthSession(env, request) {
  const cookieMap = parseCookies(request)
  const sessionToken = cookieMap[SESSION_COOKIE_NAME]
  if (!sessionToken) return null
  const session = await parseSessionToken(env, sessionToken)
  if (!isSessionValid(session, request)) return null
  const kv = getKv(env)
  if (kv && session.uid && session.sid) {
    const activeSid = await kv.get(toActiveSessionKey(session.uid))
    if (!activeSid || activeSid !== session.sid) return null
  }
  return session
}

async function verifyFirebaseIdToken(env, idToken) {
  const parts = String(idToken || '').split('.')
  if (parts.length !== 3) throw new Error('Invalid Firebase token.')

  const [encodedHeader, encodedPayload, encodedSignature] = parts
  let header
  let payload
  try {
    header = base64UrlDecodeJson(encodedHeader)
    payload = base64UrlDecodeJson(encodedPayload)
  } catch {
    throw new Error('Invalid Firebase token.')
  }

  const projectId = String(env.FIREBASE_PROJECT_ID || FIREBASE_PROJECT_ID).trim()
  const aud = String(payload.aud || '')
  const issuer = String(payload.iss || '')
  const uid = String(payload.user_id || payload.sub || '')
  const now = Math.floor(Date.now() / 1000)

  if (!projectId || aud !== projectId) {
    throw new Error('Token audience mismatch.')
  }
  if (issuer !== `${FIREBASE_TOKEN_ISSUER_BASE}/${projectId}`) {
    throw new Error('Token issuer mismatch.')
  }
  if (!uid || uid.length > 128) {
    throw new Error('Invalid Firebase token subject.')
  }
  if (Number(payload.exp || 0) <= now) {
    throw new Error('Firebase token expired.')
  }
  if (Number(payload.iat || 0) > now + 300) {
    throw new Error('Firebase token issued in the future.')
  }
  if (header.alg !== 'RS256' || !header.kid) {
    throw new Error('Unsupported Firebase token signature.')
  }

  const jwksResponse = await fetch(FIREBASE_JWKS_URL, {
    headers: { Accept: 'application/json' },
    cf: { cacheTtl: 3600, cacheEverything: true },
  })
  if (!jwksResponse.ok) throw new Error('Unable to load Firebase signing keys.')

  const jwks = await jwksResponse.json()
  const key = Array.isArray(jwks.keys) ? jwks.keys.find((item) => item.kid === header.kid) : null
  if (!key) throw new Error('Firebase signing key not found.')

  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    key,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  )
  const verified = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    base64UrlDecode(encodedSignature),
    textEncoder.encode(`${encodedHeader}.${encodedPayload}`),
  )
  if (!verified) throw new Error('Invalid Firebase token signature.')

  return {
    uid,
    email: payload.email ? String(payload.email) : null,
  }
}

function getKv(env) {
  return env.KIITX_STATE || null
}

function toActiveSessionKey(uid) {
  return `active-session:${uid}`
}

async function kvGetJson(env, key, fallback = null) {
  const kv = getKv(env)
  if (!kv) return fallback
  const raw = await kv.get(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

async function kvPutJson(env, key, value) {
  const kv = getKv(env)
  if (!kv) return
  await kv.put(key, JSON.stringify(value))
}

function toFeedbackKey(courseId) {
  return `feedback:${courseId}`
}

function toTutorKey(uid, videoId) {
  return `tutor:${uid}:${videoId}`
}

function sanitizeTutorHistoryMessages(messages) {
  if (!Array.isArray(messages)) return []
  return messages
    .slice(-200)
    .map((item) => ({
      id: sanitizeText(item?.id ?? '', 80),
      role: item?.role === 'user' ? 'user' : 'bot',
      text: sanitizeText(item?.text ?? '', 3000),
      createdAt: Number(item?.createdAt || Date.now()),
    }))
    .filter((item) => item.id && item.text)
}

function parseDuration(duration = 'PT0S') {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(duration)
  if (!match) return 0
  return Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0)
}

function isShortLikeVideo(video) {
  const title = sanitizeText(video?.snippet?.title ?? '', 300).toLowerCase()
  const durationSeconds = parseDuration(video?.contentDetails?.duration)
  return durationSeconds <= MIN_DURATION_SECONDS || title.includes('#shorts') || title.includes(' shorts ')
}

function buildYoutubeUrl(path, params) {
  const url = new URL(`https://www.googleapis.com/youtube/v3${path}`)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value))
  }
  return url.toString()
}

async function fetchYoutubeJson(url) {
  const response = await fetch(url)
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload?.error?.message || 'YouTube API failed.')
  return payload
}

async function fetchVideosForQuery(env, categoryKey, subcategoryKey, query) {
  const apiKey = String(env.YOUTUBE_API_KEY || '').trim()
  if (!apiKey) return []

  const videoIds = new Set()
  for (const channelId of CURATED_CHANNEL_IDS) {
    const url = buildYoutubeUrl('/search', {
      key: apiKey,
      part: 'snippet',
      type: 'video',
      maxResults: 6,
      order: 'relevance',
      videoEmbeddable: 'true',
      safeSearch: 'strict',
      channelId,
      q: query,
    })
    const payload = await fetchYoutubeJson(url)
    for (const item of payload.items || []) {
      if (item?.id?.videoId) videoIds.add(item.id.videoId)
    }
  }

  if (videoIds.size === 0) return []
  const detailUrl = buildYoutubeUrl('/videos', {
    key: apiKey,
    part: 'snippet,contentDetails,statistics',
    id: [...videoIds].join(','),
  })
  const details = await fetchYoutubeJson(detailUrl)
  const category = LMS_VIDEO_CATEGORIES[categoryKey]
  const sub = category.subcategories[subcategoryKey]

  return (details.items || [])
    .filter((video) => CURATED_CHANNEL_IDS.includes(video?.snippet?.channelId || ''))
    .filter((video) => !isShortLikeVideo(video))
    .map((video) => {
      const durationSeconds = parseDuration(video.contentDetails?.duration)
      return {
        youtubeId: video.id,
        title: sanitizeText(video.snippet?.title ?? 'Untitled video', 220),
        channelTitle: sanitizeText(video.snippet?.channelTitle ?? 'Curated channel', 120),
        thumbnail:
          video.snippet?.thumbnails?.high?.url
          || video.snippet?.thumbnails?.medium?.url
          || video.snippet?.thumbnails?.default?.url
          || `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`,
        durationSeconds,
        duration: formatDuration(durationSeconds),
        viewCount: Number(video.statistics?.viewCount || 0),
        categoryKey,
        categoryLabel: category.label,
        subcategoryKey,
        subcategoryLabel: sub.label,
      }
    })
}

async function getLmsVideos(env, categoryKeyInput, subcategoryKeyInput) {
  const categoryKey = LMS_VIDEO_CATEGORIES[categoryKeyInput] ? categoryKeyInput : DEFAULT_LMS_CATEGORY
  const subcategoryKey = LMS_VIDEO_CATEGORIES[categoryKey].subcategories[subcategoryKeyInput]
    ? subcategoryKeyInput
    : getDefaultSubcategoryKey(categoryKey)
  const category = LMS_VIDEO_CATEGORIES[categoryKey]
  const subcategory = category.subcategories[subcategoryKey]

  let videos = []
  try {
    const perQuery = await Promise.all(subcategory.queries.map((query) => fetchVideosForQuery(env, categoryKey, subcategoryKey, query)))
    videos = perQuery.flat()
  } catch {
    videos = []
  }

  const deduped = videos
    .filter((video, index, list) => list.findIndex((item) => item.youtubeId === video.youtubeId) === index)
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 24)

  return {
    source: deduped.length > 0 ? 'youtube' : 'fallback',
    categories: LMS_VIDEO_CATEGORIES,
    categoryKey,
    categoryLabel: category.label,
    subcategoryKey,
    subcategoryLabel: subcategory.label,
    videos: deduped.length > 0 ? deduped : flattenFallbackVideos(categoryKey, subcategoryKey),
  }
}

function tokenize(value) {
  return sanitizeText(value, 2000)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token && token.length > 2 && !STOPWORDS.has(token))
}

function computeQuestionRelevance(question, contextText) {
  const questionTokens = tokenize(question)
  if (questionTokens.length === 0) return 0
  const contextTokens = new Set(tokenize(contextText))
  let overlap = 0
  for (const token of questionTokens) {
    if (contextTokens.has(token)) overlap += 1
  }
  return overlap / questionTokens.length
}

function stripXmlTags(text) {
  return sanitizeText(text.replace(/<[^>]+>/g, ' '))
}

function decodeHtmlEntities(text) {
  return text
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
}

async function fetchYouTubeMetadata(env, videoId) {
  const youtubeApiKey = String(env.YOUTUBE_API_KEY || '').trim()
  if (!youtubeApiKey) return { title: '', description: '', channelTitle: '', tags: [] }
  const url = buildYoutubeUrl('/videos', {
    part: 'snippet',
    id: videoId,
    key: youtubeApiKey,
  })
  try {
    const data = await fetchYoutubeJson(url)
    const snippet = data?.items?.[0]?.snippet || {}
    return {
      title: sanitizeText(snippet.title ?? '', 200),
      description: sanitizeText(snippet.description ?? '', 4000),
      channelTitle: sanitizeText(snippet.channelTitle ?? '', 200),
      tags: Array.isArray(snippet.tags) ? snippet.tags.map((tag) => sanitizeText(tag, 80)).filter(Boolean).slice(0, 30) : [],
    }
  } catch {
    return { title: '', description: '', channelTitle: '', tags: [] }
  }
}

async function fetchTranscriptByLanguage(videoId, lang) {
  const transcriptUrl = new URL('https://www.youtube.com/api/timedtext')
  transcriptUrl.searchParams.set('lang', lang)
  transcriptUrl.searchParams.set('v', videoId)
  const response = await fetch(transcriptUrl.toString(), { method: 'GET' })
  if (!response.ok) return ''
  const rawXml = await response.text()
  if (!rawXml || !rawXml.includes('<text')) return ''
  return decodeHtmlEntities(stripXmlTags(rawXml))
}

async function fetchYouTubeTranscript(videoId) {
  const primary = await fetchTranscriptByLanguage(videoId, 'en')
  if (primary) return primary
  return fetchTranscriptByLanguage(videoId, 'en-US')
}

function buildVideoContext({ videoId, requestedTitle, youtubeMeta, transcript }) {
  const title = sanitizeText(requestedTitle || youtubeMeta.title || 'Untitled lesson', 300)
  const description = sanitizeText(youtubeMeta.description, 3000)
  const channel = sanitizeText(youtubeMeta.channelTitle, 200)
  const tags = Array.isArray(youtubeMeta.tags) ? youtubeMeta.tags.join(', ') : ''
  const cleanTranscript = sanitizeText(transcript, 12000)
  return {
    title,
    contextText: sanitizeText(
      [
        `Video ID: ${videoId}`,
        `Title: ${title}`,
        channel ? `Channel: ${channel}` : '',
        tags ? `Tags: ${tags}` : '',
        description ? `Description: ${description}` : '',
        cleanTranscript ? `Transcript: ${cleanTranscript}` : '',
      ].filter(Boolean).join('\n'),
      18000,
    ),
    transcript: cleanTranscript,
  }
}

function buildTutorMessages({ question, history, videoContext }) {
  const normalizedHistory = Array.isArray(history)
    ? history.slice(-8).map((item) => ({
      role: item?.role === 'assistant' ? 'assistant' : 'user',
      content: sanitizeText(item?.content ?? '', 800),
    })).filter((item) => item.content)
    : []
  return [
    {
      role: 'system',
      content: 'You are KIITX AI LMS Tutor. Answer only from provided video context. If unrelated, respond exactly: "I can only answer questions related to this video."',
    },
    {
      role: 'system',
      content: `Video context:\n${videoContext.contextText}`,
    },
    ...normalizedHistory,
    {
      role: 'user',
      content: sanitizeText(question, 900),
    },
  ]
}

const ONBOARDING_ROLE_COURSES = {
  'Frontend Engineer': [
    'Frontend Engineering for Scalable Interfaces',
    'Full-Stack Web Development with React and Node',
    'JavaScript Tutorial for Beginners',
  ],
  'Backend Engineer': [
    'Backend APIs, Databases, and Authentication',
    'Database Management Systems Full Course',
    'Operating Systems for CS Degree Programs',
  ],
  'Full Stack Engineer': [
    'Full-Stack Web Development with React and Node',
    'Backend APIs, Databases, and Authentication',
    'Frontend Engineering for Scalable Interfaces',
  ],
  'AI/ML Engineer': [
    'Machine Learning for Undergraduates',
    'Deep Learning and Neural Networks Bootcamp',
    'Generative AI Engineering with LLMs',
  ],
  'Data Engineer': [
    'Data Science, Statistics, and Python Analytics',
    'SQL Tutorial - Full Database Course',
    'Python Programming from Zero to Projects',
  ],
  'Cloud Engineer': [
    'Cloud DevOps, Docker, Kubernetes, and CI/CD',
    'Operating Systems for CS Degree Programs',
    'Computer Networks and Internet Protocols',
  ],
  'Cybersecurity Analyst': [
    'Cybersecurity Foundations for Students',
    'Ethical Hacking and Web Security Labs',
    'Network Security, Cryptography, and Defense',
  ],
}

function getOnboardingCourses(role) {
  const titles = ONBOARDING_ROLE_COURSES[role] || [
    'Python Programming from Zero to Projects',
    'Data Structures and Algorithms Master Track',
    'Full-Stack Web Development with React and Node',
  ]
  return titles.map((title, index) => ({
    id: `onboarding-${index + 1}`,
    title,
    category: index === 0 ? 'Recommended start' : 'Next course',
    level: 'Structured OpenCourse track',
    duration: 'Course path',
  }))
}

function fallbackOnboardingRoadmap(stageTitle, role, courses) {
  return {
    source: 'fallback',
    generalRecommendation: `As a ${stageTitle.toLowerCase()} targeting ${role}, this is a strong direction because companies are hiring for people who can learn fast, execute clearly, and show proof of skill instead of only certificates. The best move now is to build the role fundamentals first, then convert every learning block into a visible project or assessment result. OpenCourse gives you that structure in one place, so you do not waste time jumping between random resources. Follow the recommended courses, complete the checkpoints, and use each milestone as evidence that you are moving closer to your dream role.`,
    requirements: [
      'Master role-critical fundamentals.',
      'Build one visible project proof.',
    ],
    recommendedCourses: courses,
    assessments: [
      { title: 'Foundation check', focus: 'Core concepts and terminology', format: 'Short quiz' },
      { title: 'Coding practice', focus: 'Hands-on problem solving', format: 'Timed coding set' },
      { title: 'Project review', focus: 'Portfolio-quality implementation', format: 'Submission review' },
      { title: 'Readiness assessment', focus: 'Role-specific interview preparation', format: 'Mixed evaluation' },
    ],
  }
}

function parseOnboardingJson(content) {
  const raw = sanitizeText(content, 6000)
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]
  const candidate = fenced || raw.match(/\{[\s\S]*\}/)?.[0] || raw
  return JSON.parse(candidate)
}

function hasSubstantialOnboardingRecommendation(value) {
  const text = sanitizeText(value, 1800)
  const sentenceCount = text.split(/[.!?]+/).map((item) => item.trim()).filter(Boolean).length
  return text.length >= 420 && sentenceCount >= 5
}

function normalizeOnboardingRoadmap(payload, fallback) {
  const candidateRecommendation = sanitizeText(payload?.generalRecommendation, 1800)
  const requirements = Array.isArray(payload?.requirements)
    ? payload.requirements.map((item) => sanitizeText(item, 140)).filter(Boolean).slice(0, 2)
    : fallback.requirements
  const assessments = Array.isArray(payload?.assessments)
    ? payload.assessments.map((item) => ({
      title: sanitizeText(item?.title, 90),
      focus: sanitizeText(item?.focus, 140),
      format: sanitizeText(item?.format, 70),
    })).filter((item) => item.title && item.focus).slice(0, 4)
    : fallback.assessments
  return {
    source: 'groq',
    generalRecommendation: hasSubstantialOnboardingRecommendation(candidateRecommendation) ? candidateRecommendation : fallback.generalRecommendation,
    requirements: requirements.length ? requirements : fallback.requirements,
    recommendedCourses: fallback.recommendedCourses,
    assessments: assessments.length ? assessments : fallback.assessments,
  }
}

function getLinkedInJobsApiKey(env) {
  return String(env.RAPIDAPI_LINKEDIN_JOBS_KEY || env.RAPIDAPI_KEY || '').trim()
}

function resolveLinkedInJobsFreshness(value) {
  if (value === '1h' || value === '7d' || value === '6m') return value
  return '24h'
}

function getLinkedInJobsEndpoint(freshness) {
  if (freshness === '1h') return 'active-jb-1h'
  if (freshness === '7d') return 'active-jb-7d'
  if (freshness === '6m') return 'active-jb-6m'
  return 'active-jb-24h'
}

function getLinkedInJobsFreshnessLabel(freshness) {
  if (freshness === '1h') return 'Last hour'
  if (freshness === '7d') return 'Last 7 days'
  if (freshness === '6m') return 'Last 6 months'
  return 'Last 24h'
}

function getLinkedInJobsSourceLabel(freshness) {
  if (freshness === '1h') return 'Hourly feed'
  if (freshness === '7d') return '7-day feed'
  if (freshness === '6m') return '6-month feed'
  return '24-hour feed'
}

function normalizeLinkedInJob(job, index, freshness) {
  const company = job?.organization || job?.company || job?.company_name || job?.employer_name || job?.companyName
  const title = job?.title || job?.job_title || job?.position || job?.name
  const location = Array.isArray(job?.locations_derived) && job.locations_derived.length
    ? job.locations_derived.join(', ')
    : job?.location || job?.job_location || job?.formatted_location || job?.candidate_required_location
  const url = job?.url || job?.job_url || job?.linkedin_url || job?.application_url || job?.apply_url
  const employmentType = Array.isArray(job?.employment_type)
    ? job.employment_type.join(', ')
    : job?.employment_type || job?.type || job?.workplace_type || 'LinkedIn'
  const tags = [
    getLinkedInJobsFreshnessLabel(freshness),
    ...(Array.isArray(job?.skills) ? job.skills : []),
    ...(Array.isArray(job?.industries) ? job.industries : []),
    job?.seniority,
    job?.workplace_type,
  ].filter(Boolean).map((item) => sanitizeText(item, 42))

  return {
    id: sanitizeText(job?.id || job?.job_id || job?.linkedin_id || url || `rapidapi-${freshness}-${index}`, 180),
    title: sanitizeText(title || 'LinkedIn role', 180),
    company: sanitizeText(company || 'Hiring company', 120),
    location: sanitizeText(location || 'United States / United Kingdom', 160),
    url: sanitizeText(url || 'https://www.linkedin.com/jobs/', 600),
    source: getLinkedInJobsSourceLabel(freshness),
    type: sanitizeText(employmentType, 80),
    publishedAt: sanitizeText(job?.date_posted || job?.posted_at || job?.created_at || job?.publishedAt || '', 80),
    indexedAt: sanitizeText(job?.date_created || job?.indexed_at || job?.created_at || '', 80),
    description: sanitizeText(job?.description_text || job?.description || job?.job_description, 260),
    tags: [...new Set(tags)].slice(0, 6),
  }
}

function extractLinkedInJobs(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.jobs)) return payload.jobs
  if (Array.isArray(payload?.results)) return payload.results
  return []
}

async function getLinkedInJobs(env, searchParams) {
  const apiKey = getLinkedInJobsApiKey(env)
  if (!apiKey) throw new Error('Missing RapidAPI LinkedIn jobs key.')

  const freshness = resolveLinkedInJobsFreshness(searchParams.get('freshness'))
  const endpoint = getLinkedInJobsEndpoint(freshness)
  const params = new URLSearchParams({
    offset: String(Math.max(0, Number.parseInt(searchParams.get('offset') || '0', 10) || 0)),
    title_filter: sanitizeText(searchParams.get('title') || 'Data Engineer', 120),
    location_filter: sanitizeText(searchParams.get('location') || 'United States OR United Kingdom', 180),
    limit: String(Math.min(10, Math.max(1, Number.parseInt(searchParams.get('limit') || '10', 10) || 10))),
    description_type: 'text',
  })
  const remoteFilter = sanitizeText(searchParams.get('remote') || '', 12).toLowerCase()
  if (remoteFilter === 'true' || remoteFilter === 'false') {
    params.set('remote', remoteFilter)
  }
  const typeFilter = sanitizeText(searchParams.get('type') || '', 80)
  if (typeFilter && typeFilter !== 'ALL') {
    params.set('type_filter', typeFilter)
  }

  const response = await fetch(`https://linkedin-job-search-api.p.rapidapi.com/${endpoint}?${params.toString()}`, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'linkedin-job-search-api.p.rapidapi.com',
      'Content-Type': 'application/json',
    },
  })
  if (!response.ok) throw new Error(`LinkedIn jobs provider failed with HTTP ${response.status}.`)

  const text = await response.text()
  const payload = text ? JSON.parse(text) : []
  const jobs = extractLinkedInJobs(payload)
    .map((job, index) => normalizeLinkedInJob(job, index, freshness))
    .filter((job, index, list) => job.title && list.findIndex((item) => item.url === job.url) === index)

  return {
    source: 'rapidapi-linkedin',
    freshness,
    title: sanitizeText(searchParams.get('title') || 'Data Engineer', 120),
    location: sanitizeText(searchParams.get('location') || 'United States OR United Kingdom', 180),
    jobs,
  }
}

async function runOnboardingRoadmapCompletion(env, stage, role) {
  const stageTitle = sanitizeText(stage?.title, 120)
  const stageDetail = sanitizeText(stage?.detail, 120)
  const dreamRole = sanitizeText(role, 120)
  if (!stageTitle) throw new Error('Current status is required.')
  if (!dreamRole) throw new Error('Dream role is required.')

  const courses = getOnboardingCourses(dreamRole)
  const fallback = fallbackOnboardingRoadmap(stageTitle, dreamRole, courses)
  const xaiApiKey = String(env.XAI_API_KEY || env.GROK_API_KEY || '').trim()
  const groqApiKey = String(env.GROQ_API_KEY || '').trim()
  const provider = xaiApiKey
    ? {
      name: 'xAI Grok',
      apiKey: xaiApiKey,
      url: 'https://api.x.ai/v1/chat/completions',
      model: String(env.XAI_MODEL || env.GROK_MODEL || 'grok-4.20-reasoning'),
    }
    : groqApiKey
    ? {
      name: 'Groq',
      apiKey: groqApiKey,
      url: 'https://api.groq.com/openai/v1/chat/completions',
      model: String(env.GROQ_MODEL || 'llama-3.3-70b-versatile'),
    }
    : null
  if (!provider) return fallback

  let response
  try {
    response = await fetch(provider.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        temperature: 0.35,
        max_tokens: 950,
        messages: [
          {
            role: 'system',
            content: 'You are OpenCourse onboarding AI. Return only valid JSON. Keep copy practical, persuasive, and student-friendly. The generalRecommendation must never be one sentence or one line. The generalRecommendation must be at least 5 complete sentences.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              studentCurrentStatus: stageTitle,
              statusDetail: stageDetail,
              dreamRole,
              availableRecommendedCourses: courses.map((course) => course.title),
              outputSchema: {
                generalRecommendation: 'A strong marketable guidance block in 120 to 170 words across 5 to 7 natural sentences. Explain why the dream role is valuable in the current market, what the learner should focus on from their current status, and persuade them to use OpenCourse as the main structured path. Do not return a one-line answer.',
                requirements: ['Exactly 2 short focus points, each under 9 words'],
                assessments: [{ title: 'assessment name', focus: 'what it checks', format: 'quiz, coding set, project review, or mixed evaluation' }],
              },
            }),
          },
        ],
      }),
    })
  } catch {
    return {
      ...fallback,
      source: `${fallback.source || 'OpenCourse'} fallback`,
    }
  }
  if (!response.ok) {
    if (isProviderAuthFailure(response.status)) {
      return {
        ...fallback,
        source: `${fallback.source || 'OpenCourse'} fallback`,
      }
    }
    throw new Error(`${provider.name} roadmap generation failed with HTTP ${response.status}.`)
  }
  const payload = await response.json()
  try {
    return {
      ...normalizeOnboardingRoadmap(parseOnboardingJson(payload?.choices?.[0]?.message?.content ?? ''), fallback),
      source: provider.name,
    }
  } catch {
    return {
      ...fallback,
      source: `${fallback.source || 'OpenCourse'} fallback`,
    }
  }
}

async function runTutorCompletion(env, { videoId, title, question, history }) {
  const xaiApiKey = String(env.XAI_API_KEY || env.GROK_API_KEY || '').trim()
  const groqApiKey = String(env.GROQ_API_KEY || '').trim()
  const provider = xaiApiKey
    ? {
      name: 'xAI Grok',
      apiKey: xaiApiKey,
      url: 'https://api.x.ai/v1/chat/completions',
      model: String(env.XAI_MODEL || env.GROK_MODEL || 'grok-4.20-reasoning'),
    }
    : groqApiKey
    ? {
      name: 'Groq',
      apiKey: groqApiKey,
      url: 'https://api.groq.com/openai/v1/chat/completions',
      model: String(env.GROQ_MODEL || 'llama-3.3-70b-versatile'),
    }
    : null
  if (!provider) throw new Error('Missing tutor AI key in Worker environment.')
  const [youtubeMeta, transcript] = await Promise.all([
    fetchYouTubeMetadata(env, videoId),
    fetchYouTubeTranscript(videoId),
  ])
  const videoContext = buildVideoContext({ videoId, requestedTitle: title, youtubeMeta, transcript })
  const relevance = computeQuestionRelevance(question, videoContext.contextText)
  if (relevance < 0.12) {
    return {
      answer: 'I can only answer questions related to this video.',
      transcript: videoContext.transcript,
      title: videoContext.title,
    }
  }
  let response
  try {
    response = await fetch(provider.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        temperature: 0.2,
        max_tokens: 500,
        messages: buildTutorMessages({ question, history, videoContext }),
      }),
    })
  } catch {
    throw new Error(`${provider.name} tutor service is not reachable.`)
  }
  if (!response.ok) {
    const message = response.status === 401 || response.status === 403
      ? `${provider.name} rejected the configured tutor API key.`
      : `${provider.name} tutor completion failed with HTTP ${response.status}.`
    throw new Error(message)
  }
  const payload = await response.json()
  const answer = sanitizeText(payload?.choices?.[0]?.message?.content ?? '', 2000) || 'I can only answer questions related to this video.'
  return {
    answer,
    transcript: videoContext.transcript,
    title: videoContext.title,
  }
}

function routeMatch(pathname, pattern) {
  const regex = new RegExp(`^${pattern.replace(/:([a-zA-Z]+)/g, '(?<$1>[^/]+)')}$`)
  const match = pathname.match(regex)
  return match?.groups || null
}

async function handleRequest(request, env) {
  const url = new URL(request.url)
  const { pathname } = url
  const cors = corsHeaders(request, env)

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...cors,
        'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  if (pathname === '/api/health' && request.method === 'GET') {
    return json({ ok: true }, 200, cors)
  }

  if (pathname === '/api/lms-videos' && request.method === 'GET') {
    const payload = await getLmsVideos(env, url.searchParams.get('category'), url.searchParams.get('subcategory'))
    return json(payload, 200, cors)
  }

  if (pathname === '/api/jobs/linkedin' && request.method === 'GET') {
    try {
      const payload = await getLinkedInJobs(env, url.searchParams)
      return json(payload, 200, cors)
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : 'Unable to load LinkedIn jobs.' }, 502, cors)
    }
  }

  if (pathname === '/api/session/login' && request.method === 'POST') {
    try {
      const body = await request.json().catch(() => ({}))
      const idToken = String(body?.idToken ?? '').trim()
      const role = sanitizeRole(body?.role)
      if (!idToken || !role) return json({ error: 'idToken and role are required.' }, 400, cors)
      const user = await verifyFirebaseIdToken(env, idToken)
      if (!user.uid) return json({ error: 'Unable to resolve user from token.' }, 401, cors)
      const now = Date.now()
      const sid = crypto.randomUUID()
      const kv = getKv(env)
      if (kv) {
        await kv.put(
          toActiveSessionKey(user.uid),
          sid,
          { expirationTtl: Math.ceil(SESSION_ABSOLUTE_LIMIT_MS / 1000) },
        )
      }
      const payload = {
        uid: user.uid,
        email: user.email,
        role,
        sid,
        fingerprint: fingerprintValue(request),
        createdAtMs: now,
        rotatedAtMs: now,
        lastActivityAt: now,
      }
      const token = await createSessionToken(env, payload)
      return json(
        { user: { uid: user.uid, email: user.email, role } },
        200,
        {
          ...cors,
          'Set-Cookie': buildCookie(token, { secure: true }),
        },
      )
    } catch (error) {
      return json({
        error: error instanceof Error ? error.message : 'Authentication failed.',
      }, 401, cors)
    }
  }

  if (pathname === '/api/session/me' && request.method === 'GET') {
    const session = await readAuthSession(env, request)
    if (!session) return json({ authenticated: false }, 200, cors)
    return json({
      authenticated: true,
      user: {
        uid: session.uid,
        email: session.email ?? null,
        role: session.role,
      },
    }, 200, cors)
  }

  if (pathname === '/api/session/heartbeat' && request.method === 'POST') {
    const session = await readAuthSession(env, request)
    if (!session) return json({ authenticated: false }, 401, cors)
    const now = Date.now()
    if (now - Number(session.lastActivityAt || 0) < HEARTBEAT_MIN_INTERVAL_MS) {
      return json({ ok: true, skipped: true }, 200, cors)
    }
    const shouldRotate = now - Number(session.rotatedAtMs || 0) >= SESSION_ROTATION_INTERVAL_MS
    const nextPayload = {
      ...session,
      rotatedAtMs: shouldRotate ? now : Number(session.rotatedAtMs || now),
      lastActivityAt: now,
      fingerprint: fingerprintValue(request),
    }
    const token = await createSessionToken(env, nextPayload)
    return json({ ok: true }, 200, { ...cors, 'Set-Cookie': buildCookie(token, { secure: true }) })
  }

  if (pathname === '/api/session/logout' && request.method === 'POST') {
    const session = await readAuthSession(env, request)
    const kv = getKv(env)
    if (kv && session?.uid && session?.sid) {
      const activeSid = await kv.get(toActiveSessionKey(session.uid))
      if (activeSid === session.sid) {
        await kv.delete(toActiveSessionKey(session.uid))
      }
    }
    return json({ ok: true }, 200, { ...cors, 'Set-Cookie': buildClearCookie({ secure: true }) })
  }

  const feedbackMatch = routeMatch(pathname, '/api/courses/:courseId/feedback')
  if (feedbackMatch && request.method === 'GET') {
    const session = await readAuthSession(env, request)
    const courseId = sanitizeText(feedbackMatch.courseId, 120)
    if (!courseId) return json({ error: 'courseId is required.' }, 400, cors)
    const feedback = await kvGetJson(env, toFeedbackKey(courseId), { reviewsByUid: {}, averageRating: 0, totalReviews: 0 })
    const userReview = session?.uid ? feedback.reviewsByUid?.[session.uid] || null : null
    return json({
      averageRating: Number(feedback.averageRating || 0),
      totalReviews: Number(feedback.totalReviews || 0),
      userReview: userReview
        ? { rating: Number(userReview.rating || 0), reviewText: sanitizeText(userReview.reviewText || '', 600), updatedAt: userReview.updatedAt || null }
        : null,
    }, 200, cors)
  }

  if (feedbackMatch && request.method === 'POST') {
    const session = await readAuthSession(env, request)
    if (!session?.uid) return json({ error: 'Sign in to leave a rating.' }, 401, cors)
    const courseId = sanitizeText(feedbackMatch.courseId, 120)
    const body = await request.json().catch(() => ({}))
    const rating = Number(body?.rating)
    const reviewText = sanitizeText(body?.reviewText || '', 600)
    if (!courseId) return json({ error: 'courseId is required.' }, 400, cors)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return json({ error: 'Rating must be between 1 and 5.' }, 400, cors)

    const key = toFeedbackKey(courseId)
    const feedback = await kvGetJson(env, key, { reviewsByUid: {}, averageRating: 0, totalReviews: 0 })
    const reviewsByUid = { ...(feedback.reviewsByUid || {}) }
    const now = new Date().toISOString()
    reviewsByUid[session.uid] = {
      uid: session.uid,
      email: session.email || null,
      rating,
      reviewText,
      updatedAt: now,
      createdAt: reviewsByUid[session.uid]?.createdAt || now,
    }
    const all = Object.values(reviewsByUid)
    const totalReviews = all.length
    const averageRating = totalReviews > 0 ? Number((all.reduce((sum, item) => sum + Number(item.rating || 0), 0) / totalReviews).toFixed(2)) : 0
    await kvPutJson(env, key, { reviewsByUid, averageRating, totalReviews, updatedAt: now })
    return json({
      averageRating,
      totalReviews,
      userReview: { rating, reviewText, updatedAt: now },
    }, 200, cors)
  }

  if (pathname === '/api/tutor/video-chat' && request.method === 'POST') {
    const body = await request.json().catch(() => ({}))
    const videoId = sanitizeText(body?.videoId || '', 40)
    const title = sanitizeText(body?.title || '', 220)
    const question = sanitizeText(body?.question || '', 1000)
    const history = Array.isArray(body?.history) ? body.history : []
    if (!videoId) return json({ error: 'videoId is required.' }, 400, cors)
    if (!question) return json({ error: 'question is required.' }, 400, cors)
    try {
      const result = await runTutorCompletion(env, { videoId, title, question, history })
      return json(result, 200, cors)
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : 'Unable to answer tutor question.' }, 400, cors)
    }
  }

  if (pathname === '/api/onboarding/roadmap' && request.method === 'POST') {
    const body = await request.json().catch(() => ({}))
    try {
      const result = await runOnboardingRoadmapCompletion(env, body?.stage, body?.role)
      return json(result, 200, cors)
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : 'Unable to generate onboarding roadmap.' }, 400, cors)
    }
  }

  const tutorMatch = routeMatch(pathname, '/api/tutor/history/:videoId')
  if (tutorMatch && request.method === 'GET') {
    const session = await readAuthSession(env, request)
    if (!session?.uid) return json({ error: 'Sign in required for tutor history.' }, 401, cors)
    const videoId = sanitizeText(tutorMatch.videoId, 80)
    if (!videoId) return json({ error: 'videoId is required.' }, 400, cors)
    const history = await kvGetJson(env, toTutorKey(session.uid, videoId), { messages: [], transcript: '', updatedAt: null })
    return json({
      messages: sanitizeTutorHistoryMessages(history.messages),
      transcript: sanitizeText(history.transcript || '', 20000),
      updatedAt: history.updatedAt || null,
    }, 200, cors)
  }

  if (tutorMatch && request.method === 'PUT') {
    const session = await readAuthSession(env, request)
    if (!session?.uid) return json({ error: 'Sign in required for tutor history.' }, 401, cors)
    const videoId = sanitizeText(tutorMatch.videoId, 80)
    if (!videoId) return json({ error: 'videoId is required.' }, 400, cors)
    const body = await request.json().catch(() => ({}))
    const messages = sanitizeTutorHistoryMessages(body?.messages)
    const transcript = sanitizeText(body?.transcript || '', 20000)
    const updatedAt = new Date().toISOString()
    await kvPutJson(env, toTutorKey(session.uid, videoId), { videoId, messages, transcript, updatedAt })
    return json({ ok: true, updatedAt }, 200, cors)
  }

  return json({ error: 'Not found.' }, 404, cors)
}

export default {
  async fetch(request, env) {
    try {
      const response = await handleRequest(request, env)
      const cors = corsHeaders(request, env)
      Object.entries(cors).forEach(([k, v]) => response.headers.set(k, v))
      return applySecurityHeaders(response)
    } catch (error) {
      const cors = corsHeaders(request, env)
      return applySecurityHeaders(json({
        error: error instanceof Error ? error.message : 'Worker request failed.',
      }, 500, cors))
    }
  },
}
