import request from './request'
import type { Application, ApplicationRanking, ApplicationRecommendation, ApplicationWarningPending, Statistics } from '@/types'

interface ApplicationListResponse {
  success: boolean
  data: Application[]
}

interface ApplicationResponse {
  success: boolean
  data: Application
}

interface StatisticsResponse {
  success: boolean
  data: Statistics
}

interface RankingResponse {
  success: boolean
  data: ApplicationRanking
}

interface RecommendationsResponse {
  success: boolean
  data: ApplicationRecommendation[]
}

interface ApplicationWarningPendingResponse {
  success: boolean
  data: ApplicationWarningPending | null
}

export const applicationApi = {
  // 创建投递记录
  create(data: Partial<Application>) {
    return request.post<ApplicationResponse>('/applications', data)
  },

  // 获取投递记录列表
  list(params?: {
    channel?: string
    type?: string
    status?: string
    priority?: number
    startDate?: string
    endDate?: string
    company?: string
    position?: string
  }) {
    return request.get<ApplicationListResponse>('/applications', { params })
  },

  // 获取单个投递记录
  getById(id: number) {
    return request.get<ApplicationResponse>(`/applications/${id}`)
  },

  // 更新投递记录
  update(id: number, data: Partial<Application>) {
    return request.put<ApplicationResponse>(`/applications/${id}`, data)
  },

  // 删除投递记录
  delete(id: number) {
    return request.delete(`/applications/${id}`)
  },

  // 获取统计数据
  getStatistics() {
    return request.get<StatisticsResponse>('/applications/statistics')
  },

  // 获取投递量排名
  getRanking() {
    return request.get<RankingResponse>('/applications/ranking')
  },

  // 获取校招公司投递推荐
  getRecommendations() {
    return request.get<RecommendationsResponse>('/applications/recommendations')
  },

  // 获取待处理的投递预警
  getPendingApplicationWarning() {
    return request.get<ApplicationWarningPendingResponse>('/applications/application-warnings/pending')
  },

  // 标记投递预警已读
  markApplicationWarningRead(id: number) {
    return request.post<{ success: boolean; message: string }>(
      `/applications/application-warnings/${id}/read`
    )
  },
}

export default applicationApi
