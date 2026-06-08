import request from './request'
import type { AuthorizedStudent, ClassStatistics, OverallStatistics, Application } from '@/types'

interface StudentsResponse {
  success: boolean
  data: AuthorizedStudent[]
}

interface ClassesResponse {
  success: boolean
  data: string[]
}

interface ClassStatsResponse {
  success: boolean
  data: ClassStatistics
}

interface OverallStatsResponse {
  success: boolean
  data: OverallStatistics
}

interface ApplicationsResponse {
  success: boolean
  data: (Application & { user?: { name: string; className: string } })[]
}

interface ImportResponse {
  success: boolean
  message: string
  data: {
    count: number
  }
}

interface CreateStudentResponse {
  success: boolean
  message: string
  data: {
    name: string
    username: string
    password: string
    major?: string
    studentLink?: string
    className?: string
    userId: number
  }
}

export interface StudentOverviewItem {
  id: number
  name: string
  username: string
  password?: string
  studentLink?: string
  className: string
  totalApplications: number
  statusCount: Record<string, number>
}

interface UpdateStudentResponse {
  success: boolean
  message: string
  data: {
    id: number
    name: string
    username: string
    password: string
    className: string
    studentLink?: string
  }
}

interface DeleteStudentResponse {
  success: boolean
  message: string
}

interface StudentsOverviewResponse {
  success: boolean
  data: StudentOverviewItem[]
}

export const teacherApi = {
  // 创建学生账号
  createStudent(data: { name: string; major?: string; studentLink?: string }) {
    return request.post<CreateStudentResponse>('/teacher/create-student', data)
  },

  // 导入学生名单
  importStudents(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post<ImportResponse>('/teacher/import-students', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // 获取学生概览
  getStudentsOverview() {
    return request.get<StudentsOverviewResponse>('/teacher/students/overview')
  },

  // 更新学生信息
  updateStudent(
    id: number,
    data: {
      name: string
      username: string
      password: string
      className?: string
      studentLink?: string
    }
  ) {
    return request.put<UpdateStudentResponse>(`/teacher/students/${id}`, data)
  },

  // 删除学生
  deleteStudent(id: number) {
    return request.delete<DeleteStudentResponse>(`/teacher/students/${id}`)
  },

  // 获取学生名单
  getStudents(params?: { className?: string }) {
    return request.get<StudentsResponse>('/teacher/students', { params })
  },

  // 获取班级列表
  getClasses() {
    return request.get<ClassesResponse>('/teacher/classes')
  },

  // 获取班级统计
  getClassStatistics(className: string) {
    return request.get<ClassStatsResponse>(`/teacher/statistics/class/${className}`)
  },

  // 获取总体统计
  getOverallStatistics() {
    return request.get<OverallStatsResponse>('/teacher/statistics/overall')
  },

  // 获取所有投递记录
  getApplications(params?: {
    className?: string
    status?: string
    channel?: string
    type?: string
    startDate?: string
    endDate?: string
  }) {
    return request.get<ApplicationsResponse>('/teacher/applications', { params })
  },

  // 导出投递记录
  exportApplications(params?: {
    className?: string
    status?: string
    channel?: string
    type?: string
    startDate?: string
    endDate?: string
  }) {
    return request.get('/teacher/applications/export', {
      params,
      responseType: 'blob',
    })
  },
}

export default teacherApi
