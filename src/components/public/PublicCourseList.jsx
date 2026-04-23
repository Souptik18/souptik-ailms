import { useState } from 'react'
import { Search } from 'lucide-react'
import { thumbnailUrl } from '../../utils/siteUtils'
import { publicCatalogCourses } from '../../data/publicCatalogData'
import styles from './PublicHome.module.css'

const INITIAL_VISIBLE_COUNT = 8
const LOAD_MORE_COUNT = 8

const explorerFilters = [
  { label: 'Course Mode', value: 'All' },
  { label: 'Course Duration', value: 'All' },
  { label: 'Course Language', value: 'All' },
  { label: 'Course Exam Date', value: 'All' },
  { label: 'Course Credits', value: 'All' },
  { label: 'Category', value: 'All' },
]

function PublicCourseList({ onOpenCourse }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortValue, setSortValue] = useState('title')
  const normalizedQuery = searchQuery.trim().toLowerCase()
  const matchingCourses = publicCatalogCourses
    .filter((course) => {
      if (!normalizedQuery) return true
      return [
        course.title,
        course.institute,
        course.faculty,
        course.category,
      ].some((value) => value.toLowerCase().includes(normalizedQuery))
    })
    .sort((left, right) => {
      if (sortValue === 'institute') return left.institute.localeCompare(right.institute)
      if (sortValue === 'category') return left.category.localeCompare(right.category)
      return left.title.localeCompare(right.title)
    })
  const visibleCourses = matchingCourses.slice(0, visibleCount)
  const hasMoreCourses = visibleCount < matchingCourses.length

  return (
    <section className={styles.catalogBand} id="course-list">
      <section className={styles.catalogHero}>
        <div className={styles.catalogHeroInner}>
          <div className={styles.catalogHeroTopline}>
            <span>Home</span>
            <span>/</span>
            <span>Course Catalog</span>
          </div>
          <div className={styles.catalogHeroHeader}>
            <div className={styles.catalogHeroCopy}>
              <h1>Course Catalog</h1>
              <p>Browse the complete KIITX learning catalog with searchable access, filters, and institution-style course cards.</p>
            </div>
          </div>
          <div className={styles.catalogHeroControls}>
            <label className={styles.catalogSearchBar}>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value)
                  setVisibleCount(INITIAL_VISIBLE_COUNT)
                }}
                placeholder="Search"
                aria-label="Search course catalog"
              />
              <Search size={20} strokeWidth={2} />
            </label>

            <label className={styles.catalogSort}>
              <span>Sorted by:</span>
              <select
                value={sortValue}
                onChange={(event) => setSortValue(event.target.value)}
                aria-label="Sort courses"
              >
                <option value="title">Course Title</option>
                <option value="institute">Institute</option>
                <option value="category">Category</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      <div className={styles.exploreWorkspace}>
        <aside className={styles.exploreSidebar} aria-label="Filters">
          <p className={styles.exploreSidebarTitle}>Filters</p>
          {explorerFilters.map((filter) => (
            <div key={filter.label} className={styles.filterBlock}>
              <span>{filter.label}</span>
              <button type="button" className={styles.filterButton}>
                {filter.value}
              </button>
            </div>
          ))}
        </aside>

        <div className={styles.exploreMain}>
          <div className={styles.catalogResultsBar}>
            <p>{matchingCourses.length} courses available</p>
          </div>

          <div className={styles.exploreCoursesGrid}>
            {visibleCourses.map((course) => (
              <button
                key={course.id}
                type="button"
                className={styles.exploreCourseCard}
                onClick={() => onOpenCourse(course.id)}
              >
                <img src={thumbnailUrl(course.youtubeId)} alt={course.title} loading="lazy" />
                <div className={styles.exploreCourseBody}>
                  <h3>{course.title}</h3>
                  <p className={styles.exploreFaculty}>{course.faculty}</p>
                  <p className={styles.exploreInstitute}>{course.institute}</p>
                </div>
              </button>
            ))}
          </div>

          {matchingCourses.length === 0 && (
            <div className={styles.catalogEmptyState}>
              <h3>No courses found</h3>
              <p>Try a different keyword or clear the search to view the full catalog.</p>
            </div>
          )}

          {hasMoreCourses && (
            <button
              type="button"
              className={styles.showAllCoursesButton}
              onClick={() => setVisibleCount((currentCount) => Math.min(currentCount + LOAD_MORE_COUNT, publicCatalogCourses.length))}
            >
              Load more courses
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

export default PublicCourseList
