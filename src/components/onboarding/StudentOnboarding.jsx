import { useCallback, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bot,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
  Layers3,
  PlayCircle,
  Route,
  Sparkles,
  Target,
} from 'lucide-react'
import { OnboardingProvider, useOnboarding } from '@onboardjs/react'
import styles from './StudentOnboarding.module.css'

const MotionButton = motion.button
const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '')
const buildApiUrl = (path) => (API_BASE_URL ? `${API_BASE_URL}${path}` : path)
const ROADMAP_API_PATH = '/api/onboarding/roadmap'
const MEDIA_ASSETS = {
  roadmapPoster: 'https://images.pexels.com/photos/1181355/pexels-photo-1181355.jpeg?auto=compress&cs=tinysrgb&w=900',
  roadmapVideo: 'https://videos.pexels.com/video-files/3184465/3184465-uhd_2560_1440_25fps.mp4',
}

const careerStages = [
  { id: 'school', title: 'School learner', detail: 'Class 8 to 12', description: 'Start with fundamentals, logic, and guided projects.' },
  { id: 'college', title: 'College student', detail: 'B.Tech, BCA, MCA', description: 'Build portfolio depth for internships and placements.' },
  { id: 'fresher', title: 'Fresher', detail: '0 to 1 year', description: 'Prepare for your first serious technology role.' },
  { id: 'early-career', title: 'Early career', detail: '1 to 5 years', description: 'Sharpen ownership, execution, and specialization.' },
  { id: 'senior-leader', title: 'Mid or senior career', detail: '5+ years', description: 'Move toward architecture, leadership, and strategy.' },
]

const commonRoles = [
  'Software Development Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Engineer',
  'AI/ML Engineer',
  'Data Engineer',
  'Cloud Engineer',
  'Cybersecurity Analyst',
]

const roleRecommendations = {
  school: commonRoles,
  college: commonRoles,
  fresher: commonRoles,
  'early-career': [
    'Senior Software Engineer',
    'Platform Engineer',
    'Solutions Architect',
    'Technical Product Manager',
    'Cloud Engineer',
    'Full Stack Engineer',
  ],
  'senior-leader': [
    'Staff Engineer',
    'Principal Engineer',
    'Engineering Manager',
    'Senior Director',
    'Associate Vice President',
    'Chief Technology Officer',
  ],
}

const steps = [
  {
    id: 'profile',
    type: 'CUSTOM_COMPONENT',
    payload: { componentKey: 'profile-step' },
    nextStep: 'roadmap',
  },
  {
    id: 'roadmap',
    type: 'CUSTOM_COMPONENT',
    payload: { componentKey: 'roadmap-step' },
    nextStep: null,
  },
]

const roleCourseFallbacks = {
  'Software Development Engineer': ['Python Programming from Zero to Projects', 'Data Structures and Algorithms Master Track', 'Java OOP and Design Patterns for Campus Placements'],
  'Frontend Engineer': ['Frontend Engineering for Scalable Interfaces', 'Full-Stack Web Development with React and Node', 'JavaScript Tutorial for Beginners'],
  'Backend Engineer': ['Backend APIs, Databases, and Authentication', 'Database Management Systems Full Course', 'Operating Systems for CS Degree Programs'],
  'Full Stack Engineer': ['Full-Stack Web Development with React and Node', 'Backend APIs, Databases, and Authentication', 'Frontend Engineering for Scalable Interfaces'],
  'AI/ML Engineer': ['Machine Learning for Undergraduates', 'Deep Learning and Neural Networks Bootcamp', 'Generative AI Engineering with LLMs'],
  'Data Engineer': ['Data Science, Statistics, and Python Analytics', 'SQL Tutorial - Full Database Course', 'Python Programming from Zero to Projects'],
  'Cloud Engineer': ['Cloud DevOps, Docker, Kubernetes, and CI/CD', 'Operating Systems for CS Degree Programs', 'Computer Networks and Internet Protocols'],
  'Cybersecurity Analyst': ['Cybersecurity Foundations for Students', 'Ethical Hacking and Web Security Labs', 'Network Security, Cryptography, and Defense'],
}

function buildFallbackRoadmap(stage, role) {
  const stageTitle = stage?.title ?? 'your current stage'
  const dreamRole = role ?? 'your dream role'
  const courseTitles = roleCourseFallbacks[dreamRole] ?? [
    'Python Programming from Zero to Projects',
    'Data Structures and Algorithms Master Track',
    'Full-Stack Web Development with React and Node',
  ]

  return {
    source: 'local',
    generalRecommendation: `As ${stageTitle.toLowerCase()} targeting ${dreamRole}, this is a strong direction because hiring teams reward learners who can show practical proof, not only interest. Start with the core skills behind the role, then turn each OpenCourse block into a project, quiz result, or portfolio signal. OpenCourse keeps the path focused so you are not wasting energy across scattered resources. Follow the recommended courses in order and use each completed milestone as evidence that you are becoming ready for the role.`,
    requirements: [
      'Master role-critical fundamentals.',
      'Build one visible project proof.',
    ],
    recommendedCourses: courseTitles.map((title, index) => ({
      id: `local-${index + 1}`,
      title,
      category: index === 0 ? 'Start here' : 'Recommended next',
      level: 'OpenCourse track',
      duration: 'Structured path',
    })),
    assessments: [
      { title: 'Foundation check', focus: 'Concept clarity and terminology', format: 'Short quiz' },
      { title: 'Coding practice', focus: 'Hands-on problem solving', format: 'Timed coding set' },
      { title: 'Project review', focus: 'Portfolio-quality implementation', format: 'Submission review' },
      { title: 'Readiness check', focus: 'Role-specific interview preparation', format: 'Mixed evaluation' },
    ],
  }
}

const initialContext = {
  flowData: {
    onboarding: {
      stageId: null,
      role: null,
    },
  },
}

const reveal = {
  hidden: { opacity: 0, y: 24, clipPath: 'inset(0 0 100% 0)' },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    clipPath: 'inset(0 0 0% 0)',
    transition: { delay, duration: 0.62, ease: [0.22, 1, 0.36, 1] },
  }),
}

function resolveSelection(context) {
  const selectedStageId = context?.flowData?.onboarding?.stageId
  const stage = careerStages.find((item) => item.id === selectedStageId) ?? null
  const possibleRoles = stage ? roleRecommendations[stage.id] ?? commonRoles : []
  const selectedRole = context?.flowData?.onboarding?.role
  const role = possibleRoles.includes(selectedRole) ? selectedRole : null
  return { stage, role, possibleRoles }
}

async function requestRoadmap(payload) {
  const shouldTrySameOrigin = typeof window !== 'undefined'
    && ['localhost', '127.0.0.1'].includes(window.location.hostname)
  const candidateUrls = API_BASE_URL && shouldTrySameOrigin
    ? [buildApiUrl(ROADMAP_API_PATH), ROADMAP_API_PATH]
    : [API_BASE_URL ? buildApiUrl(ROADMAP_API_PATH) : ROADMAP_API_PATH]
  let lastError = null

  for (const url of [...new Set(candidateUrls)]) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const responsePayload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(responsePayload?.error || 'Unable to generate roadmap.')
      if (!responsePayload?.generalRecommendation && !Array.isArray(responsePayload?.recommendedCourses)) {
        throw new Error('Roadmap API returned an invalid response.')
      }
      return responsePayload
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Unable to generate roadmap.')
}

function RevealText({ as: Component = 'div', children, delay = 0, className }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      className={className}
      custom={delay}
      variants={reduceMotion ? undefined : reveal}
      initial={reduceMotion ? false : 'hidden'}
      animate={reduceMotion ? undefined : 'visible'}
    >
      <Component>{children}</Component>
    </motion.div>
  )
}

function ProfileStep({ context }) {
  const { updateContext, next, loading } = useOnboarding()
  const { stage: selectedStage, role: selectedRole, possibleRoles } = resolveSelection(context)
  const reduceMotion = useReducedMotion()
  const canGenerateRoadmap = Boolean(selectedStage && selectedRole)

  const persistSelection = async (stageId, role) => {
    const flowData = context?.flowData ?? {}
    await updateContext({
      flowData: {
        ...flowData,
        onboarding: {
          ...(flowData.onboarding ?? {}),
          stageId,
          role,
        },
      },
    })
  }

  const handleStageChange = async (stage) => {
    await persistSelection(stage.id, null)
  }

  return (
    <section className={styles.profileScreen}>
      <div className={styles.profileIntro}>
        <RevealText as="span" className={styles.kicker}>OpenCourse setup</RevealText>
        <RevealText as="h1" delay={0.06}>Tell us where you are now.</RevealText>
        <RevealText as="p" delay={0.12}>Select your current career situation first, then choose the role you want to move toward.</RevealText>
      </div>

      <motion.div
        className={styles.selectionCanvas}
        initial={reduceMotion ? false : { opacity: 0, y: 28 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.statusPanel}>
          <div className={styles.panelHeader}>
            <GraduationCap size={18} />
            <span>Current status</span>
          </div>
          <div className={styles.stageGrid}>
            {careerStages.map((stage) => (
              <button
                key={stage.id}
                type="button"
                className={selectedStage?.id === stage.id ? styles.stageActive : ''}
                onClick={() => handleStageChange(stage)}
              >
                <small>{stage.detail}</small>
                <strong>{stage.title}</strong>
                <span>{stage.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.rolePanel}>
          <div className={styles.panelHeader}>
            <BriefcaseBusiness size={18} />
            <span>Dream role</span>
          </div>
          {selectedStage ? (
            <div className={styles.roleGrid}>
              {possibleRoles.map((role) => (
                <button
                  key={`${selectedStage.id}-${role}`}
                  type="button"
                  className={selectedRole === role ? styles.roleActive : ''}
                  onClick={() => persistSelection(selectedStage.id, role)}
                >
                  {role}
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.roleEmpty}>
              <BriefcaseBusiness size={28} />
              <strong>Choose current status first</strong>
              <span>Dream role options will appear here after your current career situation is selected.</span>
            </div>
          )}
        </div>
      </motion.div>

      <div className={styles.screenFooter}>
        <span className={styles.stepIndicator}>Step 1 of 2</span>
        <MotionButton
          type="button"
          className={styles.primaryButton}
          onClick={() => next()}
          disabled={loading?.isAnyLoading || !canGenerateRoadmap}
          whileHover={reduceMotion ? undefined : { y: -2 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        >
          Generate roadmap
          <ArrowRight size={18} />
        </MotionButton>
      </div>
    </section>
  )
}

function RoadmapStep({ context }) {
  const { previous, next, loading } = useOnboarding()
  const { stage, role } = resolveSelection(context)
  const reduceMotion = useReducedMotion()
  const title = role ?? 'Recommended roadmap'
  const [roadmap, setRoadmap] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const loadRoadmap = useCallback(async () => {
    if (!stage || !role) return
    setIsGenerating(true)
    setErrorMessage('')
    try {
      setRoadmap(await requestRoadmap({ stage, role }))
    } catch (error) {
      setRoadmap(buildFallbackRoadmap(stage, role))
      setErrorMessage(error instanceof Error ? error.message : 'Unable to generate AI roadmap.')
    } finally {
      setIsGenerating(false)
    }
  }, [role, stage])

  useEffect(() => {
    void loadRoadmap()
  }, [loadRoadmap])

  const visibleRoadmap = roadmap ?? buildFallbackRoadmap(stage, role)
  const recommendedCourses = Array.isArray(visibleRoadmap?.recommendedCourses) ? visibleRoadmap.recommendedCourses.slice(0, 3) : []
  const assessments = Array.isArray(visibleRoadmap?.assessments) ? visibleRoadmap.assessments.slice(0, 4) : []
  const requirements = Array.isArray(visibleRoadmap?.requirements) ? visibleRoadmap.requirements.slice(0, 2) : []

  return (
    <section className={styles.roadmapScreen}>
      <div className={styles.roadmapHero}>
        <RevealText as="span" className={styles.kicker}>AI recommended roadmap</RevealText>
        <RevealText as="h1" delay={0.06}>{title}</RevealText>
        <RevealText as="p" delay={0.12}>Recommended for {stage?.title?.toLowerCase() ?? 'your profile'} based on your selected goal.</RevealText>
      </div>

      <div className={styles.roadmapCanvas}>
        <motion.div
          className={styles.generalCard}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
          transition={{ delay: 0.18, duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.sectionTitle}>
            <BrainCircuit size={20} />
            <span>General recommendation</span>
          </div>
          <div className={styles.aiGuidanceStrip}>
            <span><Bot size={15} /> AI guidance</span>
            <span><BadgeCheck size={15} /> Two focus points</span>
            <span><Route size={15} /> Stage to role path</span>
          </div>
          {isGenerating ? (
            <div className={styles.skeletonBlock}>
              <span />
              <span />
              <span />
            </div>
          ) : (
            <>
              {errorMessage ? (
                <div className={styles.inlineNotice}>
                  <span>{errorMessage}</span>
                  <button type="button" onClick={() => loadRoadmap()}>Retry</button>
                </div>
              ) : null}
              <p>{visibleRoadmap?.generalRecommendation}</p>
              <div className={styles.requirementList}>
                {requirements.map((item) => (
                  <span key={item}><CheckCircle2 size={15} /> {item}</span>
                ))}
              </div>
            </>
          )}
        </motion.div>

        <div className={styles.recommendationCard}>
          <div className={styles.sectionTitle}>
            <Layers3 size={20} />
            <span>Recommended courses</span>
          </div>
          {isGenerating ? (
            <div className={styles.courseSkeletonGrid}>
              <span />
              <span />
              <span />
            </div>
          ) : (
            <div className={styles.courseList}>
              {recommendedCourses.map((course, index) => (
                <motion.article
                  key={course.id || course.title}
                  className={styles.courseItem}
                  initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                  animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.07, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={reduceMotion ? undefined : { y: -3, scale: 1.01 }}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <strong>{course.title}</strong>
                    <small>{[course.category, course.level, course.duration].filter(Boolean).join(' - ')}</small>
                    <div className={styles.courseProgress}>
                      <i style={{ width: `${42 + index * 22}%` }} />
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
          <motion.div
            className={styles.courseMediaCard}
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.48, duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
          >
            <video
              src={MEDIA_ASSETS.roadmapVideo}
              poster={MEDIA_ASSETS.roadmapPoster}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
            <div className={styles.courseMediaOverlay}>
              <span><PlayCircle size={15} /> Learning momentum</span>
              <strong>Course progress turns into portfolio proof.</strong>
            </div>
          </motion.div>
        </div>

        <div className={styles.assessmentCard}>
          <div className={styles.sectionTitle}>
            <Target size={20} />
            <span>Recommended assessments</span>
          </div>
          {isGenerating ? (
            <div className={styles.assessmentSkeletonList}>
              <span />
              <span />
              <span />
            </div>
          ) : (
            <div className={styles.assessmentList}>
              {assessments.map((assessment, index) => (
                <motion.article
                  key={`${assessment.title}-${index}`}
                  className={styles.assessmentItem}
                  initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                  animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={{ delay: 0.24 + index * 0.07, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={reduceMotion ? undefined : { y: -3, scale: 1.01 }}
                >
                  <strong>{assessment.title}</strong>
                  <span>{assessment.focus}</span>
                  <small>{assessment.format}</small>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.screenFooter}>
        <span className={styles.stepIndicator}>Step 2 of 2</span>
        <MotionButton
          type="button"
          className={styles.secondaryButton}
          onClick={() => previous()}
          disabled={loading?.isAnyLoading}
          whileHover={reduceMotion ? undefined : { y: -2 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        >
          <ArrowLeft size={18} />
          Back
        </MotionButton>
        <MotionButton
          type="button"
          className={styles.primaryButton}
          onClick={() => next()}
          disabled={loading?.isAnyLoading || isGenerating || !visibleRoadmap}
          whileHover={reduceMotion ? undefined : { y: -2 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        >
          Start learning
          <ArrowRight size={18} />
        </MotionButton>
      </div>
    </section>
  )
}

function OnboardingFlow() {
  const { state, currentStep, renderStep, isCompleted } = useOnboarding()
  const reduceMotion = useReducedMotion()

  if (!state || !currentStep) {
    return (
      <main className={styles.screen}>
        <section className={styles.loadingScreen}>
          <Sparkles size={22} />
          <h1>Preparing onboarding</h1>
        </section>
      </main>
    )
  }

  if (isCompleted) return null

  return (
    <main className={styles.screen}>
      <motion.div
        key={currentStep.id}
        className={styles.stepStage}
        initial={reduceMotion ? false : { opacity: 0, x: currentStep.id === 'roadmap' ? 44 : -28, scale: 0.985 }}
        animate={reduceMotion ? undefined : { opacity: 1, x: 0, scale: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0, x: -24, scale: 0.985 }}
        transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
      >
        {renderStep()}
      </motion.div>
    </main>
  )
}

const stepComponentRegistry = {
  'profile-step': ProfileStep,
  'roadmap-step': RoadmapStep,
}

function StudentOnboarding({ onComplete }) {
  const handleFlowComplete = useCallback((context) => {
    const { stage, role } = resolveSelection(context)
    onComplete({
      completed: true,
      stage,
      role,
      completedAt: new Date().toISOString(),
    })
  }, [onComplete])

  return (
    <OnboardingProvider
      steps={steps}
      componentRegistry={stepComponentRegistry}
      initialContext={initialContext}
      onFlowComplete={handleFlowComplete}
    >
      <OnboardingFlow />
    </OnboardingProvider>
  )
}

export default StudentOnboarding
