<template>
  <div class="main-layout">
    <header class="main-header">
      <div class="header-left">
        <span class="app-title">学生秋招投递记录管理系统</span>
      </div>
      <UserProfileDropdown />
    </header>
    <main class="main-content">
      <router-view />
    </main>

    <ApplicationWarningDialog
      v-if="pendingWarning"
      v-model="warningDialogVisible"
      :warning-id="pendingWarning.id"
      :recent-count="pendingWarning.recentCount"
      @confirmed="handleWarningConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import UserProfileDropdown from '@/components/UserProfileDropdown.vue'
import ApplicationWarningDialog from '@/components/ApplicationWarningDialog.vue'
import applicationApi from '@/api/application'
import type { ApplicationWarningPending } from '@/types'

const userStore = useUserStore()

const pendingWarning = ref<ApplicationWarningPending | null>(null)
const warningDialogVisible = ref(false)
let warningPollTimer: ReturnType<typeof setInterval> | null = null
let shownWarningId: number | null = null

const fetchPendingWarning = async () => {
  if (!userStore.isStudent) {
    return
  }

  try {
    const res = await applicationApi.getPendingApplicationWarning()
    if (!res.data) {
      pendingWarning.value = null
      return
    }

    pendingWarning.value = res.data

    if (shownWarningId !== res.data.id) {
      shownWarningId = res.data.id
      warningDialogVisible.value = true
    }
  } catch (error) {
    console.error('获取投递预警失败:', error)
  }
}

const handleWarningConfirmed = () => {
  pendingWarning.value = null
  shownWarningId = null
}

const startWarningPolling = () => {
  if (!userStore.isStudent) {
    return
  }

  fetchPendingWarning()
  warningPollTimer = setInterval(fetchPendingWarning, 30000)
}

const stopWarningPolling = () => {
  if (warningPollTimer) {
    clearInterval(warningPollTimer)
    warningPollTimer = null
  }
}

onMounted(async () => {
  if (userStore.token && !userStore.userInfo) {
    await userStore.fetchUserInfo()
  }
  startWarningPolling()
})

onUnmounted(() => {
  stopWarningPolling()
})

watch(
  () => userStore.isStudent,
  (isStudent) => {
    stopWarningPolling()
    pendingWarning.value = null
    warningDialogVisible.value = false
    shownWarningId = null

    if (isStudent) {
      startWarningPolling()
    }
  }
)
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.main-header {
  height: 56px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.header-left {
  min-width: 0;
}

.app-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.main-content {
  flex: 1;
  overflow: auto;
}
</style>
