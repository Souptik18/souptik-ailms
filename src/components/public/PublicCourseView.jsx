import { useLocation } from 'react-router-dom'
import { embedUrl } from '../../utils/siteUtils'
import styles from './PublicCourseView.module.css'

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
  const stats = [
    { label: 'Rating', value: course.rating },
    { label: 'Learners', value: course.students.toLocaleString() },
    { label: 'Hours', value: course.hours },
    { label: 'Lessons', value: course.previewLessons.length },
  ]
  const summaryItems = course.summaryPoints ?? [
    `Course type: ${course.category}`,
    `Faculty: ${instructor?.name ?? course.instructorName ?? course.faculty ?? 'Faculty assigned'}`,
    `Level: ${course.level ?? 'All Levels'}`,
    `Language: ${course.language ?? 'English'}`,
  ]
  const layoutItems = course.layout ?? course.previewLessons.map((lesson, index) => `Week ${index + 1}: ${lesson.title}`)
  const referenceItems = course.references ?? ['Lecture notes', 'Recommended readings', 'Assessment guidelines']
  const certificateNote = course.certificateNote ?? 'Certificate is issued after satisfying the completion and evaluation criteria.'
  const facultyLabel = instructor?.name ?? course.instructorName ?? course.faculty ?? 'Faculty assigned'
  const enrollmentStatus = course.enrollmentStatus ?? 'Upcoming (Enrollment Open)'
  const requiresStudentAccess = currentUserRole && currentUserRole !== 'student'
  const canEnroll = authStateReady && currentUserRole === 'student' && !isEnrolled

  const accessActions = (() => {
    if (!authStateReady) {
      return (
        <button className="btn-outline" type="button" disabled>
          Checking access...
        </button>
      )
    }

    if (!currentUserRole) {
      return (
        <>
          <button className="btn-primary" type="button" onClick={() => onRegisterToEnroll(location.pathname)}>
            Register to Enroll
          </button>
          <button className="btn-outline" type="button" onClick={() => onLoginToEnroll(location.pathname)}>
            Already registered? Sign in
          </button>
        </>
      )
    }

    if (requiresStudentAccess) {
      return (
        <button className="btn-outline" type="button" disabled>
          Sign in as Student to Enroll
        </button>
      )
    }

    if (isEnrolled) {
      return (
        <button className="btn-primary" type="button" onClick={() => onOpenEnrolledCourse(course.id)}>
          See Course
        </button>
      )
    }

    return (
      <button className="btn-primary" type="button" onClick={() => onEnroll(course.id)} disabled={!canEnroll}>
        Enroll Now
      </button>
    )
  })()

  return (
    <section className={styles.stack}>
      <section className={styles.courseLayout}>
        <article className={styles.courseMain}>
          <article className={styles.panel}>
            <h1 className={styles.courseTitle}>{course.title}</h1>
            <p className={styles.subtitle}>{course.subtitle}</p>
            <div className={styles.metaRow}>
              <span>{course.rating} rating</span>
              <span>{course.students.toLocaleString()} students</span>
              <span>{course.hours} total hours</span>
              <span>{enrollmentStatus}</span>
            </div>
            <p className={styles.creatorLine}>
              Created by{' '}
              {instructor?.id ? (
                <button className="inline-link" type="button" onClick={() => onOpenInstructor(instructor.id)}>
                  {instructor.name}
                </button>
              ) : (
                <span>{facultyLabel}</span>
              )}
            </p>
            <div className={styles.statGrid}>
              {stats.map((item) => (
                <article key={item.label} className={styles.statCard}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </article>
              ))}
            </div>
          </article>

          <article className={styles.panel}>
            <h2>Course Trailer</h2>
            <div className="video-frame">
              <iframe
                src={embedUrl(course.youtubeId)}
                title={`${course.title} trailer`}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </article>

          <article className={styles.panel}>
            <h2>What you'll learn</h2>
            <ul>
              {course.learn.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>

          <article className={styles.panel}>
            <h2>Summary</h2>
            <ul>
              {summaryItems.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>

          <article className={styles.panel}>
            <h2>Preview Lessons</h2>
            <div className={styles.previewList}>
              {course.previewLessons.map((lesson, index) => (
                <button key={lesson.title} type="button" className={styles.previewRow} onClick={() => onPreview(course.id, index)}>
                  <span>{lesson.title}</span>
                  <span>{lesson.duration}</span>
                </button>
              ))}
            </div>
          </article>

          <article className={styles.panel}>
            <h2>Course Layout</h2>
            <ul>
              {layoutItems.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>

          <article className={styles.panel}>
            <h2>Books and References</h2>
            <ul>
              {referenceItems.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>

          <article className={styles.panel}>
            <h2>Course Certificate</h2>
            <p className={styles.supportText}>{certificateNote}</p>
          </article>
        </article>

        <aside className={styles.purchaseCard}>
          <p className={styles.cardEyebrow}>Enrollment Access</p>
          <h3>{authStateReady && currentUserRole ? 'Continue with learner enrollment' : 'Register first, then enroll'}</h3>
          <p className={styles.supportText}>
            The course card now opens a dedicated course page. Access is checked here first, then the learner can register or enroll.
          </p>
          <div className={styles.actionStack}>
            {accessActions}
          </div>
          <button className="btn-outline" type="button" onClick={() => onPreview(course.id, 0)}>Watch Preview</button>
        </aside>
      </section>
    </section>
  )
}

export default PublicCourseView
