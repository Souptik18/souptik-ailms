import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { embedUrl, thumbnailUrl } from '../../utils/siteUtils'
import { getCourseFeedbackSummary } from '../../firebase/courseFeedbackService'
import styles from './PublicSubjectView.module.css'

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '')
const buildApiUrl = (path) => (API_BASE_URL ? `${API_BASE_URL}${path}` : path)

const SUBJECT_ORDER = ['commerce', 'arts', 'science', 'engineering']

const SUBJECT_LABELS = {
  commerce: 'Commerce',
  arts: 'Arts',
  science: 'Science',
  engineering: 'Engineering',
}

const SUBJECT_VIDEOS = {
  commerce: [
    { youtubeId: 'M8M4McQhR7U', title: 'Principles of accounting basics', duration: '11:20' },
    { youtubeId: 'i5f8bqYYwps', title: 'Micro economics demand and supply', duration: '10:08' },
    { youtubeId: 'QYvXwsj0x6U', title: 'Business communication fundamentals', duration: '09:42' },
    { youtubeId: 'fTTGALaRZoc', title: 'Financial statements quick read', duration: '12:15' },
    { youtubeId: 'WEDIj9JBTC8', title: 'Marketing mix explained', duration: '08:54' },
    { youtubeId: 'kBdfcR-8hEY', title: 'Consumer behavior models', duration: '10:40' },
    { youtubeId: 'mB2h0zkVfJo', title: 'Cost concepts for managers', duration: '09:50' },
    { youtubeId: '5G0Vf0VQm2w', title: 'HR planning overview', duration: '11:03' },
    { youtubeId: 'VYM2zH2V9tQ', title: 'Operations and inventory control', duration: '10:11' },
    { youtubeId: 'G2g7f9fok0A', title: 'Introduction to business law', duration: '09:27' },
  ],
  arts: [
    { youtubeId: '9J1nJOivdyw', title: 'Critical thinking for humanities', duration: '10:06' },
    { youtubeId: 'MbjObHmDbZo', title: 'History source analysis methods', duration: '12:04' },
    { youtubeId: 'RUvJ4X8f6Jw', title: 'Political theory overview', duration: '09:18' },
    { youtubeId: 'w7ejDZ8SWv8', title: 'Essay structuring techniques', duration: '08:33' },
    { youtubeId: 'SqcY0GlETPk', title: 'Media literacy essentials', duration: '11:12' },
    { youtubeId: '4UZrsTqkcW4', title: 'Sociology foundations', duration: '10:44' },
    { youtubeId: '86FAWCzIe_4', title: 'Indian literature context', duration: '09:57' },
    { youtubeId: '5fH2FOn1VSM', title: 'Philosophy argument mapping', duration: '08:49' },
    { youtubeId: 'aircAruvnKk', title: 'Art appreciation basics', duration: '11:26' },
    { youtubeId: 'fNk_zzaMoSs', title: 'Research writing and citations', duration: '10:21' },
  ],
  science: [
    { youtubeId: 'aircAruvnKk', title: 'Scientific method in practice', duration: '10:14' },
    { youtubeId: 'fNk_zzaMoSs', title: 'Cell biology essentials', duration: '09:35' },
    { youtubeId: 'w4sLAQvEH-M', title: 'Laws of motion refresher', duration: '11:08' },
    { youtubeId: 'MbjObHmDbZo', title: 'Thermodynamics introduction', duration: '12:03' },
    { youtubeId: 'RUvJ4X8f6Jw', title: 'Chemical bonding essentials', duration: '09:59' },
    { youtubeId: 'w7ejDZ8SWv8', title: 'Reaction rates and catalysts', duration: '08:47' },
    { youtubeId: 'SqcY0GlETPk', title: 'Genetics inheritance patterns', duration: '10:55' },
    { youtubeId: '4UZrsTqkcW4', title: 'Ecology and ecosystems', duration: '10:09' },
    { youtubeId: '86FAWCzIe_4', title: 'Experimental data analysis', duration: '09:16' },
    { youtubeId: '5fH2FOn1VSM', title: 'Lab report writing', duration: '08:58' },
  ],
  engineering: [
    { youtubeId: 'MbjObHmDbZo', title: 'System design fundamentals', duration: '10:48' },
    { youtubeId: 'RUvJ4X8f6Jw', title: 'Data structures refresher', duration: '09:42' },
    { youtubeId: 'X48VuDVv0do', title: 'Operating systems basics', duration: '11:21' },
    { youtubeId: 'w7ejDZ8SWv8', title: 'Computer networks core ideas', duration: '10:07' },
    { youtubeId: 'SqcY0GlETPk', title: 'Database indexing strategies', duration: '09:54' },
    { youtubeId: '4UZrsTqkcW4', title: 'OOP design principles', duration: '10:28' },
    { youtubeId: '86FAWCzIe_4', title: 'Software testing essentials', duration: '08:51' },
    { youtubeId: '5fH2FOn1VSM', title: 'CI/CD delivery pipeline', duration: '11:12' },
    { youtubeId: 'aircAruvnKk', title: 'Cloud deployment intro', duration: '09:39' },
    { youtubeId: 'fNk_zzaMoSs', title: 'Interview prep and coding rounds', duration: '10:15' },
  ],
}

const DOC_SUBTOPIC_LABELS = ['Concept notes', 'Worked examples', 'Practice worksheet']
const PPT_SUBTOPIC_LABELS = ['Class slides', 'Visual diagrams', 'Quick recap deck']
const OFFICE_VIEWER_BASE = 'https://view.officeapps.live.com/op/embed.aspx?src='
const SAMPLE_RESOURCE_URLS = {
  docx: 'https://calibre-ebook.com/downloads/demos/demo.docx',
  ppt: 'https://filesamples.com/samples/document/ppt/sample1.ppt',
}

function normalizeSubject(subject) {
  const normalized = String(subject ?? '').toLowerCase()
  return SUBJECT_ORDER.includes(normalized) ? normalized : 'commerce'
}

function buildSections(videos) {
  return videos.map((video, index) => ({
    id: `section-${index + 1}`,
    title: `Section ${index + 1}`,
    topics: [video],
    docSubtopics: DOC_SUBTOPIC_LABELS.map((label, subtopicIndex) => ({
      id: `doc-${index + 1}-${subtopicIndex + 1}`,
      title: `Subtopic ${subtopicIndex + 1}: ${label}`,
    })),
    pptSubtopics: PPT_SUBTOPIC_LABELS.map((label, subtopicIndex) => ({
      id: `ppt-${index + 1}-${subtopicIndex + 1}`,
      title: `Subtopic ${subtopicIndex + 1}: ${label}`,
    })),
    startIndex: index,
  }))
}

function getOnlineViewerUrl(format) {
  const sourceUrl = SAMPLE_RESOURCE_URLS[format]
  if (!sourceUrl) return ''
  return `${OFFICE_VIEWER_BASE}${encodeURIComponent(sourceUrl)}`
}

async function parseApiPayload(response) {
  const rawText = await response.text()
  let payload = {}
  try {
    payload = rawText ? JSON.parse(rawText) : {}
  } catch {
    payload = {}
  }
  if (!response.ok) {
    const serverMessage = typeof payload?.error === 'string' ? payload.error : ''
    const fallback = rawText && !rawText.trim().startsWith('<') ? rawText : `Request failed (HTTP ${response.status}).`
    throw new Error(serverMessage || fallback)
  }
  return payload
}

function PublicSubjectView({
  initialSubject = 'commerce',
  initialVideoIndex = 0,
  mode = 'detail',
  onSubjectNavigate,
  onVideoOpen,
  onClose,
  onBack,
  backLabel = 'Back',
  detailTitle,
  detailSubtitle,
  overlayMode = false,
  courseId = '',
  enableCourseActions = false,
  onTitleChange,
}) {
  const activeSubject = normalizeSubject(initialSubject)
  const isDetailMode = mode === 'detail'
  const parsedInitialVideoIndex = Number(initialVideoIndex)
  const safeInitialSectionNumber = Number.isNaN(parsedInitialVideoIndex)
    ? 1
    : Math.max(1, parsedInitialVideoIndex + 1)
  const [activeVideoIndex, setActiveVideoIndex] = useState(() => {
    if (Number.isNaN(parsedInitialVideoIndex)) return 0
    return Math.max(0, parsedInitialVideoIndex)
  })
  const [activeTab, setActiveTab] = useState('ppt')
  const [openSectionByTab, setOpenSectionByTab] = useState({
    video: `section-${safeInitialSectionNumber}`,
    docs: 'section-1',
    ppt: 'section-1',
  })
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false)
  const [isResourcePanelCollapsed, setIsResourcePanelCollapsed] = useState(false)
  const [rightPanelMode, setRightPanelMode] = useState('resources')
  const [activeResourceViewer, setActiveResourceViewer] = useState(null)
  const [tutorInput, setTutorInput] = useState('')
  const [tutorMessages, setTutorMessages] = useState([])
  const [tutorTranscript, setTutorTranscript] = useState('')
  const [isTutorLoading, setIsTutorLoading] = useState(false)
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const tutorMessagesRef = useRef(null)
  const tutorHistoryCacheRef = useRef(new Map())
  const [courseRatingSummary, setCourseRatingSummary] = useState({ averageRating: 0, totalReviews: 0 })

  const videos = useMemo(() => SUBJECT_VIDEOS[activeSubject], [activeSubject])
  const activeVideo = videos[activeVideoIndex] ?? videos[0]
  const sections = useMemo(() => buildSections(videos), [videos])
  const activeResourceViewerUrl = activeResourceViewer ? getOnlineViewerUrl(activeResourceViewer.format) : ''

  useEffect(() => {
    onTitleChange?.(activeVideo.title)
  }, [activeVideo.title, onTitleChange])

  useEffect(() => {
    const container = tutorMessagesRef.current
    if (!container) return
    container.scrollTop = container.scrollHeight
  }, [tutorMessages, isTutorLoading])

  useEffect(() => {
    if (!enableCourseActions || !courseId) return

    let active = true

    getCourseFeedbackSummary(courseId)
      .then((payload) => {
        if (!active) return
        setCourseRatingSummary({
          averageRating: Number(payload.averageRating ?? 0),
          totalReviews: Number(payload.totalReviews ?? 0),
        })
      })
      .catch(() => {
        if (!active) return
        setCourseRatingSummary({ averageRating: 0, totalReviews: 0 })
      })

    return () => {
      active = false
    }
  }, [courseId, enableCourseActions])

  const handleSubjectChange = (subjectKey) => {
    if (typeof onSubjectNavigate === 'function') {
      onSubjectNavigate(subjectKey)
    }
  }

  const isSectionOpen = (tabKey, sectionId) => openSectionByTab[tabKey] === sectionId

  const toggleSection = (tabKey, sectionId) => {
    setOpenSectionByTab((currentState) => {
      const currentlyOpen = currentState[tabKey] === sectionId
      return {
        ...currentState,
        [tabKey]: currentlyOpen ? null : sectionId,
      }
    })
  }

  const openResourceViewer = ({ format, label }) => {
    setActiveResourceViewer({
      format,
      label,
    })
  }

  const closeResourceViewer = () => {
    setActiveResourceViewer(null)
  }

  const toggleFocusVideo = () => {
    const nextCollapsed = !(isLeftPanelCollapsed && isResourcePanelCollapsed)
    setIsLeftPanelCollapsed(nextCollapsed)
    setIsResourcePanelCollapsed(nextCollapsed)
  }

  const loadTutorHistory = useCallback(async (videoId, { force = false } = {}) => {
    if (!videoId) return

    if (!force && tutorHistoryCacheRef.current.has(videoId)) {
      const cached = tutorHistoryCacheRef.current.get(videoId)
      setTutorMessages(Array.isArray(cached?.messages) ? cached.messages : [])
      setTutorTranscript(typeof cached?.transcript === 'string' ? cached.transcript : '')
      return
    }

    setIsHistoryLoading(true)
    try {
      const response = await fetch(buildApiUrl(`/api/tutor/history/${encodeURIComponent(videoId)}`), {
        method: 'GET',
        credentials: 'include',
      })
      const payload = await parseApiPayload(response)
      const nextMessages = Array.isArray(payload?.messages) ? payload.messages : []
      const nextTranscript = typeof payload?.transcript === 'string' ? payload.transcript : ''
      tutorHistoryCacheRef.current.set(videoId, {
        messages: nextMessages,
        transcript: nextTranscript,
      })
      setTutorMessages(nextMessages)
      setTutorTranscript(nextTranscript)
    } catch {
      setTutorMessages([])
      setTutorTranscript('')
    } finally {
      setIsHistoryLoading(false)
    }
  }, [])

  const persistTutorHistory = useCallback(async (videoId, messages, transcript) => {
    if (!videoId) return
    tutorHistoryCacheRef.current.set(videoId, { messages, transcript })
    await fetch(buildApiUrl(`/api/tutor/history/${encodeURIComponent(videoId)}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        messages,
        transcript,
      }),
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (rightPanelMode !== 'aiTutor') return
    void loadTutorHistory(activeVideo.youtubeId)
  }, [activeVideo.youtubeId, rightPanelMode, loadTutorHistory])

  const openAiTutor = useCallback(() => {
    setRightPanelMode('aiTutor')
    setIsResourcePanelCollapsed(false)
    void loadTutorHistory(activeVideo.youtubeId)
  }, [activeVideo.youtubeId, loadTutorHistory])

  const switchToResources = useCallback(() => {
    setRightPanelMode('resources')
    setIsResourcePanelCollapsed(false)
  }, [])

  const refreshTutorHistory = useCallback(() => {
    void loadTutorHistory(activeVideo.youtubeId, { force: true })
  }, [activeVideo.youtubeId, loadTutorHistory])

  const tutorHistoryForApi = useMemo(
    () => tutorMessages.map((message) => ({
      role: message.role === 'bot' ? 'assistant' : 'user',
      content: message.text,
    })),
    [tutorMessages],
  )

  const submitTutorQuestion = useCallback((event) => {
    event.preventDefault()
    const question = tutorInput.trim()
    if (!question || isTutorLoading) return
    const createdAt = Date.now()
    const questionId = `u-${createdAt}`
    const userMessage = { id: questionId, role: 'user', text: question, createdAt }
    setTutorMessages((current) => [...current, userMessage])
    setTutorInput('')
    setIsTutorLoading(true)

    fetch(buildApiUrl('/api/tutor/video-chat'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoId: activeVideo.youtubeId,
        title: activeVideo.title,
        question,
        history: tutorHistoryForApi,
      }),
    })
      .then((response) => parseApiPayload(response))
      .then((payload) => {
        const answer = String(payload?.answer ?? 'I can only answer questions related to this video.')
        const transcript = String(payload?.transcript ?? '').trim()
        const nextTranscript = transcript || tutorTranscript
        if (nextTranscript) setTutorTranscript(nextTranscript)
        const botMessage = { id: `b-${Date.now()}`, role: 'bot', text: answer, createdAt: Date.now() }
        setTutorMessages((current) => {
          const nextMessages = [...current, botMessage]
          void persistTutorHistory(activeVideo.youtubeId, nextMessages, nextTranscript)
          return nextMessages
        })
      })
      .catch((error) => {
        const failureMessage = {
          id: `b-${Date.now()}-error`,
          role: 'bot',
          text: error instanceof Error ? error.message : 'Unable to fetch tutor answer.',
          createdAt: Date.now(),
        }
        setTutorMessages((current) => {
          const nextMessages = [...current, failureMessage]
          void persistTutorHistory(activeVideo.youtubeId, nextMessages, tutorTranscript)
          return nextMessages
        })
      })
      .finally(() => {
        setIsTutorLoading(false)
      })
  }, [activeVideo.title, activeVideo.youtubeId, isTutorLoading, persistTutorHistory, tutorHistoryForApi, tutorInput, tutorTranscript])

  const renderAssetRow = ({ rowKey, label, actions }) => (
    <div key={rowKey} className={styles.assetRow}>
      <span>{label}</span>
      <div className={styles.assetActions}>
        {actions.map((action) => (
          <button
            key={`${rowKey}-${action.format}`}
            type="button"
            className={styles.assetTag}
            onClick={() => openResourceViewer({ format: action.format, label })}
            title={action.label}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )

  const renderSectionList = (tabKey) => (
    sections.map((section) => {
      const open = isSectionOpen(tabKey, section.id)
      return (
        <section key={`${section.id}-${tabKey}`} className={styles.sectionCard}>
          <button
            type="button"
            className={styles.sectionToggle}
            onClick={() => toggleSection(tabKey, section.id)}
            aria-expanded={open}
            title={open ? `Collapse ${section.title}` : `Expand ${section.title}`}
          >
            <div className={styles.sectionToggleMeta}>
              <strong>{section.title}</strong>
              {tabKey === 'video' ? <span>{section.topics.length} topics</span> : null}
              {tabKey === 'docs' ? <span>{section.docSubtopics.length} Word/PPT resources</span> : null}
              {tabKey === 'ppt' ? <span>{section.pptSubtopics.length} PPT subtopics</span> : null}
            </div>
            <span className={`${styles.sectionChevron} ${open ? styles.sectionChevronOpen : ''}`} aria-hidden="true">
              ^
            </span>
          </button>

          {open ? (
            <div className={styles.topicRows}>
              {section.topics.map((topic, offset) => {
                const topicIndex = section.startIndex + offset

                if (tabKey === 'video') {
                  return (
                    <button
                      key={`${section.id}-${topic.title}`}
                      type="button"
                      className={topicIndex === activeVideoIndex ? styles.topicRowActive : ''}
                      onClick={() => {
                        setActiveVideoIndex(topicIndex)
                        closeResourceViewer()
                      }}
                      title={`Play ${topic.title}`}
                    >
                      <span>{topicIndex + 1}. {topic.title}</span>
                      <small>{topic.duration}</small>
                    </button>
                  )
                }

                if (tabKey === 'docs') {
                  return renderAssetRow({
                    rowKey: `${section.id}-doc-main-${topic.title}`,
                    label: `${topicIndex + 1}. ${topic.title}`,
                    actions: [
                      { format: 'docx', label: 'Word' },
                    ],
                  })
                }

                return renderAssetRow({
                  rowKey: `${section.id}-ppt-main-${topic.title}`,
                  label: `${topicIndex + 1}. ${topic.title}`,
                  actions: [
                    { format: 'ppt', label: 'PPT' },
                  ],
                })
              })}

              {tabKey === 'docs' && section.docSubtopics.map((item) => renderAssetRow({
                rowKey: item.id,
                label: item.title,
                actions: [
                  { format: 'docx', label: 'Word' },
                ],
              }))}

              {tabKey === 'ppt' && section.pptSubtopics.map((item) => renderAssetRow({
                rowKey: item.id,
                label: item.title,
                actions: [
                  { format: 'ppt', label: 'PPT' },
                ],
              }))}
            </div>
          ) : null}
        </section>
      )
    })
  )

  return (
    <section className={`${styles.subjectLayout} ${overlayMode ? styles.overlayMode : ''} ${isDetailMode ? styles.detailMode : ''} ${isLeftPanelCollapsed ? styles.leftCollapsed : ''}`}>
      {!isLeftPanelCollapsed ? (
        <aside className={styles.sidebar}>
          {isDetailMode ? (
            <>
              <div className={styles.sidebarHeader}>
                <h2>Video Sections</h2>
                <button type="button" className={styles.panelToggleBtn} onClick={() => setIsLeftPanelCollapsed(true)} title="Close sections">
                  &laquo;
                </button>
              </div>
              <div className={styles.sidebarSectionList}>
                {renderSectionList('video')}
              </div>
            </>
          ) : (
            <>
              <div className={styles.sidebarHeader}>
                <h2>Choose Subject</h2>
                <button type="button" className={styles.panelToggleBtn} onClick={() => setIsLeftPanelCollapsed(true)} title="Close subjects">
                  &laquo;
                </button>
              </div>
              <div className={styles.subjectStack}>
                {SUBJECT_ORDER.map((subjectKey) => (
                  <button
                    key={subjectKey}
                    type="button"
                    className={activeSubject === subjectKey ? styles.subjectActive : ''}
                    onClick={() => handleSubjectChange(subjectKey)}
                    title={`Switch to ${SUBJECT_LABELS[subjectKey]}`}
                  >
                    {SUBJECT_LABELS[subjectKey]}
                  </button>
                ))}
              </div>
            </>
          )}
        </aside>
      ) : (
        <button
          type="button"
          className={`${styles.edgeToggleBtn} ${styles.edgeToggleLeftOpen}`}
          onClick={() => setIsLeftPanelCollapsed(false)}
          title="Open sections"
        >
          &raquo;
        </button>
      )}

      <article className={styles.content}>
        {mode === 'catalog' ? (
          <section className={styles.catalogGrid}>
            {videos.map((video, index) => (
              <button
                key={`${video.youtubeId}-${video.title}`}
                type="button"
                className={styles.catalogCard}
                onClick={() => {
                  if (typeof onVideoOpen === 'function') {
                    onVideoOpen(activeSubject, index)
                  }
                }}
                title={`Open ${video.title}`}
              >
                <img src={thumbnailUrl(video.youtubeId)} alt={video.title} loading="lazy" />
                <div className={styles.cardMeta}>
                  <span>{index + 1}. {video.title}</span>
                  <small>{video.duration}</small>
                </div>
              </button>
            ))}
          </section>
        ) : (
          <div className={`${styles.watchRow} ${isResourcePanelCollapsed ? styles.watchRowExpanded : ''}`}>
            <section className={`${styles.playerPanel} ${activeResourceViewer ? styles.viewerOpen : ''}`}>
              {!activeResourceViewer ? (
                <div className="video-frame">
                  <iframe
                    src={embedUrl(activeVideo.youtubeId)}
                    title={activeVideo.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className={styles.resourceMediaFrame}>
                  {activeResourceViewerUrl ? (
                    <iframe
                      src={activeResourceViewerUrl}
                      title={`${activeResourceViewer.format.toUpperCase()} sample preview`}
                      className={styles.resourceFrame}
                    />
                  ) : (
                    <div className={styles.viewerFallback}>Preview unavailable for this file.</div>
                  )}
                </div>
              )}
              <div className={styles.playerControls}>
                <button type="button" className={styles.playerControlBtn} onClick={toggleFocusVideo} title="Toggle focus mode">
                  {isLeftPanelCollapsed && isResourcePanelCollapsed ? 'Exit Full Screen' : 'Full Screen'}
                </button>
                <button type="button" className={styles.playerControlBtn} onClick={openAiTutor} title="Open AI LMS Tutor">
                  AI LMS Tutor
                </button>
              </div>

              {isResourcePanelCollapsed ? (
                <button
                  type="button"
                  className={`${styles.edgeToggleBtn} ${styles.edgeToggleOpen}`}
                  onClick={() => setIsResourcePanelCollapsed(false)}
                  title="Open topics sidebar"
                >
                  &gt;&gt;
                </button>
              ) : null}
            </section>

            {!isResourcePanelCollapsed ? (
              <aside className={styles.resourcePanel}>
                {rightPanelMode === 'resources' ? (
                  <>
                    <div className={styles.resourceTabs}>
                      <button
                        type="button"
                        className={activeTab === 'docs' ? styles.resourceTabActive : ''}
                        onClick={() => setActiveTab('docs')}
                      >
                        Docs
                      </button>
                      <button
                        type="button"
                        className={activeTab === 'ppt' ? styles.resourceTabActive : ''}
                        onClick={() => setActiveTab('ppt')}
                      >
                        PPT
                      </button>
                      <button type="button" className={styles.resourceTabAction} onClick={openAiTutor} title="Open AI LMS Tutor">
                        AI LMS Tutor
                      </button>
                      <button type="button" className={styles.resourceTabAction} onClick={() => setIsResourcePanelCollapsed(true)} title="Close resources">
                        &raquo;
                      </button>
                    </div>

                    <div className={styles.resourceBody}>
                      {activeTab === 'docs' ? renderSectionList('docs') : null}
                      {activeTab === 'ppt' ? renderSectionList('ppt') : null}
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.resourceTabs}>
                      <button type="button" className={styles.resourceTabActive}>
                        AI LMS Tutor
                      </button>
                      <button type="button" className={styles.resourceTabAction} onClick={switchToResources}>
                        Switch to Docs/PPT
                      </button>
                      <button type="button" className={styles.resourceTabAction} onClick={() => setIsResourcePanelCollapsed(true)} title="Close tutor">
                        &raquo;
                      </button>
                    </div>
                    <div className={styles.tutorPanel}>
                      <div className={styles.tutorTranscript}>
                        <h4>Video Transcript</h4>
                        <p>{tutorTranscript || 'Ask a question to load transcript-grounded tutoring for this video.'}</p>
                      </div>
                      <div className={styles.tutorChat}>
                        <div className={styles.tutorToolbar}>
                          <button type="button" className={styles.tutorHistoryBtn} onClick={refreshTutorHistory} disabled={isHistoryLoading}>
                            {isHistoryLoading ? 'Loading History...' : 'History'}
                          </button>
                        </div>
                        <div ref={tutorMessagesRef} className={styles.tutorMessages}>
                          {tutorMessages.length === 0 ? (
                            <div className={`${styles.tutorBubble} ${styles.tutorBotBubble}`}>
                              Ask a question. I will answer using this video transcript only.
                            </div>
                          ) : (
                            tutorMessages.map((message) => (
                              <div
                                key={message.id}
                                className={`${styles.tutorBubble} ${message.role === 'user' ? styles.tutorUserBubble : styles.tutorBotBubble}`}
                              >
                                {message.text}
                              </div>
                            ))
                          )}
                          {isTutorLoading ? (
                            <div className={`${styles.tutorBubble} ${styles.tutorBotBubble}`}>
                              Typing...
                            </div>
                          ) : null}
                        </div>
                        <form className={styles.tutorComposer} onSubmit={submitTutorQuestion}>
                          <input
                            type="text"
                            value={tutorInput}
                            onChange={(event) => setTutorInput(event.target.value)}
                            disabled={isTutorLoading}
                            placeholder="Ask from this video transcript..."
                          />
                          <button type="submit" disabled={isTutorLoading}>{isTutorLoading ? 'Sending...' : 'Send'}</button>
                        </form>
                      </div>
                    </div>
                  </>
                )}

                <button type="button" className={`${styles.edgeToggleBtn} ${styles.edgeToggleClose}`} onClick={() => setIsResourcePanelCollapsed(true)} title="Close resources">
                  &laquo;
                </button>
              </aside>
            ) : null}
          </div>
        )}
      </article>
    </section>
  )
}

export default PublicSubjectView
