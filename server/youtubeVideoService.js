import {
  DEFAULT_LMS_CATEGORY,
  DEFAULT_LMS_SUBCATEGORY,
  flattenFallbackVideos,
  formatDuration,
  getDefaultSubcategoryKey,
  LMS_VIDEO_CATEGORIES,
} from '../shared/lmsVideoCatalog.js'
import { getYouTubeApiKey } from './config.js'

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'
const MIN_DURATION_SECONDS = 5 * 60
const cache = new Map()
const CACHE_TTL_MS = 20 * 60 * 1000

function parseDuration(duration = 'PT0S') {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(duration)
  if (!match) return 0
  const [, hours = '0', minutes = '0', seconds = '0'] = match
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds)
}

function isShortLikeVideo(video) {
  const title = String(video?.snippet?.title ?? '').toLowerCase()
  const durationSeconds = parseDuration(video?.contentDetails?.duration)
  return durationSeconds <= MIN_DURATION_SECONDS || title.includes('#shorts') || title.includes(' shorts ')
}

function buildUrl(path, params) {
  const url = new URL(`${YOUTUBE_API_BASE}${path}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })
  return url
}

async function fetchJson(url) {
  const response = await fetch(url)
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(typeof payload?.error?.message === 'string' ? payload.error.message : 'YouTube API request failed.')
  }
  return payload
}

function normalizeVideo(video, categoryKey, subcategoryKey, categoryLabel, subcategoryLabel) {
  const durationSeconds = parseDuration(video.contentDetails?.duration)
  return {
    youtubeId: video.id,
    title: video.snippet?.title ?? 'Untitled video',
    channelTitle: video.snippet?.channelTitle ?? 'Curated channel',
    channelId: video.snippet?.channelId ?? '',
    thumbnail:
      video.snippet?.thumbnails?.high?.url
      || video.snippet?.thumbnails?.medium?.url
      || video.snippet?.thumbnails?.default?.url
      || `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`,
    durationSeconds,
    duration: formatDuration(durationSeconds),
    viewCount: Number(video.statistics?.viewCount ?? 0),
    publishedAt: video.snippet?.publishedAt ?? '',
    categoryKey,
    categoryLabel,
    subcategoryKey,
    subcategoryLabel,
  }
}

async function fetchVideosForQuery({ query, apiKey, categoryKey, subcategoryKey, categoryLabel, subcategoryLabel, pageToken }) {
  const searchUrl = buildUrl('/search', {
    key: apiKey,
    part: 'snippet',
    type: 'video',
    maxResults: 50,
    order: 'relevance',
    videoEmbeddable: 'true',
    safeSearch: 'strict',
    q: query,
    pageToken,
  })
  const searchPayload = await fetchJson(searchUrl)
  const searchResults = searchPayload.items ?? []

  const videoIds = [...new Set(searchResults.map((item) => item?.id?.videoId).filter(Boolean))]
  if (videoIds.length === 0) {
    return {
      videos: [],
      nextPageToken: searchPayload.nextPageToken ?? '',
    }
  }

  const detailsUrl = buildUrl('/videos', {
    key: apiKey,
    part: 'snippet,contentDetails,statistics',
    id: videoIds.join(','),
    maxResults: 50,
  })
  const detailsPayload = await fetchJson(detailsUrl)

  return {
    videos: (detailsPayload.items ?? [])
      .filter((video) => !isShortLikeVideo(video))
      .map((video) => normalizeVideo(video, categoryKey, subcategoryKey, categoryLabel, subcategoryLabel)),
    nextPageToken: searchPayload.nextPageToken ?? '',
  }
}

function getRequestedScope(categoryKey, subcategoryKey, filterKey) {
  const resolvedCategoryKey = LMS_VIDEO_CATEGORIES[categoryKey] ? categoryKey : DEFAULT_LMS_CATEGORY
  const category = LMS_VIDEO_CATEGORIES[resolvedCategoryKey]
  const resolvedSubcategoryKey = subcategoryKey && category.subcategories[subcategoryKey]
    ? subcategoryKey
    : getDefaultSubcategoryKey(resolvedCategoryKey) || DEFAULT_LMS_SUBCATEGORY
  const subcategory = category.subcategories[resolvedSubcategoryKey]
  const filters = subcategory.filters ?? {}
  const resolvedFilterKey = filterKey && filters[filterKey] ? filterKey : Object.keys(filters)[0] ?? ''
  return {
    categoryKey: resolvedCategoryKey,
    subcategoryKey: resolvedSubcategoryKey,
    filterKey: resolvedFilterKey,
    category,
    subcategory,
    filter: resolvedFilterKey ? filters[resolvedFilterKey] : null,
  }
}

function buildFallbackResponse(categoryKey, subcategoryKey, filterKey) {
  const {
    category,
    subcategory,
    filter,
    filterKey: resolvedFilterKey,
    subcategoryKey: resolvedSubcategoryKey,
    categoryKey: resolvedCategoryKey,
  } = getRequestedScope(categoryKey, subcategoryKey, filterKey)
  return {
    source: 'fallback',
    categories: LMS_VIDEO_CATEGORIES,
    categoryKey: resolvedCategoryKey,
    categoryLabel: category.label,
    subcategoryKey: resolvedSubcategoryKey,
    subcategoryLabel: subcategory.label,
    filterKey: resolvedFilterKey,
    filterLabel: filter?.label ?? '',
    nextPageToken: '',
    videos: flattenFallbackVideos(resolvedCategoryKey, resolvedSubcategoryKey),
  }
}

export async function getLmsVideos({ categoryKey, subcategoryKey, filterKey, pageToken }) {
  const scope = getRequestedScope(categoryKey, subcategoryKey, filterKey)
  const requestedPageToken = String(pageToken ?? '').trim()
  const cacheKey = `${scope.categoryKey}:${scope.subcategoryKey}:${scope.filterKey || 'all'}:${requestedPageToken || 'first'}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
    return cached.payload
  }

  const apiKey = getYouTubeApiKey()
  if (!apiKey) {
    return buildFallbackResponse(scope.categoryKey, scope.subcategoryKey, scope.filterKey)
  }

  try {
    const queries = Array.isArray(scope.filter?.queries) && scope.filter.queries.length > 0
      ? scope.filter.queries
      : scope.subcategory.queries
    const queryResults = await Promise.all(
      queries.map((query) => fetchVideosForQuery({
        query,
        apiKey,
        categoryKey: scope.categoryKey,
        subcategoryKey: scope.subcategoryKey,
        categoryLabel: scope.category.label,
        subcategoryLabel: scope.subcategory.label,
        pageToken: requestedPageToken,
      })),
    )
    const videos = queryResults
      .flatMap((result) => result.videos)
      .filter((video, index, list) => list.findIndex((item) => item.youtubeId === video.youtubeId) === index)
      .sort((left, right) => right.viewCount - left.viewCount)
    const nextPageToken = queryResults.find((result) => result.nextPageToken)?.nextPageToken ?? ''

    const payload = {
      source: 'youtube',
      categories: LMS_VIDEO_CATEGORIES,
      categoryKey: scope.categoryKey,
      categoryLabel: scope.category.label,
      subcategoryKey: scope.subcategoryKey,
      subcategoryLabel: scope.subcategory.label,
      filterKey: scope.filterKey,
      filterLabel: scope.filter?.label ?? '',
      nextPageToken,
      videos: videos.length > 0 ? videos : flattenFallbackVideos(scope.categoryKey, scope.subcategoryKey),
    }
    cache.set(cacheKey, { createdAt: Date.now(), payload })
    return payload
  } catch {
    return buildFallbackResponse(scope.categoryKey, scope.subcategoryKey, scope.filterKey)
  }
}
