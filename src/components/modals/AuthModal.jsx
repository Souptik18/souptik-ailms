import { useEffect, useState } from 'react'
import styles from './Modal.module.css'

function AuthModal({
  requestedRole,
  initialMode,
  onAuthenticate,
  onClose,
  errorMessage,
  isBusy,
}) {
  const [role, setRole] = useState(requestedRole)
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    setRole(requestedRole)
  }, [requestedRole])

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  const handleEmailAuth = (event) => {
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

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <article className={styles.authModal}>
        <h2>{mode === 'signup' ? 'Create Account' : 'Login To Continue'}</h2>
        <p>Select student or instructor. Admin is not available here.</p>

        <div className={styles.authOptions} role="tablist" aria-label="Select role">
          <button
            className={`${styles.authOption} ${role === 'student' ? styles.active : ''}`}
            type="button"
            onClick={() => setRole('student')}
            disabled={isBusy}
          >
            Student
          </button>
          <button
            className={`${styles.authOption} ${role === 'instructor' ? styles.active : ''}`}
            type="button"
            onClick={() => setRole('instructor')}
            disabled={isBusy}
          >
            Instructor
          </button>
        </div>

        <div className={styles.modeSwitch}>
          <button
            className={`${styles.switchBtn} ${mode === 'login' ? styles.active : ''}`}
            type="button"
            onClick={() => setMode('login')}
            disabled={isBusy}
          >
            Log in
          </button>
          <button
            className={`${styles.switchBtn} ${mode === 'signup' ? styles.active : ''}`}
            type="button"
            onClick={() => setMode('signup')}
            disabled={isBusy}
          >
            Sign up
          </button>
        </div>

        <button className="btn-outline" type="button" onClick={handleGoogleAuth} disabled={isBusy}>
          {isBusy ? 'Please wait...' : `Continue with Google (${role})`}
        </button>

        <p className={styles.divider}>or continue with email</p>

        <form onSubmit={handleEmailAuth} className={styles.form}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={role === 'student' ? 'student@kiit.ac.in' : 'instructor@kiit.ac.in'}
              autoComplete="email"
              required
              disabled={isBusy}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={mode === 'signup' ? 'Minimum 6 characters' : 'Enter password'}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              minLength={6}
              required
              disabled={isBusy}
            />
          </label>
          <button className="btn-primary" type="submit" disabled={isBusy}>
            {isBusy ? 'Please wait...' : `${mode === 'signup' ? 'Create' : 'Login as'} ${role}`}
          </button>
        </form>

        {errorMessage && <p className={styles.error}>{errorMessage}</p>}

        <p className={styles.helper}>Admin login only from URL `/url-admin`.</p>
        <button className="btn-outline" type="button" onClick={onClose} disabled={isBusy}>Cancel</button>
      </article>
    </div>
  )
}

export default AuthModal
