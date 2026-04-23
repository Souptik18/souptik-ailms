import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import {
  getAllowedOrigins,
  getCookieOptions,
  getServerPort,
  HEARTBEAT_MIN_INTERVAL_MS,
  SESSION_COOKIE_NAME,
} from './config.js'
import { getAdminAuth, getFirestore } from './firebaseAdmin.js'
import { createSession, deleteSession, getSession, resolveUserRole, touchSession } from './sessionStore.js'
import { answerVideoTutorQuestion } from './tutorService.js'

const app = express()
const cookieOptions = getCookieOptions()

app.use((request, response, next) => {
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.setHeader('X-Frame-Options', 'DENY')
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  next()
})

app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = new Set(getAllowedOrigins())
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true)
        return
      }
      callback(new Error('CORS origin not allowed.'))
    },
    credentials: true,
  }),
)

function normalizeCourseId(value) {
  return String(value ?? '').trim()
}

function getCourseFeedbackSummaryRef(courseId) {
  return getFirestore().collection('course-feedback').doc(courseId).collection('meta').doc('summary')
}

function getCourseReviewRef(courseId, uid) {
  return getFirestore().collection('course-feedback').doc(courseId).collection('reviews').doc(uid)
}

function getTutorHistoryRef(uid, videoId) {
  return getFirestore().collection('tutor-history').doc(uid).collection('videos').doc(videoId)
}

function sanitizeTutorHistoryMessages(messages) {
  if (!Array.isArray(messages)) return []
  return messages
    .slice(-200)
    .map((item) => ({
      id: String(item?.id ?? ''),
      role: item?.role === 'user' ? 'user' : 'bot',
      text: String(item?.text ?? '').trim().slice(0, 3000),
      createdAt: typeof item?.createdAt === 'number' ? item.createdAt : Date.now(),
    }))
    .filter((item) => item.id && item.text)
}

function clearSessionCookie(response) {
  response.clearCookie(SESSION_COOKIE_NAME, {
    ...cookieOptions,
    maxAge: undefined,
  })
}

function setSessionCookie(response, sessionId) {
  response.cookie(SESSION_COOKIE_NAME, sessionId, cookieOptions)
}

async function readAuthenticatedSession(request, response) {
  const sessionId = request.cookies?.[SESSION_COOKIE_NAME]
  if (!sessionId) return null

  const session = await getSession(sessionId, request)
  if (!session || !session.role) {
    await deleteSession(sessionId)
    clearSessionCookie(response)
    return null
  }

  return session
}

app.get('/api/health', (_request, response) => {
  response.json({ ok: true })
})

app.post('/api/session/login', async (request, response) => {
  try {
    const { idToken, role } = request.body ?? {}
    if (!idToken || typeof idToken !== 'string') {
      response.status(400).json({ error: 'idToken is required.' })
      return
    }

    const decodedToken = await getAdminAuth().verifyIdToken(idToken, true)
    const resolvedRole = await resolveUserRole(decodedToken.uid, role)
    const { sessionId, user } = await createSession({
      request,
      uid: decodedToken.uid,
      email: decodedToken.email ?? null,
      role: resolvedRole,
    })

    setSessionCookie(response, sessionId)
    response.json({ user })
  } catch (error) {
    response.status(401).json({
      error: error instanceof Error ? error.message : 'Authentication failed.',
    })
  }
})

app.get('/api/session/me', async (request, response) => {
  try {
    const session = await readAuthenticatedSession(request, response)
    if (!session) {
      response.status(401).json({ authenticated: false })
      return
    }

    response.json({
      authenticated: true,
      user: {
        uid: session.uid,
        email: session.email,
        role: session.role,
      },
    })
  } catch {
    response.status(500).json({ error: 'Unable to read session.' })
  }
})

app.post('/api/session/heartbeat', async (request, response) => {
  try {
    const session = await readAuthenticatedSession(request, response)
    if (!session) {
      response.status(401).json({ authenticated: false })
      return
    }

    if (Date.now() - session.lastActivityAt < HEARTBEAT_MIN_INTERVAL_MS) {
      response.json({ ok: true, skipped: true })
      return
    }

    const refreshedSession = await touchSession(session, request)
    if (!refreshedSession) {
      clearSessionCookie(response)
      response.status(401).json({ authenticated: false })
      return
    }

    if (refreshedSession.sessionId !== session.sessionId) {
      setSessionCookie(response, refreshedSession.sessionId)
    }

    response.json({ ok: true })
  } catch {
    response.status(500).json({ error: 'Unable to refresh session.' })
  }
})

app.post('/api/session/logout', async (request, response) => {
  try {
    const sessionId = request.cookies?.[SESSION_COOKIE_NAME]
    if (sessionId) {
      await deleteSession(sessionId)
    }

    clearSessionCookie(response)
    response.json({ ok: true })
  } catch {
    response.status(500).json({ error: 'Unable to end session.' })
  }
})

app.get('/api/courses/:courseId/feedback', async (request, response) => {
  try {
    const courseId = normalizeCourseId(request.params.courseId)
    if (!courseId) {
      response.status(400).json({ error: 'courseId is required.' })
      return
    }

    const [summarySnapshot, session] = await Promise.all([
      getCourseFeedbackSummaryRef(courseId).get(),
      readAuthenticatedSession(request, response),
    ])

    let userReview = null
    if (session?.uid) {
      const reviewSnapshot = await getCourseReviewRef(courseId, session.uid).get()
      userReview = reviewSnapshot.exists ? reviewSnapshot.data() : null
    }

    const summary = summarySnapshot.exists ? summarySnapshot.data() : {}
    response.json({
      averageRating: Number(summary.averageRating ?? 0),
      totalReviews: Number(summary.totalReviews ?? 0),
      userReview: userReview
        ? {
          rating: Number(userReview.rating ?? 0),
          reviewText: typeof userReview.reviewText === 'string' ? userReview.reviewText : '',
          updatedAt: userReview.updatedAt ?? null,
        }
        : null,
    })
  } catch {
    response.status(500).json({ error: 'Unable to load course feedback.' })
  }
})

app.post('/api/courses/:courseId/feedback', async (request, response) => {
  try {
    const session = await readAuthenticatedSession(request, response)
    if (!session?.uid) {
      response.status(401).json({ error: 'Sign in to leave a rating.' })
      return
    }

    const courseId = normalizeCourseId(request.params.courseId)
    const nextRating = Number(request.body?.rating)
    const reviewText = typeof request.body?.reviewText === 'string' ? request.body.reviewText.trim().slice(0, 600) : ''

    if (!courseId) {
      response.status(400).json({ error: 'courseId is required.' })
      return
    }

    if (!Number.isInteger(nextRating) || nextRating < 1 || nextRating > 5) {
      response.status(400).json({ error: 'Rating must be an integer between 1 and 5.' })
      return
    }

    const summaryRef = getCourseFeedbackSummaryRef(courseId)
    const reviewRef = getCourseReviewRef(courseId, session.uid)
    const now = new Date().toISOString()

    const result = await getFirestore().runTransaction(async (transaction) => {
      const [summarySnapshot, reviewSnapshot] = await Promise.all([
        transaction.get(summaryRef),
        transaction.get(reviewRef),
      ])

      const existingSummary = summarySnapshot.exists ? summarySnapshot.data() : {}
      const existingReview = reviewSnapshot.exists ? reviewSnapshot.data() : null
      const previousRating = Number(existingReview?.rating ?? 0)
      const previousCount = Number(existingSummary.totalReviews ?? 0)
      const previousAverage = Number(existingSummary.averageRating ?? 0)
      const previousTotal = previousAverage * previousCount
      const nextCount = existingReview ? previousCount : previousCount + 1
      const nextTotal = previousTotal - previousRating + nextRating
      const averageRating = nextCount > 0 ? Number((nextTotal / nextCount).toFixed(2)) : 0

      transaction.set(reviewRef, {
        uid: session.uid,
        email: session.email ?? null,
        rating: nextRating,
        reviewText,
        updatedAt: now,
        createdAt: existingReview?.createdAt ?? now,
      })

      transaction.set(summaryRef, {
        averageRating,
        totalReviews: nextCount,
        updatedAt: now,
      })

      return {
        averageRating,
        totalReviews: nextCount,
        userReview: {
          rating: nextRating,
          reviewText,
          updatedAt: now,
        },
      }
    })

    response.json(result)
  } catch {
    response.status(500).json({ error: 'Unable to save course feedback.' })
  }
})

app.post('/api/tutor/video-chat', async (request, response) => {
  try {
    const { videoId, title, question, history } = request.body ?? {}
    const result = await answerVideoTutorQuestion({
      videoId,
      title,
      question,
      history,
    })
    response.json(result)
  } catch (error) {
    response.status(400).json({
      error: error instanceof Error ? error.message : 'Unable to answer tutor question.',
    })
  }
})

app.get('/api/tutor/history/:videoId', async (request, response) => {
  try {
    const session = await readAuthenticatedSession(request, response)
    if (!session?.uid) {
      response.status(401).json({ error: 'Sign in required for tutor history.' })
      return
    }

    const videoId = normalizeCourseId(request.params.videoId)
    if (!videoId) {
      response.status(400).json({ error: 'videoId is required.' })
      return
    }

    const snapshot = await getTutorHistoryRef(session.uid, videoId).get()
    if (!snapshot.exists) {
      response.json({ messages: [], transcript: '', updatedAt: null })
      return
    }

    const data = snapshot.data() ?? {}
    response.json({
      messages: sanitizeTutorHistoryMessages(data.messages),
      transcript: typeof data.transcript === 'string' ? data.transcript : '',
      updatedAt: data.updatedAt ?? null,
    })
  } catch {
    response.status(500).json({ error: 'Unable to load tutor history.' })
  }
})

app.put('/api/tutor/history/:videoId', async (request, response) => {
  try {
    const session = await readAuthenticatedSession(request, response)
    if (!session?.uid) {
      response.status(401).json({ error: 'Sign in required for tutor history.' })
      return
    }

    const videoId = normalizeCourseId(request.params.videoId)
    if (!videoId) {
      response.status(400).json({ error: 'videoId is required.' })
      return
    }

    const messages = sanitizeTutorHistoryMessages(request.body?.messages)
    const transcript = typeof request.body?.transcript === 'string' ? request.body.transcript.slice(0, 20000) : ''
    const now = new Date().toISOString()

    await getTutorHistoryRef(session.uid, videoId).set(
      {
        videoId,
        messages,
        transcript,
        updatedAt: now,
      },
      { merge: true },
    )

    response.json({ ok: true, updatedAt: now })
  } catch {
    response.status(500).json({ error: 'Unable to save tutor history.' })
  }
})

app.listen(getServerPort(), () => {
  console.log(`KIITX auth server listening on port ${getServerPort()}`)
})
