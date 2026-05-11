import { queryCourseCatalog } from './courseCatalogService.js'

const GROQ_CHAT_COMPLETIONS_URL = 'https://api.groq.com/openai/v1/chat/completions'
const XAI_CHAT_COMPLETIONS_URL = 'https://api.x.ai/v1/chat/completions'

export class OnboardingAiProviderError extends Error {
  constructor(message, { status = 502, provider = 'AI provider' } = {}) {
    super(message)
    this.name = 'OnboardingAiProviderError'
    this.status = status
    this.provider = provider
  }
}

const roleKeywords = {
  'Software Development Engineer': ['programming', 'data', 'structures', 'algorithms', 'placement'],
  'Frontend Engineer': ['frontend', 'react', 'javascript', 'web', 'interfaces'],
  'Backend Engineer': ['backend', 'api', 'databases', 'authentication', 'systems'],
  'Full Stack Engineer': ['full', 'stack', 'react', 'node', 'database'],
  'AI/ML Engineer': ['machine', 'learning', 'ai', 'python', 'data'],
  'Data Engineer': ['data', 'sql', 'python', 'pipelines', 'analytics'],
  'Cloud Engineer': ['cloud', 'devops', 'docker', 'kubernetes', 'systems'],
  'Cybersecurity Analyst': ['cybersecurity', 'security', 'network', 'web', 'defense'],
  'Senior Software Engineer': ['software', 'architecture', 'systems', 'design', 'leadership'],
  'Platform Engineer': ['platform', 'cloud', 'devops', 'systems', 'infrastructure'],
  'Solutions Architect': ['architecture', 'cloud', 'systems', 'design', 'enterprise'],
  'Technical Product Manager': ['product', 'technology', 'analytics', 'management', 'strategy'],
  'Staff Engineer': ['architecture', 'systems', 'leadership', 'design', 'strategy'],
  'Principal Engineer': ['architecture', 'systems', 'leadership', 'strategy', 'advanced'],
  'Engineering Manager': ['management', 'leadership', 'strategy', 'systems', 'execution'],
  'Senior Director': ['leadership', 'strategy', 'management', 'technology', 'execution'],
  'Associate Vice President': ['leadership', 'strategy', 'management', 'technology', 'execution'],
  'Chief Technology Officer': ['leadership', 'strategy', 'architecture', 'technology', 'management'],
}

function sanitizeText(value, maxLength = 1000) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

function getGroqApiKey() {
  return String(process.env.GROQ_API_KEY ?? '').trim()
}

function getGroqModel() {
  return String(process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile').trim()
}

function getAiProviderConfig() {
  const xaiApiKey = String(process.env.XAI_API_KEY || process.env.GROK_API_KEY || '').trim()
  if (xaiApiKey) {
    return {
      name: 'xAI Grok',
      apiKey: xaiApiKey,
      url: XAI_CHAT_COMPLETIONS_URL,
      model: String(process.env.XAI_MODEL || process.env.GROK_MODEL || 'grok-4.20-reasoning').trim(),
    }
  }

  const groqApiKey = getGroqApiKey()
  if (groqApiKey) {
    return {
      name: 'Groq',
      apiKey: groqApiKey,
      url: GROQ_CHAT_COMPLETIONS_URL,
      model: getGroqModel(),
    }
  }

  return null
}

function getKeywords(stageTitle, role) {
  const base = `${stageTitle} ${role}`
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 3)
  return [...new Set([...(roleKeywords[role] ?? []), ...base])].slice(0, 10)
}

function getRecommendedCourses(stageTitle, role) {
  const keywords = getKeywords(stageTitle, role)
  const catalog = queryCourseCatalog({
    page: 1,
    pageSize: 4,
    sort: 'recommended',
    recommendedOnly: keywords.length > 0,
    keywords,
  })

  return catalog.items.slice(0, 4).map((course) => ({
    id: sanitizeText(course.id, 120),
    title: sanitizeText(course.title, 180),
    category: sanitizeText(course.categoryLabel ?? course.category, 100),
    level: sanitizeText(course.level, 120),
    duration: sanitizeText(course.courseHours ?? course.hours, 80),
  }))
}

function fallbackRoadmap({ stageTitle, role, courses }) {
  return {
    source: 'fallback',
    generalRecommendation: `As a ${stageTitle.toLowerCase()} targeting ${role}, this is a strong direction because companies are hiring for people who can learn fast, execute clearly, and show proof of skill instead of only certificates. The best move now is to build the role fundamentals first, then convert every learning block into a visible project or assessment result. OpenCourse gives you that structure in one place, so you do not waste time jumping between random resources. Follow the recommended courses, complete the checkpoints, and use each milestone as evidence that you are moving closer to your dream role.`,
    requirements: [
      'Master role-critical fundamentals.',
      'Build one visible project proof.',
    ],
    recommendedCourses: courses,
    assessments: [
      { title: 'Foundation check', focus: 'Core concepts and terminology', format: 'Short quiz' },
      { title: 'Coding practice', focus: 'Hands-on problem solving', format: 'Timed coding set' },
      { title: 'Project review', focus: 'Portfolio-quality implementation', format: 'Submission review' },
      { title: 'Readiness assessment', focus: 'Role-specific interview preparation', format: 'Mixed evaluation' },
    ],
  }
}

function parseJsonObject(content) {
  const raw = sanitizeText(content, 6000)
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]
  const candidate = fenced || raw.match(/\{[\s\S]*\}/)?.[0] || raw
  return JSON.parse(candidate)
}

function hasSubstantialRecommendation(value) {
  const text = sanitizeText(value, 1800)
  const sentenceCount = text.split(/[.!?]+/).map((item) => item.trim()).filter(Boolean).length
  return text.length >= 420 && sentenceCount >= 5
}

function normalizeRoadmapPayload(payload, fallback) {
  const candidateRecommendation = sanitizeText(payload?.generalRecommendation, 1800)
  const generalRecommendation = hasSubstantialRecommendation(candidateRecommendation)
    ? candidateRecommendation
    : fallback.generalRecommendation
  const requirements = Array.isArray(payload?.requirements)
    ? payload.requirements.map((item) => sanitizeText(item, 140)).filter(Boolean).slice(0, 2)
    : fallback.requirements
  const assessments = Array.isArray(payload?.assessments)
    ? payload.assessments.map((item) => ({
      title: sanitizeText(item?.title, 90),
      focus: sanitizeText(item?.focus, 140),
      format: sanitizeText(item?.format, 70),
    })).filter((item) => item.title && item.focus).slice(0, 4)
    : fallback.assessments

  return {
    source: fallback.source === 'fallback' ? 'ai' : fallback.source,
    generalRecommendation,
    requirements: requirements.length ? requirements : fallback.requirements,
    recommendedCourses: fallback.recommendedCourses,
    assessments: assessments.length ? assessments : fallback.assessments,
  }
}

function buildMessages({ stageTitle, stageDetail, role, courses }) {
  return [
    {
      role: 'system',
      content: [
        'You are OpenCourse onboarding AI.',
        'Return ONLY valid JSON.',
        'Do not use markdown.',
        'Keep copy practical, persuasive, and student-friendly.',
        'The generalRecommendation must never be one sentence or one line.',
        'The generalRecommendation must be at least 5 complete sentences.',
        'Do not invent course names. Use recommendedCourses only as context; the server will attach final courses.',
      ].join(' '),
    },
    {
      role: 'user',
      content: JSON.stringify({
        task: 'Generate onboarding roadmap content.',
        studentCurrentStatus: stageTitle,
        statusDetail: stageDetail,
        dreamRole: role,
        availableRecommendedCourses: courses.map((course) => course.title),
        outputSchema: {
          generalRecommendation: 'A strong marketable guidance block in 120 to 170 words across 5 to 7 natural sentences. Explain why the dream role is valuable in the current market, what the learner should focus on from their current status, and persuade them to use OpenCourse as the main structured path. Do not return a one-line answer.',
          requirements: ['Exactly 2 short focus points, each under 9 words'],
          assessments: [
            {
              title: 'assessment name',
              focus: 'what it checks',
              format: 'quiz, coding set, project review, or mixed evaluation',
            },
          ],
        },
      }),
    },
  ]
}

export async function generateOnboardingRoadmap({ stage, role }) {
  const stageTitle = sanitizeText(stage?.title, 120)
  const stageDetail = sanitizeText(stage?.detail, 120)
  const dreamRole = sanitizeText(role, 120)

  if (!stageTitle) throw new Error('Current status is required.')
  if (!dreamRole) throw new Error('Dream role is required.')

  const courses = getRecommendedCourses(stageTitle, dreamRole)
  const fallback = fallbackRoadmap({ stageTitle, role: dreamRole, courses })
  const provider = getAiProviderConfig()
  if (!provider) return fallback

  let response
  try {
    response = await fetch(provider.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        temperature: 0.35,
        max_tokens: 950,
        messages: buildMessages({ stageTitle, stageDetail, role: dreamRole, courses }),
      }),
    })
  } catch {
    throw new OnboardingAiProviderError(`${provider.name} is not reachable from the server.`, {
      status: 502,
      provider: provider.name,
    })
  }

  if (!response.ok) {
    const status = response.status
    const message = status === 401 || status === 403
      ? `${provider.name} rejected the configured API key.`
      : `${provider.name} roadmap generation failed with HTTP ${status}.`
    throw new OnboardingAiProviderError(message, {
      status: status === 401 || status === 403 ? 401 : 502,
      provider: provider.name,
    })
  }

  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content ?? ''
  try {
    return {
      ...normalizeRoadmapPayload(parseJsonObject(content), fallback),
      source: provider.name,
    }
  } catch {
    throw new OnboardingAiProviderError(`${provider.name} returned an invalid roadmap response.`, {
      status: 502,
      provider: provider.name,
    })
  }
}
