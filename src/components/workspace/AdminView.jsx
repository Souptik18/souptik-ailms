import styles from './WorkspaceViews.module.css'

function AdminView({ activeTab, adminUsers }) {
  return (
    <div className={styles.stack}>
      <h1>Admin View - {activeTab}</h1>
      <section className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {adminUsers.map((user) => (
              <tr key={user.name}>
                <td>{user.name}</td>
                <td>{user.role}</td>
                <td><span className={`${styles.statusChip} ${user.status === 'Review' ? styles.warn : ''}`}>{user.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export default AdminView
