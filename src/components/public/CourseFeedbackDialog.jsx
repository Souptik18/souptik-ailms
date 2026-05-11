import { useEffect, useState } from 'react'
import { getCourseFeedbackSummary, saveCourseReview } from '../../firebase/courseFeedbackService'
import styles from './CourseFeedbackDialog.module.css'

const RATING_OPTIONS = [5, 4, 3, 2, 1]

function formatAverageRating(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return '0.0'
  }

  return value.toFixed(1)
}

function CourseFeedbackDialog({ open, courseId, courseTitle, onClose }) {
  const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0, userReview: null })
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!open || !courseId) return

    let active = true
    setLoading(true)
    setError('')
    setSuccess('')

    getCourseFeedbackSummary(courseId)
      .then((payload) => {
        if (!active) return
        const userReview = payload.userReview ?? null
        setSummary({
          averageRating: Number(payload.averageRating ?? 0),
          totalReviews: Number(payload.totalReviews ?? 0),
          userReview,
        })
        setRating(Number(userReview?.rating ?? 5))
        setReviewText(userReview?.reviewText ?? '')
      })
      .catch((loadError) => {
        if (!active) return
        setError(loadError.message || 'Unable to load course rating.')
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [open, courseId])

  if (!open) return null

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const payload = await saveCourseReview(courseId, {
        rating,
        reviewText,
      })
      const userReview = payload.userReview ?? { rating, reviewText }
      setSummary({
        averageRating: Number(payload.averageRating ?? 0),
        totalReviews: Number(payload.totalReviews ?? 0),
        userReview,
      })
      setRating(Number(userReview.rating ?? rating))
      setReviewText(userReview.reviewText ?? reviewText)
      setSuccess('Rating saved to cloud.')
    } catch (saveError) {
      setError(saveError.message || 'Unable to save course rating.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="course-feedback-title">
      <div className={styles.dialog}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Course Rating</p>
            <h2 id="course-feedback-title">Leave a rating for {courseTitle}</h2>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close review popup">
            Close
          </button>
        </div>

        <div className={styles.summaryCard}>
          <strong>{formatAverageRating(summary.averageRating)}/5</strong>
          <span>{summary.totalReviews} ratings saved</span>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.ratingGrid}>
            {RATING_OPTIONS.map((value) => (
              <button
                key={value}
                type="button"
                className={rating === value ? styles.ratingActive : styles.ratingButton}
                onClick={() => setRating(value)}
              >
                {value}/5
              </button>
            ))}
          </div>

          <label className={styles.field}>
            <span>Review</span>
            <textarea
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value.slice(0, 600))}
              placeholder="Share what was useful in this course."
              rows={5}
            />
          </label>

          {loading ? <p className={styles.infoLine}>Loading saved rating...</p> : null}
          {error ? <p className={styles.errorLine}>{error}</p> : null}
          {success ? <p className={styles.successLine}>{success}</p> : null}

          <div className={styles.actions}>
            <button type="button" className={styles.secondaryAction} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryAction} disabled={saving || loading}>
              {saving ? 'Saving...' : 'Save Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CourseFeedbackDialog
