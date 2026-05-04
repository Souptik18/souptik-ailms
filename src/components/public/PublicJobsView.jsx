import { useEffect, useMemo, useState } from 'react'
import { BriefcaseBusiness, ExternalLink, Globe2, LockKeyhole, MapPin, Search } from 'lucide-react'
import styles from './PublicJobsView.module.css'

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '')
const buildApiUrl = (path) => (API_BASE_URL ? `${API_BASE_URL}${path}` : path)

const feedOptions = [
  { id: '24h', label: 'Get Jobs 24h' },
  { id: '7d', label: 'Get Jobs 7 days' },
  { id: '6m', label: 'Get Jobs 6m' },
  { id: '1h', label: 'Get Jobs Hourly' },
]

const roleOptions = [
  { label: 'Data Engineer', value: '"Data Engineer"' },
  { label: 'Software Engineer', value: '"Software Engineer"' },
  { label: 'Frontend Engineer', value: '"Frontend Engineer"' },
  { label: 'Backend Engineer', value: '"Backend Engineer"' },
  { label: 'Full Stack Engineer', value: '"Full Stack Engineer"' },
  { label: 'AI / Machine Learning', value: 'AI OR "Machine Learning"' },
  { label: 'Cloud Engineer', value: '"Cloud Engineer"' },
  { label: 'Cybersecurity Analyst', value: '"Cybersecurity Analyst"' },
]

const locationOptions = [
  { label: 'India', value: 'India' },
  { label: 'United States or United Kingdom', value: '"United States" OR "United Kingdom"' },
  { label: 'United States', value: '"United States"' },
  { label: 'United Kingdom', value: '"United Kingdom"' },
  { label: 'Canada', value: 'Canada' },
  { label: 'Germany', value: 'Germany' },
  { label: 'Australia', value: 'Australia' },
  { label: 'Singapore', value: 'Singapore' },
]

const remoteOptions = [
  { label: 'All work modes', value: '' },
  { label: 'Remote only', value: 'true' },
  { label: 'Non-remote only', value: 'false' },
]

const typeOptions = [
  { label: 'All job types', value: 'ALL' },
  { label: 'Full time', value: 'FULL_TIME' },
  { label: 'Internship', value: 'INTERN' },
  { label: 'Contractor', value: 'CONTRACTOR' },
  { label: 'Part time', value: 'PART_TIME' },
]

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

function formatPostedTime(value) {
  if (!value) return 'Posted recently'
  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return 'Posted recently'

  const diffMs = Date.now() - timestamp
  const absDiffMs = Math.abs(diffMs)
  const minutes = Math.floor(absDiffMs / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const suffix = diffMs >= 0 ? 'ago' : 'from now'

  if (minutes < 60) return `Posted ${Math.max(1, minutes)}m ${suffix}`
  if (hours < 24) return `Posted ${hours}h ${suffix}`
  if (days < 30) return `Posted ${days}d ${suffix}`
  return `Posted ${dateFormatter.format(new Date(timestamp))}`
}

function formatPostedDate(value) {
  if (!value) return 'Date not listed'
  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return 'Date not listed'
  return dateFormatter.format(new Date(timestamp))
}

function shouldTrySameOrigin() {
  return typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)
}

async function fetchJobs({ freshness, title, location, remote, type }) {
  const params = new URLSearchParams({
    freshness,
    title,
    location,
    remote,
    type,
    limit: '10',
    offset: '0',
  })
  const path = `/api/jobs/linkedin?${params.toString()}`
  const urls = API_BASE_URL && shouldTrySameOrigin() ? [buildApiUrl(path), path] : [buildApiUrl(path)]
  let lastError = null

  for (const url of [...new Set(urls)]) {
    try {
      const response = await fetch(url, { credentials: 'include' })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.error || 'Unable to load jobs.')
      return Array.isArray(payload?.jobs) ? payload.jobs.slice(0, 10) : []
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Unable to load jobs.')
}

function PublicJobsView({ currentUserRole, authStateReady, onLogin, onRegister }) {
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [titleFilter, setTitleFilter] = useState('"Data Engineer"')
  const [locationFilter, setLocationFilter] = useState('India')
  const [freshness, setFreshness] = useState('24h')
  const [remoteFilter, setRemoteFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [submittedFilters, setSubmittedFilters] = useState({
    freshness: '24h',
    title: '"Data Engineer"',
    location: 'India',
    remote: '',
    type: 'ALL',
  })

  const canFetchJobs = authStateReady && !!currentUserRole

  useEffect(() => {
    if (!canFetchJobs) return undefined

    let active = true
    setIsLoading(true)
    setErrorMessage('')

    fetchJobs(submittedFilters)
      .then((nextJobs) => {
        if (active) setJobs(nextJobs)
      })
      .catch((error) => {
        if (active) setErrorMessage(error instanceof Error ? error.message : 'Unable to load jobs right now.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [canFetchJobs, submittedFilters])

  const filteredJobs = useMemo(() => jobs.slice(0, 10), [jobs])

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmittedFilters({
      freshness,
      title: titleFilter,
      location: locationFilter,
      remote: remoteFilter,
      type: typeFilter,
    })
  }

  if (!authStateReady) {
    return (
      <main className={styles.jobsShell}>
        <section className={styles.jobsGate}>
          <div className={styles.loader} />
          <h1>Checking access</h1>
        </section>
      </main>
    )
  }

  if (!currentUserRole) {
    return (
      <main className={styles.jobsShell}>
        <section className={styles.jobsGate}>
          <LockKeyhole size={34} />
          <span>Jobs access</span>
          <h1>Please login first or register first.</h1>
          <p>After you sign in as a student, curated jobs from hourly, 24-hour, 7-day, and 6-month feeds will appear here.</p>
          <div className={styles.gateActions}>
            <button type="button" onClick={onRegister}>Register now</button>
            <button type="button" onClick={onLogin}>Log in</button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className={styles.jobsShell}>
      <section className={styles.jobsHero}>
        <div>
          <span>Jobs feed</span>
          <h1>Fresh roles from live hiring signals.</h1>
          <p>Choose a role, market, feed window, work mode, and job type. OpenCourse loads 10 active jobs.</p>
        </div>
        <div className={styles.jobsStats}>
          <strong>{filteredJobs.length}</strong>
          <span>loaded roles</span>
        </div>
      </section>

      <form className={styles.jobsToolbar} onSubmit={handleSubmit}>
        <label>
          <span>Feed</span>
          <select value={freshness} onChange={(event) => setFreshness(event.target.value)}>
            {feedOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </label>
        <label>
          <span>Role</span>
          <select value={titleFilter} onChange={(event) => setTitleFilter(event.target.value)}>
            {roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label>
          <span>Market</span>
          <select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
            {locationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label>
          <span>Work mode</span>
          <select value={remoteFilter} onChange={(event) => setRemoteFilter(event.target.value)}>
            {remoteOptions.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label>
          <span>Job type</span>
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            {typeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <button type="submit" className={styles.jobsSubmit}>
          <Search size={17} />
          Submit
        </button>
      </form>

      {isLoading ? (
        <section className={styles.jobsGrid}>
          {Array.from({ length: 9 }, (_, index) => <article key={index} className={styles.jobSkeleton} />)}
        </section>
      ) : errorMessage ? (
        <section className={styles.jobsEmpty}>{errorMessage}</section>
      ) : filteredJobs.length === 0 ? (
        <section className={styles.jobsEmpty}>No jobs matched these dropdowns.</section>
      ) : (
        <section className={styles.jobsGrid}>
          {filteredJobs.map((job) => (
            <article key={job.id} className={styles.jobCard}>
              <div className={styles.jobCardTop}>
                <span>{job.source}</span>
                <BriefcaseBusiness size={18} />
              </div>
              <div className={styles.jobPostedRow}>
                <span>{formatPostedTime(job.publishedAt || job.indexedAt)}</span>
                <small>{formatPostedDate(job.publishedAt || job.indexedAt)}</small>
              </div>
              <h2>{job.title}</h2>
              <p>{job.company}</p>
              <div className={styles.jobMeta}>
                <span><MapPin size={14} /> {job.location}</span>
                <span><Globe2 size={14} /> {job.type}</span>
              </div>
              {job.description ? <p className={styles.jobDescription}>{job.description}</p> : null}
              <div className={styles.jobTags}>
                {job.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}
              </div>
              <a href={job.url} target="_blank" rel="noreferrer">
                View job
                <ExternalLink size={15} />
              </a>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}

export default PublicJobsView
