import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Router } from 'vue-router'
import type { User } from '@/types'
import authApi from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const userInfo = ref<User | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const isStudent = computed(() => userInfo.value?.role === 'student')
  const isTeacher = computed(() => userInfo.value?.role === 'teacher')

  // 登录
  const login = async (username: string, password: string) => {
    const res = await authApi.login({ username, password })
    token.value = res.data.token
    userInfo.value = res.data.user
    localStorage.setItem('token', res.data.token)
    return res.data
  }

  // 注册
  const register = async (data: {
    username: string
    password: string
    name: string
    className: string
    email?: string
    phone?: string
  }) => {
    const res = await authApi.register(data)
    token.value = res.data.token
    userInfo.value = res.data.user
    localStorage.setItem('token', res.data.token)
    return res.data
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    if (!token.value) return
    
    try {
      const res = await authApi.getProfile()
      userInfo.value = res.data
    } catch (error) {
      logout()
    }
  }

  // 登出
  const logout = () => {
    token.value = null
    userInfo.value = null
    localStorage.removeItem('token')
  }

  const logoutAndRedirect = (router: Router) => {
    logout()
    router.push('/login')
  }

  const updateProfile = async (data: { name: string }) => {
    const res = await authApi.updateProfile(data)
    userInfo.value = res.data
    return res.data
  }

  // 初始化用户信息
  const initUser = async () => {
    if (token.value) {
      await fetchUserInfo()
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    isStudent,
    isTeacher,
    login,
    register,
    logout,
    logoutAndRedirect,
    updateProfile,
    fetchUserInfo,
    initUser,
  }
})
