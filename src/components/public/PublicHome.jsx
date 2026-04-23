import { useState } from 'react'
import {
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Cpu,
  Globe,
  HeartPulse,
  Palette,
  Scale,
  Sigma,
  Search,
} from 'lucide-react'
import { thumbnailUrl } from '../../utils/siteUtils'
import { exploreCategories, exploreCoursesByCategory } from '../../data/publicCatalogData'
import uilsLogo from '../../utils/pic.png'
import styles from './PublicHome.module.css'

const heroShortcuts = [
  { label: 'Popular Courses', icon: BookOpen, action: 'catalog' },
  { label: 'Architecture & Planning', icon: Building2, action: 'catalog', query: 'system' },
  { label: 'Design', icon: Palette, action: 'catalog', query: 'react' },
  { label: 'Engineering & Technology', icon: Cpu, action: 'subject', subject: 'engineering' },
  { label: 'Health Sciences', icon: HeartPulse, action: 'subject', subject: 'science' },
  { label: 'Humanities & Arts', icon: Globe, action: 'catalog', query: 'communication' },
  { label: 'Law', icon: Scale, action: 'catalog', query: 'cloud' },
  { label: 'Management & Commerce', icon: BriefcaseBusiness, action: 'subject', subject: 'commerce' },
  { label: 'Maths & Sciences', icon: Sigma, action: 'subject', subject: 'science' },
]

const rankingHighlights = [
  {
    title: 'NIRF Logo',
    items: [
      '17th rank among all public & private universities in India',
      '27th in the overall category',
      '14th in Law category',
      '24th in Medical category',
      '36th in Engineering category',
    ],
  },
  {
    title: 'Times Higher Education',
    items: [
      '501-600 in Times Higher Education World University Rankings 2026',
      '168th in Times Higher Education Young University Rankings 2024',
      '184th in Times Higher Education Asia University Rankings 2026',
      '5th in the overall category among Indian universities',
    ],
  },
  {
    title: 'SDG Rankings',
    items: [
      '101-200 in Times Higher Education Impact Rankings 2025',
      'No.3 in India & 20th globally for SDG 4',
      'No.1 in India & 15th globally for SDG 10',
      'No.1 in India & 29th globally for SDG 16',
      '19th in India & 401-600 globally for SDG 17',
    ],
  },
  {
    title: 'QS Rankings',
    items: [
      '1st rank among all private universities in Odisha',
      '294th in QS Asia University Rankings 2025 for South Asia',
      "QS 5 Stars India's first university to receive this rating in 2026",
    ],
  },
]


function PublicHome({ onOpenSubject, onOpenCatalog, onOpenCourse }) {
  const [query, setQuery] = useState('')
  const [activeExploreCategory, setActiveExploreCategory] = useState('Design')

  const activeExploreCourses = exploreCoursesByCategory[activeExploreCategory] ?? []

  const scrollToCatalog = () => {
    if (typeof document === 'undefined') return
    document.getElementById('explore-courses')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    scrollToCatalog()
  }

  const handleShortcutClick = (shortcut) => {
    if (shortcut.action === 'subject') {
      onOpenSubject(shortcut.subject)
      return
    }

    setQuery(shortcut.query ?? '')
    scrollToCatalog()
  }

  return (
    <>
      <section className={styles.hero} id="about-swayam">
        <div className={styles.heroBrand}>
          <img src={uilsLogo} alt="KIITX portal" className={styles.heroLogo} />
          <p className={styles.heroTag}>KIITX learning portal</p>
        </div>

        <form className={styles.searchBar} onSubmit={handleSearchSubmit}>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search KIITX Courses"
            aria-label="Search KIITX Courses"
          />
          <button type="submit" aria-label="Search courses">
            <Search size={22} strokeWidth={2.2} />
          </button>
        </form>

        <div className={styles.shortcutGrid}>
          {heroShortcuts.map((shortcut) => {
            const Icon = shortcut.icon

            return (
              <button
                key={shortcut.label}
                type="button"
                className={styles.shortcutCard}
                onClick={() => handleShortcutClick(shortcut)}
              >
                <span className={styles.shortcutIcon}>
                  <Icon size={28} strokeWidth={1.8} />
                </span>
                <span>{shortcut.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className={styles.rankingsTitle}>
        <h2>Why KIITX E-Learning</h2>
      </section>

      <section className={styles.rankingsBand} aria-label="University rankings and recognitions">
        {rankingHighlights.map((group) => (
          <article key={group.title} className={styles.rankingCard}>
            <div className={styles.rankingHeader}>
              <span className={styles.rankingBadge}>{group.title}</span>
            </div>
            <ul className={styles.rankingList}>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className={styles.exploreBand} id="explore-courses">
        <div className={styles.exploreHeadingRow}>
          <h2>Explore Courses</h2>
        </div>

        <div className={styles.exploreCategoryTabs} role="tablist" aria-label="Explore categories">
          {exploreCategories.map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={activeExploreCategory === category}
              className={activeExploreCategory === category ? styles.exploreTabActive : ''}
              onClick={() => setActiveExploreCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className={styles.exploreVideoGrid}>
          {activeExploreCourses.map((course) => (
            <button
              key={course.id}
              type="button"
              className={styles.exploreVideoCard}
              onClick={() => onOpenCourse(course.id)}
            >
              <img src={thumbnailUrl(course.youtubeId)} alt={course.title} loading="lazy" />
              <div className={styles.exploreVideoBody}>
                <h3>{course.title}</h3>
                <p className={styles.exploreVideoInstitute}>{course.institute}</p>
                <p className={styles.exploreVideoFaculty}>{course.faculty}</p>
              </div>
            </button>
          ))}
        </div>

        <button type="button" className={styles.showAllCoursesButton} onClick={onOpenCatalog}>
          All Courses
        </button>
      </section>
    </>
  )
}

export default PublicHome
