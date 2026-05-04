import { useEffect, useMemo, useRef, useState } from 'react'
import { Bot, Compass, Funnel, Search, SlidersHorizontal, Sparkles } from 'lucide-react'
import { thumbnailUrl } from '../../utils/siteUtils'
import styles from './PublicCourseList.module.css'

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '')
const buildApiUrl = (path) => (API_BASE_URL ? `${API_BASE_URL}${path}` : path)
const PAGE_SIZE = 10

function normalizeCurrency(value) {
  return Number.isFinite(value) && value > 0 ? `INR ${value.toLocaleString('en-IN')}` : 'Free'
}

function normalizeCourse(course) {
  const numericPrice = Number(course?.price)
  const isPaid = Number.isFinite(numericPrice) && numericPrice > 0
  const numericOriginalPrice = Number(course?.originalPrice)
  const effectiveOriginalPrice = isPaid
    ? (Number.isFinite(numericOriginalPrice) && numericOriginalPrice > numericPrice
      ? numericOriginalPrice
      : Math.round(numericPrice * 1.9))
    : 0

  return {
    ...course,
    rating: Number(course?.rating ?? 0) || 0,
    students: Number(course?.students ?? 0) || 0,
    accessType: isPaid ? 'paid' : 'free',
    price: isPaid ? numericPrice : 0,
    originalPrice: effectiveOriginalPrice,
    instructorLabel: course?.instructorName ?? course?.faculty ?? 'Faculty assigned',
    categoryLabel: String(course?.category ?? 'General'),
    courseHours: String(course?.hours ?? ''),
  }
}

function roadmapKeywords(onboardingProfile) {
  const profileText = `${onboardingProfile?.role ?? ''} ${onboardingProfile?.stage?.title ?? ''}`.toLowerCase()
  return profileText
    .split(/[^a-z0-9]+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 3)
}

function recommendationScore(course, keywords) {
  if (!keywords.length) return 0
  const haystack = `${course.title} ${course.subtitle} ${course.categoryLabel} ${course.instructorLabel} ${(course.learn ?? []).join(' ')}`.toLowerCase()
  const keywordMatches = keywords.reduce((total, keyword) => (
    total + (haystack.includes(keyword) ? 1 : 0)
  ), 0)
  const baseline = course.rating * 8 + Math.log10(Math.max(1, course.students)) * 10
  return keywordMatches * 28 + baseline
}

function PublicCourseList({
  courses = [],
  enrolledCourseIds = [],
  onboardingProfile,
  currentUserRole,
  authStateReady,
  onOpenCourse,
  onOpenEnrolledCourse,
  onRegister,
  onLogin,
  onEnroll,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [accessFilter, setAccessFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recommended')
  const [recommendedOnly, setRecommendedOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [displayedCourses, setDisplayedCourses] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [apiAvailable, setApiAvailable] = useState(true)
  const loadMoreRef = useRef(null)
  const fallbackCourses = useMemo(() => courses.map((course) => normalizeCourse(course)), [courses])
  const keywords = useMemo(() => roadmapKeywords(onboardingProfile), [onboardingProfile])
  const supportsRecommendations = keywords.length > 0

  const fallbackCategories = useMemo(
    () => [...new Set(fallbackCourses.map((course) => course.categoryLabel))].sort((a, b) => a.localeCompare(b)),
    [fallbackCourses],
  )

  const fallbackFilteredCourses = useMemo(() => {
    if (apiAvailable) return []
    const query = searchQuery.trim().toLowerCase()
    const withScores = fallbackCourses.map((course) => ({
      ...course,
      recommendationScore: recommendationScore(course, keywords),
    }))

    const results = withScores.filter((course) => {
      const searchable = `${course.title} ${course.subtitle} ${course.categoryLabel} ${course.instructorLabel}`.toLowerCase()
      if (query && !searchable.includes(query)) return false
      if (accessFilter !== 'all' && course.accessType !== accessFilter) return false
      if (categoryFilter !== 'all' && course.categoryLabel !== categoryFilter) return false
      if (recommendedOnly && supportsRecommendations && course.recommendationScore <= 0) return false
      return true
    })

    const sorted = [...results]
    sorted.sort((left, right) => {
      if (sortBy === 'rating') return right.rating - left.rating
      if (sortBy === 'learners') return right.students - left.students
      if (sortBy === 'price-low') return left.price - right.price
      if (sortBy === 'price-high') return right.price - left.price
      return right.recommendationScore - left.recommendationScore
    })

    return sorted
  }, [accessFilter, apiAvailable, categoryFilter, fallbackCourses, keywords, recommendedOnly, searchQuery, sortBy, supportsRecommendations])

  const hasMore = apiAvailable
    ? displayedCourses.length < totalCount
    : displayedCourses.length < fallbackFilteredCourses.length

  useEffect(() => {
    setPage(1)
  }, [searchQuery, accessFilter, categoryFilter, sortBy, recommendedOnly, supportsRecommendations])

  useEffect(() => {
    let active = true

    const loadCatalogPage = async () => {
      setIsLoading(true)
      if (page === 1) {
        setIsInitialLoading(true)
      }

      if (!apiAvailable) {
        const nextCourses = fallbackFilteredCourses.slice(0, page * PAGE_SIZE)
        if (!active) return
        setDisplayedCourses(nextCourses)
        setTotalCount(fallbackFilteredCourses.length)
        setCategories(fallbackCategories)
        setIsLoading(false)
        setIsInitialLoading(false)
        return
      }

      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(PAGE_SIZE),
          search: searchQuery.trim(),
          access: accessFilter,
          category: categoryFilter,
          sort: sortBy,
          recommendedOnly: String(recommendedOnly),
          keywords: keywords.join(','),
        })
        const response = await fetch(buildApiUrl(`/api/course-catalog?${params.toString()}`), { credentials: 'include' })
        const payload = await response.json()
        if (!response.ok) throw new Error(payload?.error || 'Unable to fetch catalog')
        if (!active) return

        const incoming = Array.isArray(payload?.items) ? payload.items.map((course) => normalizeCourse(course)) : []
        setDisplayedCourses((current) => (page === 1 ? incoming : [...current, ...incoming]))
        setTotalCount(Number(payload?.total ?? 0) || 0)
        setCategories(Array.isArray(payload?.categories) && payload.categories.length > 0 ? payload.categories : fallbackCategories)
      } catch {
        if (!active) return
        setApiAvailable(false)
        const nextCourses = fallbackFilteredCourses.slice(0, page * PAGE_SIZE)
        setDisplayedCourses(nextCourses)
        setTotalCount(fallbackFilteredCourses.length)
        setCategories(fallbackCategories)
      } finally {
        if (active) {
          setIsLoading(false)
          setIsInitialLoading(false)
        }
      }
    }

    void loadCatalogPage()

    return () => {
      active = false
    }
  }, [
    page,
    searchQuery,
    accessFilter,
    categoryFilter,
    sortBy,
    recommendedOnly,
    keywords,
    fallbackFilteredCourses,
    fallbackCategories,
    apiAvailable,
  ])

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isLoading) return undefined

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setPage((currentPage) => currentPage + 1)
      }
    }, { rootMargin: '200px 0px' })

    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasMore, isLoading])

  const accessButton = (course) => {
    if (!authStateReady) {
      return (
        <button type="button" className={styles.secondaryAction} disabled>
          Checking access...
        </button>
      )
    }

    if (!currentUserRole) {
      return (
        <div className={styles.cardActionsRow}>
          <button type="button" className={styles.primaryAction} onClick={() => onRegister?.('/course-list')}>
            Register
          </button>
          <button type="button" className={styles.secondaryAction} onClick={() => onLogin?.('/course-list')}>
            Sign In
          </button>
        </div>
      )
    }

    if (currentUserRole !== 'student') {
      return (
        <button type="button" className={styles.secondaryAction} disabled>
          Student account required
        </button>
      )
    }

    if (enrolledCourseIds.includes(course.id)) {
      return (
        <button type="button" className={styles.primaryAction} onClick={() => onOpenEnrolledCourse?.(course.id)}>
          See Course
        </button>
      )
    }

    return (
      <button type="button" className={styles.primaryAction} onClick={() => onEnroll?.(course.id)}>
        {course.accessType === 'paid' ? `Enroll Paid ${normalizeCurrency(course.price)}` : 'Enroll Free'}
      </button>
    )
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <span><Compass size={15} /> Course Marketplace</span>
          <h1>All Courses</h1>
          <p>Clean filters, better spacing, and progressive loading in batches of 10 courses.</p>
        </div>
        <div className={styles.controlGrid}>
          <label className={styles.searchBox}>
            <Search size={17} />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search courses, skills, or faculty"
              aria-label="Search courses"
            />
          </label>
          <label className={styles.control}>
            <span><Funnel size={14} /> Access</span>
            <select value={accessFilter} onChange={(event) => setAccessFilter(event.target.value)}>
              <option value="all">All access types</option>
              <option value="paid">Paid courses</option>
              <option value="free">Free courses</option>
            </select>
          </label>
          <label className={styles.control}>
            <span><Bot size={14} /> Category</span>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="all">All categories</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label className={styles.control}>
            <span><SlidersHorizontal size={14} /> Sort</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="recommended">Recommended</option>
              <option value="rating">Top rated</option>
              <option value="learners">Most learners</option>
              <option value="price-low">Price low to high</option>
              <option value="price-high">Price high to low</option>
            </select>
          </label>
        </div>
        <div className={styles.toggleRow}>
          <button
            type="button"
            className={recommendedOnly ? styles.recommendedToggleActive : styles.recommendedToggle}
            onClick={() => setRecommendedOnly((current) => !current)}
            disabled={!supportsRecommendations}
          >
            <Sparkles size={14} />
            Recommended from your roadmap
          </button>
          <p>{totalCount} courses found</p>
        </div>
      </header>

      <section className={styles.courseGrid} aria-label="Course results">
        {displayedCourses.map((course) => (
          <article key={course.id} className={styles.courseCard}>
            <button type="button" className={styles.coverButton} onClick={() => onOpenCourse?.(course.id)} aria-label={`Open ${course.title}`}>
              <img src={thumbnailUrl(course.youtubeId)} alt={course.title} loading="lazy" />
            </button>
            <div className={styles.cardBody}>
              <div className={styles.badgeRow}>
                <span className={styles.badge}>{course.categoryLabel}</span>
                <span className={course.accessType === 'paid' ? styles.paidBadge : styles.freeBadge}>
                  {course.accessType === 'paid' ? 'Paid' : 'Free'}
                </span>
              </div>
              <h2>{course.title}</h2>
              <p>{course.subtitle}</p>
              <div className={styles.stats}>
                <span>{course.rating.toFixed(1)} rating</span>
                <span>{course.students.toLocaleString()} learners</span>
                <span>{course.courseHours} hrs</span>
              </div>
              <div className={styles.priceRow}>
                <strong>{normalizeCurrency(course.price)}</strong>
                {course.accessType === 'paid' && course.originalPrice > course.price ? (
                  <small>INR {course.originalPrice.toLocaleString('en-IN')}</small>
                ) : null}
              </div>
              <p className={styles.instructor}>{course.instructorLabel}</p>
              <div className={styles.cardFooter}>
                <button type="button" className={styles.secondaryAction} onClick={() => onOpenCourse?.(course.id)}>
                  View Details
                </button>
                {accessButton(course)}
              </div>
            </div>
          </article>
        ))}

        {isInitialLoading
          ? Array.from({ length: PAGE_SIZE }, (_, index) => (
            <article key={`skeleton-${index}`} className={styles.courseSkeletonCard} aria-hidden="true">
              <span className={styles.skeletonThumb} />
              <span className={styles.skeletonLineWide} />
              <span className={styles.skeletonLineShort} />
            </article>
          ))
          : null}
      </section>

      {hasMore ? (
        <div ref={loadMoreRef} className={styles.lazyLoadSentinel}>
          {isLoading ? 'Loading next 10 courses...' : 'Scroll to load next 10 courses'}
        </div>
      ) : null}
    </section>
  )
}

export default PublicCourseList
