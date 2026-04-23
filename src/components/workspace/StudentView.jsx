import { useEffect, useMemo, useState } from 'react'
import { thumbnailUrl } from '../../utils/siteUtils'
import styles from './WorkspaceViews.module.css'

const STATUS_BY_COURSE = {
  'sys-design': 'In progress',
  'ml-blueprint': 'In progress',
  'react-scale': 'Completed',
  'devops-bootcamp': 'Not started',
}

const PROGRESS_BY_COURSE = {
  'sys-design': 62,
  'ml-blueprint': 44,
  'react-scale': 100,
  'devops-bootcamp': 15,
}

function StudentView({ activeTab, selectedCourse, courses, enrolledCourseIds, onVideoViewChange, onOpenCourseView }) {
  const [activeFilter, setActiveFilter] = useState('All courses')
  const [activeCourseId, setActiveCourseId] = useState(selectedCourse.id)

  const enrolledCourses = useMemo(() => (
    courses.filter((course) => enrolledCourseIds.includes(course.id))
  ), [courses, enrolledCourseIds])

  const filteredCourses = useMemo(() => {
    const sourceCourses = activeTab === 'My Learnings' ? enrolledCourses : courses
    if (activeFilter === 'All courses') return sourceCourses
    return sourceCourses.filter((course) => STATUS_BY_COURSE[course.id] === activeFilter)
  }, [activeFilter, activeTab, courses, enrolledCourses])

  const activeCourse = useMemo(
    () => courses.find((course) => course.id === activeCourseId) ?? selectedCourse,
    [activeCourseId, courses, selectedCourse],
  )

  const filters = ['All courses', 'In progress', 'Completed']

  const openCourseView = (courseId) => {
    setActiveCourseId(courseId)
    const course = courses.find((item) => item.id === courseId)
    if (course) {
      onOpenCourseView?.(course)
    }
  }

  useEffect(() => {
    onVideoViewChange?.(false)
  }, [onVideoViewChange])

  return (
    <div className={styles.studentShell}>
      <header className={styles.studentTop}>
        <div>
          <h1>{activeTab}</h1>
          <p>
            {activeTab === 'My Learnings'
              ? 'Open any enrolled course to continue in the full subject-style learning view.'
              : 'Continue through your enrolled courses in the updated learner-portal workspace.'}
          </p>
        </div>
        <div className={styles.filterPills}>
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={activeFilter === filter ? styles.filterPillActive : ''}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </header>

      <section className={styles.learningCards}>
        {filteredCourses.length === 0 && (
          <article className={styles.emptyStateCard}>
            <h3>No enrolled courses yet</h3>
            <p>Enroll in a course first. It will appear here and open in the three-column learning layout.</p>
          </article>
        )}
        {filteredCourses.map((course) => {
          const status = STATUS_BY_COURSE[course.id] ?? 'In progress'
          const progress = PROGRESS_BY_COURSE[course.id] ?? 0
          return (
            <button
              key={course.id}
              type="button"
              className={`${styles.learningCard} ${course.id === activeCourse.id ? styles.learningCardActive : ''}`}
              onClick={() => openCourseView(course.id)}
            >
              <div className={styles.cardThumb}>
                <img src={thumbnailUrl(course.youtubeId)} alt={course.title} loading="lazy" />
                <span>Resume</span>
              </div>
              <div className={styles.cardBody}>
                <h3>{course.title}</h3>
                <p>{course.subtitle}</p>
                <div className={styles.cardMeta}>
                  <span>{status}</span>
                  <span>{progress}% complete</span>
                </div>
                <div className={styles.cardProgress}>
                  <span style={{ width: `${progress}%` }} />
                </div>
              </div>
            </button>
          )
        })}
      </section>
    </div>
  )
}

export default StudentView
