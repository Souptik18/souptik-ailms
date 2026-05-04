import { inr } from '../../utils/siteUtils'
import styles from './WorkspaceViews.module.css'

function InstructorView({ activeTab }) {
  const summaryCards = [
    { value: '1,264', label: 'Total students', tone: 'primary' },
    { value: '14', label: 'Active batches', tone: 'primary' },
    { value: '92%', label: 'Completion trend', tone: 'accent' },
    { value: inr(392000), label: 'Revenue', tone: 'accent' },
  ]

  const courseRows = [
    { title: 'System Design for Placements', coordinator: 'NPTEL aligned', status: 'Ongoing', learners: '524' },
    { title: 'Machine Learning Engineering Blueprint', coordinator: 'AICTE stream', status: 'Review', learners: '318' },
    { title: 'Cloud DevOps Hands-on Bootcamp', coordinator: 'Local chapter', status: 'Scheduled', learners: '422' },
  ]

  return (
    <div className={styles.stack}>
      <section className={styles.panel}>
        <p className={styles.sectionEyebrow}>Instructor workspace</p>
        <h1>Academic delivery overview - {activeTab}</h1>
        <p className={styles.leadCopy}>
          This workspace now follows the same institutional UI language as the public portal, keeping metrics, course status, and coordinator readiness visible at a glance.
        </p>
      </section>

      <div className={styles.grid}>
        {summaryCards.map((card) => (
          <article key={card.label} className={`${styles.metricCard} ${card.tone === 'accent' ? styles.metricCardAccent : ''}`}>
            <h3>{card.value}</h3>
            <p>{card.label}</p>
          </article>
        ))}
      </div>

      <div className={styles.dualGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.sectionEyebrow}>Course readiness</p>
              <h2>Coordinator-style course status</h2>
            </div>
          </div>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Stream</th>
                  <th>Status</th>
                  <th>Learners</th>
                </tr>
              </thead>
              <tbody>
                {courseRows.map((row) => (
                  <tr key={row.title}>
                    <td>{row.title}</td>
                    <td>{row.coordinator}</td>
                    <td>
                      <span className={`${styles.statusChip} ${row.status === 'Review' ? styles.warn : ''}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>{row.learners}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.sectionEyebrow}>Delivery notes</p>
              <h2>What needs attention</h2>
            </div>
          </div>
          <div className={styles.noteStack}>
            <article className={styles.noteCard}>
              <strong>Assessment publishing</strong>
              <p>Two active batches still need the public assessment notice updated before the next release cycle.</p>
            </article>
            <article className={styles.noteCard}>
              <strong>Certification metadata</strong>
              <p>Completion criteria and credit-transfer notes should remain visible on every course detail page.</p>
            </article>
            <article className={styles.noteCard}>
              <strong>Coordinator sync</strong>
              <p>Use the updated visual blocks to keep NPTEL and local chapter course details consistent.</p>
            </article>
          </div>
        </section>
      </div>
    </div>
  )
}

export default InstructorView
