import CourseCard from '../common/CourseCard'
import styles from './PublicInstructorView.module.css'

function PublicInstructorView({
  instructor,
  instructorCourses,
  onOpenCourse,
  onOpenInstructor,
  onAddCart,
  onPreview,
}) {
  return (
    <section className={styles.stack}>
      <article className={styles.banner}>
        <p className={styles.breadcrumb}>Home &gt; National Coordinators &gt; Faculty</p>
        <p className={styles.eyebrow}>Instructor profile</p>
        <h1>{instructor.name}</h1>
        <p className={styles.subtitle}>{instructor.title}</p>
        <div className={styles.metaRow}>
          <span>{instructor.rating} rating</span>
          <span>{instructor.students} students</span>
          <span>{instructor.courses} courses</span>
        </div>
        <div className={styles.statGrid}>
          <article className={styles.statCard}>
            <strong>{instructor.rating}</strong>
            <span>Average rating</span>
          </article>
          <article className={styles.statCard}>
            <strong>{instructor.students}</strong>
            <span>Learners reached</span>
          </article>
          <article className={styles.statCard}>
            <strong>{instructor.courses}</strong>
            <span>Published courses</span>
          </article>
        </div>
      </article>

      <section className={styles.gridThree}>
        {instructorCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            instructor={instructor}
            onOpen={onOpenCourse}
            onInstructor={onOpenInstructor}
            onAddCart={onAddCart}
            onPreview={onPreview}
          />
        ))}
      </section>
    </section>
  )
}

export default PublicInstructorView
