const categoryOrder = [
  'School Coding',
  'Programming Foundations',
  'Web and App Development',
  'AI and Data Science',
  'Systems and Cloud',
  'Cybersecurity',
  'Theory and Research',
]

const CATEGORY_TARGET_COUNTS = {
  'School Coding': 14,
  'Programming Foundations': 14,
  'Web and App Development': 14,
  'AI and Data Science': 14,
  'Systems and Cloud': 13,
  Cybersecurity: 13,
  'Theory and Research': 14,
}

const COURSE_VARIANT_LABELS = [
  'Applied Studio',
  'Industry Track',
  'Practical Intensive',
  'Career Accelerator',
  'Project Sprint',
  'Advanced Cohort',
  'Mentored Lab',
]

const categorySeed = {
  'School Coding': [
    ['school-1', 'Coding for Young Learners: Scratch to Python', 'OpenCourse CS Lab', 'CS Mentor Team', 'w7ejDZ8SWv8'],
    ['school-2', 'Computer Basics for Middle School Innovators', 'OpenCourse CS Lab', 'Anika Rao', '4UZrsTqkcW4'],
    ['school-3', 'Logic, Puzzles, and Algorithms for School Students', 'OpenCourse CS Lab', 'Rahul Sen', 'MbjObHmDbZo'],
    ['school-4', 'High School Computer Science Olympiad Prep', 'OpenCourse CS Lab', 'Dr. Kavya Menon', 'X48VuDVv0do'],
  ],
  'Programming Foundations': [
    ['prog-1', 'Python Programming from Zero to Projects', 'OpenCourse CS Academy', 'Dr. Meera Iyer', 'RUvJ4X8f6Jw'],
    ['prog-2', 'C and C++ for First-Year CS Students', 'OpenCourse CS Academy', 'Prof. Arjun Nair', 'MbjObHmDbZo'],
    ['prog-3', 'Data Structures and Algorithms Master Track', 'OpenCourse CS Academy', 'Dr. S. Mohanty', 'SqcY0GlETPk'],
    ['prog-4', 'Java OOP and Design Patterns for Campus Placements', 'OpenCourse CS Academy', 'Rahul Nanda', '4UZrsTqkcW4'],
  ],
  'Web and App Development': [
    ['web-1', 'Full-Stack Web Development with React and Node', 'OpenCourse Product School', 'Rahul Nanda', '86FAWCzIe_4'],
    ['web-2', 'Frontend Engineering for Scalable Interfaces', 'OpenCourse Product School', 'Neha Banerjee', '5fH2FOn1VSM'],
    ['web-3', 'Backend APIs, Databases, and Authentication', 'OpenCourse Product School', 'Amit Sharma', 'aircAruvnKk'],
    ['web-4', 'Mobile App Development with React Native', 'OpenCourse Product School', 'Ishaan Gupta', 'fNk_zzaMoSs'],
  ],
  'AI and Data Science': [
    ['ai-1', 'Machine Learning for Undergraduates', 'OpenCourse AI Institute', 'Prof. A. Patel', '9J1nJOivdyw'],
    ['ai-2', 'Deep Learning and Neural Networks Bootcamp', 'OpenCourse AI Institute', 'Dr. Priya Shah', 'SqcY0GlETPk'],
    ['ai-3', 'Generative AI Engineering with LLMs', 'OpenCourse AI Institute', 'Dr. Nikhil Rao', '86FAWCzIe_4'],
    ['ai-4', 'Data Science, Statistics, and Python Analytics', 'OpenCourse AI Institute', 'Ananya Sahu', 'aircAruvnKk'],
  ],
  'Systems and Cloud': [
    ['systems-1', 'Operating Systems for CS Degree Programs', 'OpenCourse Systems School', 'Dr. S. Mohanty', 'aircAruvnKk'],
    ['systems-2', 'Computer Networks and Internet Protocols', 'OpenCourse Systems School', 'Prof. Tanmay Ghosh', 'fNk_zzaMoSs'],
    ['systems-3', 'Cloud DevOps, Docker, Kubernetes, and CI/CD', 'OpenCourse Systems School', 'Rahul Nanda', 'MbjObHmDbZo'],
    ['systems-4', 'Distributed Systems and System Design', 'OpenCourse Systems School', 'Dr. Kavya Menon', '86FAWCzIe_4'],
  ],
  Cybersecurity: [
    ['security-1', 'Cybersecurity Foundations for Students', 'OpenCourse Security Lab', 'Dr. Farah Khan', 'i5f8bqYYwps'],
    ['security-2', 'Ethical Hacking and Web Security Labs', 'OpenCourse Security Lab', 'Rohan Das', '5fH2FOn1VSM'],
    ['security-3', 'Network Security, Cryptography, and Defense', 'OpenCourse Security Lab', 'Prof. Dev Malhotra', '4UZrsTqkcW4'],
    ['security-4', 'Secure Software Engineering and AppSec', 'OpenCourse Security Lab', 'Kritika Rao', 'fNk_zzaMoSs'],
  ],
  'Theory and Research': [
    ['research-1', 'Discrete Mathematics for Computer Science', 'OpenCourse Research School', 'Prof. R. Krishnan', 'aircAruvnKk'],
    ['research-2', 'Theory of Computation and Automata', 'OpenCourse Research School', 'Dr. Soumya Basu', 'fNk_zzaMoSs'],
    ['research-3', 'Research Methods for MS, PhD, and Postdoc CS', 'OpenCourse Research School', 'Dr. Leena Kapoor', '4UZrsTqkcW4'],
    ['research-4', 'Advanced Algorithms and Complexity Theory', 'OpenCourse Research School', 'Prof. Vivek Raman', '86FAWCzIe_4'],
  ],
}

function expandCategorySeed(category) {
  const seeds = categorySeed[category] ?? []
  const targetCount = Math.max(seeds.length, CATEGORY_TARGET_COUNTS[category] ?? seeds.length)
  if (seeds.length === 0) return []
  if (targetCount === seeds.length) return seeds

  const extras = Array.from({ length: targetCount - seeds.length }, (_, index) => {
    const base = seeds[index % seeds.length]
    const [baseId, baseTitle, institute, faculty, youtubeId] = base
    const variantLabel = COURSE_VARIANT_LABELS[index % COURSE_VARIANT_LABELS.length]
    const variantNumber = index + 1

    return [
      `${baseId}-plus-${variantNumber}`,
      `${baseTitle}: ${variantLabel}`,
      institute,
      faculty,
      youtubeId,
    ]
  })

  return [...seeds, ...extras]
}

function buildCourse(category, [id, title, institute, faculty, youtubeId], index) {
  const isSchoolTrack = category === 'School Coding'
  const isResearchTrack = category === 'Theory and Research'

  return {
    id,
    title,
    subtitle: `${title} with structured computer science lessons, projects, coding practice, and guided outcomes for ${isSchoolTrack ? 'school learners' : isResearchTrack ? 'advanced degree and research learners' : 'college students'}.`,
    category,
    institute,
    faculty,
    instructorName: faculty,
    youtubeId,
    rating: (4.7 + (index % 3) * 0.1).toFixed(1),
    students: 5200 + index * 1037,
    hours: `${6 + (index % 6) * 2} weeks`,
    level: isSchoolTrack ? 'School to Beginner' : isResearchTrack ? 'Graduate to Research' : index % 2 === 0 ? 'Undergraduate to Advanced' : 'Beginner to Undergraduate',
    language: 'English',
    creditEligibility: isSchoolTrack ? 'Practice certificate' : 'Academic certificate eligible',
    startDate: '01 Jul 2026',
    endDate: '31 Aug 2026',
    examDate: '20 Sep 2026',
    enrollmentStatus: index % 5 === 0 ? 'Ongoing (Enrollment Closed)' : 'Upcoming (Enrollment Open)',
    summaryPoints: [
      `Track: ${category}`,
      `Faculty: ${faculty}`,
      `Audience: ${isSchoolTrack ? 'school and higher-school students' : isResearchTrack ? 'postgraduate, doctoral, postdoctoral, and research learners' : 'undergraduate and postgraduate CS students'}`,
      'Mode: Video lessons, coding practice, projects, and certification path',
    ],
    learn: [
      `Build practical computer science skill in ${title.toLowerCase()}.`,
      'Complete guided coding tasks, assignments, and applied projects.',
      'Prepare for exams, placements, research work, or portfolio outcomes.',
      'Learn through video-led modules, references, and structured practice.',
    ],
    previewLessons: [
      { title: 'Module 1: Computer science foundations', duration: '12:10', youtubeId },
      { title: 'Module 2: Guided coding and applied examples', duration: '14:35', youtubeId },
      { title: 'Module 3: Project, assessment, and next steps', duration: '11:42', youtubeId },
    ],
    layout: [
      'Module 1: concepts, terminology, and mental models',
      'Module 2: coding walkthroughs and worked examples',
      'Module 3: assignments, labs, and debugging practice',
      'Module 4: project build, review, and certification prep',
    ],
    references: [
      `${title} computer science handbook`,
      'Coding exercises and lab notes',
      'Recommended papers, docs, and practice repositories',
    ],
    certificateNote: 'Digital computer science certificate available after satisfying assignment and evaluation criteria.',
  }
}

export const exploreCategories = categoryOrder

export const exploreCoursesByCategory = Object.fromEntries(
  categoryOrder.map((category) => [
    category,
    expandCategorySeed(category).map((entry, index) => buildCourse(category, entry, index + 1)),
  ]),
)

export const publicCatalogCourses = categoryOrder.flatMap((category) => exploreCoursesByCategory[category])

export function findPublicCatalogCourse(courseId) {
  return publicCatalogCourses.find((course) => course.id === courseId) ?? null
}
