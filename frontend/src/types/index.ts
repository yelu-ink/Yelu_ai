export interface User {
  id: number
  username: string
  name: string
  email?: string
  phone?: string
  className?: string
  role: 'student' | 'teacher'
}

export interface Application {
  id: number
  userId: number
  company: string
  position: string
  applicationDate: string
  channel?: string
  type?: string
  status?: string
  statusDate?: string
  location?: string
  referralCode?: string
  priority?: number
  remarks?: string
  createdAt: string
  updatedAt: string
}

export interface AuthorizedStudent {
  id: number
  name: string
  className: string
  isUsed: boolean
  usedByUserId?: number
  createdAt: string
  updatedAt: string
}

export interface LoginData {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  password: string
  name: string
  className: string
  email?: string
  phone?: string
}

export interface Statistics {
  total: number
  statusCount: Record<string, number>
  typeCount: Record<string, number>
  channelCount: Record<string, number>
  trend: Record<string, number>
}

export interface ApplicationRankingItem {
  rank: number
  maskedName: string
  className: string
  totalApplications: number
  isCurrentUser: boolean
}

export interface ApplicationRanking {
  rankings: ApplicationRankingItem[]
  currentRank: number
  totalStudents: number
  isBottom40: boolean
  warningMessage?: string
}

export interface ApplicationRecommendation {
  company: string
  position: string
  applicationDate: string
  channel?: string
  type?: string
  location?: string
  status?: string
  applicationCount: number
}

export interface ApplicationWarningPending {
  id: number
  recentCount: number
}

export interface ClassStatistics {
  className: string
  studentCount: number
  totalApplications: number
  avgApplications: string
  statusCount: Record<string, number>
  studentRanks: Array<{
    studentId: number
    studentName: string
    count: number
  }>
}

export interface OverallStatistics {
  totalClasses: number
  totalStudents: number
  totalApplications: number
  statusCount: Record<string, number>
}

export interface RecruitmentResource {
  id: number
  teacherId: number
  title: string
  category: string
  description?: string
  contentType: 'file' | 'link'
  filePath?: string
  fileName?: string
  linkUrl?: string
  priority: number
  createdAt: string
  updatedAt: string
}
