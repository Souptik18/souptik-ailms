import { useMemo, useState } from 'react'
import styles from './AuthScreen.module.css'

const portalHighlights = ['Video lessons', 'Practice tracks', 'Instructor sessions']

const credentialNotes = [
  'Email + Google',
  'Student + Instructor',
  'Quick access',
]

function LoadingScreen() {
  return (
    <main className={styles.page}>
      <section className={styles.loadingShell} aria-label="Preparing secure sign-in">
        <div className={styles.loadingBackdrop} />
        <div className={styles.loadingPanel}>
          <span className={styles.loadingBadge}>Preparing secure access</span>
          <div className={styles.loadingOrbit}>
            <span />
            <span />
            <span />
          </div>
          <h1>Warming up your workspace session.</h1>
          <p>Checking secure session state, aligning learner routes, and preparing the sign-in flow.</p>
          <div className={styles.skeletonGrid}>
            <div className={styles.skeletonBlockLarge} />
            <div className={styles.skeletonBlock} />
            <div className={styles.skeletonBlock} />
            <div className={styles.skeletonBlock} />
          </div>
        </div>
      </section>
    </main>
  )
}

function AuthScreen({
  mode,
  onModeChange,
  onBackHome,
  onAuthenticate,
  errorMessage,
  isBusy,
  isReady,
}) {
  const [role, setRole] = useState('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const screenCopy = useMemo(() => {
    if (mode === 'signup') {
      return {
        kicker: 'Get started',
        title: 'Create a KIITX access identity.',
        subtitle: 'Enter once and move into the right workspace immediately.',
        buttonText: `Create ${role} access`,
        googleText: 'Create access with Google',
        asideTitle: 'One clean place to join KIITX.',
      }
    }

    return {
      kicker: 'Welcome back',
      title: 'Sign in and continue instantly.',
      subtitle: 'Pick your role and continue where you left off.',
      buttonText: `Continue as ${role}`,
      googleText: 'Continue with Google',
      asideTitle: 'Fast login with a clean light interface.',
    }
  }, [mode, role])

  const handleEmailSubmit = (event) => {
    event.preventDefault()
    onAuthenticate({
      role,
      method: 'email',
      mode,
      email: email.trim(),
      password,
    })
  }

  const handleGoogleAuth = () => {
    onAuthenticate({
      role,
      method: 'google',
      mode,
    })
  }

  if (!isReady) {
    return <LoadingScreen />
  }

  return (
    <main className={styles.page}>
      <section className={styles.authShell}>
        <aside className={styles.storyPanel}>
          <div className={styles.storyGlow} />
          <div className={styles.storyTopline}>
            <span className={styles.storyBadge}>{screenCopy.kicker}</span>
            <button className={styles.backButton} type="button" onClick={onBackHome}>
              Back home
            </button>
          </div>

          <div className={styles.storyContent}>
            <ul className={styles.visualGrid}>
              {portalHighlights.map((item) => (
                <li key={item}>
                  <span />
                  <p>{item}</p>
                </li>
              ))}
            </ul>
            <div className={styles.storyText}>
              <p className={styles.brandLine}>KIITX Secure Portal</p>
              <h2>{screenCopy.asideTitle}</h2>
              <p className={styles.storyBody}>
                Keep it simple and start learning fast.
              </p>
              <div className={styles.storyMeta}>
                <span>Live classes</span>
                <span>Hands-on tracks</span>
              </div>
            </div>
          </div>
        </aside>

        <section className={styles.formPanel}>
          <div className={styles.formPrimary}>
            <div className={styles.formHeader}>
              <button className={styles.brand} type="button" onClick={onBackHome}>KIITX</button>
              <div className={styles.modeSwitch}>
                <button
                  type="button"
                  className={mode === 'login' ? styles.modeActive : ''}
                  onClick={() => onModeChange('login')}
                  disabled={isBusy}
                >
                  Log in
                </button>
                <button
                  type="button"
                  className={mode === 'signup' ? styles.modeActive : ''}
                  onClick={() => onModeChange('signup')}
                  disabled={isBusy}
                >
                  Sign up
                </button>
              </div>
            </div>

            <div className={styles.heroCopy}>
              <span className={styles.heroEyebrow}>{screenCopy.kicker}</span>
              <h1>{screenCopy.title}</h1>
              <p>{screenCopy.subtitle}</p>
            </div>

            <div className={styles.roleToggle}>
              <button
                type="button"
                className={role === 'student' ? styles.roleActive : ''}
                onClick={() => setRole('student')}
                disabled={isBusy}
              >
                <span>Student</span>
                <small>Courses and progress</small>
              </button>
              <button
                type="button"
                className={role === 'instructor' ? styles.roleActive : ''}
                onClick={() => setRole('instructor')}
                disabled={isBusy}
              >
                <span>Instructor</span>
                <small>Delivery and control</small>
              </button>
            </div>

            <form className={styles.form} onSubmit={handleEmailSubmit}>
              <label className={styles.field}>
                <span>Email address</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@kiit.ac.in"
                  aria-label="Email address"
                  autoComplete="email"
                  required
                  disabled={isBusy}
                />
              </label>

              <label className={styles.field}>
                <span>{mode === 'signup' ? 'Create password' : 'Password'}</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={mode === 'signup' ? 'Minimum 6 characters' : 'Enter your password'}
                  aria-label="Password"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  minLength={6}
                  required
                  disabled={isBusy}
                />
              </label>

              <button className={styles.submitBtn} type="submit" disabled={isBusy}>
                {isBusy ? (
                  <span className={styles.buttonLoader}>
                    <span />
                    Securing access...
                  </span>
                ) : (
                  screenCopy.buttonText
                )}
              </button>
            </form>

            <button className={styles.googleBtn} type="button" onClick={handleGoogleAuth} disabled={isBusy}>
              <span className={styles.googleGlyph}>G</span>
              {screenCopy.googleText}
            </button>

            {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}
          </div>

          <div className={styles.formMeta}>
            <div className={styles.noteStack}>
              {credentialNotes.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>

            <p className={styles.switchLine}>
              {mode === 'signup' ? 'Already registered?' : 'New to KIITX?'}{' '}
              <button
                className={styles.switchBtn}
                type="button"
                onClick={() => onModeChange(mode === 'signup' ? 'login' : 'signup')}
                disabled={isBusy}
              >
                {mode === 'signup' ? 'Use login instead' : 'Create an account'}
              </button>
            </p>

            <p className={styles.meta}>Administrative access remains isolated at `/url-admin`.</p>
          </div>
        </section>
      </section>

      {isBusy ? (
        <div className={styles.processingOverlay} aria-live="polite" aria-busy="true">
          <div className={styles.processingCard}>
            <div className={styles.processingSpinner}>
              <span />
            </div>
            <h3>Establishing secure session</h3>
            <p>Verifying identity, issuing backend credentials, and routing you to the correct workspace.</p>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default AuthScreen
