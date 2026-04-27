import { useMemo, useRef, useState } from 'react'
import { ArrowRight, Bot, MessageCircle, Minus, Send, Sparkles, X } from 'lucide-react'
import styles from './FloatingAssistant.module.css'

const assistantGif = 'https://media.giphy.com/media/LMcB8XospGZO8UQq87/giphy.gif'

const starterMessages = [
  {
    id: 'welcome',
    role: 'assistant',
    text: 'Hi, I can help you find courses, understand enrollment, or continue learning from your dashboard.',
  },
]

const quickPrompts = [
  'Find AI courses',
  'How do I enroll?',
  'Open my learnings',
]

function getAssistantReply(message) {
  const normalized = message.toLowerCase()

  if (normalized.includes('enroll')) {
    return 'Open any course page and use the enrollment action. After enrollment, it appears in My Learnings for continuation.'
  }

  if (normalized.includes('learning') || normalized.includes('mylearning') || normalized.includes('my learnings')) {
    return 'Use My Learnings from the top navigation to continue only the courses you are enrolled in.'
  }

  if (normalized.includes('ai') || normalized.includes('course') || normalized.includes('program')) {
    return 'Browse the catalog and use search or categories to find AI, software, design, management, and engineering programs.'
  }

  return 'I can help with course discovery, enrollment, and learning navigation. Try asking for a course category or how to continue an enrolled course.'
}

function FloatingAssistant({ onOpenHelp }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [messages, setMessages] = useState(starterMessages)
  const messageIdRef = useRef(0)

  const hasUserMessages = useMemo(() => messages.some((message) => message.role === 'user'), [messages])

  const sendMessage = (text) => {
    const trimmedText = text.trim()
    if (!trimmedText) return

    messageIdRef.current += 1
    const messageId = messageIdRef.current
    const userMessage = {
      id: `user-${messageId}`,
      role: 'user',
      text: trimmedText,
    }
    const assistantMessage = {
      id: `assistant-${messageId}`,
      role: 'assistant',
      text: getAssistantReply(trimmedText),
    }

    setMessages((currentMessages) => [...currentMessages, userMessage, assistantMessage])
    setMessageText('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    sendMessage(messageText)
  }

  return (
    <div className={styles.assistantDock}>
      {isOpen ? (
        <section className={styles.chatPanel} aria-label="OpenCourse chat assistant">
          <header className={styles.chatHeader}>
            <div className={styles.chatIdentity}>
              <span>
                <Bot size={17} />
              </span>
              <div>
                <strong>Course Assistant</strong>
                <small>Online now</small>
              </div>
            </div>
            <button type="button" className={styles.headerIconButton} onClick={() => setIsOpen(false)} aria-label="Close chat">
              <X size={17} />
            </button>
          </header>

          <div className={styles.chatBody}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.messageBubble} ${message.role === 'user' ? styles.userBubble : styles.assistantBubble}`}
              >
                {message.text}
              </div>
            ))}
          </div>

          {!hasUserMessages ? (
            <div className={styles.quickPrompts} aria-label="Suggested questions">
              {quickPrompts.map((prompt) => (
                <button key={prompt} type="button" onClick={() => sendMessage(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}

          <form className={styles.chatComposer} onSubmit={handleSubmit}>
            <input
              type="text"
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              placeholder="Ask about courses..."
              aria-label="Message course assistant"
            />
            <button type="submit" aria-label="Send message">
              <Send size={16} />
            </button>
          </form>

          <button
            type="button"
            className={styles.helpLink}
            onClick={() => {
              onOpenHelp()
              setIsOpen(false)
            }}
          >
            Explore course help
            <ArrowRight size={15} />
          </button>
        </section>
      ) : null}

      {isMinimized ? (
        <button
          type="button"
          className={styles.reopenButton}
          onClick={() => setIsMinimized(false)}
          aria-label="Reopen course assistant"
          title="Reopen course assistant"
        >
          <MessageCircle size={18} />
        </button>
      ) : (
        <div className={styles.iconShell}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => setIsOpen((current) => !current)}
            aria-label="Open course assistant"
            title="Open course assistant"
          >
            <span className={styles.statusPulse} />
            <span className={styles.iconWrap}>
              <img src={assistantGif} alt="" className={styles.iconVisual} loading="lazy" />
            </span>
            <span className={styles.iconBadge}>
              <Sparkles size={13} />
            </span>
          </button>

          <button
            type="button"
            className={styles.minimizeButton}
            onClick={() => {
              setIsOpen(false)
              setIsMinimized(true)
            }}
            aria-label="Minimize course assistant"
            title="Minimize course assistant"
          >
            <Minus size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

export default FloatingAssistant
