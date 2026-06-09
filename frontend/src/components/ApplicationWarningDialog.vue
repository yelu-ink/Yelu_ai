<template>
  <el-dialog
    v-model="visible"
    title="投递预警"
    width="420px"
    :close-on-click-modal="false"
    :show-close="false"
  >
    <div class="warning-content">
      <p class="warning-date">今天是 <strong>{{ todayLabel }}</strong></p>
      <p class="warning-count">近期的投递量为 <strong>{{ recentCount }}</strong> 家</p>
      <p class="warning-message">
        老师提醒你目前投递量较少，请注意时间安排，尽快投递！
      </p>
    </div>
    <template #footer>
      <el-button type="primary" :loading="confirming" @click="handleConfirm">
        我知道了
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import applicationApi from '@/api/application'

const props = defineProps<{
  warningId: number
  recentCount: number
}>()

const emit = defineEmits<{
  confirmed: []
}>()

const visible = defineModel<boolean>({ required: true })

const confirming = ref(false)

const todayLabel = computed(() => {
  const now = new Date()
  return `${now.getMonth() + 1}月${now.getDate()}日`
})

const handleConfirm = async () => {
  confirming.value = true
  try {
    await applicationApi.markApplicationWarningRead(props.warningId)
    visible.value = false
    emit('confirmed')
  } catch (error: any) {
    console.error('标记预警已读失败:', error)
  } finally {
    confirming.value = false
  }
}
</script>

<style scoped>
.warning-content {
  line-height: 1.8;
  color: #303133;
}

.warning-date,
.warning-count {
  margin: 0 0 12px;
  font-size: 15px;
}

.warning-message {
  margin: 16px 0 0;
  padding: 12px;
  background: #fdf6ec;
  border-radius: 6px;
  color: #e6a23c;
  font-size: 14px;
}
</style>
