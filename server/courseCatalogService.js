import { publicCatalogCourses } from '../src/data/publicCatalogData.js'
import { courses } from '../src/data/siteData.js'

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

function recommendationScore(course, keywords) {
  if (!keywords.length) return 0
  const haystack = `${course.title} ${course.subtitle} ${course.categoryLabel} ${course.instructorLabel} ${(course.learn ?? []).join(' ')}`.toLowerCase()
  const keywordMatches = keywords.reduce((total, keyword) => (
    total + (haystack.includes(keyword) ? 1 : 0)
  ), 0)
  const baseline = course.rating * 8 + Math.log10(Math.max(1, course.students)) * 10
  return keywordMatches * 28 + baseline
}

const catalogCourses = [
  ...courses,
  ...publicCatalogCourses.filter((course) => !courses.some((item) => item.id === course.id)),
].map((course) => normalizeCourse(course))

export function queryCourseCatalog({
  page = 1,
  pageSize = 10,
  search = '',
  access = 'all',
  category = 'all',
  sort = 'recommended',
  recommendedOnly = false,
  keywords = [],
}) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.min(50, Math.floor(pageSize)) : 10
  const normalizedQuery = String(search ?? '').trim().toLowerCase()
  const safeKeywords = Array.isArray(keywords)
    ? keywords.map((item) => String(item).trim().toLowerCase()).filter((item) => item.length >= 3)
    : []

  const withScores = catalogCourses.map((course) => ({
    ...course,
    recommendationScore: recommendationScore(course, safeKeywords),
  }))

  const filtered = withScores.filter((course) => {
    if (normalizedQuery) {
      const searchable = `${course.title} ${course.subtitle} ${course.categoryLabel} ${course.instructorLabel}`.toLowerCase()
      if (!searchable.includes(normalizedQuery)) return false
    }

    if (access !== 'all' && course.accessType !== access) return false
    if (category !== 'all' && course.categoryLabel !== category) return false
    if (recommendedOnly && safeKeywords.length > 0 && course.recommendationScore <= 0) return false
    return true
  })

  const sorted = [...filtered]
  sorted.sort((left, right) => {
    if (sort === 'rating') return right.rating - left.rating
    if (sort === 'learners') return right.students - left.students
    if (sort === 'price-low') return left.price - right.price
    if (sort === 'price-high') return right.price - left.price
    return right.recommendationScore - left.recommendationScore
  })

  const total = sorted.length
  const start = (safePage - 1) * safePageSize
  const end = start + safePageSize
  const items = sorted.slice(start, end)

  return {
    total,
    page: safePage,
    pageSize: safePageSize,
    hasMore: end < total,
    items,
  }
}

export function getCourseCatalogCategories() {
  return [...new Set(catalogCourses.map((course) => course.categoryLabel))].sort((a, b) => a.localeCompare(b))
}
