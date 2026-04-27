import { useEffect, useMemo, useState } from 'react'
import { BriefcaseBusiness, ExternalLink, Globe2, LockKeyhole, MapPin, Search } from 'lucide-react'
import styles from './PublicJobsView.module.css'

const CS_KEYWORDS = [
  'software',
  'developer',
  'engineer',
  'frontend',
  'front-end',
  'backend',
  'back-end',
  'full stack',
  'fullstack',
  'react',
  'node',
  'python',
  'java',
  'javascript',
  'typescript',
  'data engineer',
  'machine learning',
  'ai',
  'devops',
  'cloud',
  'security',
  'qa',
  'sre',
  'mobile',
  'android',
  'ios',
]

const INDIA_OR_GLOBAL_KEYWORDS = ['india', 'worldwide', 'global', 'remote', 'asia', 'anywhere']

function includesAny(value, keywords) {
  const normalized = String(value ?? '').toLowerCase()
  return keywords.some((keyword) => normalized.includes(keyword))
}

function normalizeHimalayasJob(job) {
  const locationText = [
    job?.location,
    job?.locationRestrictions,
    Array.isArray(job?.countries) ? job.countries.join(', ') : '',
    Array.isArray(job?.timezones) ? job.timezones.join(', ') : '',
  ].filter(Boolean).join(' ')

  return {
    id: `himalayas-${job?.id ?? job?.slug ?? job?.applicationLink}`,
    title: job?.title ?? 'Computer Science role',
    company: job?.companyName ?? job?.company?.name ?? 'Hiring company',
    location: locationText || 'Remote',
    url: job?.applicationLink ?? job?.url ?? job?.jobUrl ?? 'https://himalayas.app/jobs',
    source: 'Himalayas',
    type: job?.employmentType ?? job?.type ?? 'Remote',
    publishedAt: job?.pubDate ?? job?.publishedAt ?? job?.createdAt ?? '',
    tags: [
      ...(Array.isArray(job?.categories) ? job.categories.map((item) => item?.name ?? item) : []),
      ...(Array.isArray(job?.skills) ? job.skills.map((item) => item?.name ?? item) : []),
    ].filter(Boolean),
  }
}

function normalizeRemotiveJob(job) {
  return {
    id: `remotive-${job?.id ?? job?.url}`,
    title: job?.title ?? 'Computer Science role',
    company: job?.company_name ?? 'Hiring company',
    location: job?.candidate_required_location ?? 'Remote',
    url: job?.url ?? 'https://remotive.com',
    source: 'Remotive',
    type: job?.job_type ?? 'Remote',
    publishedAt: job?.publication_date ?? '',
    tags: [job?.category, ...(Array.isArray(job?.tags) ? job.tags : [])].filter(Boolean),
  }
}

function isComputerScienceJob(job) {
  return includesAny(`${job.title} ${job.tags.join(' ')} ${job.type}`, CS_KEYWORDS)
}

function isIndiaOrGlobalJob(job) {
  return includesAny(`${job.location} ${job.title}`, INDIA_OR_GLOBAL_KEYWORDS)
}

async function fetchJobs() {
  const requests = [
    fetch('https://himalayas.app/jobs/api?limit=20&offset=0').then((response) => response.json()),
    fetch('https://himalayas.app/jobs/api?limit=20&offset=20').then((response) => response.json()),
    fetch('https://remotive.com/api/remote-jobs?category=software-dev&limit=50').then((response) => response.json()),
  ]

  const results = await Promise.allSettled(requests)
  const himalayasJobs = results
    .slice(0, 2)
    .flatMap((result) => (result.status === 'fulfilled' ? result.value?.jobs ?? result.value?.data ?? [] : []))
    .map(normalizeHimalayasJob)
  const remotiveJobs = results[2]?.status === 'fulfilled'
    ? (results[2].value?.jobs ?? []).map(normalizeRemotiveJob)
    : []

  return [...himalayasJobs, ...remotiveJobs]
    .filter((job, index, list) => list.findIndex((item) => item.url === job.url) === index)
    .filter(isComputerScienceJob)
    .filter(isIndiaOrGlobalJob)
    .slice(0, 80)
}

function PublicJobsView({ currentUserRole, authStateReady, onLogin, onRegister }) {
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [query, setQuery] = useState('')
  const [regionFilter, setRegionFilter] = useState('All')

  const canFetchJobs = authStateReady && !!currentUserRole

  useEffect(() => {
    if (!canFetchJobs) return undefined

    let active = true
    setIsLoading(true)
    setErrorMessage('')

    fetchJobs()
      .then((nextJobs) => {
        if (active) setJobs(nextJobs)
      })
      .catch(() => {
        if (active) setErrorMessage('Unable to load jobs right now. Please try again shortly.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [canFetchJobs])

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return jobs.filter((job) => {
      const haystack = `${job.title} ${job.company} ${job.location} ${job.tags.join(' ')}`.toLowerCase()
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery)
      const matchesRegion =
        regionFilter === 'All'
        || (regionFilter === 'India' && haystack.includes('india'))
        || (regionFilter === 'Remote / Global' && INDIA_OR_GLOBAL_KEYWORDS.some((keyword) => haystack.includes(keyword)))
      return matchesQuery && matchesRegion
    })
  }, [jobs, query, regionFilter])

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
          <p>After you sign in as a student, Computer Science jobs for India and global remote markets will appear here.</p>
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
          <span>Computer Science jobs</span>
          <h1>India and global remote CS roles.</h1>
          <p>Fresh public job listings filtered for software, AI, data, cloud, security, QA, mobile, and web engineering roles.</p>
        </div>
        <div className={styles.jobsStats}>
          <strong>{filteredJobs.length}</strong>
          <span>matching roles</span>
        </div>
      </section>

      <section className={styles.jobsToolbar}>
        <label>
          <Search size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search React, Python, AI, DevOps..." />
        </label>
        <select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)}>
          <option>All</option>
          <option>India</option>
          <option>Remote / Global</option>
        </select>
      </section>

      {isLoading ? (
        <section className={styles.jobsGrid}>
          {Array.from({ length: 9 }, (_, index) => <article key={index} className={styles.jobSkeleton} />)}
        </section>
      ) : errorMessage ? (
        <section className={styles.jobsEmpty}>{errorMessage}</section>
      ) : filteredJobs.length === 0 ? (
        <section className={styles.jobsEmpty}>No Computer Science jobs matched these filters.</section>
      ) : (
        <section className={styles.jobsGrid}>
          {filteredJobs.map((job) => (
            <article key={job.id} className={styles.jobCard}>
              <div className={styles.jobCardTop}>
                <span>{job.source}</span>
                <BriefcaseBusiness size={18} />
              </div>
              <h2>{job.title}</h2>
              <p>{job.company}</p>
              <div className={styles.jobMeta}>
                <span><MapPin size={14} /> {job.location}</span>
                <span><Globe2 size={14} /> {job.type}</span>
              </div>
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
