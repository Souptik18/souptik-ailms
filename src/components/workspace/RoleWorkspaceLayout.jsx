import styles from './RoleWorkspaceLayout.module.css'
import { Route } from 'lucide-react'

function RoleWorkspaceLayout({
  title,
  menu,
  activeTab,
  onTabChange,
  children,
  fullWidth = false,
  singleView = false,
  tourScope = '',
  onGuideClick = null,
  guideTooltip = 'Open workspace tour',
}) {
  return (
    <main
      className={`${styles.layout} ${fullWidth ? styles.fullWidth : ''} ${singleView ? styles.singleView : ''}`}
      data-tour={tourScope ? `${tourScope}-layout` : undefined}
    >
      {!singleView && (
        <aside className={styles.sidebar} data-tour={tourScope ? `${tourScope}-navigation` : undefined}>
          <div className={styles.sidebarHeader}>
            <h2>{title}</h2>
            {onGuideClick ? (
              <button
                type="button"
                className={styles.guideIconButton}
                onClick={onGuideClick}
                aria-label={guideTooltip}
                title={guideTooltip}
              >
                <Route size={20} strokeWidth={2.4} />
              </button>
            ) : null}
          </div>
          {menu.map((item) => (
            <button
              key={item}
              type="button"
              className={activeTab === item ? styles.active : ''}
              onClick={() => onTabChange(item)}
              data-tour={tourScope ? `${tourScope}-nav-${item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : undefined}
            >
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
