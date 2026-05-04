import styles from './RoleWorkspaceLayout.module.css'

function RoleWorkspaceLayout({
  title,
  menu,
  activeTab,
  onTabChange,
  children,
  fullWidth = false,
  singleView = false,
}) {
  return (
    <main className={`${styles.layout} ${fullWidth ? styles.fullWidth : ''} ${singleView ? styles.singleView : ''}`}>
      {!singleView && (
        <aside className={styles.sidebar}>
          <h2>{title}</h2>
          {menu.map((item) => (
            <button key={item} type="button" className={activeTab === item ? styles.active : ''} onClick={() => onTabChange(item)}>
              {item}
            </button>
          ))}
        </aside>
      )}
      <section className={`${styles.content} ${singleView ? styles.centerContent : ''}`}>{children}</section>
    </main>
  )
}

export default RoleWorkspaceLayout
