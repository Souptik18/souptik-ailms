import modalStyles from '../modals/Modal.module.css'
import styles from './AdminGate.module.css'

function AdminGate({ adminLogin, adminError, onLoginChange, onSubmit, isLoading, adminEmail }) {
  return (
    <main className={styles.gate}>
      <article className={modalStyles.authModal}>
        <h2>Admin Login</h2>
        <p>Use this only via URL `/url-admin`.</p>
        <p className={styles.helper}>Only privileged email is allowed: <strong>{adminEmail}</strong></p>
        <form onSubmit={onSubmit} className={styles.form}>
          <label>
            Admin Email
            <input
              type="email"
              value={adminLogin.email}
              onChange={(event) => onLoginChange({ ...adminLogin, email: event.target.value })}
              placeholder={adminEmail}
              autoComplete="email"
              required
              disabled={isLoading}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={adminLogin.password}
              onChange={(event) => onLoginChange({ ...adminLogin, password: event.target.value })}
              placeholder="Enter admin password"
              autoComplete="current-password"
              required
              disabled={isLoading}
            />
          </label>
          {adminError && <p className={styles.error}>{adminError}</p>}
          <button className="btn-primary" type="submit" disabled={isLoading}>
            {isLoading ? 'Please wait...' : 'Login As Admin'}
          </button>
        </form>
      </article>
    </main>
  )
}

export default AdminGate
