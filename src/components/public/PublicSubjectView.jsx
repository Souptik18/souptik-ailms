import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { embedUrl, thumbnailUrl } from '../../utils/siteUtils'
import {
  DEFAULT_LMS_CATEGORY,
  DEFAULT_LMS_SUBCATEGORY,
  flattenFallbackVideos,
  getDefaultSubcategoryKey,
  LMS_VIDEO_CATEGORIES,
} from '../../../shared/lmsVideoCatalog'
import styles from './PublicSubjectView.module.css'

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '')
const buildApiUrl = (path) => (API_BASE_URL ? `${API_BASE_URL}${path}` : path)

const SUBJECT_ORDER = Object.keys(LMS_VIDEO_CATEGORIES)

const DOC_SUBTOPIC_LABELS = ['Concept notes', 'Worked examples', 'Practice worksheet']
const PPT_SUBTOPIC_LABELS = ['Class slides', 'Visual diagrams', 'Quick recap deck']
const OFFICE_VIEWER_BASE = 'https://view.officeapps.live.com/op/embed.aspx?src='
const SAMPLE_RESOURCE_URLS = {
  docx: 'https://calibre-ebook.com/downloads/demos/demo.docx',
  ppt: 'https://filesamples.com/samples/document/ppt/sample1.ppt',
}

function normalizeSubject(subject) {
  const normalized = String(subject ?? '').toLowerCase()
  return SUBJECT_ORDER.includes(normalized) ? normalized : DEFAULT_LMS_CATEGORY
}

function getDefaultFilterKey(categoryKey, subcategoryKey) {
  const filters = LMS_VIDEO_CATEGORIES[categoryKey]?.subcategories?.[subcategoryKey]?.filters ?? {}
  return Object.keys(filters)[0] ?? ''
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

function VideoSkeletonGrid() {
  return (
    <section className={styles.catalogGrid} aria-label="Loading Computer Science videos">
      {Array.from({ length: 12 }, (_, index) => (
        <article key={index} className={styles.catalogSkeletonCard}>
          <span className={styles.skeletonThumb} />
          <span className={styles.skeletonLineWide} />
          <span className={styles.skeletonLineShort} />
        </article>
      ))}
    </section>
  )
}

function buildPreviewContents(video, categoryLabel) {
  const title = video?.title ?? 'Selected lesson'
  return [
    `Preview: ${title}`,
    `${categoryLabel} concepts and learning outcomes`,
    'Guided notes, examples, and practice resources',
    'Certificate-ready project or assessment checkpoint',
  ]
}

function isVideoEnrollmentMatch(enrollmentId, { subjectKey, subcategoryKey, youtubeId }) {
  const parts = String(enrollmentId).split(':')
  const enrolledSubjectKey = parts[0]
  const enrolledSubcategoryKey = parts[1]
  const enrolledYoutubeId = parts.length >= 4 ? parts.slice(3).join(':') : parts[2]
  return enrolledSubjectKey === subjectKey
    && enrolledSubcategoryKey === subcategoryKey
    && enrolledYoutubeId === youtubeId
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
  initialSubject = 'computerscience',
  initialSubcategory: initialSubcategoryProp,
  initialVideoIndex = 0,
  mode = 'detail',
  onVideoOpen,
  currentUserRole,
  enrolledVideoIds = [],
  onRegisterVideo,
  onEnrollVideo,
  overlayMode = false,
  onTitleChange,
}) {
  const activeSubject = normalizeSubject(initialSubject)
  const initialSubcategory = initialSubcategoryProp
    && LMS_VIDEO_CATEGORIES[activeSubject]?.subcategories?.[initialSubcategoryProp]
    ? initialSubcategoryProp
    : getDefaultSubcategoryKey(activeSubject) || DEFAULT_LMS_SUBCATEGORY
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
  const [activeSubcategory, setActiveSubcategory] = useState(initialSubcategory)
  const [activeFilterKey, setActiveFilterKey] = useState(() => getDefaultFilterKey(activeSubject, initialSubcategory))
  const [previewVideoIndex, setPreviewVideoIndex] = useState(null)
  const [visibleVideoCount, setVisibleVideoCount] = useState(16)
  const [videoFeed, setVideoFeed] = useState(() => flattenFallbackVideos(activeSubject, initialSubcategory))
  const [isVideoFeedLoading, setIsVideoFeedLoading] = useState(false)
  const [isLoadingMoreVideos, setIsLoadingMoreVideos] = useState(false)
  const [nextPageToken, setNextPageToken] = useState('')
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
  const loadMoreRef = useRef(null)

  useEffect(() => {
    setActiveSubcategory(initialSubcategory)
    setActiveFilterKey(getDefaultFilterKey(activeSubject, initialSubcategory))
    setActiveVideoIndex(0)
    setPreviewVideoIndex(null)
    setVisibleVideoCount(16)
    setNextPageToken('')
  }, [activeSubject, initialSubcategory])

  useEffect(() => {
    let active = true
    const fallbackVideos = flattenFallbackVideos(activeSubject, activeSubcategory)
    setVideoFeed(fallbackVideos)
    setIsVideoFeedLoading(true)
    setIsLoadingMoreVideos(false)
    setVisibleVideoCount(16)
    setNextPageToken('')

    const filterParam = activeFilterKey ? `&filter=${encodeURIComponent(activeFilterKey)}` : ''
    fetch(buildApiUrl(`/api/lms-videos?category=${encodeURIComponent(activeSubject)}&subcategory=${encodeURIComponent(activeSubcategory)}${filterParam}`))
      .then((response) => parseApiPayload(response))
      .then((payload) => {
        if (!active) return
        const nextVideos = Array.isArray(payload?.videos) && payload.videos.length > 0 ? payload.videos : fallbackVideos
        setVideoFeed(nextVideos)
        setNextPageToken(typeof payload?.nextPageToken === 'string' ? payload.nextPageToken : '')
        setActiveVideoIndex((currentIndex) => Math.min(currentIndex, Math.max(0, nextVideos.length - 1)))
      })
      .catch(() => {
        if (active) setVideoFeed(fallbackVideos)
      })
      .finally(() => {
        if (active) setIsVideoFeedLoading(false)
      })

    return () => {
      active = false
    }
  }, [activeSubject, activeSubcategory, activeFilterKey])

  const videos = videoFeed
  const activeSubcategoryConfig = LMS_VIDEO_CATEGORIES[activeSubject].subcategories[activeSubcategory]
  const activeFilters = Object.entries(activeSubcategoryConfig?.filters ?? {})
  const activeFilterLabel = activeSubcategoryConfig?.filters?.[activeFilterKey]?.label ?? activeSubcategoryConfig?.label ?? 'Videos'
  const activeVideo = videos[activeVideoIndex] ?? videos[0]
  const previewVideo = previewVideoIndex === null ? null : videos[previewVideoIndex] ?? null
  const previewEnrollmentId = previewVideo ? `${activeSubject}:${activeSubcategory}:${previewVideoIndex}:${previewVideo.youtubeId}` : ''
  const isPreviewEnrolled = previewVideo
    ? enrolledVideoIds.some((enrollmentId) => isVideoEnrollmentMatch(enrollmentId, {
      subjectKey: activeSubject,
      subcategoryKey: activeSubcategory,
      youtubeId: previewVideo.youtubeId,
    }))
    : false
  const previewStudentPath = previewVideoIndex === null ? '' : `/student/subjects/${activeSubject}/${activeSubcategory}/${previewVideoIndex + 1}`
  const visibleVideos = videos.slice(0, visibleVideoCount)
  const hasMoreVideos = visibleVideoCount < videos.length || Boolean(nextPageToken)
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
    if (mode !== 'catalog' || previewVideo || !hasMoreVideos || !loadMoreRef.current) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (visibleVideoCount < videos.length) {
          setVisibleVideoCount((currentCount) => Math.min(currentCount + 16, videos.length))
          return
        }

        if (!nextPageToken || isLoadingMoreVideos) return
        setIsLoadingMoreVideos(true)
        const filterParam = activeFilterKey ? `&filter=${encodeURIComponent(activeFilterKey)}` : ''
        fetch(buildApiUrl(`/api/lms-videos?category=${encodeURIComponent(activeSubject)}&subcategory=${encodeURIComponent(activeSubcategory)}${filterParam}&pageToken=${encodeURIComponent(nextPageToken)}`))
          .then((response) => parseApiPayload(response))
          .then((payload) => {
            const incomingVideos = Array.isArray(payload?.videos) ? payload.videos : []
            setVideoFeed((currentVideos) => {
              const existingIds = new Set(currentVideos.map((video) => video.youtubeId))
              const uniqueIncomingVideos = incomingVideos.filter((video) => video?.youtubeId && !existingIds.has(video.youtubeId))
              return uniqueIncomingVideos.length > 0 ? [...currentVideos, ...uniqueIncomingVideos] : currentVideos
            })
            setNextPageToken(typeof payload?.nextPageToken === 'string' ? payload.nextPageToken : '')
            setVisibleVideoCount((currentCount) => currentCount + Math.max(16, incomingVideos.length))
          })
          .catch(() => {
            setNextPageToken('')
          })
          .finally(() => {
            setIsLoadingMoreVideos(false)
          })
      }
    }, { rootMargin: '320px 0px' })

    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [activeFilterKey, activeSubject, activeSubcategory, hasMoreVideos, isLoadingMoreVideos, mode, nextPageToken, previewVideo, visibleVideoCount, videos.length])

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
                <h2>Computer Science</h2>
                <button type="button" className={styles.panelToggleBtn} onClick={() => setIsLeftPanelCollapsed(true)} title="Close subjects">
                  &laquo;
                </button>
              </div>
              <div className={styles.subcategoryStack}>
                <h3>Categories</h3>
                {Object.entries(LMS_VIDEO_CATEGORIES[activeSubject].subcategories).map(([subcategoryKey, subcategory]) => (
                  <button
                    key={subcategoryKey}
                    type="button"
                    className={activeSubcategory === subcategoryKey ? styles.subjectActive : ''}
                    onClick={() => {
                      setActiveSubcategory(subcategoryKey)
                      setActiveFilterKey(getDefaultFilterKey(activeSubject, subcategoryKey))
                      setActiveVideoIndex(0)
                      setPreviewVideoIndex(null)
                      setVisibleVideoCount(16)
                      setNextPageToken('')
                    }}
                    title={`Open ${subcategory.label}`}
                  >
                    {subcategory.label}
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

      <article className={`${styles.content} ${mode === 'catalog' ? styles.catalogContent : ''}`}>
        {mode === 'catalog' ? (
          <>
            {activeFilters.length > 0 ? (
              <nav className={styles.filterChips} aria-label={`${activeSubcategoryConfig?.label} filters`}>
                {activeFilters.map(([filterKey, filter]) => (
                  <button
                    key={filterKey}
                    type="button"
                    className={activeFilterKey === filterKey ? styles.filterChipActive : ''}
                    onClick={() => {
                      setActiveFilterKey(filterKey)
                      setActiveVideoIndex(0)
                      setPreviewVideoIndex(null)
                      setVisibleVideoCount(16)
                      setNextPageToken('')
                    }}
                    title={`Show ${filter.label}`}
                  >
                    {filter.label}
                  </button>
                ))}
              </nav>
            ) : null}
            {isVideoFeedLoading ? (
              <VideoSkeletonGrid />
            ) : previewVideo ? (
              <section className={styles.previewPage}>
                <div className={styles.previewMain}>
                  <button type="button" className={styles.previewBackButton} onClick={() => setPreviewVideoIndex(null)}>
                    Back to videos
                  </button>
                  <div className={styles.previewVideoFrame}>
                    <iframe
                      src={embedUrl(previewVideo.youtubeId)}
                      title={`${previewVideo.title} preview`}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className={styles.previewDetails}>
                    <span>{activeFilterLabel}</span>
                    <h2>{previewVideo.title}</h2>
                    <p>
                      A structured preview for this Computer Science learning track, including the instructor channel,
                      expected contents, duration, and enrollment actions before opening the full learner workspace.
                    </p>
                  </div>
                  <div className={styles.previewContentList}>
                    <h3>What this course includes</h3>
                    {buildPreviewContents(previewVideo, activeFilterLabel).map((item, index) => (
                      <article key={item}>
                        <strong>{String(index + 1).padStart(2, '0')}</strong>
                        <span>{item}</span>
                      </article>
                    ))}
                  </div>
                </div>

                <aside className={styles.previewAside}>
                  <img src={previewVideo.thumbnail || thumbnailUrl(previewVideo.youtubeId)} alt="" loading="lazy" />
                  <div className={styles.previewAsideBody}>
                    <span className={styles.previewPrice}>Free</span>
                    {currentUserRole === 'student' ? (
                      isPreviewEnrolled ? (
                        <>
                          <button type="button" className={styles.previewPrimaryCta} disabled>
                            Enrolled
                          </button>
                          <button
                            type="button"
                            className={styles.previewSecondaryCta}
                            onClick={() => onVideoOpen?.(activeSubject, previewVideoIndex, activeSubcategory)}
                          >
                            Continue to course
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className={styles.previewPrimaryCta}
                          onClick={() => onEnrollVideo?.(previewEnrollmentId)}
                        >
                          Enroll now
                        </button>
                      )
                    ) : (
                      <button
                        type="button"
                        className={styles.previewPrimaryCta}
                        onClick={() => onRegisterVideo?.(previewStudentPath)}
                      >
                        Register now
                      </button>
                    )}
                    <div className={styles.previewMetaGrid}>
                      <span>Instructor</span>
                      <strong>{previewVideo.channelTitle ?? 'Curated channel'}</strong>
                      <span>Duration</span>
                      <strong>{previewVideo.duration}</strong>
                      <span>Views</span>
                      <strong>{Number(previewVideo.viewCount ?? 0).toLocaleString()}</strong>
                      <span>Level</span>
                      <strong>Beginner to advanced</strong>
                    </div>
                  </div>
                </aside>
              </section>
            ) : (
              <section className={styles.catalogGrid}>
              {visibleVideos.map((video, index) => (
                <button
                  key={`${activeSubcategory}-${activeFilterKey}-${video.youtubeId}-${index}`}
                  type="button"
                  className={styles.catalogCard}
                  onClick={() => {
                    setActiveVideoIndex(index)
                    setPreviewVideoIndex(index)
                  }}
                  title={`Preview ${video.title}`}
                >
                  <img src={video.thumbnail || thumbnailUrl(video.youtubeId)} alt={video.title} loading="lazy" />
                  <div className={styles.cardMeta}>
                    <span>{index + 1}. {video.title}</span>
                    <small>{video.channelTitle ?? 'Curated channel'} · {video.duration}</small>
                  </div>
                </button>
              ))}
              {hasMoreVideos ? (
                <div ref={loadMoreRef} className={styles.lazyLoadSentinel}>
                  {isLoadingMoreVideos ? 'Loading more videos...' : 'Scroll for more videos'}
                </div>
              ) : null}
              </section>
            )}
          </>
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
