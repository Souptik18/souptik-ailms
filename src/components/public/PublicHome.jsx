import { useEffect, useMemo, useRef, useState } from 'react'
import * as Avatar from '@radix-ui/react-avatar'
import Lenis from 'lenis'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  Building2,
  ChevronRight,
  Compass,
  Globe2,
  Play,
  Quote,
  Search,
  Star,
  UsersRound,
} from 'lucide-react'
import { exploreCategories, exploreCoursesByCategory } from '../../data/publicCatalogData'
import { Button } from '../../dashboard/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../dashboard/components/ui/tabs'
import styles from './PublicHome.module.css'

const MotionSection = motion.section
const MotionDiv = motion.div
const MotionButton = motion.button

const heroSlides = [
  {
    label: 'Computer science academy',
    title: 'OpenCS Academy',
    headline: 'Computer science learning from first code to research systems.',
    copy: 'A focused LMS for school learners, undergraduates, postgraduates, PhD scholars, and research teams building real computing skill.',
    image: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=2200',
    track: 'Python, DSA, and AI',
  },
  {
    label: 'Career-ready computing',
    title: 'OpenCS Academy',
    headline: 'Coding, systems, cloud, security, and AI in one learning path.',
    copy: 'Run curated video lessons, coding labs, mentor reviews, project work, and certificate readiness without a raw search experience.',
    image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=2200',
    track: 'Systems and Cloud',
  },
  {
    label: 'Research depth',
    title: 'OpenCS Academy',
    headline: 'From school coding to advanced algorithms and research methods.',
    copy: 'Surface the next tutorial, project, paper, coding problem, or research milestone for every level of computer science learner.',
    image: 'https://images.pexels.com/photos/8199171/pexels-photo-8199171.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=2200',
    track: 'Theory and Research',
  },
]

const imageSet = {
  courses: [
    'https://images.pexels.com/photos/4144224/pexels-photo-4144224.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=1200',
    'https://images.pexels.com/photos/4145354/pexels-photo-4145354.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=1200',
    'https://images.pexels.com/photos/5428830/pexels-photo-5428830.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=1200',
    'https://images.pexels.com/photos/5905483/pexels-photo-5905483.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=1200',
    'https://images.pexels.com/photos/6476588/pexels-photo-6476588.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=1200',
    'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=1200',
  ],
  operator: 'https://images.pexels.com/photos/3182804/pexels-photo-3182804.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=1600',
  cohort: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=1600',
  workflow: 'https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=1600',
  testimonial: 'https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=1500',
}

const heroMetrics = [
  { value: 'K-PhD', label: 'CS learner pathways' },
  { value: '420+', label: 'curated CS modules' },
  { value: '96%', label: 'project completion lift' },
]

const operatingSystem = [
  { icon: BrainCircuit, title: 'AI learning paths', text: 'Dynamic recommendations by role, progress, and cohort target.' },
  { icon: BookOpenCheck, title: 'Course delivery', text: 'Video lessons, assignments, rubrics, reviews, and certification readiness.' },
  { icon: BarChart3, title: 'Outcome analytics', text: 'Completion, engagement, skill gaps, and instructor health in one view.' },
  { icon: BadgeCheck, title: 'Governance layer', text: 'Role access, cohort controls, program standards, and audit-friendly operations.' },
]

const storySteps = [
  { step: '01', title: 'Launch the cohort', text: 'Create paths, assign mentors, and publish the first learning sprint.' },
  { step: '02', title: 'Guide every learner', text: 'AI nudges surface what each learner should practice, watch, or submit next.' },
  { step: '03', title: 'Review the work', text: 'Instructor feedback, project evidence, and assessment state stay connected.' },
  { step: '04', title: 'Prove the outcome', text: 'Certificates, dashboards, and portfolio artifacts close the loop.' },
]

const testimonials = [
  {
    quote: 'It finally gave our learning team one place to run programs instead of managing five different tools.',
    author: 'Mira Shah',
    role: 'Learning Operations Lead',
    image: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=320',
  },
  {
    quote: 'The course experience feels premium, but the real win is the operational control behind it.',
    author: 'Neel Rao',
    role: 'Program Director',
    image: 'https://images.pexels.com/photos/874158/pexels-photo-874158.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=320',
  },
  {
    quote: 'Our instructors can see what is working before the cohort falls behind.',
    author: 'Ritika Nair',
    role: 'Academic Strategy',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=320',
  },
]

function useIntersection(options = { threshold: 0.18, rootMargin: '0px' }) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(
    () => typeof window !== 'undefined' && !('IntersectionObserver' in window),
  )

  useEffect(() => {
    const element = ref.current
    if (!element || isVisible || typeof window === 'undefined' || !('IntersectionObserver' in window)) return undefined

    const observer = new window.IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
        observer.unobserve(entry.target)
      }
    }, options)

    observer.observe(element)
    return () => observer.disconnect()
  }, [isVisible, options])

  return { ref, isVisible }
}

function RevealSection({ id, className, children }) {
  const shouldReduceMotion = useReducedMotion()
  const { ref, isVisible } = useIntersection({ threshold: 0.16, rootMargin: '100px 0px' })

  return (
    <MotionSection
      id={id}
      ref={ref}
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      animate={isVisible || shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionSection>
  )
}

function PublicHome({ visibleCourses = [], instructorsById = {}, onOpenSubject, onOpenCatalog, onOpenCourse }) {
  const [query, setQuery] = useState('')
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [activeCategory, setActiveCategory] = useState(exploreCategories[0] ?? 'Design')
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const shouldReduceMotion = useReducedMotion()
  const imageScale = 1
  const imageY = '0%'

  const featuredCourses = useMemo(() => visibleCourses.slice(0, 6), [visibleCourses])
  const activeCourses = useMemo(() => (exploreCoursesByCategory[activeCategory] ?? []).slice(0, 6), [activeCategory])
  const activeSlide = heroSlides[activeSlideIndex]
  const testimonial = testimonials[activeTestimonial]

  useEffect(() => {
    if (shouldReduceMotion) return undefined
    const timer = window.setInterval(() => {
      setActiveSlideIndex((current) => (current + 1) % heroSlides.length)
      setActiveTestimonial((current) => (current + 1) % testimonials.length)
    }, 5200)
    return () => window.clearInterval(timer)
  }, [shouldReduceMotion])

  useEffect(() => {
    if (typeof window === 'undefined' || shouldReduceMotion) return undefined
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true, touchMultiplier: 1.05 })
    let rafId = 0
    const raf = (time) => {
      lenis.raf(time)
      rafId = window.requestAnimationFrame(raf)
    }
    rafId = window.requestAnimationFrame(raf)

    return () => {
      window.cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [shouldReduceMotion])

  const scrollToCatalog = () => {
    if (typeof document === 'undefined') return
    document.getElementById('explore-courses')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSearch = (event) => {
    event.preventDefault()
    scrollToCatalog()
  }

  return (
    <main className={styles.home}>
      <section className={styles.hero} aria-label="OpenCourse Studio homepage">
        <div className={styles.heroShade} />

        <div className={styles.heroInner}>
          <MotionDiv
            className={styles.heroCopy}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className={styles.heroLabel}>{activeSlide.label}</span>
            <h1>{activeSlide.title}</h1>
            <p className={styles.heroHeadline}>{activeSlide.headline}</p>
            <p className={styles.heroText}>{activeSlide.copy}</p>
            <div className={styles.heroActions}>
              <Button className={styles.primaryButton} onClick={onOpenCatalog}>
                Explore courses
                <ArrowRight size={18} />
              </Button>
              <Button variant="outline" className={styles.secondaryButton} onClick={() => onOpenSubject?.('computerscience')}>
                <Play size={17} />
                Watch track
              </Button>
            </div>
          </MotionDiv>

          <div className={styles.heroRail}>
            <AnimatePresence mode="wait">
              <MotionDiv
                key={activeSlide.image}
                className={styles.heroImageLayer}
                style={{ scale: imageScale, y: imageY }}
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              >
                <img src={activeSlide.image} alt="" fetchPriority="high" />
              </MotionDiv>
            </AnimatePresence>
            <form className={styles.searchDock} onSubmit={handleSearch}>
              <Search size={17} />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Find Python, DSA, AI, systems"
                aria-label="Search computer science catalog"
              />
              <button type="submit" aria-label="Search">
                <ArrowRight size={17} />
              </button>
            </form>

            <div className={styles.slidePicker} aria-label="Hero stories">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.track}
                  type="button"
                  className={activeSlideIndex === index ? styles.activeSlide : ''}
                  onClick={() => setActiveSlideIndex(index)}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {slide.track}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.heroMetrics}>
          {heroMetrics.map((metric) => (
            <article key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </article>
          ))}
        </div>
      </section>

      <RevealSection id="about-swayam" className={styles.courseStage}>
        <div className={styles.stageIntro}>
          <span>Featured programs</span>
          <h2>Course launches that look like product experiences.</h2>
        </div>
        <div className={styles.courseRunway}>
          {featuredCourses.map((course, index) => (
            <MotionButton
              key={course.id}
              type="button"
              className={index === 0 ? styles.courseFeature : styles.courseTile}
              whileHover={shouldReduceMotion ? undefined : { y: -6 }}
              onClick={() => onOpenCourse(course.id)}
            >
              <img src={imageSet.courses[index % imageSet.courses.length]} alt="" loading="lazy" />
              <span>{course.category}</span>
              <h3>{course.title}</h3>
              <p>{instructorsById[course.instructorId]?.name ?? course.instructorName ?? 'Lead Instructor'}</p>
              <ArrowUpRight size={18} />
            </MotionButton>
          ))}
        </div>
      </RevealSection>

      <RevealSection className={styles.systemStage}>
        <div className={styles.systemMedia}>
          <img src={imageSet.operator} alt="" loading="lazy" />
        </div>
        <div className={styles.systemContent}>
          <span>Operating system</span>
          <h2>Not a static course shelf. A live learning command center.</h2>
          <div className={styles.systemList}>
            {operatingSystem.map((item) => {
              const Icon = item.icon
              return (
                <article key={item.title}>
                  <Icon size={20} />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </RevealSection>

      <RevealSection id="explore-courses" className={styles.catalogStage}>
        <div className={styles.catalogHeader}>
          <div>
            <span>Course catalog</span>
            <h2>Switch disciplines without losing the premium flow.</h2>
          </div>
          <Button className={styles.primaryButton} onClick={onOpenCatalog}>
            Full catalog
            <ArrowRight size={17} />
          </Button>
        </div>
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className={styles.tabs}>
          <TabsList className={styles.tabsList}>
            {exploreCategories.slice(0, 6).map((category) => (
              <TabsTrigger key={category} value={category} className={styles.tabsTrigger}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          {exploreCategories.slice(0, 6).map((category) => (
            <TabsContent key={category} value={category} className={styles.tabsContent}>
              <div className={styles.catalogGrid}>
                {(category === activeCategory ? activeCourses : []).map((course, index) => (
                  <button key={course.id} type="button" onClick={() => onOpenCourse(course.id)}>
                    <img src={imageSet.courses[(index + 2) % imageSet.courses.length]} alt="" loading="lazy" />
                    <div>
                      <span>{course.category}</span>
                      <h3>{course.title}</h3>
                      <p>{course.faculty}</p>
                    </div>
                    <ChevronRight size={18} />
                  </button>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </RevealSection>

      <RevealSection className={styles.workflowStage}>
        <div className={styles.workflowShell}>
          <div className={styles.workflowMedia}>
            <img src={imageSet.workflow} alt="" loading="lazy" />
          </div>
          <div className={styles.workflowPanel}>
            <div className={styles.workflowCopy}>
              <span>Workflow</span>
              <h2>Every section has a job. Every learner has a next step.</h2>
            </div>
            <div className={styles.workflowGrid}>
              {storySteps.map((item) => (
                <article key={item.step}>
                  <span>{item.step}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </RevealSection>

      <RevealSection className={styles.proofStage}>
        <img src={imageSet.cohort} alt="" loading="lazy" />
        <div className={styles.proofContent}>
          <span>Trusted learning operations</span>
          <h2>Built for teams that care about outcomes, not page views.</h2>
          <div className={styles.proofStats}>
            <strong>4.9</strong>
            <p>average learner rating across guided programs</p>
          </div>
          <div className={styles.proofPills}>
            <span><UsersRound size={16} /> Cohorts</span>
            <span><Globe2 size={16} /> Global access</span>
            <span><Compass size={16} /> Guided paths</span>
            <span><Building2 size={16} /> Admin controls</span>
          </div>
        </div>
      </RevealSection>

      <RevealSection className={styles.testimonialStage}>
        <div className={styles.testimonialMedia}>
          <img src={imageSet.testimonial} alt="" loading="lazy" />
        </div>
        <div className={styles.testimonialCopy}>
          <Quote size={22} />
          <p>{testimonial.quote}</p>
          <div className={styles.testimonialPerson}>
            <Avatar.Root className={styles.avatarRoot}>
              <Avatar.Image src={testimonial.image} alt={testimonial.author} />
              <Avatar.Fallback>{testimonial.author.charAt(0)}</Avatar.Fallback>
            </Avatar.Root>
            <div>
              <h3>{testimonial.author}</h3>
              <span>{testimonial.role}</span>
            </div>
            <div className={styles.stars}>
              {[0, 1, 2, 3, 4].map((item) => <Star key={item} size={15} />)}
            </div>
          </div>
        </div>
        <div className={styles.testimonialPicker}>
          {testimonials.map((item, index) => (
            <button
              key={item.author}
              type="button"
              className={activeTestimonial === index ? styles.activeTestimonial : ''}
              onClick={() => setActiveTestimonial(index)}
            >
              {item.author}
            </button>
          ))}
        </div>
      </RevealSection>

    </main>
  )
}

export default PublicHome
