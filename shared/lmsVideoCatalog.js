export const LMS_VIDEO_CATEGORIES = {
  computerscience: {
    label: 'Computer Science',
    subcategories: {
      programming: {
        label: 'Programming',
        queries: ['programming fundamentals full course', 'python programming full course', 'java programming full course'],
        filters: {
          foundations: { label: 'Programming foundations', queries: ['programming fundamentals full course computer science'] },
          python: { label: 'Python programming', queries: ['python programming full course computer science projects'] },
          java: { label: 'Java programming', queries: ['java programming full course object oriented programming'] },
          placements: { label: 'Programming for placements', queries: ['programming interview preparation coding questions'] },
        },
        fallbackVideos: [
          { youtubeId: 'rfscVS0vtbw', title: 'Learn Python - Full Course for Beginners', channelTitle: 'freeCodeCamp.org', durationSeconds: 15900, viewCount: 44000000 },
          { youtubeId: 'grEKMHGYyns', title: 'Java Tutorial for Beginners', channelTitle: 'Programming with Mosh', durationSeconds: 9120, viewCount: 9800000 },
          { youtubeId: 'KJgsSFOSQv0', title: 'C Programming Tutorial for Beginners', channelTitle: 'freeCodeCamp.org', durationSeconds: 13680, viewCount: 12000000 },
        ],
      },
      dataStructuresAlgorithms: {
        label: 'Data Structures & Algorithms',
        queries: ['data structures and algorithms full course', 'algorithms lecture course', 'dsa interview preparation full course'],
        filters: {
          theory: { label: 'DSA theory', queries: ['data structures algorithms theory lectures'] },
          problems: { label: 'Problem solving', queries: ['data structures algorithms problem solving full course'] },
          placements: { label: 'DSA for placements', queries: ['dsa interview preparation placement full course'] },
          advanced: { label: 'Advanced algorithms', queries: ['advanced algorithms dynamic programming graph algorithms'] },
        },
        fallbackVideos: [
          { youtubeId: '8hly31xKli0', title: 'Data Structures Easy to Advanced Course', channelTitle: 'freeCodeCamp.org', durationSeconds: 28800, viewCount: 7300000 },
          { youtubeId: 'RBSGKlAvoiM', title: 'Data Structures and Algorithms in JavaScript', channelTitle: 'freeCodeCamp.org', durationSeconds: 52200, viewCount: 3600000 },
          { youtubeId: '09_LlHjoEiY', title: 'Algorithms Course - Graphs and Dynamic Programming', channelTitle: 'freeCodeCamp.org', durationSeconds: 14400, viewCount: 2200000 },
        ],
      },
      operatingSystems: {
        label: 'Operating Systems',
        queries: ['operating systems full course', 'operating system lectures', 'process memory file systems lecture'],
        filters: {
          theory: { label: 'Operating systems theory', queries: ['operating systems theory lectures process memory file system'] },
          practical: { label: 'Operating system practicals', queries: ['operating system practical linux process scheduling memory management'] },
          placements: { label: 'Operating systems for placements', queries: ['operating system interview questions placement preparation'] },
          linux: { label: 'Linux internals', queries: ['linux operating system internals full course'] },
        },
        fallbackVideos: [
          { youtubeId: '26QPDBe-NB8', title: 'Operating Systems: Crash Course Computer Science', channelTitle: 'CrashCourse', durationSeconds: 780, viewCount: 2300000 },
          { youtubeId: 'yK1uBHPdp30', title: 'Operating Systems Full Course', channelTitle: 'Gate Smashers', durationSeconds: 36000, viewCount: 2600000 },
          { youtubeId: 'xw_OuOhjauw', title: 'Operating System Concepts', channelTitle: 'Neso Academy', durationSeconds: 2100, viewCount: 900000 },
        ],
      },
      computerNetworks: {
        label: 'Computer Networks',
        queries: ['computer networks full course', 'networking fundamentals full course', 'tcp ip networking lecture'],
        filters: {
          theory: { label: 'Networking theory', queries: ['computer networks theory lectures osi tcp ip'] },
          practical: { label: 'Networking practicals', queries: ['computer networking practical packet tracer wireshark'] },
          placements: { label: 'Networks for placements', queries: ['computer networks interview questions placement preparation'] },
          security: { label: 'Network security', queries: ['network security fundamentals computer science'] },
        },
        fallbackVideos: [
          { youtubeId: '3QhU9jd03a0', title: 'Computer Networking Course - Network Engineering', channelTitle: 'freeCodeCamp.org', durationSeconds: 33120, viewCount: 5400000 },
          { youtubeId: 'qiQR5rTSshw', title: 'Computer Networks Full Course', channelTitle: 'Gate Smashers', durationSeconds: 28800, viewCount: 1900000 },
          { youtubeId: 'IPvYjXCsTg8', title: 'TCP/IP and Networking Fundamentals', channelTitle: 'Practical Networking', durationSeconds: 5400, viewCount: 1600000 },
        ],
      },
      databases: {
        label: 'Databases',
        queries: ['database management systems full course', 'sql full course', 'dbms lectures normalization transactions'],
        filters: {
          dbms: { label: 'DBMS theory', queries: ['dbms theory lectures normalization transactions indexing'] },
          sql: { label: 'SQL practice', queries: ['sql full course database practice queries'] },
          placements: { label: 'DBMS for placements', queries: ['dbms interview questions placement preparation'] },
          design: { label: 'Database design', queries: ['database design er model normalization full course'] },
        },
        fallbackVideos: [
          { youtubeId: 'HXV3zeQKqGY', title: 'SQL Tutorial - Full Database Course', channelTitle: 'freeCodeCamp.org', durationSeconds: 14400, viewCount: 19000000 },
          { youtubeId: 'ztHopE5Wnpc', title: 'Database Management Systems Full Course', channelTitle: 'Gate Smashers', durationSeconds: 36000, viewCount: 2800000 },
          { youtubeId: '4cWkVbC2bNE', title: 'DBMS Normalization and Transactions', channelTitle: 'Neso Academy', durationSeconds: 3600, viewCount: 780000 },
        ],
      },
      artificialIntelligence: {
        label: 'AI & Machine Learning',
        queries: ['machine learning full course', 'artificial intelligence full course', 'deep learning full course'],
        filters: {
          ml: { label: 'Machine learning', queries: ['machine learning full course computer science'] },
          deepLearning: { label: 'Deep learning', queries: ['deep learning neural networks full course'] },
          genai: { label: 'Generative AI', queries: ['generative ai llm full course'] },
          placements: { label: 'AI for placements', queries: ['machine learning interview questions placement preparation'] },
        },
        fallbackVideos: [
          { youtubeId: 'GwIo3gDZCVQ', title: 'Machine Learning Full Course', channelTitle: 'freeCodeCamp.org', durationSeconds: 32400, viewCount: 8300000 },
          { youtubeId: 'aircAruvnKk', title: 'But what is a neural network?', channelTitle: '3Blue1Brown', durationSeconds: 1140, viewCount: 16000000 },
          { youtubeId: 'JMUxmLyrhSk', title: 'Artificial Intelligence Full Course', channelTitle: 'Simplilearn', durationSeconds: 36000, viewCount: 3200000 },
        ],
      },
      webDevelopment: {
        label: 'Web Development',
        queries: ['web development full course', 'react full course', 'javascript full course'],
        filters: {
          frontend: { label: 'Frontend', queries: ['frontend development react javascript full course'] },
          backend: { label: 'Backend', queries: ['backend development node js express database full course'] },
          fullstack: { label: 'Full stack', queries: ['full stack web development full course'] },
          placements: { label: 'Web dev for placements', queries: ['web developer interview preparation javascript react'] },
        },
        fallbackVideos: [
          { youtubeId: 'nu_pCVPKzTk', title: 'Full Stack Web Development for Beginners', channelTitle: 'freeCodeCamp.org', durationSeconds: 28800, viewCount: 4100000 },
          { youtubeId: 'bMknfKXIFA8', title: 'React Course - Beginner Tutorial', channelTitle: 'freeCodeCamp.org', durationSeconds: 39600, viewCount: 9000000 },
          { youtubeId: 'PkZNo7MFNFg', title: 'JavaScript Tutorial for Beginners', channelTitle: 'freeCodeCamp.org', durationSeconds: 12480, viewCount: 16000000 },
        ],
      },
      cybersecurity: {
        label: 'Cybersecurity',
        queries: ['cybersecurity full course', 'ethical hacking full course', 'network security lecture'],
        filters: {
          fundamentals: { label: 'Security fundamentals', queries: ['cyber security fundamentals full course'] },
          ethicalHacking: { label: 'Ethical hacking', queries: ['ethical hacking full course penetration testing'] },
          appsec: { label: 'Application security', queries: ['application security web security full course'] },
          placements: { label: 'Security for placements', queries: ['cyber security interview questions placement preparation'] },
        },
        fallbackVideos: [
          { youtubeId: 'inWWhr5tnEA', title: 'Cyber Security Full Course for Beginners', channelTitle: 'Simplilearn', durationSeconds: 36000, viewCount: 4200000 },
          { youtubeId: '3Kq1MIfTWCE', title: 'Ethical Hacking Full Course', channelTitle: 'freeCodeCamp.org', durationSeconds: 54000, viewCount: 6200000 },
          { youtubeId: 'U_P23SqJaDc', title: 'Network Security Fundamentals', channelTitle: 'edureka!', durationSeconds: 7200, viewCount: 900000 },
        ],
      },
    },
  },
}

export const DEFAULT_LMS_CATEGORY = 'computerscience'
export const DEFAULT_LMS_SUBCATEGORY = 'programming'

const FALLBACK_LESSON_PREFIXES = [
  'Foundations',
  'Core Concepts',
  'Hands-on Practice',
  'Interview Patterns',
  'Project Walkthrough',
  'Advanced Review',
  'Implementation Lab',
  'System Design Context',
]

export function getLmsCategoryKeys() {
  return Object.keys(LMS_VIDEO_CATEGORIES)
}

export function getDefaultSubcategoryKey(categoryKey = DEFAULT_LMS_CATEGORY) {
  const category = LMS_VIDEO_CATEGORIES[categoryKey] ?? LMS_VIDEO_CATEGORIES[DEFAULT_LMS_CATEGORY]
  return Object.keys(category.subcategories)[0]
}

export function flattenFallbackVideos(categoryKey = DEFAULT_LMS_CATEGORY, subcategoryKey) {
  const category = LMS_VIDEO_CATEGORIES[categoryKey] ?? LMS_VIDEO_CATEGORIES[DEFAULT_LMS_CATEGORY]
  const resolvedSubcategoryKey = subcategoryKey && category.subcategories[subcategoryKey]
    ? subcategoryKey
    : getDefaultSubcategoryKey(categoryKey)
  const subcategory = category.subcategories[resolvedSubcategoryKey]
  const seedVideos = subcategory?.fallbackVideos ?? []
  const expandedVideos = Array.from({ length: 48 }, (_, index) => {
    const seedVideo = seedVideos[index % seedVideos.length]
    const moduleNumber = Math.floor(index / Math.max(1, seedVideos.length)) + 1
    const lessonNumber = index + 1
    const prefix = FALLBACK_LESSON_PREFIXES[index % FALLBACK_LESSON_PREFIXES.length]
    return {
      ...seedVideo,
      youtubeId: seedVideo.youtubeId,
      title: moduleNumber === 1 ? seedVideo.title : `${prefix}: ${seedVideo.title} - Lesson ${lessonNumber}`,
      viewCount: Math.max(0, Number(seedVideo.viewCount ?? 0) - (lessonNumber * 371)),
      durationSeconds: seedVideo.durationSeconds,
    }
  })

  return expandedVideos.map((video) => ({
    ...video,
    categoryKey,
    categoryLabel: category.label,
    subcategoryKey: resolvedSubcategoryKey,
    subcategoryLabel: subcategory.label,
    duration: formatDuration(video.durationSeconds),
  }))
}

export function formatDuration(totalSeconds = 0) {
  const seconds = Math.max(0, Number(totalSeconds) || 0)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}
