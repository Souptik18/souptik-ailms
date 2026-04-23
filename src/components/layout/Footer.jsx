import styles from './Footer.module.css'

const kiitGroupLinks = [
  'Founder',
  'KIIT',
  'KISS',
  'KIMS',
  'KSOM',
  'KIIT Polytechnic',
  'KIIT International School',
  'Art of Giving',
  'Kanya Kiran',
]

const usefulLinks = [
  'About Us',
  'Leadership',
  'UGC Approval for Online Program',
  'CIQA',
  'Mandatory Disclosures',
  'FAQS',
  'Helpdesk',
  'LMS Login',
  'Blogs',
  'Cancellation and Refund Policies',
  'Admission Guidelines',
]

function Footer() {
  return (
    <footer className={styles.footer}>
      <section className={styles.linkGrid}>
        <article className={styles.linkColumn}>
          <h3>KIIT Group</h3>
          <ul>
            {kiitGroupLinks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className={styles.linkColumn}>
          <h3>Other Useful Links</h3>
          <ul>
            {usefulLinks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>
    </footer>
  )
}

export default Footer
