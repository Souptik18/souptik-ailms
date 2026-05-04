import { ArrowRight, BookOpen, GraduationCap, HelpCircle, PlayCircle, Sparkles } from 'lucide-react'
import styles from './Footer.module.css'

const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Course catalog', href: '/course-list' },
      { label: 'Subject tracks', href: '/#explore-courses' },
      { label: 'Free courses', href: '/course-list' },
      { label: 'Learning paths', href: '/subjects/computerscience' },
    ],
  },
  {
    title: 'Learning',
    links: [
      { label: 'CS foundations', href: '/subjects/computerscience' },
      { label: 'Management', href: '/subjects/management' },
      { label: 'Design', href: '/subjects/design' },
      { label: 'Technology', href: '/subjects/technology' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Help center', href: '/#faq' },
      { label: 'About', href: '/#about' },
      { label: 'Guided programs', href: '/course-list' },
      { label: 'Course previews', href: '/course-list' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/#privacy' },
      { label: 'Terms', href: '/#terms' },
      { label: 'Accessibility', href: '/#accessibility' },
      { label: 'Contact', href: '/#contact' },
    ],
  },
]

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.wrap}>
        <section className={styles.ctaPanel}>
          <div className={styles.ctaCopy}>
            <h2>Start learning with clarity. Build skills that last.</h2>
            <p>Explore free courses, guided programs, and subject tracks built for focused progress.</p>
            <div className={styles.ctaActions}>
              <a className={styles.secondaryCta} href="/course-list">
                <PlayCircle size={17} />
                View courses
              </a>
              <a className={styles.primaryCta} href="/course-list">
                Get started
                <ArrowRight size={17} />
              </a>
            </div>
          </div>
          <div className={styles.imageMosaic} aria-label="Learning moments">
            <img src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=700" alt="" loading="lazy" />
            <img src="https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=600" alt="" loading="lazy" />
            <img src="https://images.pexels.com/photos/4145354/pexels-photo-4145354.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=600" alt="" loading="lazy" />
          </div>
        </section>

        <section className={styles.footerMain}>
          <div className={styles.brandBlock}>
            <a className={styles.brandMark} href="/" aria-label="OpenCourse home">
              <span className={styles.brandIcon}><GraduationCap size={19} /></span>
              <span>OpenCourse</span>
            </a>
            <p>Premium online learning for focused students, professionals, and lifelong learners.</p>
            <div className={styles.trustRow} aria-label="Learning benefits">
              <span><Sparkles size={14} /> Curated</span>
              <span><BookOpen size={14} /> Free access</span>
              <span><HelpCircle size={14} /> Guided help</span>
            </div>
          </div>

          <nav className={styles.footerColumns} aria-label="Footer navigation">
            {footerColumns.map((column) => (
              <div className={styles.footerColumn} key={column.title}>
                <h3>{column.title}</h3>
                {column.links.map((link) => (
                  <a key={link.label} href={link.href}>{link.label}</a>
                ))}
              </div>
            ))}
          </nav>

          <div className={styles.appBlock}>
            <h3>Learn anywhere</h3>
            <a href="/course-list" className={styles.storeBadge}>
              <span>Explore on</span>
              <strong>Web Portal</strong>
            </a>
            <a href="/subjects/computerscience" className={styles.storeBadge}>
              <span>Open</span>
              <strong>Subject Tracks</strong>
            </a>
          </div>
        </section>

        <section className={styles.bottomBand}>
          <p>(c) {new Date().getFullYear()} OpenCourse Studio</p>
          <div className={styles.socialLinks} aria-label="Social links">
            <a href="/#about" aria-label="About OpenCourse">X</a>
            <a href="/#faq" aria-label="Help center">in</a>
            <a href="/course-list" aria-label="Course catalog">f</a>
            <a href="/subjects/computerscience" aria-label="Subject tracks">dr</a>
          </div>
        </section>
      </div>
    </footer>
  )
}

export default Footer
