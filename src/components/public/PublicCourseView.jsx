import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { BookOpen, CirclePlay, Clock3, Star, Users } from 'lucide-react'
import { embedUrl, thumbnailUrl } from '../../utils/siteUtils'
import styles from './PublicCourseView.module.css'

function formatCurrency(amount) {
  return `INR ${amount.toLocaleString('en-IN')}`
}

function PublicCourseView({
  course,
  instructor,
  onOpenInstructor,
  onPreview,
  onOpenEnrolledCourse,
  currentUserRole,
  authStateReady,
  onRegisterToEnroll,
  onLoginToEnroll,
  onEnroll,
  isEnrolled,
}) {
  const location = useLocation()
  const [activePreviewIndex, setActivePreviewIndex] = useState(0)
  const previewLessons = Array.isArray(course.previewLessons) && course.previewLessons.length > 0
    ? course.previewLessons
    : [{ title: 'Course Trailer', duration: 'Preview', youtubeId: course.youtubeId }]
  const safePreviewIndex = activePreviewIndex >= previewLessons.length ? 0 : activePreviewIndex
  const activePreview = previewLessons[safePreviewIndex] ?? previewLessons[0]

  const priceValue = Number(course?.price)
  const isPaidCourse = Number.isFinite(priceValue) && priceValue > 0
  const originalPriceValue = Number(course?.originalPrice)
  const originalPrice = isPaidCourse
    ? (Number.isFinite(originalPriceValue) && originalPriceValue > priceValue
      ? originalPriceValue
      : Math.round(priceValue * 1.9))
    : 0
  const discountPercent = isPaidCourse && originalPrice > priceValue
    ? Math.max(1, Math.round(((originalPrice - priceValue) / originalPrice) * 100))
    : 0

  const summaryItems = course.summaryPoints ?? [
    `Course type: ${course.category}`,
    `Faculty: ${instructor?.name ?? course.instructorName ?? course.faculty ?? 'Faculty assigned'}`,
    `Level: ${course.level ?? 'All Levels'}`,
    `Language: ${course.language ?? 'English'}`,
  ]
  const curriculumItems = course.layout ?? previewLessons.map((lesson, index) => `Week ${index + 1}: ${lesson.title}`)
  const referenceItems = course.references ?? ['Lecture notes', 'Recommended readings', 'Assessment guidelines']
  const certificateNote = course.certificateNote ?? 'Certificate is issued after satisfying the completion and evaluation criteria.'
  const facultyLabel = instructor?.name ?? course.instructorName ?? course.faculty ?? 'Faculty assigned'
  const enrollmentStatus = course.enrollmentStatus ?? 'Upcoming (Enrollment Open)'
  const requiresStudentAccess = currentUserRole && currentUserRole !== 'student'

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActivePreviewIndex((current) => (current + 1) % previewLessons.length)
    }, 6500)
    return () => window.clearInterval(timer)
  }, [previewLessons.length])

  const accessActions = useMemo(() => {
    if (!authStateReady) {
      return (
        <button className={styles.secondaryAction} type="button" disabled>
          Checking access...
        </button>
      )
    }

    if (!currentUserRole) {
      return (
        <>
          <button className={styles.primaryAction} type="button" onClick={() => onRegisterToEnroll(location.pathname)}>
            Register
          </button>
          <button className={styles.secondaryAction} type="button" onClick={() => onLoginToEnroll(location.pathname)}>
            Already registered? Sign in
          </button>
        </>
      )
    }

    if (requiresStudentAccess) {
      return (
        <button className={styles.secondaryAction} type="button" disabled>
          Student account required
        </button>
      )
    }

    if (isEnrolled) {
      return (
        <button className={styles.primaryAction} type="button" onClick={() => onOpenEnrolledCourse(course.id)}>
          See Course
        </button>
      )
    }

    return (
      <button className={styles.primaryAction} type="button" onClick={() => onEnroll(course.id)}>
        {isPaidCourse ? `Enroll for ${formatCurrency(priceValue)}` : 'Enroll Free'}
      </button>
    )
  }, [
    authStateReady,
    currentUserRole,
    course.id,
    isEnrolled,
    isPaidCourse,
    location.pathname,
    onEnroll,
    onLoginToEnroll,
    onOpenEnrolledCourse,
    onRegisterToEnroll,
    priceValue,
    requiresStudentAccess,
  ])

  return (
    <section className={styles.page}>
      <div className={styles.layout}>
        <article className={styles.mainColumn}>
          <section className={styles.heroCard}>
            <div className={styles.topBadges}>
              <span>{course.category}</span>
              <span>{isPaidCourse ? 'Paid course' : 'Free course'}</span>
              <span>{enrollmentStatus}</span>
            </div>
            <h1>{course.title}</h1>
            <p>{course.subtitle}</p>
            <div className={styles.metaRow}>
              <span><Star size={14} /> {Number(course.rating).toFixed(1)} rating</span>
              <span><Users size={14} /> {Number(course.students).toLocaleString()} learners</span>
              <span><Clock3 size={14} /> {course.hours} hours</span>
              <span><BookOpen size={14} /> {previewLessons.length} lessons</span>
            </div>
            <p className={styles.facultyRow}>
              Created by{' '}
              {instructor?.id ? (
                <button className={styles.inlineButton} type="button" onClick={() => onOpenInstructor(instructor.id)}>
                  {instructor.name}
                </button>
              ) : (
                <strong>{facultyLabel}</strong>
              )}
            </p>
          </section>

          <section className={styles.videoCard}>
            <div className={styles.videoHeader}>
              <h2>Video Details</h2>
              <div className={styles.carouselControls}>
                <button
                  type="button"
                  className={styles.carouselButton}
                  onClick={() => setActivePreviewIndex((current) => (current - 1 + previewLessons.length) % previewLessons.length)}
                  aria-label="Previous preview"
                >
                  {'<'}
                </button>
                <button
                  type="button"
                  className={styles.carouselButton}
                  onClick={() => setActivePreviewIndex((current) => (current + 1) % previewLessons.length)}
                  aria-label="Next preview"
                >
                  {'>'}
                </button>
              </div>
            </div>
            <div className="video-frame">
              <iframe
                src={embedUrl(activePreview.youtubeId || course.youtubeId)}
                title={`${course.title} trailer`}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className={styles.videoCaption}>
              <strong>{activePreview.title}</strong>
              <span>{activePreview.duration}</span>
            </div>
            <div className={styles.lessonGrid}>
              {previewLessons.map((lesson, index) => (
                <button
                  key={`${lesson.title}-${index}`}
                  type="button"
                  className={index === safePreviewIndex ? styles.lessonItemActive : styles.lessonItem}
                  onClick={() => {
                    setActivePreviewIndex(index)
                    onPreview(course.id, index)
                  }}
                >
                  <img src={thumbnailUrl(lesson.youtubeId || course.youtubeId)} alt="" loading="lazy" />
                  <div>
                    <span>{lesson.title}</span>
                    <small>{lesson.duration}</small>
                  </div>
                  <CirclePlay size={15} />
                </button>
              ))}
            </div>
          </section>

          <section className={styles.infoColumns}>
            <article className={styles.infoCard}>
              <h2>What you will learn</h2>
              <ul>
                {course.learn.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
            <article className={styles.infoCard}>
              <h2>Course curriculum</h2>
              <ul>
                {curriculumItems.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
            <article className={styles.infoCard}>
              <h2>Summary</h2>
              <ul>
                {summaryItems.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
            <article className={styles.infoCard}>
              <h2>Books and references</h2>
              <ul>
                {referenceItems.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
            <article className={styles.infoCard}>
              <h2>Certification</h2>
              <p>{certificateNote}</p>
            </article>
          </section>
        </article>

        <aside className={styles.sideColumn}>
          <section className={styles.checkoutCard}>
            <p className={styles.checkoutLabel}>Payment & Enrollment</p>
            <h3>{isPaidCourse ? 'Secure your seat in this paid cohort' : 'This course is free to enroll'}</h3>
            {isPaidCourse ? (
              <div className={styles.pricePanel}>
                <strong>{formatCurrency(priceValue)}</strong>
                <div>
                  <small>{formatCurrency(originalPrice)}</small>
                  <span>{discountPercent}% off</span>
                </div>
              </div>
            ) : (
              <div className={styles.pricePanel}>
                <strong>Free Access</strong>
              </div>
            )}
            <ul className={styles.checkoutBullets}>
              <li>Full video lessons and learner workspace access</li>
              <li>Roadmap-aligned recommendations after enrollment</li>
              <li>Certificate path and progress tracking support</li>
            </ul>
            <div className={styles.actions}>
              {accessActions}
              <button className={styles.secondaryAction} type="button" onClick={() => onPreview(course.id, 0)}>
                Watch Preview
              </button>
            </div>
          </section>
        </aside>
      </div>
    </section>
  )
}

export default PublicCourseView
