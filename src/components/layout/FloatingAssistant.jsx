import { useState } from 'react'
import styles from './FloatingAssistant.module.css'
import assistantGif from '../../Video Project.gif'

function FloatingAssistant({ onOpenHelp }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  return (
    <div className={styles.assistantDock}>
      {isOpen ? (
        <section className={styles.popup} aria-label="KIITX help popup">
          <div className={styles.popupUtility}>
            <span>KIITX Support</span>
            <button
              type="button"
              className={styles.popupClose}
              onClick={() => setIsOpen(false)}
              aria-label="Close popup"
            >
              x
            </button>
          </div>

          <div className={styles.popupBody}>
            <div className={styles.popupIntro}>
              <strong>Need help?</strong>
              <p>Open learner support and quick guidance from the assistant.</p>
            </div>

            <div className={styles.popupActions}>
              <button
                type="button"
                className={styles.primaryAction}
                onClick={() => {
                  onOpenHelp()
                  setIsOpen(false)
                }}
              >
                Open Help
              </button>
              <button
                type="button"
                className={styles.secondaryAction}
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {isMinimized ? (
        <button
          type="button"
          className={styles.reopenButton}
          onClick={() => setIsMinimized(false)}
          aria-label="Reopen KIITX help icon"
          title="Reopen KIITX help icon"
        >
          +
        </button>
      ) : (
        <div className={styles.iconShell}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => setIsOpen((current) => !current)}
            aria-label="Open KIITX help"
            title="Open KIITX help"
          >
            <span className={styles.iconWrap}>
              <img src={assistantGif} alt="" className={styles.iconVisual} />
            </span>
          </button>

          <button
            type="button"
            className={styles.minimizeButton}
            onClick={() => {
              setIsOpen(false)
              setIsMinimized(true)
            }}
            aria-label="Minimize KIITX help icon"
            title="Minimize KIITX help icon"
          >
            -
          </button>
        </div>
      )}
    </div>
  )
}

export default FloatingAssistant
