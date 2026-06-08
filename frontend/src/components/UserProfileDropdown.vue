<template>
  <div class="user-profile-area">
    <el-dropdown trigger="click" @visible-change="handleVisibleChange">
      <span class="user-trigger">
        <el-avatar :size="32" class="user-avatar">
          {{ avatarText }}
        </el-avatar>
        <span class="user-name">{{ userStore.userInfo?.name || userStore.userInfo?.username }}</span>
        <el-tag size="small" :type="userStore.isTeacher ? 'warning' : 'success'">
          {{ userStore.isTeacher ? '老师' : '学生' }}
        </el-tag>
        <el-icon><ArrowDown /></el-icon>
      </span>
      <template #dropdown>
        <div class="profile-panel">
          <template v-if="userStore.isStudent">
            <div class="profile-item">
              <span class="label">姓名</span>
              <span class="value">{{ userStore.userInfo?.name || '-' }}</span>
            </div>
            <div class="profile-item">
              <span class="label">账号</span>
              <span class="value">{{ userStore.userInfo?.username || '-' }}</span>
            </div>
            <div class="profile-item">
              <span class="label">学习方向</span>
              <span class="value">{{ userStore.userInfo?.className || '-' }}</span>
            </div>
          </template>

          <template v-else>
            <div class="profile-item">
              <span class="label">账号</span>
              <span class="value">{{ userStore.userInfo?.username || '-' }}</span>
            </div>
            <div class="profile-item editable">
              <span class="label">姓名</span>
              <el-input v-model="teacherName" placeholder="请输入姓名" />
            </div>
            <div class="profile-actions">
              <el-button type="primary" size="small" :loading="saving" @click="saveTeacherName">
                保存
              </el-button>
            </div>
          </template>
        </div>
      </template>
    </el-dropdown>

    <el-button type="danger" link @click="handleLogout">
      退出登录
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const teacherName = ref('')
const saving = ref(false)

const avatarText = computed(() => {
  const name = userStore.userInfo?.name || userStore.userInfo?.username || '?'
  return name.slice(0, 1)
})

const handleVisibleChange = (visible: boolean) => {
  if (visible && userStore.isTeacher) {
    teacherName.value = userStore.userInfo?.name || ''
  }
}

const saveTeacherName = async () => {
  const name = teacherName.value.trim()
  if (!name) {
    ElMessage.warning('请填写姓名')
    return
  }

  saving.value = true
  try {
    await userStore.updateProfile({ name })
    ElMessage.success('姓名已更新')
  } catch (error: any) {
    ElMessage.error(error.message || '更新失败')
  } finally {
    saving.value = false
  }
}

const handleLogout = () => {
  userStore.logoutAndRedirect(router)
}
</script>

<style scoped>
.user-profile-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #303133;
}

.user-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.user-avatar {
  background: #409eff;
  color: #fff;
}

.profile-panel {
  width: 280px;
  padding: 12px 16px;
}

.profile-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.profile-item.editable {
  margin-bottom: 8px;
}

.profile-item .label {
  font-size: 12px;
  color: #909399;
}

.profile-item .value {
  font-size: 14px;
  color: #303133;
  word-break: break-all;
}

.profile-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
