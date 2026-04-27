import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { LMS_VIDEO_CATEGORIES } from '../../../shared/lmsVideoCatalog'
import styles from './WorkspaceViews.module.css'

const PROGRESS_BY_COURSE = {
  'sys-design': 62,
  'ml-blueprint': 44,
  'react-scale': 100,
  'devops-bootcamp': 15,
}

const WEEKLY_LEARNING_PATTERN = [52, 68, 74, 58, 86, 91, 72]
const STATUS_COLORS = ['#2563eb', '#16a34a', '#f59e0b']

function clampValue(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value))
}

function StudentView({
  activeTab,
  currentUserUid,
  courses,
  enrolledCourseIds,
  enrolledVideoIds = [],
  onVideoViewChange,
}) {
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true)
  const [jobsAlertsEnabled, setJobsAlertsEnabled] = useState(true)
  const [weeklySummaryEnabled, setWeeklySummaryEnabled] = useState(false)
  const [exportBusy, setExportBusy] = useState(false)
  const [exportMessage, setExportMessage] = useState('')
  const analyticsRef = useRef(null)

  const isDashboardTab = activeTab === 'My Learnings'
  const isWishlistTab = activeTab === 'Wishlist'
  const isCertificatesTab = activeTab === 'Certificates'
  const isProfileTab = activeTab === 'My Profile'
  const isSettingsTab = activeTab === 'Settings'

  const enrolledCourses = useMemo(
    () => courses.filter((course) => enrolledCourseIds.includes(course.id)),
    [courses, enrolledCourseIds],
  )

  const enrolledVideoCourses = useMemo(
    () => enrolledVideoIds.map((enrollmentId) => {
      const parts = String(enrollmentId).split(':')
      const [subjectKey, subcategoryKey] = parts
      const hasStoredIndex = parts.length >= 4
      const youtubeId = hasStoredIndex ? parts.slice(3).join(':') : parts[2]
      const subject = LMS_VIDEO_CATEGORIES[subjectKey]
      const subcategory = subject?.subcategories?.[subcategoryKey]
      const video = subcategory?.fallbackVideos?.find((item) => item.youtubeId === youtubeId)
      if (!subject || !subcategory || !youtubeId) return null

      return {
        id: enrollmentId,
        title: video?.title ?? subcategory.label,
        category: subcategory.label,
        hours: video?.durationSeconds ? Math.max(1, Math.round(video.durationSeconds / 3600)) : 1,
      }
    }).filter(Boolean),
    [enrolledVideoIds],
  )

  const allEnrolledLearning = useMemo(
    () => [...enrolledVideoCourses, ...enrolledCourses.map((course) => ({
      id: course.id,
      title: course.title,
      category: course.category,
      hours: Number.parseFloat(String(course.hours ?? '').replace(/[^\d.]/g, '')) || 1,
    }))],
    [enrolledCourses, enrolledVideoCourses],
  )

  const totalEnrolledCourses = allEnrolledLearning.length
  const completedCourses = allEnrolledLearning.filter((course) => (PROGRESS_BY_COURSE[course.id] ?? 40) >= 100).length
  const inProgressCourses = Math.max(0, totalEnrolledCourses - completedCourses)
  const averageProgress = totalEnrolledCourses > 0
    ? Math.round(allEnrolledLearning.reduce((sum, course) => sum + (PROGRESS_BY_COURSE[course.id] ?? 40), 0) / totalEnrolledCourses)
    : 0
  const estimatedLearningHours = allEnrolledLearning.reduce((sum, course) => sum + (Number(course.hours) || 0), 0)

  const categoryDistribution = useMemo(() => {
    const counts = allEnrolledLearning.reduce((acc, course) => {
      const category = String(course.category ?? 'General')
      acc.set(category, (acc.get(category) ?? 0) + 1)
      return acc
    }, new Map())

    return [...counts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 6)
  }, [allEnrolledLearning])

  const weeklyLearningData = useMemo(() => {
    const baseline = Math.max(30, Math.round(estimatedLearningHours * 3))
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => ({
      day,
      minutes: Math.round((baseline * WEEKLY_LEARNING_PATTERN[index]) / 100),
    }))
  }, [estimatedLearningHours])

  const progressByCourseData = useMemo(
    () => allEnrolledLearning.slice(0, 6).map((course) => ({
      name: course.title.length > 18 ? `${course.title.slice(0, 18)}...` : course.title,
      progress: PROGRESS_BY_COURSE[course.id] ?? 40,
    })),
    [allEnrolledLearning],
  )

  const activeLearningDays = weeklyLearningData.filter((entry) => entry.minutes >= 45).length
  const consistencyScore = Math.round((activeLearningDays / 7) * 100)
  const completionRate = totalEnrolledCourses > 0 ? Math.round((completedCourses / totalEnrolledCourses) * 100) : 0
  const retentionScore = clampValue(Math.round((averageProgress * 0.62) + (consistencyScore * 0.38)), 0, 100)
  const marketReadinessScore = clampValue(Math.round((completionRate * 0.34) + (averageProgress * 0.33) + (consistencyScore * 0.33)), 0, 100)
  const paceScore = clampValue(Math.round(((estimatedLearningHours || 0) / Math.max(1, totalEnrolledCourses || 1)) * 18), 0, 100)
  const focusScore = clampValue(Math.round((categoryDistribution[0]?.value ?? 0) / Math.max(1, totalEnrolledCourses) * 100), 0, 100)
  const burnoutRisk = clampValue(Math.round((100 - consistencyScore) * 0.55 + (100 - paceScore) * 0.45), 0, 100)
  const aiCoachScore = clampValue(Math.round((retentionScore * 0.4) + (marketReadinessScore * 0.35) + (paceScore * 0.25)), 0, 100)
  const goalVelocityScore = clampValue(Math.round((averageProgress * 0.5) + (completionRate * 0.5)), 0, 100)
  const weeklyAverageMinutes = weeklyLearningData.length > 0
    ? Math.round(weeklyLearningData.reduce((sum, item) => sum + item.minutes, 0) / weeklyLearningData.length)
    : 0

  const statusData = [
    { name: 'In progress', value: inProgressCourses },
    { name: 'Completed', value: completedCourses },
    { name: 'Planned', value: Math.max(0, totalEnrolledCourses === 0 ? 0 : 1) },
  ].filter((item) => item.value > 0)

  const analyticsKpis = [
    { label: 'Total enrolled courses', value: totalEnrolledCourses },
    { label: 'In progress', value: inProgressCourses },
    { label: 'Completed', value: completedCourses },
    { label: 'Average progress', value: `${averageProgress}%` },
    { label: 'Completion rate', value: `${completionRate}%` },
    { label: 'Consistency score', value: `${consistencyScore}%` },
    { label: 'Retention score', value: `${retentionScore}%` },
    { label: 'Market readiness', value: `${marketReadinessScore}%` },
    { label: 'AI coach score', value: `${aiCoachScore}%` },
    { label: 'Burnout risk', value: `${burnoutRisk}%` },
    { label: 'Focus score', value: `${focusScore}%` },
    { label: 'Goal velocity', value: `${goalVelocityScore}%` },
    { label: 'Weekly avg time', value: `${weeklyAverageMinutes}m` },
  ]

  const aiInsights = [
    {
      title: 'AI Readiness Summary',
      value: `${marketReadinessScore}%`,
      note: marketReadinessScore >= 70
        ? 'You are on track for placement-ready preparedness.'
        : 'Increase completion pace and consistency for stronger market readiness.',
    },
    {
      title: 'AI Burnout Monitor',
      value: `${burnoutRisk}% risk`,
      note: burnoutRisk <= 45
        ? 'Healthy learning cadence detected.'
        : 'Reduce session load spikes and distribute study time across weekdays.',
    },
    {
      title: 'AI Skill Gap Signal',
      value: focusScore >= 55 ? 'Focused' : 'Diversify',
      note: focusScore >= 55
        ? 'Primary domain focus is strong. Continue depth practice.'
        : 'Category spread is high; prioritize one track for deeper competency.',
    },
    {
      title: 'AI Progress Coach',
      value: `${goalVelocityScore}%`,
      note: goalVelocityScore >= 65
        ? 'Current weekly plan is likely to hit your next milestone.'
        : 'Add one extra focused session per week to improve velocity.',
    },
  ]

  useEffect(() => {
    onVideoViewChange?.(false)
  }, [onVideoViewChange])

  const exportAnalytics = async (format) => {
    if (!analyticsRef.current || exportBusy) return
    setExportBusy(true)
    setExportMessage('')
    try {
      const canvas = await html2canvas(analyticsRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      })
      const fileBase = `student-analytics-${new Date().toISOString().slice(0, 10)}`
      if (format === 'pdf') {
        const imageData = canvas.toDataURL('image/png')
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] })
        pdf.addImage(imageData, 'PNG', 0, 0, canvas.width, canvas.height)
        pdf.save(`${fileBase}.pdf`)
      } else {
        const mime = format === 'jpg' ? 'image/jpeg' : 'image/png'
        const imageData = canvas.toDataURL(mime, 0.95)
        const link = document.createElement('a')
        link.href = imageData
        link.download = `${fileBase}.${format}`
        link.click()
      }
      setExportMessage(`Analytics exported as ${format.toUpperCase()}.`)
    } catch {
      setExportMessage('Export failed. Please retry.')
    } finally {
      setExportBusy(false)
    }
  }

  return (
    <div className={styles.studentShell}>
      {isDashboardTab ? (
        <section className={styles.studentAnalytics} ref={analyticsRef}>
          <header className={styles.analyticsHeader}>
            <div>
              <span>Student dashboard</span>
              <h2>Learning Analytics</h2>
              <p>Track progress, market readiness, and AI-powered learning insights.</p>
            </div>
            <div className={styles.analyticsActions}>
              <button type="button" onClick={() => exportAnalytics('pdf')} disabled={exportBusy}>Export PDF</button>
              <button type="button" onClick={() => exportAnalytics('png')} disabled={exportBusy}>Export PNG</button>
              <button type="button" onClick={() => exportAnalytics('jpg')} disabled={exportBusy}>Export JPG</button>
            </div>
          </header>
          {exportMessage ? <p className={styles.analyticsExportNote}>{exportMessage}</p> : null}
          <div className={styles.analyticsKpiGrid}>
            {analyticsKpis.map((kpi) => (
              <article key={kpi.label} className={styles.analyticsKpiCard}>
                <span>{kpi.label}</span>
                <strong>{kpi.value}</strong>
              </article>
            ))}
          </div>
          <div className={styles.aiInsightsGrid}>
            {aiInsights.map((insight) => (
              <article key={insight.title} className={styles.aiInsightCard}>
                <span>{insight.title}</span>
                <strong>{insight.value}</strong>
                <p>{insight.note}</p>
              </article>
            ))}
          </div>
          <div className={styles.analyticsChartGrid}>
            <article className={styles.analyticsChartCard}>
              <h3>Weekly learning time (minutes)</h3>
              <div className={styles.analyticsChartWrap}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyLearningData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="minutes" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>
            <article className={styles.analyticsChartCard}>
              <h3>Course progress by title</h3>
              <div className={styles.analyticsChartWrap}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressByCourseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#475569', fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="progress" fill="#16a34a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
            <article className={styles.analyticsChartCard}>
              <h3>Enrolled categories</h3>
              <div className={styles.analyticsChartWrap}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fill: '#475569', fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fill: '#475569', fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
            <article className={styles.analyticsChartCard}>
              <h3>Learning status split</h3>
              <div className={styles.analyticsChartWrap}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={88} paddingAngle={4}>
                      {statusData.map((entry, index) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      {isWishlistTab ? (
        <section className={styles.learningCards}>
          <article className={styles.emptyStateCard}>
            <h3>No wishlist items yet</h3>
            <p>Wishlist is currently blank for all students.</p>
          </article>
        </section>
      ) : null}

      {isCertificatesTab ? (
        <section className={styles.learningCards}>
          <article className={styles.emptyStateCard}>
            <h3>No certificates yet</h3>
            <p>Certificates are currently blank for all students.</p>
          </article>
        </section>
      ) : null}

      {isProfileTab ? (
        <section className={styles.profilePanel}>
          <header className={styles.profileHeader}>
            <div className={styles.profileAvatar} aria-hidden="true">S</div>
            <div>
              <span>Student profile</span>
              <h2>My Profile</h2>
              <p>Manage your learning identity and account details.</p>
            </div>
          </header>
          <div className={styles.profileGrid}>
            <article className={styles.profileCard}>
              <span>Role</span>
              <strong>Student</strong>
            </article>
            <article className={styles.profileCard}>
              <span>User ID</span>
              <strong>{currentUserUid ? currentUserUid.slice(0, 14) : 'Secure account'}</strong>
            </article>
            <article className={styles.profileCard}>
              <span>Enrolled Courses</span>
              <strong>{allEnrolledLearning.length}</strong>
            </article>
            <article className={styles.profileCard}>
              <span>Primary Domain</span>
              <strong>Computer Science</strong>
            </article>
          </div>
        </section>
      ) : null}

      {isSettingsTab ? (
        <section className={styles.settingsPanel}>
          <header className={styles.settingsHeader}>
            <span>Account controls</span>
            <h2>Settings</h2>
            <p>Choose how you receive course and job notifications.</p>
          </header>
          <div className={styles.settingsList}>
            <label className={styles.settingRow}>
              <div>
                <strong>Email course updates</strong>
                <small>Announcements and release updates for enrolled courses.</small>
              </div>
              <input type="checkbox" checked={emailAlertsEnabled} onChange={(event) => setEmailAlertsEnabled(event.target.checked)} />
            </label>
            <label className={styles.settingRow}>
              <div>
                <strong>Job alerts</strong>
                <small>Computer science jobs feed notifications in your region.</small>
              </div>
              <input type="checkbox" checked={jobsAlertsEnabled} onChange={(event) => setJobsAlertsEnabled(event.target.checked)} />
            </label>
            <label className={styles.settingRow}>
              <div>
                <strong>Weekly summary</strong>
                <small>Weekly digest with progress and pending learning tasks.</small>
              </div>
              <input type="checkbox" checked={weeklySummaryEnabled} onChange={(event) => setWeeklySummaryEnabled(event.target.checked)} />
            </label>
          </div>
        </section>
      ) : null}
    </div>
  )
}

export default StudentView
