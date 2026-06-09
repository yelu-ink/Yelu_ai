import request from './request'
import type { RecruitmentResource } from '@/types'

interface ResourceListResponse {
  success: boolean
  data: RecruitmentResource[]
}

interface ResourceResponse {
  success: boolean
  message?: string
  data: RecruitmentResource
}

export const resourceApi = {
  list() {
    return request.get<ResourceListResponse>('/resources')
  },

  listForTeacher() {
    return request.get<ResourceListResponse>('/resources/teacher')
  },

  create(formData: FormData) {
    return request.post<ResourceResponse>('/resources/teacher', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  update(id: number, formData: FormData) {
    return request.put<ResourceResponse>(`/resources/teacher/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  remove(id: number) {
    return request.delete<{ success: boolean; message: string }>(`/resources/teacher/${id}`)
  },
}

export function getResourceFileUrl(filePath?: string) {
  if (!filePath) return ''
  return `/uploads/${filePath}`
}

export default resourceApi
