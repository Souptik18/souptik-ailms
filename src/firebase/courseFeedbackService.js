const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '')
const COURSE_API_BASE = API_BASE_URL ? `${API_BASE_URL}/api/courses` : '/api/courses'

async function requestCourseFeedback(path, options = {}) {
  const response = await fetch(`${COURSE_API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(payload.error || 'Course feedback request failed.')
    error.status = response.status
    throw error
  }

  return payload
}

export async function getCourseFeedbackSummary(courseId) {
  return requestCourseFeedback(`/${courseId}/feedback`, { method: 'GET' })
}

export async function saveCourseReview(courseId, review) {
  return requestCourseFeedback(`/${courseId}/feedback`, {
    method: 'POST',
    body: JSON.stringify(review),
  })
}
