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
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import UserProfileDropdown from '@/components/UserProfileDropdown.vue'

const userStore = useUserStore()

onMounted(() => {
  if (userStore.token && !userStore.userInfo) {
    userStore.fetchUserInfo()
  }
})
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
