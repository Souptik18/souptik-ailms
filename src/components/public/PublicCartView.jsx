import styles from './PublicCartView.module.css'

function PublicCartView({ cartCourses, instructorsById, onRemoveCart, onStartLearning }) {
  return (
    <section className={styles.stack}>
      <article className={styles.heroPanel}>
        <p className={styles.breadcrumb}>Home &gt; Learner Dashboard &gt; My Courses</p>
        <p className={styles.eyebrow}>Enrollment summary</p>
        <h1>My Free Courses ({cartCourses.length})</h1>
        <p className={styles.subtitle}>This page now follows the same structured learner-portal style used across the rest of the site.</p>
      </article>

      <section className={styles.cartLayout}>
        <article className={styles.panel}>
          {cartCourses.length === 0 && <p className="meta-copy">No free course enrolled yet.</p>}
          {cartCourses.map((course) => (
            <div key={course.id} className={styles.cartRow}>
              <div>
                <h3>{course.title}</h3>
                <p className="meta-copy">{instructorsById[course.instructorId].name}</p>
              </div>
              <div className={styles.cartSide}>
                <strong>Free</strong>
                <button className="inline-link" type="button" onClick={() => onRemoveCart(course.id)}>Remove</button>
              </div>
            </div>
          ))}
        </article>

        <aside className={styles.purchaseCard}>
          <p className={styles.cardEyebrow}>Learner note</p>
          <h3>All enrolled courses are free</h3>
          <p className={styles.supportText}>Continue into the learner workspace and access course content through the updated portal layout.</p>
          <button className="btn-primary" type="button" onClick={onStartLearning}>Start Learning</button>
        </aside>
      </section>
    </section>
  )
}

export default PublicCartView
