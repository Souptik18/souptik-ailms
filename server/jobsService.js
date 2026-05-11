const RAPIDAPI_HOST = 'linkedin-job-search-api.p.rapidapi.com'
const RAPIDAPI_BASE_URL = `https://${RAPIDAPI_HOST}`

function sanitizeText(value, maxLength = 2000) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

function getRapidApiKey() {
  return String(
    process.env.RAPIDAPI_LINKEDIN_JOBS_KEY
    || process.env.RAPIDAPI_KEY
    || '',
  ).trim()
}

function resolveFreshness(value) {
  if (value === '1h' || value === '7d' || value === '6m') return value
  return '24h'
}

function getEndpoint(freshness) {
  if (freshness === '1h') return 'active-jb-1h'
  if (freshness === '7d') return 'active-jb-7d'
  if (freshness === '6m') return 'active-jb-6m'
  return 'active-jb-24h'
}

function getFreshnessLabel(freshness) {
  if (freshness === '1h') return 'Last hour'
  if (freshness === '7d') return 'Last 7 days'
  if (freshness === '6m') return 'Last 6 months'
  return 'Last 24h'
}

function getSourceLabel(freshness) {
  if (freshness === '1h') return 'Hourly feed'
  if (freshness === '7d') return '7-day feed'
  if (freshness === '6m') return '6-month feed'
  return '24-hour feed'
}

function normalizeJob(job, index, freshness) {
  const company = job?.organization || job?.company || job?.company_name || job?.employer_name || job?.companyName
  const title = job?.title || job?.job_title || job?.position || job?.name
  const location = job?.locations_derived?.join(', ')
    || job?.location
    || job?.job_location
    || job?.formatted_location
    || job?.candidate_required_location
  const url = job?.url || job?.job_url || job?.linkedin_url || job?.application_url || job?.apply_url
  const employmentType = Array.isArray(job?.employment_type)
    ? job.employment_type.join(', ')
    : job?.employment_type || job?.type || job?.workplace_type || 'LinkedIn'
  const publishedAt = job?.date_posted || job?.posted_at || job?.created_at || job?.publishedAt || ''
  const indexedAt = job?.date_created || job?.indexed_at || job?.created_at || ''
  const description = sanitizeText(job?.description_text || job?.description || job?.job_description, 260)
  const tags = [
    getFreshnessLabel(freshness),
    ...(Array.isArray(job?.skills) ? job.skills : []),
    ...(Array.isArray(job?.industries) ? job.industries : []),
    job?.seniority,
    job?.workplace_type,
  ].filter(Boolean).map((item) => sanitizeText(item, 42))

  return {
    id: sanitizeText(job?.id || job?.job_id || job?.linkedin_id || url || `rapidapi-${freshness}-${index}`, 180),
    title: sanitizeText(title || 'LinkedIn role', 180),
    company: sanitizeText(company || 'Hiring company', 120),
    location: sanitizeText(location || 'United States / United Kingdom', 160),
    url: sanitizeText(url || 'https://www.linkedin.com/jobs/', 600),
    source: getSourceLabel(freshness),
    type: sanitizeText(employmentType, 80),
    publishedAt: sanitizeText(publishedAt, 80),
    indexedAt: sanitizeText(indexedAt, 80),
    description,
    tags: [...new Set(tags)].slice(0, 6),
  }
}

function extractJobs(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.jobs)) return payload.jobs
  if (Array.isArray(payload?.results)) return payload.results
  return []
}

export async function getLinkedInJobs({
  freshness = '24h',
  title = 'Data Engineer',
  location = 'United States OR United Kingdom',
  limit = 10,
  offset = 0,
  remote = '',
  type = '',
} = {}) {
  const apiKey = getRapidApiKey()
  if (!apiKey) throw new Error('Missing RapidAPI LinkedIn jobs key.')

  const resolvedFreshness = resolveFreshness(freshness)
  const endpoint = getEndpoint(resolvedFreshness)
  const params = new URLSearchParams({
    offset: String(Math.max(0, Number.parseInt(String(offset), 10) || 0)),
    title_filter: sanitizeText(title, 120) || 'Data Engineer',
    location_filter: sanitizeText(location, 180) || 'United States OR United Kingdom',
    limit: String(Math.min(10, Math.max(1, Number.parseInt(String(limit), 10) || 10))),
    description_type: 'text',
  })

  const remoteFilter = sanitizeText(remote, 12).toLowerCase()
  if (remoteFilter === 'true' || remoteFilter === 'false') {
    params.set('remote', remoteFilter)
  }

  const typeFilter = sanitizeText(type, 80)
  if (typeFilter && typeFilter !== 'ALL') {
    params.set('type_filter', typeFilter)
  }

  const response = await fetch(`${RAPIDAPI_BASE_URL}/${endpoint}?${params.toString()}`, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': RAPIDAPI_HOST,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`LinkedIn jobs provider failed with HTTP ${response.status}.`)
  }

  const text = await response.text()
  const payload = text ? JSON.parse(text) : []
  const jobs = extractJobs(payload)
    .map((job, index) => normalizeJob(job, index, resolvedFreshness))
    .filter((job, index, list) => job.title && list.findIndex((item) => item.url === job.url) === index)

  return {
    source: 'rapidapi-linkedin',
    freshness: resolvedFreshness,
    title: sanitizeText(title, 120) || 'Data Engineer',
    location: sanitizeText(location, 180) || 'United States OR United Kingdom',
    jobs,
  }
}
