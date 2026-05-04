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
import { ArrowRight, CheckCircle2, ChevronDown, Compass, Map as MapIcon, RotateCcw, Search, Sparkles, Target } from 'lucide-react'
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
const STATUS_COLORS = ['#2563eb', '#f59e0b', '#6366f1']

function clampValue(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value))
}

function StudentView({
  activeTab,
  currentUserUid,
  courses,
  enrolledCourseIds,
  enrolledVideoIds = [],
  onboardingProfile,
  onVideoViewChange,
  onOpenCourseView,
  onOpenVideoView,
  onExploreCourses,
  onResetRoadmap,
}) {
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true)
  const [jobsAlertsEnabled, setJobsAlertsEnabled] = useState(true)
  const [weeklySummaryEnabled, setWeeklySummaryEnabled] = useState(false)
  const [exportBusy, setExportBusy] = useState(false)
  const [exportMessage, setExportMessage] = useState('')
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const [learningQuery, setLearningQuery] = useState('')
  const [learningCategoryFilter, setLearningCategoryFilter] = useState('all')
  const [learningQuickFilter, setLearningQuickFilter] = useState('all')
  const [learningSort, setLearningSort] = useState('recent')
  const [assessmentViewMode, setAssessmentViewMode] = useState('self-evaluation')
  const [jobReadinessTrack, setJobReadinessTrack] = useState('dream-role')
  const [coreEvaluationSubject, setCoreEvaluationSubject] = useState('Computer Networks')
  const analyticsRef = useRef(null)
  const exportMenuRef = useRef(null)

  const isRoadmapTab = activeTab === 'Roadmap'
  const isReportTab = activeTab === 'Student Report'
  const isAssessmentsTab = activeTab === 'Assessments'
  const isInterviewsTab = activeTab === 'Interviews'
  const isMyLearningsTab = activeTab === 'My Learnings'
  const isWishlistTab = activeTab === 'Wishlist'
  const isCertificatesTab = activeTab === 'Certificates'
  const isProfileTab = activeTab === 'My Profile'
  const isSettingsTab = activeTab === 'Settings'
  const isFaqTab = activeTab === 'FAQ'

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
        type: 'video',
        subjectKey,
        subcategoryKey,
        videoIndex: hasStoredIndex ? Number.parseInt(parts[2], 10) || 0 : 0,
        title: video?.title ?? subcategory.label,
        category: subcategory.label,
        hours: video?.durationSeconds ? Math.max(1, Math.round(video.durationSeconds / 3600)) : 1,
        thumbnail: video?.youtubeId ? `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg` : null,
      }
    }).filter(Boolean),
    [enrolledVideoIds],
  )

  const allEnrolledLearning = useMemo(
    () => [...enrolledVideoCourses, ...enrolledCourses.map((course) => ({
      id: course.id,
      type: 'course',
      title: course.title,
      category: course.category,
      hours: Number.parseFloat(String(course.hours ?? '').replace(/[^\d.]/g, '')) || 1,
      thumbnail: course.youtubeId ? `https://img.youtube.com/vi/${course.youtubeId}/hqdefault.jpg` : null,
      source: course,
    }))],
    [enrolledCourses, enrolledVideoCourses],
  )

  const learningItems = useMemo(
    () => allEnrolledLearning.map((course, index) => {
      const progress = clampValue(PROGRESS_BY_COURSE[course.id] ?? 40, 0, 100)
      return {
        ...course,
        progress,
        enrolledRank: index,
        status: progress >= 100 ? 'completed' : 'in-progress',
        typeLabel: course.type === 'video' ? 'Video Lesson' : 'Full Course',
      }
    }),
    [allEnrolledLearning],
  )

  const learningCategories = useMemo(
    () => [...new Set(learningItems.map((course) => String(course.category ?? 'General')))].sort((left, right) => left.localeCompare(right)),
    [learningItems],
  )

  const visibleLearningItems = useMemo(() => {
    const normalizedQuery = learningQuery.trim().toLowerCase()
    const filtered = learningItems.filter((course) => {
      if (normalizedQuery) {
        const searchable = `${course.title} ${course.category} ${course.typeLabel}`.toLowerCase()
        if (!searchable.includes(normalizedQuery)) return false
      }
      if (learningCategoryFilter !== 'all' && course.category !== learningCategoryFilter) return false
      if (learningQuickFilter === 'course' && course.type !== 'course') return false
      if (learningQuickFilter === 'video' && course.type !== 'video') return false
      if (learningQuickFilter === 'in-progress' && course.status !== 'in-progress') return false
      if (learningQuickFilter === 'completed' && course.status !== 'completed') return false
      return true
    })

    const sorted = [...filtered]
    sorted.sort((left, right) => {
      if (learningSort === 'title') return left.title.localeCompare(right.title)
      if (learningSort === 'progress') return right.progress - left.progress
      if (learningSort === 'duration') return (Number(right.hours) || 0) - (Number(left.hours) || 0)
      return right.enrolledRank - left.enrolledRank
    })
    return sorted
  }, [learningCategoryFilter, learningItems, learningQuery, learningQuickFilter, learningSort])

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

  const dreamRole = onboardingProfile?.role ?? 'Software Development Engineer'
  const careerStage = onboardingProfile?.stage?.title ?? 'Career learner'
  const assessmentCounters = [
    { label: 'Practice Tests Given', value: 12 },
    { label: 'Quizzes Given', value: 18 },
    { label: 'Job Readiness Exams Given', value: 7 },
  ]

  const selfEvaluationBlocks = [
    {
      title: 'Practice Tests',
      score: 74,
      count: 12,
      note: 'Timed practice tests for core accuracy, speed, and revision depth.',
    },
    {
      title: 'Quiz',
      score: 81,
      count: 18,
      note: 'Short checkpoint quizzes across lessons and enrolled tracks.',
    },
    {
      title: 'MCQ',
      score: 69,
      count: 36,
      note: 'Multiple-choice drills for fast recall and concept-level diagnosis.',
    },
  ]

  const coreEvaluationSubjects = ['Computer Networks', 'Database Management System', 'Operating System', 'System Design']
  const jobReadinessExamCards = jobReadinessTrack === 'dream-role'
    ? Array.from({ length: 5 }, (_, index) => ({
      id: `dream-role-${index + 1}`,
      title: `${dreamRole} Readiness Test ${index + 1}`,
      category: dreamRole,
      level: index < 2 ? 'Foundation' : index < 4 ? 'Applied' : 'Premium',
      duration: `${35 + index * 5} min`,
      questions: 30 + index * 5,
      score: 70 + index * 3,
    }))
    : Array.from({ length: 5 }, (_, index) => ({
      id: `${coreEvaluationSubject}-${index + 1}`,
      title: `${coreEvaluationSubject} Job Readiness Test ${index + 1}`,
      category: 'Core Evaluation',
      level: index < 2 ? 'Foundation' : index < 4 ? 'Applied' : 'Advanced',
      duration: `${30 + index * 5} min`,
      questions: 25 + index * 5,
      score: 66 + index * 4,
    }))

  const interviewCards = [
    {
      title: `${dreamRole} Technical Interview`,
      detail: 'Role-specific technical screen with focused feedback and next-step signals.',
      status: 'Available',
    },
    {
      title: 'Core CS Interview',
      detail: 'Computer networks, DBMS, OS, and system design interview practice.',
      status: 'Available',
    },
    {
      title: 'HR and Communication Round',
      detail: 'Behavioral answers, clarity, confidence, and structured communication review.',
      status: 'Coming next',
    },
  ]
  const workspaceFaqItems = [
    {
      question: 'Where do I find my AI roadmap?',
      answer: 'Open Roadmap in the Student Workspace to see the career path built from your onboarding choices.',
    },
    {
      question: 'Where are job readiness exams available?',
      answer: 'Open Assessments, then choose Job Readiness Evaluation to access role-specific and core CS exams.',
    },
    {
      question: 'Where are interviews now placed?',
      answer: 'Interviews have a separate workspace tab so interview preparation stays outside assessments.',
    },
    {
      question: 'How do I continue an enrolled course?',
      answer: 'Open My Learnings from the top navigation and select the enrolled course or video card.',
    },
  ]
  const roadmapSteps = [
    {
      title: 'Foundation calibration',
      detail: `Lock the core computer science, programming, and problem-solving base required for ${dreamRole}.`,
    },
    {
      title: 'Role skill stack',
      detail: 'Build the exact technical stack, tools, and execution habits expected in the target role.',
    },
    {
      title: 'Portfolio proof',
      detail: 'Complete projects, case studies, and visible proof that matches the hiring bar for this path.',
    },
    {
      title: 'Interview and leadership readiness',
      detail: 'Practice system thinking, communication, interview loops, and decision-making depth.',
    },
    {
      title: 'Market launch',
      detail: 'Use relevant courses, job signals, and weekly progress tracking to move from roadmap to outcomes.',
    },
  ]

  useEffect(() => {
    onVideoViewChange?.(false)
  }, [onVideoViewChange])

  useEffect(() => {
    if (!exportMenuOpen) return undefined

    const handleOutsideClick = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setExportMenuOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setExportMenuOpen(false)
      }
    }

    window.addEventListener('mousedown', handleOutsideClick)
    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('mousedown', handleOutsideClick)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [exportMenuOpen])

  const openLearningItem = (course) => {
    if (course.type === 'video') {
      onOpenVideoView?.(course)
      return
    }

    onOpenCourseView?.(course.source ?? course)
  }

  const exportAnalytics = async (format) => {
    if (!analyticsRef.current || exportBusy) return
    setExportMenuOpen(false)
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
    <div className={`${styles.studentShell} ${isMyLearningsTab ? styles.studentShellWide : ''}`}>
      {isRoadmapTab ? (
        <section className={styles.roadmapPanel}>
          <header className={styles.roadmapHeader}>
            <div>
              <span><Sparkles size={15} /> AI recommended roadmap</span>
              <h2>{dreamRole}</h2>
              <p>{careerStage} path calibrated from onboarding. Follow these milestones, then explore courses aligned to the next skill gap.</p>
            </div>
            <div className={styles.roadmapActions}>
              <button type="button" className={styles.exploreCoursesButton} onClick={onExploreCourses}>
                <Compass size={17} />
                Explore Courses
                <ArrowRight size={16} />
              </button>
              <button type="button" className={styles.resetRoadmapButton} onClick={onResetRoadmap}>
                <RotateCcw size={16} />
                Reset Roadmap
              </button>
            </div>
          </header>

          <div className={styles.roadmapGrid}>
            <article className={styles.roadmapSummaryCard}>
              <MapIcon size={22} />
              <span>Current stage</span>
              <strong>{careerStage}</strong>
              <p>Your roadmap starts here and adapts toward your selected role path.</p>
            </article>
            <article className={styles.roadmapSummaryCard}>
              <Target size={22} />
              <span>Dream role</span>
              <strong>{dreamRole}</strong>
              <p>Recommendations prioritize skills, proof, and courses for this outcome.</p>
            </article>
          </div>

          <div className={styles.roadmapTimeline}>
            {roadmapSteps.map((step, index) => (
              <article key={step.title} className={styles.roadmapStep}>
                <div className={styles.roadmapStepIndex}>
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.detail}</p>
                </div>
                <CheckCircle2 size={19} />
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {isReportTab ? (
        <section className={styles.studentAnalytics} ref={analyticsRef}>
          <header className={styles.analyticsHeader}>
            <div>
              <span>Student dashboard</span>
              <h2>Learning Analytics</h2>
              <p>Track progress, market readiness, and AI-powered learning insights.</p>
            </div>
            <div className={styles.analyticsActions}>
              <div className={styles.exportMenuWrap} ref={exportMenuRef}>
                <button
                  type="button"
                  className={styles.exportMenuTrigger}
                  onClick={() => setExportMenuOpen((current) => !current)}
                  disabled={exportBusy}
                  aria-haspopup="menu"
                  aria-expanded={exportMenuOpen}
                >
                  Export
                  <ChevronDown size={15} strokeWidth={2.4} />
                </button>
                {exportMenuOpen ? (
                  <div className={styles.exportMenu} role="menu" aria-label="Export analytics">
                    <button type="button" role="menuitem" onClick={() => exportAnalytics('pdf')}>
                      Export PDF
                    </button>
                    <button type="button" role="menuitem" onClick={() => exportAnalytics('png')}>
                      Export PNG
                    </button>
                    <button type="button" role="menuitem" onClick={() => exportAnalytics('jpg')}>
                      Export JPG
                    </button>
                  </div>
                ) : null}
              </div>
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
                    <Bar dataKey="progress" fill="#f59e0b" radius={[6, 6, 0, 0]} />
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

      {isAssessmentsTab ? (
        <section className={styles.assessmentPanel}>
          <header className={styles.assessmentHeader}>
            <div>
              <span>Student workspace</span>
              <h2>Assessments</h2>
              <p>Practice tests, quizzes, MCQs, and role-calibrated job readiness exams.</p>
            </div>
            <div className={styles.assessmentModeSwitch} role="tablist" aria-label="Assessment view mode">
              <button
                type="button"
                className={assessmentViewMode === 'self-evaluation' ? styles.assessmentModeActive : ''}
                onClick={() => setAssessmentViewMode('self-evaluation')}
              >
                Self Evaluation
              </button>
              <button
                type="button"
                className={assessmentViewMode === 'job-readiness' ? styles.assessmentModeActive : ''}
                onClick={() => setAssessmentViewMode('job-readiness')}
              >
                Job Readiness Evaluation
              </button>
            </div>
          </header>

          <div className={styles.assessmentCounterGrid}>
            {assessmentCounters.map((item) => (
              <article key={item.label} className={styles.assessmentCounterCard}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>

          {assessmentViewMode === 'self-evaluation' ? (
            <section className={styles.selfEvaluationScreen}>
              <header className={styles.assessmentSectionHeader}>
                <span>Self Evaluation</span>
                <h3>Practice Test, Quiz, and MCQ</h3>
                <p>Internal evaluation screen for measuring preparation quality before job-readiness exams.</p>
              </header>
              <div className={styles.selfEvaluationGrid}>
                {selfEvaluationBlocks.map((item) => (
                  <article key={item.title} className={styles.selfEvaluationCard}>
                    <span>{item.title}</span>
                    <strong>{item.score}%</strong>
                    <small>{item.count} attempts</small>
                    <p>{item.note}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : (
            <section className={styles.jobReadinessScreen}>
              <header className={styles.assessmentSectionHeader}>
                <span>Job Readiness Evaluation</span>
                <h3>{jobReadinessTrack === 'dream-role' ? dreamRole : 'Core Evaluation'}</h3>
                <p>
                  {jobReadinessTrack === 'dream-role'
                    ? `Premium curated exams tailored for the ${dreamRole} path selected during onboarding.`
                    : 'Core CS evaluation across computer networks, DBMS, operating systems, and system design.'}
                </p>
              </header>

              <div className={styles.jobTrackSwitch}>
                <button
                  type="button"
                  className={jobReadinessTrack === 'dream-role' ? styles.jobTrackActive : ''}
                  onClick={() => setJobReadinessTrack('dream-role')}
                >
                  {dreamRole}
                </button>
                <button
                  type="button"
                  className={jobReadinessTrack === 'core' ? styles.jobTrackActive : ''}
                  onClick={() => setJobReadinessTrack('core')}
                >
                  Core Evaluation
                </button>
              </div>

              {jobReadinessTrack === 'core' ? (
                <div className={styles.coreSubjectTabs}>
                  {coreEvaluationSubjects.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      className={coreEvaluationSubject === subject ? styles.coreSubjectActive : ''}
                      onClick={() => setCoreEvaluationSubject(subject)}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className={styles.assessmentReportGrid}>
                {jobReadinessExamCards.map((exam) => (
                  <article key={exam.id} className={styles.assessmentReportCard}>
                    <div>
                      <span>{exam.category}</span>
                      <h3>{exam.title}</h3>
                    </div>
                    <div className={styles.assessmentReportMeta}>
                      <strong>{exam.score}%</strong>
                      <p>{exam.level}</p>
                      <small>{exam.questions} questions - {exam.duration}</small>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </section>
      ) : null}

      {isInterviewsTab ? (
        <section className={styles.interviewPanel}>
          <header className={styles.assessmentHeader}>
            <div>
              <span>Student workspace</span>
              <h2>Interviews</h2>
              <p>Dedicated interview preparation separated from assessments.</p>
            </div>
          </header>
          <div className={styles.interviewGrid}>
            {interviewCards.map((item) => (
              <article key={item.title} className={styles.interviewCard}>
                <span>{item.status}</span>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {isMyLearningsTab ? (
        <section className={styles.learningDashboard}>
          <header className={styles.learningDashboardHeader}>
            <div>
              <span>Student workspace</span>
              <h2>My Learnings</h2>
              <p>Track enrolled items with focused filtering and cleaner course cards built for quick scanning.</p>
            </div>
            <div className={styles.learningToolbar}>
              <label className={styles.learningSearch}>
                <Search size={15} />
                <input
                  type="search"
                  value={learningQuery}
                  onChange={(event) => setLearningQuery(event.target.value)}
                  placeholder="Search enrolled items"
                  aria-label="Search enrolled courses"
                />
              </label>
              <select value={learningCategoryFilter} onChange={(event) => setLearningCategoryFilter(event.target.value)} aria-label="Filter by category">
                <option value="all">All categories</option>
                {learningCategories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
              <select value={learningSort} onChange={(event) => setLearningSort(event.target.value)} aria-label="Sort enrolled courses">
                <option value="recent">Most recent</option>
                <option value="progress">Highest progress</option>
                <option value="duration">Longest duration</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>
          </header>

          <div className={styles.filterPills}>
            <button
              type="button"
              className={learningQuickFilter === 'all' ? styles.filterPillActive : ''}
              onClick={() => setLearningQuickFilter('all')}
            >
              All
            </button>
            <button
              type="button"
              className={learningQuickFilter === 'course' ? styles.filterPillActive : ''}
              onClick={() => setLearningQuickFilter('course')}
            >
              Full Courses
            </button>
            <button
              type="button"
              className={learningQuickFilter === 'video' ? styles.filterPillActive : ''}
              onClick={() => setLearningQuickFilter('video')}
            >
              Video Lessons
            </button>
            <button
              type="button"
              className={learningQuickFilter === 'in-progress' ? styles.filterPillActive : ''}
              onClick={() => setLearningQuickFilter('in-progress')}
            >
              In Progress
            </button>
            <button
              type="button"
              className={learningQuickFilter === 'completed' ? styles.filterPillActive : ''}
              onClick={() => setLearningQuickFilter('completed')}
            >
              Completed
            </button>
          </div>

          {visibleLearningItems.length > 0 ? (
            <div className={styles.dashboardCourseGrid}>
              {visibleLearningItems.map((course) => (
                <button key={course.id} type="button" className={styles.dashboardCourseCard} onClick={() => openLearningItem(course)}>
                  <img
                    src={course.thumbnail || 'https://images.pexels.com/photos/5212339/pexels-photo-5212339.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt={course.title}
                    loading="lazy"
                  />
                  <div className={styles.dashboardCourseBody}>
                    <span>{course.typeLabel}</span>
                    <h3>{course.title}</h3>
                    <div className={styles.dashboardCourseMeta}>
                      <span>{course.category}</span>
                      <span>{course.progress}% complete</span>
                    </div>
                    <div className={styles.dashboardProgress}>
                      <span style={{ width: `${course.progress}%` }} />
                    </div>
                    <div className={styles.dashboardCourseMeta}>
                      <span>{course.status === 'completed' ? 'Completed' : 'In progress'}</span>
                      <span>{Number(course.hours) || 1}h track</span>
                    </div>
                    <strong>{course.status === 'completed' ? 'Review Course' : 'Continue Learning'}</strong>
                  </div>
                </button>
              ))}
            </div>
          ) : allEnrolledLearning.length > 0 ? (
            <article className={styles.emptyDashboardState}>
              <span>No match</span>
              <h3>No enrolled items match these filters</h3>
              <p>Adjust your search, category, type, or status filters to see enrolled content.</p>
            </article>
          ) : (
            <article className={styles.emptyDashboardState}>
              <span>Start learning</span>
              <h3>No enrolled courses yet</h3>
              <p>Enroll in courses to populate this workspace and continue directly from here.</p>
            </article>
          )}
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

      {isFaqTab ? (
        <section className={styles.faqPanel}>
          <header className={styles.faqHeader}>
            <span>Student support</span>
            <h2>FAQ</h2>
            <p>Workspace guidance for roadmap, assessments, interviews, and learning access.</p>
          </header>
          <div className={styles.faqList}>
            {workspaceFaqItems.map((item) => (
              <article key={item.question} className={styles.faqItem}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

export default StudentView
