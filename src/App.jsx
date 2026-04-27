import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import AuthScreen from './components/auth/AuthScreen'
import Footer from './components/layout/Footer'
import FloatingAssistant from './components/layout/FloatingAssistant'
import Topbar from './components/layout/Topbar'
import PreviewModal from './components/modals/PreviewModal'
import CourseFeedbackDialog from './components/public/CourseFeedbackDialog'
import PublicCartView from './components/public/PublicCartView'
import PublicCourseList from './components/public/PublicCourseList'
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
const HEARTBEAT_INTERVAL_MS = 60 * 1000
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

function roleHomePath(role) {
  if (role === 'student') return '/student'
  if (role === 'instructor') return '/instructor-dashboard'
  return '/'
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
          onOpenHelp={onOpenHelp}
          onOpenJobs={onOpenJobs}
          onOpenLocalChapters={onOpenLocalChapters}
          onOpenMyLearnings={onOpenMyLearnings}
          onOpenMyProfile={onOpenMyProfile}
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

function StudentCourseRoute({ courseCollection, enrolledCourseIds, onVideoViewChange, onLogout, onTitleChange }) {
  const navigate = useNavigate()
  const { courseSlug } = useParams()
  const course = findCourseBySlug(courseCollection, courseSlug ?? '')

  useEffect(() => {
    onVideoViewChange?.(true)
    return () => onVideoViewChange?.(false)
  }, [onVideoViewChange])

  if (!course || !enrolledCourseIds.includes(course.id)) {
    return <Navigate to="/student" replace />
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
      onOpenProfileHome={() => navigate('/student')}
      onLogout={onLogout}
      currentUserRole="student"
      onTitleChange={onTitleChange}
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

function SubjectDetailRoute({ onSubjectNavigate, onVideoNavigate }) {
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
    />
  )
}

function SubjectRouteRedirect() {
  const { subject } = useParams()
  return <Navigate to={`/subjects/${subject ?? 'computerscience'}/1`} replace />
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
  const [studentTab, setStudentTab] = useState('My Learnings')
  const [instructorTab, setInstructorTab] = useState(workspaceMenu.instructor[0])
  const [previewState, setPreviewState] = useState(null)
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id ?? null)
  const [currentUserRole, setCurrentUserRole] = useState(null)
  const [currentUserUid, setCurrentUserUid] = useState(null)
  const [authStateReady, setAuthStateReady] = useState(false)
  const [authBusy, setAuthBusy] = useState(false)
  const [authError, setAuthError] = useState('')
  const [isStudentVideoView, setIsStudentVideoView] = useState(false)
  const [courseViewTitle, setCourseViewTitle] = useState('')
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
    () => [...courses, ...publicCatalogCourses.filter((course) => !courses.some((item) => item.id === course.id))],
    [],
  )

  const selectedCourse = useMemo(
    () => allLearnerCourses.find((course) => course.id === selectedCourseId) ?? allLearnerCourses[0],
    [allLearnerCourses, selectedCourseId],
  )

  const previewCourse = useMemo(
    () => courses.find((course) => course.id === previewState?.courseId)
      ?? publicCatalogCourses.find((course) => course.id === previewState?.courseId)
      ?? null,
    [previewState],
  )

  const cartCourses = useMemo(
    () => cartCourseIds.map((id) => courses.find((course) => course.id === id)).filter(Boolean),
    [cartCourseIds],
  )

  useEffect(() => {
    let active = true

    const loadSession = async () => {
      try {
        await warmSessionApi()
        const session = await getCurrentSession()
        if (!active) return

        if (session.authenticated && session.user) {
          setCurrentUserUid(session.user.uid)
          setCurrentUserRole(session.user.role)
        } else {
          setCurrentUserUid(null)
          setCurrentUserRole(null)
          setEnrolledCourseIds([])
          setEnrolledVideoIds([])
        }
      } catch {
        if (!active) return
        setCurrentUserUid(null)
        setCurrentUserRole(null)
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
  }, [])

  useEffect(() => {
    if (!location.pathname.startsWith('/student')) {
      setIsStudentVideoView(false)
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
    const redirectTo = location.state?.redirectTo
    const requiredRole = location.state?.requiredRole
    if (redirectTo && (!requiredRole || requiredRole === role)) {
      return redirectTo
    }
    return roleHomePath(role)
  }

  const enrollInCourse = (courseId) => {
    setEnrolledCourseIds((currentIds) => (currentIds.includes(courseId) ? currentIds : [...currentIds, courseId]))
    setSelectedCourseId(courseId)
    setStudentTab('My Learnings')
    const course = allLearnerCourses.find((item) => item.id === courseId)
    navigate(course ? buildStudentCoursePath(course) : '/student')
  }

  const handlePublicLogout = async () => {
    try {
      await logoutUser()
    } catch {
      // Ignore logout cleanup errors and continue routing out.
    }

    setCurrentUserUid(null)
    setCurrentUserRole(null)
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
        sessionResponse = await signInWithGoogle(role)
      } else if (mode === 'signup') {
        sessionResponse = await signUpWithEmail(email, password, role)
      } else {
        sessionResponse = await signInWithEmail(email, password, role)
      }

      const nextUser = sessionResponse?.user
      if (!nextUser?.uid || !nextUser?.role) {
        throw new Error('Secure session could not be created.')
      }

      lastHeartbeatAtRef.current = Date.now()
      setCurrentUserUid(nextUser.uid)
      setCurrentUserRole(nextUser.role)
      navigate(resolvePostAuthPath(nextUser.role), { replace: true })
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

  const handleEnrollVideo = (videoEnrollmentId) => {
    const nextParts = String(videoEnrollmentId).split(':')
    const nextYoutubeId = nextParts.length >= 4 ? nextParts.slice(3).join(':') : nextParts[2]
    setEnrolledVideoIds((currentIds) => (
      currentIds.some((currentId) => {
        const currentParts = String(currentId).split(':')
        const currentYoutubeId = currentParts.length >= 4 ? currentParts.slice(3).join(':') : currentParts[2]
        return currentParts[0] === nextParts[0]
          && currentParts[1] === nextParts[1]
          && currentYoutubeId === nextYoutubeId
      }) ? currentIds : [...currentIds, videoEnrollmentId]
    ))
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
        navigate(currentUserRole === 'student' ? '/student' : '/login')
      }}
      onOpenMyProfile={() => {
        if (currentUserRole === 'student') {
          setStudentTab('My Profile')
          navigate('/student')
          return
        }
        navigate('/login')
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
            currentUserRole={currentUserRole}
            enrolledVideoIds={enrolledVideoIds}
            onRegisterVideo={(redirectTo) => navigateToAuth('signup', redirectTo)}
            onEnrollVideo={handleEnrollVideo}
            onOpenSubjectVideo={handleSubjectVideoOpen}
          />,
          { centered: false, showFooter: false },
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
              navigate(course ? buildStudentCoursePath(course) : '/student')
            }}
            onRegisterToEnroll={(redirectTo) => navigateToAuth('signup', redirectTo)}
            onLoginToEnroll={(redirectTo) => navigateToAuth('login', redirectTo)}
            onEnroll={enrollInCourse}
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
            : currentUserRole === 'student'
            ? renderMarketplace(
              <StudentCourseRoute
                courseCollection={allLearnerCourses}
                enrolledCourseIds={enrolledCourseIds}
                onVideoViewChange={setIsStudentVideoView}
                onLogout={handlePublicLogout}
                onTitleChange={setCourseViewTitle}
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
            onStartLearning={() => navigate(currentUserRole === 'student' ? '/student' : '/login')}
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
          />,
          { centered: false, showFooter: false, hideFlashBanner: true, hideFloatingAssistant: true },
        )}
      />
      <Route path="/subjects/:subject" element={<SubjectRouteRedirect />} />
      <Route
        path="/student/subjects/:subject/:subcategory/:videoIndex"
        element={
          !authStateReady
            ? renderMarketplace(<SessionRefreshScreen />, { showFooter: false, centered: false })
            : currentUserRole === 'student'
            ? renderMarketplace(
              <SubjectDetailRoute
                onSubjectNavigate={handleStudentSubjectRouteNavigate}
                onVideoNavigate={handleSubjectVideoOpen}
              />,
              { centered: false, showFooter: false, hideFlashBanner: true, hideFloatingAssistant: true },
            )
            : <Navigate to="/signup" replace state={{ redirectTo: location.pathname, requiredRole: 'student' }} />
        }
      />
      <Route
        path="/student/subjects/:subject"
        element={<Navigate to={`/student/subjects/${location.pathname.split('/').pop() ?? 'computerscience'}/programming/1`} replace />}
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
      <Route
        path="/student"
        element={
          !authStateReady
            ? renderMarketplace(<SessionRefreshScreen />, { showFooter: false, centered: false })
            : currentUserRole === 'student'
            ? renderMarketplace(
            <RoleWorkspaceLayout
                title="Student workspace"
                menu={workspaceMenu.student}
                activeTab={studentTab}
                onTabChange={setStudentTab}
                fullWidth
                singleView={false}
              >
                <StudentView
                  activeTab={studentTab}
                  selectedCourse={selectedCourse}
                  currentUserUid={currentUserUid}
                  courses={allLearnerCourses}
                  enrolledCourseIds={enrolledCourseIds}
                  enrolledVideoIds={enrolledVideoIds}
                  onVideoViewChange={setIsStudentVideoView}
                  onOpenCourseView={(course) => navigate(buildStudentCoursePath(course))}
                  onOpenVideoView={(course) => navigate(`/student/subjects/${course.subjectKey}/${course.subcategoryKey}/${course.videoIndex + 1}`)}
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
