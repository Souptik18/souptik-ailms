import { embedUrl } from '../../utils/siteUtils'
import styles from './Modal.module.css'

function PreviewModal({ course, lessonIndex, onLessonChange, onClose, isEnrolled, onOpenCourse }) {
  const lesson = course.previewLessons[lessonIndex] ?? course.previewLessons[0]

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <article className={styles.previewModal}>
        <div className={styles.stack}>
          <p className="meta-copy">Previewing {course.title}</p>
          <h3>{lesson.title}</h3>
          <p className="meta-copy">Duration: {lesson.duration}</p>
          <div className={styles.videoFrame}>
            <iframe
              src={embedUrl(lesson.youtubeId ?? course.youtubeId)}
              title={`${course.title} lesson preview`}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
        <div className={styles.previewList}>
          {course.previewLessons.map((item, index) => (
            <button
              key={item.title}
              type="button"
              className={`${styles.previewRow} ${index === lessonIndex ? styles.active : ''}`}
              onClick={() => onLessonChange(index)}
            >
              <span>{item.title}</span>
              <span>{item.duration}</span>
            </button>
          ))}
          {isEnrolled ? (
            <button className="btn-primary" type="button" onClick={() => onOpenCourse(course.id)}>
              See Course
            </button>
          ) : null}
          <button className="btn-outline" type="button" onClick={onClose}>Close Preview</button>
        </div>
      </article>
    </div>
  )
}

export default PreviewModal
