const categoryOrder = [
  'Design',
  'Engineering',
  'Health Sciences',
  'Humanities and Arts',
  'Management',
  'Sciences',
  'Others',
]

const categorySeed = {
  Design: [
    ['design-1', 'User Interface Design', 'IIT Roorkee', 'Prof. Saptarshi Kolay', 'w7ejDZ8SWv8'],
    ['design-2', 'Interior Design', 'IIT Roorkee', 'Prof. Smriti Saraswat', '4UZrsTqkcW4'],
    ['design-3', 'Robotics: Basics and Selected Advanced Concepts', 'IISc Bangalore', 'Prof. Ashitava Ghosal', 'MbjObHmDbZo'],
    ['design-4', 'Product Design and Manufacturing', 'IIT Kanpur', 'Prof. J. Ramkumar, Prof. Amandeep Singh Oberoi', 'X48VuDVv0do'],
  ],
  Engineering: [
    ['eng-1', 'Signals and Systems', 'IIT Kharagpur', 'Prof. S. C. Dutta Roy', 'RUvJ4X8f6Jw'],
    ['eng-2', 'Thermodynamics', 'IIT Bombay', 'Prof. D. B. Phatak', 'MbjObHmDbZo'],
    ['eng-3', 'Digital Electronics', 'IIT Madras', 'Prof. N. B. Chakraborti', 'SqcY0GlETPk'],
    ['eng-4', 'Manufacturing Processes', 'IIT Delhi', 'Prof. A. K. Chattopadhyay', '4UZrsTqkcW4'],
  ],
  'Health Sciences': [
    ['health-1', 'Public Health Essentials', 'AIIMS', 'Prof. R. Singh', '86FAWCzIe_4'],
    ['health-2', 'Nutrition and Wellness', 'IIT Kharagpur', 'Prof. P. Ghosh', '5fH2FOn1VSM'],
    ['health-3', 'Biomedical Signal Processing', 'IIT Bombay', 'Prof. S. Chandra', 'aircAruvnKk'],
    ['health-4', 'Health Informatics', 'IIT Madras', 'Prof. R. Iyer', 'fNk_zzaMoSs'],
  ],
  'Humanities and Arts': [
    ['hum-1', 'Critical Thinking for Humanities', 'IIT Madras', 'Prof. V. Raman', '9J1nJOivdyw'],
    ['hum-2', 'Media Literacy Essentials', 'IIT Delhi', 'Prof. K. Sharma', 'SqcY0GlETPk'],
    ['hum-3', 'Indian Literature Context', 'IIT Kanpur', 'Prof. S. Bhadra', '86FAWCzIe_4'],
    ['hum-4', 'Art Appreciation Basics', 'IIT Bombay', 'Prof. A. Menon', 'aircAruvnKk'],
  ],
  Management: [
    ['mgmt-1', 'Principles of Accounting', 'IIM Bangalore', 'Prof. D. Sengupta', 'M8M4McQhR7U'],
    ['mgmt-2', 'Marketing Management', 'IIM Calcutta', 'Prof. S. Roy', 'WEDIj9JBTC8'],
    ['mgmt-3', 'HR Planning Overview', 'IIT Kharagpur', 'Prof. A. Dey', '5G0Vf0VQm2w'],
    ['mgmt-4', 'Operations and Inventory Control', 'IIT Delhi', 'Prof. R. Tiwari', 'VYM2zH2V9tQ'],
  ],
  Sciences: [
    ['sci-1', 'Scientific Method in Practice', 'IIT Madras', 'Prof. N. Krishnan', 'aircAruvnKk'],
    ['sci-2', 'Cell Biology Essentials', 'IISc Bangalore', 'Prof. M. Rao', 'fNk_zzaMoSs'],
    ['sci-3', 'Thermodynamics Introduction', 'IIT Bombay', 'Prof. A. Verma', 'MbjObHmDbZo'],
    ['sci-4', 'Experimental Data Analysis', 'IIT Delhi', 'Prof. P. K. Jain', '86FAWCzIe_4'],
  ],
  Others: [
    ['oth-1', 'Communication Fundamentals', 'IIT Kharagpur', 'Prof. S. Bose', 'i5f8bqYYwps'],
    ['oth-2', 'Career Skills for Graduates', 'IIT Kanpur', 'Prof. A. Saxena', '5fH2FOn1VSM'],
    ['oth-3', 'Environmental Awareness', 'IIT Delhi', 'Prof. N. Vora', '4UZrsTqkcW4'],
    ['oth-4', 'Research Writing and Citations', 'IIT Madras', 'Prof. K. Balan', 'fNk_zzaMoSs'],
  ],
}

function buildCourse(category, [id, title, institute, faculty, youtubeId], index) {
  return {
    id,
    title,
    subtitle: `${title} with structured weekly learning, guided outcomes, and institution-style enrollment flow.`,
    category,
    institute,
    faculty,
    instructorName: faculty,
    youtubeId,
    rating: (4.6 + (index % 4) * 0.1).toFixed(1),
    students: 4200 + index * 913,
    hours: `${8 + (index % 5) * 2} weeks`,
    level: index % 2 === 0 ? 'Beginner to Intermediate' : 'Intermediate',
    language: 'English',
    creditEligibility: index % 2 === 0 ? 'Yes' : 'Optional',
    startDate: '01 Jul 2026',
    endDate: '31 Aug 2026',
    examDate: '20 Sep 2026',
    enrollmentStatus: index % 5 === 0 ? 'Ongoing (Enrollment Closed)' : 'Upcoming (Enrollment Open)',
    summaryPoints: [
      `Institution: ${institute}`,
      `Faculty: ${faculty}`,
      `Category: ${category}`,
      'Mode: Self-paced with certification track',
    ],
    learn: [
      `Build core understanding in ${title.toLowerCase()}.`,
      'Follow a guided weekly structure with practical outcomes.',
      'Prepare for assignments, quizzes, and certification evaluation.',
      'Learn through video-led modules and curated references.',
    ],
    previewLessons: [
      { title: 'Week 1: Foundations', duration: '12:10', youtubeId },
      { title: 'Week 2: Applied Concepts', duration: '14:35', youtubeId },
      { title: 'Week 3: Assessment Readiness', duration: '11:42', youtubeId },
    ],
    layout: [
      'Week 1: introduction and terminology',
      'Week 2: frameworks, methods, and examples',
      'Week 3: applied use cases and case studies',
      'Week 4: assignments, revision, and assessment prep',
    ],
    references: [
      `${title} course handbook`,
      'Faculty lecture notes',
      'Recommended journal and review articles',
    ],
    certificateNote: 'Digital certificate available after satisfying assignment and exam criteria.',
  }
}

export const exploreCategories = categoryOrder

export const exploreCoursesByCategory = Object.fromEntries(
  categoryOrder.map((category) => [
    category,
    categorySeed[category].map((entry, index) => buildCourse(category, entry, index + 1)),
  ]),
)

export const publicCatalogCourses = categoryOrder.flatMap((category) => exploreCoursesByCategory[category])

export function findPublicCatalogCourse(courseId) {
  return publicCatalogCourses.find((course) => course.id === courseId) ?? null
}
