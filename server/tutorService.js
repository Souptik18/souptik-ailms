const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3/videos'
const YOUTUBE_TIMED_TEXT_BASE = 'https://www.youtube.com/api/timedtext'
const GROQ_CHAT_COMPLETIONS_URL = 'https://api.groq.com/openai/v1/chat/completions'

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'to', 'of', 'in', 'on', 'for', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'as',
  'at', 'it', 'this', 'that', 'from', 'into', 'about', 'what', 'which', 'when', 'where', 'who', 'why', 'how', 'can',
  'could', 'would', 'should', 'do', 'does', 'did', 'have', 'has', 'had', 'i', 'you', 'we', 'they', 'he', 'she', 'my',
  'your', 'our', 'their', 'me', 'us', 'them', 'if', 'then', 'than', 'so', 'also', 'not', 'only',
])

function getGroqApiKey() {
  return String(process.env.GROQ_API_KEY ?? '').trim()
}

function getGroqModel() {
  return String(process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile').trim()
}

function getYouTubeApiKey() {
  return String(process.env.YOUTUBE_API_KEY ?? '').trim()
}

function sanitizeText(value, maxLength = 6000) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

function tokenize(value) {
  return sanitizeText(value, 2000)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token && token.length > 2 && !STOPWORDS.has(token))
}

function computeQuestionRelevance(question, contextText) {
  const questionTokens = tokenize(question)
  if (questionTokens.length === 0) return 0
  const contextTokens = new Set(tokenize(contextText))
  let overlap = 0
  for (const token of questionTokens) {
    if (contextTokens.has(token)) overlap += 1
  }
  return overlap / questionTokens.length
}

function stripXmlTags(text) {
  return sanitizeText(text.replace(/<[^>]+>/g, ' '))
}

function decodeHtmlEntities(text) {
  return text
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
}

async function fetchYouTubeMetadata(videoId) {
  const youtubeApiKey = getYouTubeApiKey()
  if (!youtubeApiKey) {
    return {
      title: '',
      description: '',
      channelTitle: '',
      tags: [],
    }
  }

  const url = new URL(YOUTUBE_API_BASE)
  url.searchParams.set('part', 'snippet')
  url.searchParams.set('id', videoId)
  url.searchParams.set('key', youtubeApiKey)

  try {
    const response = await fetch(url, { method: 'GET' })
    if (!response.ok) {
      return {
        title: '',
        description: '',
        channelTitle: '',
        tags: [],
      }
    }

    const data = await response.json()
    const item = data?.items?.[0]
    const snippet = item?.snippet ?? {}
    return {
      title: sanitizeText(snippet.title ?? ''),
      description: sanitizeText(snippet.description ?? '', 4000),
      channelTitle: sanitizeText(snippet.channelTitle ?? ''),
      tags: Array.isArray(snippet.tags) ? snippet.tags.map((tag) => sanitizeText(tag, 80)).filter(Boolean).slice(0, 30) : [],
    }
  } catch {
    return {
      title: '',
      description: '',
      channelTitle: '',
      tags: [],
    }
  }
}

async function fetchTranscriptByLanguage(videoId, lang) {
  const transcriptUrl = new URL(YOUTUBE_TIMED_TEXT_BASE)
  transcriptUrl.searchParams.set('lang', lang)
  transcriptUrl.searchParams.set('v', videoId)

  const response = await fetch(transcriptUrl, { method: 'GET' })
  if (!response.ok) return ''

  const rawXml = await response.text()
  if (!rawXml || !rawXml.includes('<text')) return ''
  const withoutTags = stripXmlTags(rawXml)
  return decodeHtmlEntities(withoutTags)
}

async function fetchYouTubeTranscript(videoId) {
  const primary = await fetchTranscriptByLanguage(videoId, 'en')
  if (primary) return primary
  const fallback = await fetchTranscriptByLanguage(videoId, 'en-US')
  return fallback
}

function buildVideoContext({ videoId, requestedTitle, youtubeMeta, transcript }) {
  const title = sanitizeText(requestedTitle || youtubeMeta.title || 'Untitled lesson', 300)
  const description = sanitizeText(youtubeMeta.description, 3000)
  const channel = sanitizeText(youtubeMeta.channelTitle, 200)
  const tags = youtubeMeta.tags?.join(', ') ?? ''
  const cleanTranscript = sanitizeText(transcript, 12000)
  return {
    title,
    contextText: sanitizeText(
      [
        `Video ID: ${videoId}`,
        `Title: ${title}`,
        channel ? `Channel: ${channel}` : '',
        tags ? `Tags: ${tags}` : '',
        description ? `Description: ${description}` : '',
        cleanTranscript ? `Transcript: ${cleanTranscript}` : '',
      ].filter(Boolean).join('\n'),
      18000,
    ),
    transcript: cleanTranscript,
  }
}

function buildMessages({ question, chatHistory, videoContext }) {
  const history = Array.isArray(chatHistory)
    ? chatHistory
      .slice(-8)
      .map((item) => ({
        role: item?.role === 'assistant' ? 'assistant' : 'user',
        content: sanitizeText(item?.content ?? '', 800),
      }))
      .filter((item) => item.content)
    : []

  return [
    {
      role: 'system',
      content: [
        'You are KIITX AI LMS Tutor.',
        'Answer ONLY from the provided video context.',
        'If question is unrelated to this video context, respond exactly:',
        '"I can only answer questions related to this video."',
        'Do not use external knowledge.',
        'Keep responses clear, concise, and student-friendly.',
      ].join(' '),
    },
    {
      role: 'system',
      content: `Video context:\n${videoContext.contextText}`,
    },
    ...history,
    {
      role: 'user',
      content: sanitizeText(question, 900),
    },
  ]
}

async function generateTutorAnswer({ question, chatHistory, videoId, requestedTitle }) {
  const groqApiKey = getGroqApiKey()
  if (!groqApiKey) {
    throw new Error('Missing GROQ_API_KEY in server environment.')
  }

  const [youtubeMeta, transcript] = await Promise.all([
    fetchYouTubeMetadata(videoId),
    fetchYouTubeTranscript(videoId),
  ])

  const videoContext = buildVideoContext({
    videoId,
    requestedTitle,
    youtubeMeta,
    transcript,
  })

  const relevance = computeQuestionRelevance(question, videoContext.contextText)
  if (relevance < 0.12) {
    return {
      answer: 'I can only answer questions related to this video.',
      transcript: videoContext.transcript,
      title: videoContext.title,
    }
  }

  const messages = buildMessages({ question, chatHistory, videoContext })

  const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${groqApiKey}`,
    },
    body: JSON.stringify({
      model: getGroqModel(),
      temperature: 0.2,
      max_tokens: 500,
      messages,
    }),
  })

  if (!response.ok) {
    throw new Error('Groq tutor completion failed.')
  }

  const data = await response.json()
  const answer = sanitizeText(data?.choices?.[0]?.message?.content ?? '', 2000) || 'I can only answer questions related to this video.'

  return {
    answer,
    transcript: videoContext.transcript,
    title: videoContext.title,
  }
}

export async function answerVideoTutorQuestion({ videoId, title, question, history }) {
  const normalizedVideoId = sanitizeText(videoId, 40)
  const normalizedQuestion = sanitizeText(question, 1000)
  if (!normalizedVideoId) {
    throw new Error('videoId is required.')
  }
  if (!normalizedQuestion) {
    throw new Error('question is required.')
  }

  return generateTutorAnswer({
    question: normalizedQuestion,
    chatHistory: history,
    videoId: normalizedVideoId,
    requestedTitle: title,
  })
}
