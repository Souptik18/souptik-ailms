import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Topbar.module.css'
import uilsLogo from '../../utils/pic.png'

function Topbar({
  isAdminRoute,
  currentUserRole,
  authStateReady,
  onLogout,
  onOpenLogin,
  onOpenAbout,
  onOpenHelp,
  onOpenMyLearnings,
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
  const accountMenuRef = useRef(null)

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
  const alertMessage = 'Call us: +91 92373 96048'
  const openKiitExtensionSchoolSite = () => {
    if (typeof window !== 'undefined') {
      window.open('https://kiitx.kiit.ac.in', '_blank', 'noopener,noreferrer')
    }
  }
  const openSwayamSite = () => {
    if (typeof window !== 'undefined') {
      window.open('https://swayam.gov.in', '_blank', 'noopener,noreferrer')
    }
  }
  const primaryLinks = [
    { label: 'About KIITX', action: onOpenAbout },
    { label: 'All Courses', action: onOpenCatalog },
    { label: 'FAQ', action: onOpenHelp },
    { label: 'Kiit Extension School', action: openKiitExtensionSchoolSite },
    { label: 'Swayam', action: openSwayamSite },
  ]

  return (
    <header className={styles.topbar}>
      {!isAdminRoute && (
        <>
          {showAnnouncement && !hideFlashBanner && (
            <div className={styles.utilityBar}>
              <div className={styles.utilityInner}>
                <div className={styles.alertTicker} aria-label={alertMessage}>
                  <div className={styles.alertTrack}>
                    <span className={styles.alertMessage}>{alertMessage}</span>
                    <span className={styles.alertMessage} aria-hidden="true">{alertMessage}</span>
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
                <img src={uilsLogo} alt="KIITX logo" />
              </Link>
              {titleOnly ? (
                <h1 className={styles.navTitle}>{titleText}</h1>
              ) : null}
            </div>
            {titleOnly ? (
              <div className={`${styles.marketNavCenter} ${styles.titleCenter}`} aria-hidden="true" />
            ) : (
              <nav className={`${styles.primaryNav} ${styles.topLineNav} ${styles.marketNavCenter}`} aria-label="Primary">
                {primaryLinks.map((item) => (
                  <button key={item.label} type="button" onClick={item.action}>
                    {item.label}
                  </button>
                ))}
              </nav>
            )}
            <div className={styles.marketNavRight}>
              {!authStateReady ? (
                <span className={styles.authPlaceholder} aria-hidden="true" />
              ) : currentUserRole ? (
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
                        {currentUserRole === 'student' ? (
                          <button
                            className={styles.accountAction}
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setAccountMenuOpen(false)
                              onOpenMyLearnings()
                            }}
                          >
                            My Learnings
                          </button>
                        ) : null}
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
                  <button className={`btn-outline ${styles.navBtn}`} type="button" onClick={() => onOpenLogin('login')}>Log in</button>
                  <button className={`btn-primary ${styles.navBtn}`} type="button" onClick={() => onOpenLogin('signup')}>Sign up</button>
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
