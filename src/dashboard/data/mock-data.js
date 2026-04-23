import {
  BookOpen,
  ChartColumnBig,
  GraduationCap,
  LayoutDashboard,
  PlaySquare,
  Settings,
  Users,
} from 'lucide-react'

export const navItems = [
  { title: 'Dashboard', href: '/url-admin/dashboard', icon: LayoutDashboard },
  { title: 'Courses', href: '/url-admin/courses', icon: BookOpen },
  { title: 'Course Viewer', href: '/url-admin/courses/sys-design', icon: PlaySquare },
  { title: 'Students', href: '/url-admin/students', icon: Users },
  { title: 'Analytics', href: '/url-admin/analytics', icon: ChartColumnBig },
  { title: 'Settings', href: '/url-admin/settings', icon: Settings },
]

export const kpiCards = [
  { title: 'Active learners', value: '18.4K', delta: '+12.4%', hint: 'vs last 30 days' },
  { title: 'Course completion', value: '74%', delta: '+6.1%', hint: 'average across programs' },
  { title: 'Revenue', value: 'Rs 12.8L', delta: '+18.7%', hint: 'net this quarter' },
  { title: 'Live sessions', value: '26', delta: '+4', hint: 'scheduled this week' },
]

export const revenueSeries = [
  { month: 'Jan', revenue: 240000, learners: 8900 },
  { month: 'Feb', revenue: 310000, learners: 9600 },
  { month: 'Mar', revenue: 385000, learners: 11000 },
  { month: 'Apr', revenue: 420000, learners: 12300 },
  { month: 'May', revenue: 505000, learners: 14100 },
  { month: 'Jun', revenue: 560000, learners: 15900 },
]

export const engagementBreakdown = [
  { name: 'On-demand', value: 46 },
  { name: 'Webinars', value: 31 },
  { name: 'Assessments', value: 23 },
]

export const recentActivity = [
  { title: 'Machine Learning cohort launched', meta: '320 enrollments in first 3 hours' },
  { title: 'New mentor joined React program', meta: 'Assigned to advanced frontend track' },
  { title: 'Weekly retention report generated', meta: '22% boost in returning learners' },
]

export const courses = [
  {
    id: 'sys-design',
    title: 'System Design for Placements',
    instructor: 'Dr. S. Mohanty',
    category: 'Engineering',
    status: 'Live',
    completion: 72,
    learners: 2480,
    rating: 4.9,
    duration: '36h',
    description: 'A flagship LMS program for distributed systems, architecture reviews, and interview preparation.',
    sections: [
      {
        title: 'Foundations',
        lessons: ['Architecture framing', 'Scale estimation', 'Cache patterns', 'API contracts'],
      },
      {
        title: 'Resilience',
        lessons: ['Replication', 'Consistency', 'Queues', 'Rate limiting'],
      },
      {
        title: 'Interview sprint',
        lessons: ['Whiteboard method', 'Tradeoff language', 'Mock interview', 'Answer review'],
      },
    ],
  },
  {
    id: 'ml-blueprint',
    title: 'Machine Learning Engineering Blueprint',
    instructor: 'Prof. A. Patel',
    category: 'Data',
    status: 'Draft',
    completion: 48,
    learners: 1760,
    rating: 4.7,
    duration: '42h',
    description: 'Production-grade ML systems with monitoring, deployment, and experiment management.',
    sections: [
      {
        title: 'Pipelines',
        lessons: ['Feature stores', 'Experiment tracking', 'Batch scoring'],
      },
      {
        title: 'Operations',
        lessons: ['Drift monitoring', 'Rollback strategy', 'Model governance'],
      },
    ],
  },
  {
    id: 'react-scale',
    title: 'React Patterns for Scalable Apps',
    instructor: 'Rahul Nanda',
    category: 'Frontend',
    status: 'Live',
    completion: 81,
    learners: 3210,
    rating: 4.8,
    duration: '28h',
    description: 'Architecture systems and reusable front-end patterns for modern product teams.',
    sections: [
      {
        title: 'Architecture',
        lessons: ['Feature folders', 'Design tokens', 'State strategy'],
      },
      {
        title: 'Scale',
        lessons: ['Data fetching', 'Performance audits', 'Release readiness'],
      },
    ],
  },
]

export const students = [
  { id: 'S-1001', name: 'Ananya Sahu', cohort: 'System Design', progress: 84, streak: 18, status: 'Active' },
  { id: 'S-1002', name: 'Karan Mehta', cohort: 'ML Blueprint', progress: 61, streak: 9, status: 'At risk' },
  { id: 'S-1003', name: 'Ritika Das', cohort: 'React Scale', progress: 92, streak: 24, status: 'Active' },
  { id: 'S-1004', name: 'Aaditya Jain', cohort: 'System Design', progress: 44, streak: 3, status: 'Needs follow-up' },
  { id: 'S-1005', name: 'Sneha Kapoor', cohort: 'React Scale', progress: 77, streak: 12, status: 'Active' },
  { id: 'S-1006', name: 'Rahul Sen', cohort: 'ML Blueprint', progress: 55, streak: 7, status: 'At risk' },
]

export const analyticsCards = [
  { title: 'Session attendance', value: '88%', note: '7-day average' },
  { title: 'Discussion participation', value: '64%', note: 'active in chat or poll' },
  { title: 'Assessment pass rate', value: '79%', note: 'last 3 cohorts' },
]

export const acquisitionSeries = [
  { week: 'W1', organic: 120, referral: 60, paid: 30 },
  { week: 'W2', organic: 140, referral: 72, paid: 36 },
  { week: 'W3', organic: 165, referral: 88, paid: 42 },
  { week: 'W4', organic: 182, referral: 90, paid: 38 },
]

export const settingsSections = [
  { title: 'Workspace', text: 'Manage branding, notifications, and learner communication defaults.' },
  { title: 'Security', text: 'Update roles, access policy, and activity monitoring preferences.' },
]

export const defaultLogin = {
  email: 'admin@kiitx.in',
  password: 'password123',
}

export const brandMeta = {
  name: 'KIITX NPTEL',
  descriptor: 'SaaS LMS Control Center',
  learners: '18,400',
  mentors: '42',
  icon: GraduationCap,
}
