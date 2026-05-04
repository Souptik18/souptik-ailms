import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpenCheck, CheckCircle2, Lock, Mail, PlayCircle, Sparkles } from 'lucide-react'
import styles from './AuthScreen.module.css'

const STUDENT_ROLE = 'student'
const portalHighlights = [
  { label: 'Adaptive lessons', icon: BookOpenCheck },
  { label: 'Guided projects', icon: Sparkles },
  { label: 'Video progress', icon: PlayCircle },
]
const credentialNotes = ['Student access', 'Email + Google auth', 'Secure session routing']

function LoadingScreen() {
  return (
    <main className={styles.page}>
      <section className={styles.loadingShell} aria-label="Preparing secure sign-in">
        <div className={styles.loadingPanel}>
          <span className={styles.loadingBadge}>Preparing secure access</span>
          <h1>Setting up your secure workspace.</h1>
          <p>Checking session integrity and preparing role-aware authentication flow.</p>
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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const screenCopy = useMemo(() => {
    if (mode === 'signup') {
      return {
        kicker: 'Create account',
        title: 'Start your AI learning workspace.',
        subtitle: 'Create student access and continue into guided programs, projects, and progress tracking.',
        buttonText: 'Create student account',
        googleText: 'Continue with Google',
      }
    }

    return {
      kicker: 'Welcome back',
      title: 'Log in and continue instantly.',
      subtitle: 'Resume lessons, saved courses, cohort activity, and certificate progress from your student workspace.',
      buttonText: 'Continue as student',
      googleText: 'Sign in with Google',
    }
  }, [mode])

  const handleEmailSubmit = (event) => {
    event.preventDefault()
    onAuthenticate({
      role: STUDENT_ROLE,
      method: 'email',
      mode,
      email: email.trim(),
      password,
    })
  }

  const handleGoogleAuth = () => {
    onAuthenticate({
      role: STUDENT_ROLE,
      method: 'google',
      mode,
    })
  }

  if (!isReady) return <LoadingScreen />

  return (
    <main className={styles.page}>
      <section className={styles.authShell}>
        <aside className={styles.storyPanel}>
          <div className={styles.storyTopline}>
            <span className={styles.storyBadge}>{screenCopy.kicker}</span>
            <button className={styles.backButton} type="button" onClick={onBackHome}>
              <ArrowLeft size={16} />
              Back home
            </button>
          </div>

          <div className={styles.storyContent}>
            <p className={styles.brandLine}>OpenCourse Studio</p>
            <h2>Student access for modern online learning.</h2>
            <p className={styles.storyBody}>
              Enter a clean learning workspace built around lessons, projects, progress, and certificates.
            </p>
            <ul className={styles.visualGrid}>
              {portalHighlights.map((item) => {
                const Icon = item.icon
                return (
                <li key={item.label}>
                  <Icon size={16} />
                  <span>{item.label}</span>
                </li>
                )
              })}
            </ul>
          </div>
        </aside>

        <section className={styles.formPanel}>
          <div className={styles.formHeader}>
            <button className={styles.brand} type="button" onClick={onBackHome}>OpenCourse</button>
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

          <div className={styles.studentOnly}>
            <CheckCircle2 size={17} />
            <span>Student workspace access</span>
          </div>

          <form className={styles.form} onSubmit={handleEmailSubmit}>
            <label className={styles.field}>
              <span>Email address</span>
              <div className={styles.inputWrap}>
                <Mail size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  aria-label="Email address"
                  autoComplete="email"
                  required
                  disabled={isBusy}
                />
              </div>
            </label>

            <label className={styles.field}>
              <span>{mode === 'signup' ? 'Create password' : 'Password'}</span>
              <div className={styles.inputWrap}>
                <Lock size={16} />
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
              </div>
            </label>

            <button className={styles.submitBtn} type="submit" disabled={isBusy}>
              {isBusy ? 'Securing access...' : screenCopy.buttonText}
              {!isBusy ? <ArrowRight size={16} /> : null}
            </button>
          </form>

          <button className={styles.googleBtn} type="button" onClick={handleGoogleAuth} disabled={isBusy}>
            <span className={styles.googleGlyph}>G</span>
            {screenCopy.googleText}
          </button>

          {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}

          <div className={styles.formMeta}>
            <div className={styles.noteStack}>
              {credentialNotes.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <p className={styles.switchLine}>
              {mode === 'signup' ? 'Already registered?' : 'New here?'}{' '}
              <button
                className={styles.switchBtn}
                type="button"
                onClick={() => onModeChange(mode === 'signup' ? 'login' : 'signup')}
                disabled={isBusy}
              >
                {mode === 'signup' ? 'Use login instead' : 'Create an account'}
              </button>
            </p>
          </div>
        </section>
      </section>
    </main>
  )
}

export default AuthScreen
