import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import AuthScreen from './components/auth/AuthScreen'
import Footer from './components/layout/Footer'
import FloatingAssistant from './components/layout/FloatingAssistant'
import Topbar from './components/layout/Topbar'
import PreviewModal from './components/modals/PreviewModal'
import StudentOnboarding from './components/onboarding/StudentOnboarding'
import CourseFeedbackDialog from './components/public/CourseFeedbackDialog'
import PublicCartView from './components/public/PublicCartView'
import PublicCourseList from './components/public/PublicCourseList'
import PublicCourseCheckoutView from './components/public/PublicCourseCheckoutView'
import PublicCourseView from './components/public/PublicCourseView'
import PublicHome from './components/public/PublicHome'
import PublicInstructorView from './components/public/PublicInstructorView'
import PublicJobsView from './components/public/PublicJobsView'
import PublicSubjectView from './components/public/PublicSubjectView'
import InstructorView from './components/workspace/InstructorView'
import RoleWorkspaceLayout from './components/workspace/RoleWorkspaceLayout'
import StudentView from './components/workspace/StudentView'
import { DashboardLayout } from './dashboard/components/layout/dashboard-layout'
import { AnalyticsPage } from './dashboard/pages/analytics-page'
import { CourseViewerPage } from './dashboard/pages/course-viewer-page'
import { CoursesPage } from './dashboard/pages/courses-page'
import { DashboardPage } from './dashboard/pages/dashboard-page'
import { LoginPage } from './dashboard/pages/login-page'
import { SettingsPage } from './dashboard/pages/settings-page'
import { StudentsPage } from './dashboard/pages/students-page'
import { publicCatalogCourses } from './data/publicCatalogData'
import { ADMIN_EMAIL, courses, instructors, workspaceMenu } from './data/siteData'
import {
  consumeGoogleRedirectSession,
  getCurrentSession,
  heartbeatSession,
  logoutUser,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  warmSessionApi,
} from './firebase/authService'

const ENROLLMENT_STORAGE_PREFIX = 'kiitx-enrollments'
const LMS_VIDEO_ENROLLMENT_STORAGE_PREFIX = 'kiitx-video-enrollments'
const STUDENT_ONBOARDING_STORAGE_PREFIX = 'kiitx-student-onboarding'
const HEARTBEAT_INTERVAL_MS = 60 * 1000
const STUDENT_WORKSPACE_PATH = '/student/student-workspace'
const STUDENT_MY_LEARNINGS_PATH = '/student/my-learnings'
const STUDENT_ONBOARDING_PATH = '/student/onboarding'
const STUDENT_WORKSPACE_TAB_SEGMENTS = {
  roadmap: 'Roadmap',
  'student-report': 'Student Report',
  assessments: 'Assessments',
  interviews: 'Interviews',
  wishlist: 'Wishlist',
  certificates: 'Certificates',
  'my-profile': 'My Profile',
  settings: 'Settings',
  faq: 'FAQ',
}
const STUDENT_WORKSPACE_SEGMENT_BY_TAB = Object.fromEntries(
  Object.entries(STUDENT_WORKSPACE_TAB_SEGMENTS).map(([segment, tab]) => [tab, segment]),
)
const SUBJECT_BY_CATEGORY = {
  Development: 'computerscience',
  'Data Science': 'computerscience',
  'IT and Software': 'computerscience',
  Management: 'computerscience',
  Commerce: 'computerscience',
  Science: 'computerscience',
  Engineering: 'computerscience',
  Arts: 'computerscience',
}

function slugifyCourseTitle(title = '') {
  return String(title)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getCourseSlug(course) {
  return slugifyCourseTitle(course?.title ?? course?.id ?? '')
}

function buildPublicCoursePath(course) {
  return `/course/${getCourseSlug(course)}`
}

function buildStudentCoursePath(course) {
  return `/student/course/${getCourseSlug(course)}`
}

function findCourseBySlug(courseCollection, courseSlug) {
  return courseCollection.find((course) => getCourseSlug(course) === courseSlug || course.id === courseSlug) ?? null
}

function ensurePreviewLessons(course, targetCount = 50) {
  const baseLessons = Array.isArray(course?.previewLessons) && course.previewLessons.length > 0
    ? course.previewLessons
    : [{ title: 'Course Trailer', duration: '08:00', youtubeId: course?.youtubeId }]

  if (baseLessons.length >= targetCount) {
    return baseLessons.slice(0, targetCount)
  }

  const extraLessons = Array.from({ length: targetCount - baseLessons.length }, (_, index) => {
    const lessonNumber = baseLessons.length + index + 1
    const seedLesson = baseLessons[index % baseLessons.length]
    const minutes = 8 + (lessonNumber % 9)
    const seconds = String((lessonNumber * 7) % 60).padStart(2, '0')
    return {
      title: `Module ${lessonNumber}: Guided Session ${lessonNumber}`,
      duration: `${minutes}:${seconds}`,
      youtubeId: seedLesson?.youtubeId ?? course?.youtubeId,
    }
  })

  return [...baseLessons, ...extraLessons]
}

function withExpandedCourseVideos(course) {
  return {
    ...course,
    previewLessons: ensurePreviewLessons(course, 50),
  }
}

function roleHomePath(role) {
  if (role === 'student') return STUDENT_WORKSPACE_PATH
  if (role === 'instructor') return '/instructor-dashboard'
  return '/'
}

function resolvePostAuthPathForLocation(role, locationState) {
  const redirectTo = locationState?.redirectTo
  const requiredRole = locationState?.requiredRole
  if (redirectTo && (!requiredRole || requiredRole === role)) {
    return redirectTo
  }
  return roleHomePath(role)
}

function buildStudentWorkspacePath(tab = 'Roadmap') {
  const segment = STUDENT_WORKSPACE_SEGMENT_BY_TAB[tab] ?? STUDENT_WORKSPACE_SEGMENT_BY_TAB.Roadmap
  return `${STUDENT_WORKSPACE_PATH}/${segment}`
}

function readStudentOnboarding(uid) {
  if (typeof window === 'undefined' || !uid) return null
  try {
    const savedProfile = window.localStorage.getItem(`${STUDENT_ONBOARDING_STORAGE_PREFIX}:${uid}`)
    const parsedProfile = savedProfile ? JSON.parse(savedProfile) : null
    return parsedProfile?.completed ? parsedProfile : null
  } catch {
    return null
  }
}

function getAuthMessage(error) {
  const message = typeof error?.message === 'string' ? error.message.trim() : ''
  const code = error?.code ?? ''
  if (code.includes('popup-closed')) return 'Google sign-in was closed before completion.'
  if (code.includes('invalid-credential') || code.includes('wrong-password')) return 'Incorrect email or password.'
  if (code.includes('email-already-in-use')) return 'This email is already registered.'
  if (code.includes('user-not-found')) return 'No account exists for this email.'
  if (code.includes('too-many-requests')) return 'Too many attempts. Try again shortly.'
  if (message) return message
  return 'Authentication failed. Please try again.'
}

function SessionRefreshScreen() {
  return (
    <section
      aria-label="Restoring session"
      style={{
        width: '100%',
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}
    >
      <div
        style={{
          width: 'min(100%, 640px)',
          borderRadius: '8px',
          border: '1px solid rgba(148, 163, 184, 0.16)',
          background: 'rgba(15, 23, 42, 0.04)',
          padding: '1.5rem',
          display: 'grid',
          gap: '1rem',
        }}
      >
        <div
          style={{
            width: '7rem',
            height: '0.875rem',
            borderRadius: '999px',
            background: 'rgba(148, 163, 184, 0.22)',
          }}
        />
        <div
          style={{
            width: '55%',
            height: '1.5rem',
            borderRadius: '999px',
            background: 'rgba(148, 163, 184, 0.2)',
          }}
        />
        <div
          style={{
            width: '100%',
            height: '0.9rem',
            borderRadius: '999px',
            background: 'rgba(148, 163, 184, 0.14)',
          }}
        />
        <div
          style={{
            width: '82%',
            height: '0.9rem',
            borderRadius: '999px',
            background: 'rgba(148, 163, 184, 0.14)',
          }}
        />
      </div>
    </section>
  )
}

function MarketplaceFrame({
  children,
  currentUserRole,
  authStateReady,
  onLogout,
  onOpenLogin,
  onOpenAbout,
  onOpenCatalog,
  onOpenHelp,
  onOpenJobs,
  onOpenLocalChapters,
  onOpenMyLearnings,
  onOpenMyProfile,
  onOpenStudentWorkspace,
  onLogoClick,
  onOpenSubject,
  showFooter = true,
  hideFlashBanner = false,
  centered = true,
  previewCourse,
  previewLessonIndex,
  onPreviewLessonChange,
  onClosePreview,
  hideTopbar = false,
  onOpenPreviewCourse,
  isPreviewCourseEnrolled = false,
  topbarTitle = '',
  topbarTitleOnly = false,
  showCourseActions = false,
  onLeaveReview,
  onShareCourse,
  hideFloatingAssistant = false,
  showVideoThemeToggle = false,
  videoThemeMode = 'light',
  onToggleVideoTheme,
}) {
  return (
    <>
      {!hideTopbar ? (
        <Topbar
          isAdminRoute={false}
          currentUserRole={currentUserRole}
          authStateReady={authStateReady}
          onLogout={onLogout}
          onOpenLogin={onOpenLogin}
          onOpenAbout={onOpenAbout}
          onOpenCatalog={onOpenCatalog}
          onOpenJobs={onOpenJobs}
          onOpenLocalChapters={onOpenLocalChapters}
          onOpenMyLearnings={onOpenMyLearnings}
          onOpenMyProfile={onOpenMyProfile}
          onOpenStudentWorkspace={onOpenStudentWorkspace}
          adminLoggedIn={false}
          onBackToMarketplace={onLogoClick}
          onLogoClick={onLogoClick}
          onOpenSubject={onOpenSubject}
          hideFlashBanner={hideFlashBanner}
          titleOnly={topbarTitleOnly}
          titleText={topbarTitle}
          showCourseActions={showCourseActions}
          onLeaveReview={onLeaveReview}
          onShareCourse={onShareCourse}
          showVideoThemeToggle={showVideoThemeToggle}
          videoThemeMode={videoThemeMode}
          onToggleVideoTheme={onToggleVideoTheme}
        />
      ) : null}
      <div className={`public-shell ${centered ? 'public-shell-center' : ''}`}>{children}</div>
      {showFooter ? <Footer /> : null}
      {!hideFloatingAssistant ? <FloatingAssistant onOpenHelp={onOpenHelp} /> : null}
      {previewCourse ? (
        <PreviewModal
          course={previewCourse}
          lessonIndex={previewLessonIndex}
          onLessonChange={onPreviewLessonChange}
          isEnrolled={isPreviewCourseEnrolled}
          onOpenCourse={(courseId) => {
            onClosePreview()
            onOpenPreviewCourse?.(courseId)
          }}
          onClose={onClosePreview}
        />
      ) : null}
    </>
  )
}

function CourseRoute({
  courseCollection,
  instructorsById,
  currentUserRole,
  authStateReady,
  enrolledCourseIds,
  onOpenInstructor,
  onPreview,
  onOpenEnrolledCourse,
  onRegisterToEnroll,
  onLoginToEnroll,
  onEnroll,
}) {
  const { courseSlug } = useParams()
  const course = findCourseBySlug(courseCollection, courseSlug ?? '')

  if (!course) {
    return <Navigate to="/" replace />
  }

  return (
    <PublicCourseView
      course={course}
      instructor={course.instructorId ? instructorsById[course.instructorId] : null}
      currentUserRole={currentUserRole}
      authStateReady={authStateReady}
      isEnrolled={enrolledCourseIds.includes(course.id)}
      onOpenInstructor={onOpenInstructor}
      onPreview={onPreview}
      onOpenEnrolledCourse={onOpenEnrolledCourse}
      onRegisterToEnroll={onRegisterToEnroll}
      onLoginToEnroll={onLoginToEnroll}
      onEnroll={onEnroll}
    />
  )
}

function CourseCheckoutRoute({
  courseCollection,
  currentUserRole,
  authStateReady,
  enrolledCourseIds,
  onBack,
  onRegister,
  onLogin,
  onConfirmPayment,
  onOpenEnrolledCourse,
}) {
  const { courseSlug } = useParams()
  const course = findCourseBySlug(courseCollection, courseSlug ?? '')

  if (!course) {
    return <Navigate to="/course-list" replace />
  }

  return (
    <PublicCourseCheckoutView
      course={course}
      currentUserRole={currentUserRole}
      authStateReady={authStateReady}
      isEnrolled={enrolledCourseIds.includes(course.id)}
      onBack={onBack}
      onRegister={onRegister}
      onLogin={onLogin}
      onConfirmPayment={onConfirmPayment}
      onOpenEnrolledCourse={onOpenEnrolledCourse}
    />
  )
}

function StudentCourseRoute({
  courseCollection,
  enrolledCourseIds,
  onVideoViewChange,
  onLogout,
  onTitleChange,
  videoThemeMode,
}) {
  const navigate = useNavigate()
  const { courseSlug } = useParams()
  const course = findCourseBySlug(courseCollection, courseSlug ?? '')

  useEffect(() => {
    onVideoViewChange?.(true)
    return () => onVideoViewChange?.(false)
  }, [onVideoViewChange])

  if (!course || !enrolledCourseIds.includes(course.id)) {
    return <Navigate to={STUDENT_MY_LEARNINGS_PATH} replace />
  }

  return (
    <PublicSubjectView
      key={`${course.id}-${course.category}`}
      initialSubject={SUBJECT_BY_CATEGORY[course.category] ?? 'computerscience'}
      initialVideoIndex={0}
      mode="detail"
      detailTitle={course.title}
      detailSubtitle={course.subtitle}
      courseId={course.id}
      sharePath={buildPublicCoursePath(course)}
      enableCourseActions
      onOpenProfileHome={() => navigate(STUDENT_WORKSPACE_PATH)}
      onLogout={onLogout}
      currentUserRole="student"
      onTitleChange={onTitleChange}
      themeMode={videoThemeMode}
    />
  )
}

function InstructorRoute({ onOpenCourse, onOpenInstructor, onAddCart, onPreview }) {
  const { instructorId } = useParams()
  const instructor = instructors.find((item) => item.id === instructorId)

  if (!instructor) {
    return <Navigate to="/" replace />
  }

  const instructorCourses = courses.filter((course) => course.instructorId === instructor.id)

  return (
    <PublicInstructorView
      instructor={instructor}
      instructorCourses={instructorCourses}
      onOpenCourse={onOpenCourse}
      onOpenInstructor={onOpenInstructor}
      onAddCart={onAddCart}
      onPreview={onPreview}
    />
  )
}

function SubjectDetailRoute({
  onSubjectNavigate,
  onVideoNavigate,
  videoThemeMode,
}) {
  const { subject, subcategory, videoIndex } = useParams()
  const parsedIndex = Number.parseInt(videoIndex ?? '1', 10)
  const initialVideoIndex = Number.isNaN(parsedIndex) ? 0 : Math.max(0, parsedIndex - 1)

  return (
    <PublicSubjectView
      key={`${subject ?? 'computerscience'}-${subcategory ?? 'default'}-${initialVideoIndex}`}
      initialSubject={subject ?? 'computerscience'}
      initialSubcategory={subcategory}
      initialVideoIndex={initialVideoIndex}
      mode="detail"
      onSubjectNavigate={onSubjectNavigate}
      onVideoOpen={onVideoNavigate}
      themeMode={videoThemeMode}
    />
  )
}

function SubjectRouteRedirect() {
  const { subject } = useParams()
  return <Navigate to={`/subjects/${subject ?? 'computerscience'}/1`} replace />
}

function StudentWorkspaceRoute({
  studentTab,
  onTabChange,
  renderMarketplace,
  selectedCourse,
  currentUserUid,
  courses,
  enrolledCourseIds,
  enrolledVideoIds,
  onboardingProfile,
  onVideoViewChange,
  onOpenCourseView,
  onOpenVideoView,
  onExploreCourses,
  onResetRoadmap,
  isStudentVideoView,
}) {
  const { workspaceTab } = useParams()
  const resolvedTab = STUDENT_WORKSPACE_TAB_SEGMENTS[workspaceTab ?? 'roadmap'] ?? 'Roadmap'

  useEffect(() => {
    if (studentTab !== resolvedTab) {
      onTabChange(resolvedTab)
    }
  }, [onTabChange, resolvedTab, studentTab])

  return renderMarketplace(
    <RoleWorkspaceLayout
      title="Student workspace"
      menu={workspaceMenu.student}
      activeTab={resolvedTab}
      onTabChange={(nextTab) => onTabChange(nextTab, true)}
      fullWidth
      singleView={false}
    >
      <StudentView
        activeTab={resolvedTab}
        selectedCourse={selectedCourse}
        currentUserUid={currentUserUid}
        courses={courses}
        enrolledCourseIds={enrolledCourseIds}
        enrolledVideoIds={enrolledVideoIds}
        onboardingProfile={onboardingProfile}
        onVideoViewChange={onVideoViewChange}
        onOpenCourseView={onOpenCourseView}
        onOpenVideoView={onOpenVideoView}
        onExploreCourses={onExploreCourses}
        onResetRoadmap={onResetRoadmap}
      />
    </RoleWorkspaceLayout>,
    {
      showFooter: false,
      hideFlashBanner: isStudentVideoView,
      centered: false,
      hideTopbar: isStudentVideoView,
      hideFloatingAssistant: isStudentVideoView,
    },
  )
}

function AdminProtectedLayout({ authenticated, onLogout }) {
  if (!authenticated) {
    return <Navigate to="/url-admin" replace />
  }

  return <DashboardLayout onLogout={onLogout} />
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  const [cartCourseIds, setCartCourseIds] = useState([])
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([])
  const [enrolledVideoIds, setEnrolledVideoIds] = useState([])
  const [studentTab, setStudentTab] = useState('Roadmap')
  const [instructorTab, setInstructorTab] = useState(workspaceMenu.instructor[0])
  const [previewState, setPreviewState] = useState(null)
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id ?? null)
  const [currentUserRole, setCurrentUserRole] = useState(null)
  const [currentUserUid, setCurrentUserUid] = useState(null)
  const [studentOnboarding, setStudentOnboarding] = useState(null)
  const [studentOnboardingReady, setStudentOnboardingReady] = useState(false)
  const [studentOnboardingRequired, setStudentOnboardingRequired] = useState(false)
  const [authStateReady, setAuthStateReady] = useState(false)
  const [authBusy, setAuthBusy] = useState(false)
  const [authError, setAuthError] = useState('')
  const [isStudentVideoView, setIsStudentVideoView] = useState(false)
  const [courseViewTitle, setCourseViewTitle] = useState('')
  const [videoThemeMode, setVideoThemeMode] = useState('dark')
  const [activeCourseFeedback, setActiveCourseFeedback] = useState(null)
  const [courseShareMessage, setCourseShareMessage] = useState('')
  const lastHeartbeatAtRef = useRef(0)
  const [adminAuthenticated, setAdminAuthenticated] = useState(false)

  const instructorsById = useMemo(
    () => Object.fromEntries(instructors.map((instructor) => [instructor.id, instructor])),
    [],
  )

  const visibleCourses = courses
  const allLearnerCourses = useMemo(
    () => [
      ...courses.map((course) => withExpandedCourseVideos(course)),
      ...publicCatalogCourses
        .filter((course) => !courses.some((item) => item.id === course.id))
        .map((course) => withExpandedCourseVideos(course)),
    ],
    [],
  )

  const selectedCourse = useMemo(
    () => allLearnerCourses.find((course) => course.id === selectedCourseId) ?? allLearnerCourses[0],
    [allLearnerCourses, selectedCourseId],
  )

  const previewCourse = useMemo(
    () => allLearnerCourses.find((course) => course.id === previewState?.courseId) ?? null,
    [allLearnerCourses, previewState],
  )

  const cartCourses = useMemo(
    () => cartCourseIds.map((id) => courses.find((course) => course.id === id)).filter(Boolean),
    [cartCourseIds],
  )

  const studentOnboardingComplete = currentUserRole !== 'student' || studentOnboarding?.completed === true
  const studentOnboardingPending = authStateReady && currentUserRole === 'student' && !studentOnboardingReady
  const shouldGateStudentOnboarding =
    authStateReady
    && studentOnboardingReady
    && studentOnboardingRequired
    && currentUserRole === 'student'
    && !!currentUserUid
    && !studentOnboardingComplete

  const completePublicSession = useCallback((sessionResponse, mode = 'login') => {
    const nextUser = sessionResponse?.user
    if (!nextUser?.uid || !nextUser?.role) {
      throw new Error('Secure session could not be created.')
    }

    const savedOnboarding = nextUser.role === 'student' && mode !== 'signup'
      ? readStudentOnboarding(nextUser.uid)
      : null

    flushSync(() => {
      lastHeartbeatAtRef.current = Date.now()
      setAuthStateReady(true)
      setCurrentUserUid(nextUser.uid)
      setCurrentUserRole(nextUser.role)

      if (nextUser.role === 'student') {
        setStudentOnboarding(savedOnboarding)
        setStudentOnboardingReady(true)
        setStudentOnboardingRequired(mode === 'signup' && !savedOnboarding?.completed)
      }
    })

    if (nextUser.role === 'student' && mode === 'signup' && !savedOnboarding?.completed) {
      navigate(STUDENT_ONBOARDING_PATH, { replace: true })
      return
    }

    navigate(resolvePostAuthPathForLocation(nextUser.role, location.state), { replace: true })
  }, [location.state, navigate])

  useEffect(() => {
    let active = true

    const loadSession = async () => {
      try {
        await warmSessionApi()
        const redirectSession = await consumeGoogleRedirectSession()
        if (!active) return

        if (redirectSession?.user) {
          completePublicSession(redirectSession, redirectSession.authMode ?? 'login')
          return
        }

        const session = await getCurrentSession()
        if (!active) return

        if (session.authenticated && session.user) {
          setCurrentUserUid(session.user.uid)
          setCurrentUserRole(session.user.role)
          setStudentOnboardingRequired(false)
        } else {
          setCurrentUserUid(null)
          setCurrentUserRole(null)
          setStudentOnboardingRequired(false)
          setEnrolledCourseIds([])
          setEnrolledVideoIds([])
        }
      } catch {
        if (!active) return
        setCurrentUserUid(null)
        setCurrentUserRole(null)
        setStudentOnboardingRequired(false)
        setEnrolledCourseIds([])
        setEnrolledVideoIds([])
      } finally {
        if (active) {
          setAuthStateReady(true)
        }
      }
    }

    void loadSession()

    return () => {
      active = false
    }
  }, [completePublicSession])

  useEffect(() => {
    if (!location.pathname.startsWith('/student')) {
      setIsStudentVideoView(false)
    }
  }, [location.pathname])

  useEffect(() => {
    if (currentUserRole !== 'student' || !currentUserUid) {
      setStudentOnboarding(null)
      setStudentOnboardingReady(true)
      setStudentOnboardingRequired(false)
      return
    }

    setStudentOnboarding(readStudentOnboarding(currentUserUid))
    setStudentOnboardingReady(true)
  }, [currentUserRole, currentUserUid])

  useEffect(() => {
    if (!shouldGateStudentOnboarding) return
    if (location.pathname !== STUDENT_ONBOARDING_PATH) {
      navigate(STUDENT_ONBOARDING_PATH, { replace: true })
    }
  }, [location.pathname, navigate, shouldGateStudentOnboarding])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (location.pathname === '/login' || location.pathname === '/signup') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }
  }, [location.pathname])

  useEffect(() => {
    if (typeof document === 'undefined') return undefined
    const isVideoRoute =
      location.pathname.startsWith('/student/course/')
      || location.pathname.startsWith('/student/subjects/')
      || /^\/subjects\/[^/]+\/\d+$/.test(location.pathname)

    const previousOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow

    if (isVideoRoute) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = previousOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
    }
  }, [location.pathname])

  useEffect(() => {
    if (!courseShareMessage) return undefined
    const timeoutId = window.setTimeout(() => setCourseShareMessage(''), 2200)
    return () => window.clearTimeout(timeoutId)
  }, [courseShareMessage])

  useEffect(() => {
    if (typeof window === 'undefined' || !currentUserUid) return
    const savedEnrollmentIds = window.localStorage.getItem(`${ENROLLMENT_STORAGE_PREFIX}:${currentUserUid}`)
    if (!savedEnrollmentIds) {
      setEnrolledCourseIds([])
      return
    }

    try {
      const parsedEnrollmentIds = JSON.parse(savedEnrollmentIds)
      setEnrolledCourseIds(Array.isArray(parsedEnrollmentIds) ? parsedEnrollmentIds : [])
    } catch {
      setEnrolledCourseIds([])
    }
  }, [currentUserUid])

  useEffect(() => {
    if (typeof window === 'undefined' || !currentUserUid) return
    const savedEnrollmentIds = window.localStorage.getItem(`${LMS_VIDEO_ENROLLMENT_STORAGE_PREFIX}:${currentUserUid}`)
    if (!savedEnrollmentIds) {
      setEnrolledVideoIds([])
      return
    }

    try {
      const parsedEnrollmentIds = JSON.parse(savedEnrollmentIds)
      setEnrolledVideoIds(Array.isArray(parsedEnrollmentIds) ? parsedEnrollmentIds : [])
    } catch {
      setEnrolledVideoIds([])
    }
  }, [currentUserUid])

  useEffect(() => {
    if (typeof window === 'undefined' || !currentUserUid) return
    window.localStorage.setItem(`${ENROLLMENT_STORAGE_PREFIX}:${currentUserUid}`, JSON.stringify(enrolledCourseIds))
  }, [currentUserUid, enrolledCourseIds])

  useEffect(() => {
    if (typeof window === 'undefined' || !currentUserUid) return
    window.localStorage.setItem(`${LMS_VIDEO_ENROLLMENT_STORAGE_PREFIX}:${currentUserUid}`, JSON.stringify(enrolledVideoIds))
  }, [currentUserUid, enrolledVideoIds])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    if (!authStateReady || !currentUserUid) {
      return undefined
    }

    let disposed = false

    const sendHeartbeat = async () => {
      if (disposed) return

      const now = Date.now()
      if (now - lastHeartbeatAtRef.current < HEARTBEAT_INTERVAL_MS) {
        return
      }

      lastHeartbeatAtRef.current = now
      try {
        await heartbeatSession()
      } catch {
        if (!disposed) {
          setCurrentUserUid(null)
          setCurrentUserRole(null)
          setEnrolledCourseIds([])
          setEnrolledVideoIds([])
          navigate('/login', { replace: true })
        }
      }
    }

    const handleActivity = () => {
      void sendHeartbeat()
    }

    window.addEventListener('pointerdown', handleActivity)
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('scroll', handleActivity, { passive: true })
    window.addEventListener('touchstart', handleActivity, { passive: true })
    document.addEventListener('visibilitychange', handleActivity)

    return () => {
      disposed = true
      window.removeEventListener('pointerdown', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('scroll', handleActivity)
      window.removeEventListener('touchstart', handleActivity)
      document.removeEventListener('visibilitychange', handleActivity)
    }
  }, [authStateReady, currentUserUid, navigate])

  const openCourse = (courseId) => {
    const course = allLearnerCourses.find((item) => item.id === courseId)
    if (courses.some((item) => item.id === courseId)) {
      setSelectedCourseId(courseId)
    }
    if (course) {
      navigate(buildPublicCoursePath(course))
    }
  }

  const openInstructor = (instructorId) => {
    navigate(`/instructor/${instructorId}`)
  }

  const openPreview = (courseId, lessonIndex) => {
    if (courses.some((course) => course.id === courseId)) {
      setSelectedCourseId(courseId)
    }
    setPreviewState({ courseId, lessonIndex })
  }

  const addToCart = (courseId) => {
    setCartCourseIds((currentIds) => (currentIds.includes(courseId) ? currentIds : [...currentIds, courseId]))
    setSelectedCourseId(courseId)
    navigate('/cart')
  }

  const removeFromCart = (courseId) => {
    setCartCourseIds((currentIds) => currentIds.filter((id) => id !== courseId))
  }

  const navigateToAuth = (mode, redirectTo, requiredRole = 'student') => {
    navigate(`/${mode}`, {
      state: {
        redirectTo,
        requiredRole,
      },
    })
  }

  const resolvePostAuthPath = (role) => {
    return resolvePostAuthPathForLocation(role, location.state)
  }

  const enrollInCourse = (courseId) => {
    setEnrolledCourseIds((currentIds) => (currentIds.includes(courseId) ? currentIds : [...currentIds, courseId]))
    setSelectedCourseId(courseId)
    setStudentTab('My Learnings')
    const course = allLearnerCourses.find((item) => item.id === courseId)
    navigate(course ? buildStudentCoursePath(course) : STUDENT_MY_LEARNINGS_PATH)
  }

  const startEnrollmentFlow = (courseId) => {
    const course = allLearnerCourses.find((item) => item.id === courseId)
    if (!course) return

    const isPaidCourse = Number(course.price) > 0
    if (isPaidCourse) {
      navigate(`/checkout/${getCourseSlug(course)}`)
      return
    }

    enrollInCourse(courseId)
  }

  const handlePublicLogout = async () => {
    try {
      await logoutUser()
    } catch {
      // Ignore logout cleanup errors and continue routing out.
    }

    setCurrentUserUid(null)
    setCurrentUserRole(null)
    setStudentOnboarding(null)
    setStudentOnboardingReady(true)
    setStudentOnboardingRequired(false)
    setEnrolledCourseIds([])
    setEnrolledVideoIds([])
    navigate('/', { replace: true })
  }

  const handlePublicAuthenticate = async ({ role, method, mode, email, password }) => {
    setAuthBusy(true)
    setAuthError('')

    try {
      let sessionResponse

      if (method === 'google') {
        sessionResponse = await signInWithGoogle(role, mode)
      } else if (mode === 'signup') {
        sessionResponse = await signUpWithEmail(email, password, role)
      } else {
        sessionResponse = await signInWithEmail(email, password, role)
      }

      if (sessionResponse?.pendingRedirect) {
        return
      }

      completePublicSession(sessionResponse, mode)
    } catch (error) {
      setAuthError(getAuthMessage(error))
    } finally {
      setAuthBusy(false)
    }
  }

  const handleAdminLogin = (values) => {
    const email = values?.email?.trim().toLowerCase() ?? ''
    if (email !== ADMIN_EMAIL) {
      return false
    }

    setAdminAuthenticated(true)
    return true
  }

  const handleAdminLogout = () => {
    setAdminAuthenticated(false)
    navigate('/url-admin', { replace: true })
  }

  const handleSubjectVideoOpen = (subjectKey, videoIndex, subcategoryKey = 'programming') => {
    navigate(`/student/subjects/${subjectKey}/${subcategoryKey}/${videoIndex + 1}`)
  }

  const handleSubjectRouteNavigate = (subjectKey) => {
    navigate(`/subjects/${subjectKey}/1`)
  }

  const handleStudentSubjectRouteNavigate = (subjectKey) => {
    navigate(`/student/subjects/${subjectKey}/programming/1`)
  }

  const completeStudentOnboarding = (profile) => {
    if (!currentUserUid) return

    const nextProfile = {
      ...profile,
      uid: currentUserUid,
    }

    window.localStorage.setItem(`${STUDENT_ONBOARDING_STORAGE_PREFIX}:${currentUserUid}`, JSON.stringify(nextProfile))
    setStudentOnboarding(nextProfile)
    setStudentOnboardingReady(true)
    setStudentOnboardingRequired(false)
    setStudentTab('Roadmap')
    navigate(buildStudentWorkspacePath('Roadmap'), { replace: true })
  }

  const resetStudentRoadmap = () => {
    if (!currentUserUid) return
    window.localStorage.removeItem(`${STUDENT_ONBOARDING_STORAGE_PREFIX}:${currentUserUid}`)
    setStudentOnboarding(null)
    setStudentOnboardingReady(true)
    setStudentOnboardingRequired(true)
    navigate(STUDENT_ONBOARDING_PATH, { replace: true })
  }

  const scrollToHomeSection = (sectionId) => {
    const scroll = () => {
      if (typeof document === 'undefined') return
      const target = document.getElementById(sectionId)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    if (location.pathname !== '/') {
      navigate('/')
      window.setTimeout(scroll, 120)
      return
    }

    scroll()
  }

  const getCourseFromPath = () => findCourseBySlug(allLearnerCourses, location.pathname.split('/').pop() ?? '')

  const handleCourseShare = async () => {
    if (typeof window === 'undefined') return
    const course = getCourseFromPath()
    if (!course) return

    const shareUrl = new URL(buildPublicCoursePath(course), window.location.origin).toString()
    try {
      if (navigator.share) {
        await navigator.share({
          title: course.title,
          text: `Preview ${course.title} on KIITX.`,
          url: shareUrl,
        })
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        setCourseShareMessage('Preview link copied.')
      } else {
        setCourseShareMessage(shareUrl)
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        setCourseShareMessage('Unable to share preview right now.')
      }
    }
  }

  const renderMarketplace = (element, options = {}) => (
    <MarketplaceFrame
      currentUserRole={currentUserRole}
      authStateReady={authStateReady}
      onLogout={handlePublicLogout}
      onOpenLogin={(mode) => navigate(`/${mode}`)}
      onOpenAbout={() => scrollToHomeSection('about-swayam')}
      onOpenCatalog={() => navigate('/course-list')}
      onOpenHelp={() => scrollToHomeSection('explore-courses')}
      onOpenJobs={() => navigate('/jobs')}
      onOpenLocalChapters={() => scrollToHomeSection('explore-courses')}
      onOpenMyLearnings={() => {
        setStudentTab('My Learnings')
        navigate(currentUserRole === 'student' ? STUDENT_MY_LEARNINGS_PATH : '/login')
      }}
      onOpenMyProfile={() => {
        if (currentUserRole === 'student') {
          setStudentTab('My Profile')
          navigate(buildStudentWorkspacePath('My Profile'))
          return
        }
        navigate('/login')
      }}
      onOpenStudentWorkspace={() => {
        setStudentTab('Roadmap')
        navigate(currentUserRole === 'student' ? STUDENT_WORKSPACE_PATH : '/login')
      }}
      onLogoClick={() => navigate('/')}
      onOpenSubject={(subjectKey = 'computerscience') => navigate(`/subjects/${subjectKey}`)}
      showFooter={options.showFooter ?? true}
      hideFlashBanner={options.hideFlashBanner ?? false}
      centered={options.centered ?? true}
      hideTopbar={options.hideTopbar ?? false}
      previewCourse={previewCourse}
      previewLessonIndex={previewState?.lessonIndex ?? 0}
      onPreviewLessonChange={(lessonIndex) => setPreviewState((current) => ({ ...current, lessonIndex }))}
      onClosePreview={() => setPreviewState(null)}
      onOpenPreviewCourse={(courseId) => {
        const course = allLearnerCourses.find((item) => item.id === courseId)
        if (course) {
          navigate(buildPublicCoursePath(course))
        }
      }}
      isPreviewCourseEnrolled={!!previewCourse && enrolledCourseIds.includes(previewCourse.id)}
      topbarTitle={options.topbarTitle ?? ''}
      topbarTitleOnly={options.topbarTitleOnly ?? false}
      showCourseActions={options.showCourseActions ?? false}
      onLeaveReview={options.onLeaveReview}
      onShareCourse={options.onShareCourse}
      hideFloatingAssistant={options.hideFloatingAssistant ?? false}
      showVideoThemeToggle={options.showVideoThemeToggle ?? false}
      videoThemeMode={options.videoThemeMode ?? 'light'}
      onToggleVideoTheme={options.onToggleVideoTheme}
    >
      {element}
    </MarketplaceFrame>
  )

  return (
    <>
      <Routes>
      <Route
        path="/"
        element={renderMarketplace(
          <PublicHome
            visibleCourses={visibleCourses}
            instructorsById={instructorsById}
            onOpenCourse={openCourse}
            onOpenInstructor={openInstructor}
            onAddCart={addToCart}
            onPreview={openPreview}
            onOpenCatalog={() => navigate('/course-list')}
            onOpenSubject={(subjectKey = 'computerscience') => navigate(`/subjects/${subjectKey}`)}
          />,
          { centered: false },
        )}
      />
      <Route
        path="/course-list"
        element={renderMarketplace(
          <PublicCourseList
            courses={allLearnerCourses}
            enrolledCourseIds={enrolledCourseIds}
            onboardingProfile={studentOnboarding}
            currentUserRole={currentUserRole}
            authStateReady={authStateReady}
            onOpenCourse={openCourse}
            onOpenEnrolledCourse={(courseId) => {
              setSelectedCourseId(courseId)
              setStudentTab('My Learnings')
              const course = allLearnerCourses.find((item) => item.id === courseId)
              navigate(course ? buildStudentCoursePath(course) : STUDENT_MY_LEARNINGS_PATH)
            }}
            onRegister={(redirectTo) => navigateToAuth('signup', redirectTo)}
            onLogin={(redirectTo) => navigateToAuth('login', redirectTo)}
            onEnroll={startEnrollmentFlow}
          />,
          { centered: false, showFooter: false },
        )}
      />
      <Route
        path="/checkout/:courseSlug"
        element={renderMarketplace(
          <CourseCheckoutRoute
            courseCollection={allLearnerCourses}
            currentUserRole={currentUserRole}
            authStateReady={authStateReady}
            enrolledCourseIds={enrolledCourseIds}
            onBack={() => {
              const course = getCourseFromPath()
              navigate(course ? buildPublicCoursePath(course) : '/course-list')
            }}
            onRegister={() => navigateToAuth('signup', location.pathname)}
            onLogin={() => navigateToAuth('login', location.pathname)}
            onConfirmPayment={enrollInCourse}
            onOpenEnrolledCourse={(courseId) => {
              setSelectedCourseId(courseId)
              setStudentTab('My Learnings')
              const course = allLearnerCourses.find((item) => item.id === courseId)
              navigate(course ? buildStudentCoursePath(course) : STUDENT_MY_LEARNINGS_PATH)
            }}
          />,
          {
            centered: false,
            showFooter: false,
            hideTopbar: true,
            hideFloatingAssistant: true,
          },
        )}
      />
      <Route
        path="/jobs"
        element={renderMarketplace(
          <PublicJobsView
            currentUserRole={currentUserRole}
            authStateReady={authStateReady}
            onLogin={() => navigate('/login', { state: { redirectTo: '/jobs', requiredRole: 'student' } })}
            onRegister={() => navigate('/signup', { state: { redirectTo: '/jobs', requiredRole: 'student' } })}
          />,
          { centered: false, showFooter: false },
        )}
      />
      <Route
        path="/course/:courseSlug"
        element={renderMarketplace(
          <CourseRoute
            courseCollection={allLearnerCourses}
            instructorsById={instructorsById}
            currentUserRole={currentUserRole}
            authStateReady={authStateReady}
            enrolledCourseIds={enrolledCourseIds}
            onOpenInstructor={openInstructor}
            onPreview={openPreview}
            onOpenEnrolledCourse={(courseId) => {
              setSelectedCourseId(courseId)
              setStudentTab('My Learnings')
              const course = allLearnerCourses.find((item) => item.id === courseId)
              navigate(course ? buildStudentCoursePath(course) : STUDENT_MY_LEARNINGS_PATH)
            }}
            onRegisterToEnroll={(redirectTo) => navigateToAuth('signup', redirectTo)}
            onLoginToEnroll={(redirectTo) => navigateToAuth('login', redirectTo)}
            onEnroll={startEnrollmentFlow}
          />,
          {
            centered: false,
            showFooter: false,
            topbarTitleOnly: true,
            topbarTitle: findCourseBySlug(allLearnerCourses, location.pathname.split('/').pop())?.title ?? 'Course',
            showCourseActions: true,
            onLeaveReview: () => {
              const course = getCourseFromPath()
              if (course) setActiveCourseFeedback({ courseId: course.id, courseTitle: course.title })
            },
            onShareCourse: () => void handleCourseShare(),
          },
        )}
      />
      <Route
        path="/student/course/:courseSlug"
        element={
          !authStateReady
            ? renderMarketplace(<SessionRefreshScreen />, { showFooter: false, centered: false, hideTopbar: true })
            : studentOnboardingPending
            ? renderMarketplace(<SessionRefreshScreen />, { showFooter: false, centered: false, hideTopbar: true })
            : shouldGateStudentOnboarding
            ? <Navigate to={STUDENT_ONBOARDING_PATH} replace />
            : currentUserRole === 'student'
            ? renderMarketplace(
              <StudentCourseRoute
                courseCollection={allLearnerCourses}
                enrolledCourseIds={enrolledCourseIds}
                onVideoViewChange={setIsStudentVideoView}
                onLogout={handlePublicLogout}
                onTitleChange={setCourseViewTitle}
                videoThemeMode={videoThemeMode}
              />,
              {
                showFooter: false,
                hideFlashBanner: true,
                centered: false,
                topbarTitleOnly: true,
                topbarTitle: courseViewTitle || 'Course',
                hideFloatingAssistant: true,
                showCourseActions: true,
                onLeaveReview: () => {
                  const course = getCourseFromPath()
                  if (course) setActiveCourseFeedback({ courseId: course.id, courseTitle: course.title })
                },
                onShareCourse: () => void handleCourseShare(),
                showVideoThemeToggle: true,
                videoThemeMode,
                onToggleVideoTheme: () => {
                  setVideoThemeMode((currentMode) => (currentMode === 'dark' ? 'light' : 'dark'))
                },
              },
            )
            : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/instructor/:instructorId"
        element={renderMarketplace(
          <InstructorRoute
            onOpenCourse={openCourse}
            onOpenInstructor={openInstructor}
            onAddCart={addToCart}
            onPreview={openPreview}
          />,
          { showFooter: false },
        )}
      />
      <Route
        path="/cart"
        element={renderMarketplace(
          <PublicCartView
            cartCourses={cartCourses}
            instructorsById={instructorsById}
            onRemoveCart={removeFromCart}
            onStartLearning={() => navigate(currentUserRole === 'student' ? STUDENT_MY_LEARNINGS_PATH : '/login')}
          />,
          { showFooter: false },
        )}
      />
      <Route
        path="/subjects/:subject/:videoIndex"
        element={renderMarketplace(
          <SubjectDetailRoute
            onSubjectNavigate={handleSubjectRouteNavigate}
            onVideoNavigate={handleSubjectVideoOpen}
            videoThemeMode={videoThemeMode}
          />,
          {
            centered: false,
            showFooter: false,
            hideFlashBanner: true,
            hideFloatingAssistant: true,
            showVideoThemeToggle: true,
            videoThemeMode,
            onToggleVideoTheme: () => {
              setVideoThemeMode((currentMode) => (currentMode === 'dark' ? 'light' : 'dark'))
            },
          },
        )}
      />
      <Route path="/subjects/:subject" element={<SubjectRouteRedirect />} />
      <Route
        path="/student/subjects/:subject/:subcategory/:videoIndex"
        element={
          !authStateReady
            ? renderMarketplace(<SessionRefreshScreen />, { showFooter: false, centered: false })
            : studentOnboardingPending
            ? renderMarketplace(<SessionRefreshScreen />, { showFooter: false, centered: false })
            : shouldGateStudentOnboarding
            ? <Navigate to={STUDENT_ONBOARDING_PATH} replace />
            : currentUserRole === 'student'
            ? renderMarketplace(
              <SubjectDetailRoute
                onSubjectNavigate={handleStudentSubjectRouteNavigate}
                onVideoNavigate={handleSubjectVideoOpen}
                videoThemeMode={videoThemeMode}
              />,
              {
                centered: false,
                showFooter: false,
                hideFlashBanner: true,
                hideFloatingAssistant: true,
                showVideoThemeToggle: true,
                videoThemeMode,
                onToggleVideoTheme: () => {
                  setVideoThemeMode((currentMode) => (currentMode === 'dark' ? 'light' : 'dark'))
                },
              },
            )
            : <Navigate to="/signup" replace state={{ redirectTo: location.pathname, requiredRole: 'student' }} />
        }
      />
      <Route
        path="/student/subjects/:subject"
        element={<Navigate to={`/student/subjects/${location.pathname.split('/').pop() ?? 'computerscience'}/programming/1`} replace />}
      />
      <Route
        path="/student/onboarding"
        element={
          !authStateReady || (currentUserRole === 'student' && !studentOnboardingReady)
            ? <SessionRefreshScreen />
            : currentUserRole !== 'student'
            ? <Navigate to="/login" replace />
            : studentOnboardingComplete
            ? <Navigate to={buildStudentWorkspacePath('Roadmap')} replace />
            : <StudentOnboarding onComplete={completeStudentOnboarding} />
        }
      />
      <Route
        path="/login"
        element={
          currentUserRole
            ? <Navigate to={resolvePostAuthPath(currentUserRole)} replace />
            : renderMarketplace(
              <AuthScreen
                mode="login"
                onModeChange={(mode) => navigate(`/${mode}`)}
                onBackHome={() => navigate('/')}
                onAuthenticate={handlePublicAuthenticate}
                errorMessage={authError}
                isBusy={authBusy}
                isReady={authStateReady}
              />,
              {
                showFooter: true,
                centered: false,
                hideFloatingAssistant: true,
              },
            )
        }
      />
      <Route
        path="/signup"
        element={
          currentUserRole
            ? <Navigate to={resolvePostAuthPath(currentUserRole)} replace />
            : renderMarketplace(
              <AuthScreen
                mode="signup"
                onModeChange={(mode) => navigate(`/${mode}`)}
                onBackHome={() => navigate('/')}
                onAuthenticate={handlePublicAuthenticate}
                errorMessage={authError}
                isBusy={authBusy}
                isReady={authStateReady}
              />,
              {
                showFooter: true,
                centered: false,
                hideFloatingAssistant: true,
              },
            )
        }
      />
      <Route path="/student" element={<Navigate to={STUDENT_WORKSPACE_PATH} replace />} />
      <Route
        path="/student/my-learnings"
        element={
          !authStateReady
            ? renderMarketplace(<SessionRefreshScreen />, { showFooter: false, centered: false })
            : studentOnboardingPending
            ? renderMarketplace(<SessionRefreshScreen />, { showFooter: false, centered: false })
            : shouldGateStudentOnboarding
            ? <Navigate to={STUDENT_ONBOARDING_PATH} replace />
            : currentUserRole === 'student'
            ? renderMarketplace(
              <StudentView
                activeTab="My Learnings"
                selectedCourse={selectedCourse}
                currentUserUid={currentUserUid}
                courses={allLearnerCourses}
                enrolledCourseIds={enrolledCourseIds}
                enrolledVideoIds={enrolledVideoIds}
                onboardingProfile={studentOnboarding}
                onVideoViewChange={setIsStudentVideoView}
                onOpenCourseView={(course) => navigate(buildStudentCoursePath(course))}
                onOpenVideoView={(course) => navigate(`/student/subjects/${course.subjectKey}/${course.subcategoryKey}/${course.videoIndex + 1}`)}
                onExploreCourses={() => navigate('/course-list')}
                onResetRoadmap={resetStudentRoadmap}
              />,
              {
                showFooter: true,
                centered: true,
                hideFlashBanner: false,
                hideTopbar: false,
                hideFloatingAssistant: false,
              },
            )
            : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/student/student-workspace"
        element={
          !authStateReady
            ? renderMarketplace(<SessionRefreshScreen />, { showFooter: false, centered: false })
            : studentOnboardingPending
            ? renderMarketplace(<SessionRefreshScreen />, { showFooter: false, centered: false })
            : shouldGateStudentOnboarding
            ? <Navigate to={STUDENT_ONBOARDING_PATH} replace />
            : currentUserRole === 'student'
            ? <StudentWorkspaceRoute
                studentTab={studentTab}
                onTabChange={(nextTab, shouldNavigate = false) => {
                  setStudentTab(nextTab)
                  if (shouldNavigate) {
                    navigate(buildStudentWorkspacePath(nextTab))
                  }
                }}
                renderMarketplace={renderMarketplace}
                selectedCourse={selectedCourse}
                currentUserUid={currentUserUid}
                courses={allLearnerCourses}
                enrolledCourseIds={enrolledCourseIds}
                enrolledVideoIds={enrolledVideoIds}
                onboardingProfile={studentOnboarding}
                onVideoViewChange={setIsStudentVideoView}
                onOpenCourseView={(course) => navigate(buildStudentCoursePath(course))}
                onOpenVideoView={(course) => navigate(`/student/subjects/${course.subjectKey}/${course.subcategoryKey}/${course.videoIndex + 1}`)}
                onExploreCourses={() => navigate('/course-list')}
                onResetRoadmap={resetStudentRoadmap}
                isStudentVideoView={isStudentVideoView}
              />
            : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/student/student-workspace/:workspaceTab"
        element={
          !authStateReady
            ? renderMarketplace(<SessionRefreshScreen />, { showFooter: false, centered: false })
            : studentOnboardingPending
            ? renderMarketplace(<SessionRefreshScreen />, { showFooter: false, centered: false })
            : shouldGateStudentOnboarding
            ? <Navigate to={STUDENT_ONBOARDING_PATH} replace />
            : currentUserRole === 'student'
            ? <StudentWorkspaceRoute
                studentTab={studentTab}
                onTabChange={(nextTab, shouldNavigate = false) => {
                  setStudentTab(nextTab)
                  if (shouldNavigate) {
                    navigate(buildStudentWorkspacePath(nextTab))
                  }
                }}
                renderMarketplace={renderMarketplace}
                selectedCourse={selectedCourse}
                currentUserUid={currentUserUid}
                courses={allLearnerCourses}
                enrolledCourseIds={enrolledCourseIds}
                enrolledVideoIds={enrolledVideoIds}
                onboardingProfile={studentOnboarding}
                onVideoViewChange={setIsStudentVideoView}
                onOpenCourseView={(course) => navigate(buildStudentCoursePath(course))}
                onOpenVideoView={(course) => navigate(`/student/subjects/${course.subjectKey}/${course.subcategoryKey}/${course.videoIndex + 1}`)}
                onExploreCourses={() => navigate('/course-list')}
                onResetRoadmap={resetStudentRoadmap}
                isStudentVideoView={isStudentVideoView}
              />
            : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/instructor-dashboard"
        element={
          !authStateReady
            ? renderMarketplace(<SessionRefreshScreen />, { showFooter: false, centered: false })
            : currentUserRole === 'instructor'
            ? renderMarketplace(
              <RoleWorkspaceLayout
                title="Instructor workspace"
                menu={workspaceMenu.instructor}
                activeTab={instructorTab}
                onTabChange={setInstructorTab}
                fullWidth
              >
                <InstructorView activeTab={instructorTab} />
              </RoleWorkspaceLayout>,
              { showFooter: false, centered: false },
            )
            : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/url-admin"
        element={
          adminAuthenticated
            ? <Navigate to="/url-admin/dashboard" replace />
            : <LoginPage onLogin={handleAdminLogin} />
        }
      />
      <Route element={<AdminProtectedLayout authenticated={adminAuthenticated} onLogout={handleAdminLogout} />}>
        <Route path="/url-admin/dashboard" element={<DashboardPage />} />
        <Route path="/url-admin/courses" element={<CoursesPage />} />
        <Route path="/url-admin/courses/:courseId" element={<CourseViewerPage />} />
        <Route path="/url-admin/students" element={<StudentsPage />} />
        <Route path="/url-admin/analytics" element={<AnalyticsPage />} />
        <Route path="/url-admin/settings" element={<SettingsPage />} />
      </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {activeCourseFeedback ? (
        <CourseFeedbackDialog
          open
          courseId={activeCourseFeedback.courseId}
          courseTitle={activeCourseFeedback.courseTitle}
          onClose={() => setActiveCourseFeedback(null)}
        />
      ) : null}
      {courseShareMessage ? (
        <div style={{ position: 'fixed', top: 92, right: 20, zIndex: 80, padding: '0.6rem 0.9rem', borderRadius: '999px', background: '#ecfdf5', color: '#047857', fontWeight: 700, boxShadow: '0 10px 24px rgba(15, 23, 42, 0.12)' }}>
          {courseShareMessage}
        </div>
      ) : null}
    </>
  )
}

export default App
