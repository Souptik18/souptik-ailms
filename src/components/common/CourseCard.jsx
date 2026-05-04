import { thumbnailUrl } from '../../utils/siteUtils'
import styles from './CourseCard.module.css'

function CourseCard({ course, instructor, onOpen, onInstructor, onAddCart, onPreview }) {
  return (
    <article className={styles.card}>
      <img src={thumbnailUrl(course.youtubeId)} alt={course.title} className={styles.thumb} loading="lazy" />

      <div className={styles.body}>
        <p className={styles.partner}>KIITX Professional Certificate</p>
        <h3>{course.title}</h3>

        <button className={styles.instructorLink} type="button" onClick={() => onInstructor(instructor.id)}>
          {instructor.name}
        </button>

        <div className={styles.metaRow}>
          <span>{course.hours} hrs</span>
          <span>{course.level}</span>
        </div>

        <p className={styles.ratingLine}>
          <strong>{course.rating}</strong> ({course.reviews.toLocaleString()} reviews)
        </p>

        <p className={styles.freeTag}>Free</p>

        <div className={styles.buttons}>
          <button className="btn-primary" type="button" onClick={() => onAddCart(course.id)}>Enroll Free</button>
          <button className="btn-outline" type="button" onClick={() => onOpen(course.id)}>View Course</button>
          <button className={styles.previewLink} type="button" onClick={() => onPreview(course.id, 0)}>Preview</button>
        </div>
      </div>
    </article>
  )
}

export default CourseCard
