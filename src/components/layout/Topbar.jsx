import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Topbar.module.css'

function Topbar({
  isAdminRoute,
  currentUserRole,
  authStateReady,
  onLogout,
  onOpenLogin,
  onOpenHelp,
  onOpenJobs,
  onOpenMyLearnings,
  onOpenMyProfile,
  onOpenCatalog,
  adminLoggedIn,
  onBackToMarketplace,
  hideFlashBanner = false,
  titleOnly = false,
  titleText = '',
  showCourseActions = false,
  onLeaveReview,
  onShareCourse,
}) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [showAnnouncement, setShowAnnouncement] = useState(true)
  const topbarRef = useRef(null)
  const accountMenuRef = useRef(null)

  useEffect(() => {
    if (typeof document === 'undefined' || !topbarRef.current) return undefined

    const updateTopbarHeight = () => {
      const nextHeight = Math.ceil(topbarRef.current?.getBoundingClientRect().height ?? 0)
      document.documentElement.style.setProperty('--topbar-height', `${nextHeight}px`)
    }

    updateTopbarHeight()
    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateTopbarHeight)
    resizeObserver?.observe(topbarRef.current)
    window.addEventListener('resize', updateTopbarHeight)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', updateTopbarHeight)
      document.documentElement.style.removeProperty('--topbar-height')
    }
  }, [])

  useEffect(() => {
    if (!accountMenuOpen) return undefined

    const handleOutsideClick = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountMenuOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setAccountMenuOpen(false)
      }
    }

    window.addEventListener('mousedown', handleOutsideClick)
    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [accountMenuOpen])

  const accountInitial = currentUserRole ? currentUserRole.charAt(0).toUpperCase() : 'U'
  const alertMessage = 'New guided programs are open for enrollment'
  const openOpenLearningSite = () => {
    if (typeof window !== 'undefined') {
      window.open('https://swayam.gov.in', '_blank', 'noopener,noreferrer')
    }
  }
  const primaryLinks = [
    { label: 'All Courses', action: onOpenCatalog },
    { label: 'Jobs', action: onOpenJobs },
    { label: 'FAQ', action: onOpenHelp },
    { label: 'Open Learning', action: openOpenLearningSite },
  ]

  return (
    <header className={styles.topbar} ref={topbarRef}>
      {!isAdminRoute && (
        <>
          {showAnnouncement && !hideFlashBanner && (
            <div className={styles.utilityBar}>
              <div className={styles.utilityInner}>
                <div className={styles.alertTicker} aria-label={alertMessage}>
                  <div className={styles.alertTrack}>
                    <span className={styles.alertMessage}>{alertMessage}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.flashClose}
                  aria-label="Close announcements"
                  onClick={() => setShowAnnouncement(false)}
                >
                  x
                </button>
              </div>
            </div>
          )}
          <div className={styles.marketNav}>
            <div className={styles.marketNavLeft}>
              <Link className={styles.logo} to="/" aria-label="Go to homepage" title="Go to homepage">
                <span className={styles.logoGlyph}>OC</span>
                <span className={styles.logoText}>OpenCourse</span>
              </Link>
              {titleOnly ? (
                <h1 className={styles.navTitle}>{titleText}</h1>
              ) : null}
            </div>
            {titleOnly ? (
              <div className={`${styles.marketNavCenter} ${styles.titleCenter}`} aria-hidden="true" />
            ) : (
              <div className={`${styles.marketNavCenter} ${styles.titleCenter}`} aria-hidden="true" />
            )}
            <div className={styles.marketNavRight}>
              {!titleOnly ? (
                <nav className={`${styles.primaryNav} ${styles.topLineNav}`} aria-label="Primary">
                  {primaryLinks.map((item) => (
                    <button key={item.label} type="button" onClick={item.action}>
                      {item.label}
                    </button>
                  ))}
                </nav>
              ) : null}
              {authStateReady && currentUserRole ? (
                <>
                  {showCourseActions ? (
                    <>
                      <button className={styles.courseActionButton} type="button" onClick={onLeaveReview}>
                        Leave a Review
                      </button>
                      <button className={styles.courseActionButtonPrimary} type="button" onClick={onShareCourse}>
                        Share Preview
                      </button>
                    </>
                  ) : null}
                  {currentUserRole === 'student' ? (
                    <button className={styles.learningLink} type="button" onClick={onOpenMyLearnings}>
                      My Learnings
                    </button>
                  ) : null}
                  <div className={styles.accountWrap} ref={accountMenuRef}>
                    <button
                      className={styles.avatarButton}
                      type="button"
                      aria-haspopup="menu"
                      aria-expanded={accountMenuOpen}
                      aria-label="Account menu"
                      onClick={() => setAccountMenuOpen((prevOpen) => !prevOpen)}
                      title="Open account menu"
                    >
                      {accountInitial}
                    </button>

                    {accountMenuOpen && (
                      <div className={styles.accountMenu} role="menu">
                        <p className={styles.accountMeta}>Signed in as {currentUserRole}</p>
                        <button
                          className={styles.accountAction}
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setAccountMenuOpen(false)
                            onOpenMyProfile?.()
                          }}
                        >
                          My Profile
                        </button>
                        <button
                          className={styles.accountAction}
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setAccountMenuOpen(false)
                            onLogout()
                          }}
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {showCourseActions ? (
                    <>
                      <button className={styles.courseActionButton} type="button" onClick={onLeaveReview}>
                        Leave a Review
                      </button>
                      <button className={styles.courseActionButtonPrimary} type="button" onClick={onShareCourse}>
                        Share Preview
                      </button>
                    </>
                  ) : null}
                  <button
                    className={`btn-outline ${styles.navBtn}`}
                    type="button"
                    onClick={() => onOpenLogin('login')}
                    disabled={!authStateReady}
                  >
                    Log in
                  </button>
                  <button
                    className={`btn-primary ${styles.navBtn}`}
                    type="button"
                    onClick={() => onOpenLogin('signup')}
                    disabled={!authStateReady}
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {isAdminRoute && (
        <div className={styles.adminBanner}>
          <div>
            <p>KIITX Admin Console</p>
            <span>Accessible only with `url-admin` route</span>
          </div>
          <div className={styles.adminBannerActions}>
            {adminLoggedIn && <button className="btn-outline" type="button" onClick={onLogout}>Logout (admin)</button>}
            <button className="btn-outline" type="button" onClick={onBackToMarketplace}>Back To Marketplace</button>
          </div>
        </div>
      )}

    </header>
  )
}

export default Topbar
