<template>
  <div class="filter-bar">
    <div class="filter-header" @click="toggleCollapse">
      <div class="filter-title">
        <el-icon class="filter-icon"><Filter /></el-icon>
        <span>筛选条件</span>
        <el-tag v-if="hasActiveFilters" type="warning" size="small">{{ activeFilterCount }} 个条件</el-tag>
      </div>
      <el-icon class="collapse-icon" :class="{ rotated: isCollapsed }"><ArrowDown /></el-icon>
    </div>

    <transition name="slide">
      <div v-show="!isCollapsed" class="filter-content">
        <el-form :model="localFilters" class="filter-form" inline>
          <div class="filter-row">
            <el-form-item label="公司" class="filter-item">
              <el-input 
                v-model="localFilters.company" 
                placeholder="模糊搜索公司名称"
                clearable
                class="filter-input"
                @input="emitChange"
              />
            </el-form-item>

            <el-form-item label="岗位" class="filter-item">
              <el-input 
                v-model="localFilters.position" 
                placeholder="模糊搜索岗位名称"
                clearable
                class="filter-input"
                @input="emitChange"
              />
            </el-form-item>

            <el-form-item label="渠道" class="filter-item">
              <el-select 
                v-model="localFilters.channel" 
                placeholder="全部渠道"
                clearable
                class="filter-select"
                @change="emitChange"
              >
                <el-option 
                  v-for="option in channelOptions" 
                  :key="option" 
                  :label="option" 
                  :value="option" 
                />
              </el-select>
            </el-form-item>

            <el-form-item label="类型" class="filter-item">
              <el-select 
                v-model="localFilters.type" 
                placeholder="全部类型"
                clearable
                class="filter-select"
                @change="emitChange"
              >
                <el-option 
                  v-for="option in typeOptions" 
                  :key="option" 
                  :label="option" 
                  :value="option" 
                />
              </el-select>
            </el-form-item>

            <el-form-item label="进展" class="filter-item">
              <el-select 
                v-model="localFilters.status" 
                placeholder="全部进展"
                clearable
                class="filter-select"
                @change="emitChange"
              >
                <el-option 
                  v-for="option in statusOptions" 
                  :key="option" 
                  :label="option" 
                  :value="option" 
                />
              </el-select>
            </el-form-item>
          </div>

          <div class="filter-row">
            <el-form-item label="地点" class="filter-item">
              <el-select 
                v-model="localFilters.location" 
                placeholder="选择地点"
                clearable
                class="filter-select"
                filterable
                @change="emitChange"
              >
                <el-option 
                  v-for="option in locationOptions" 
                  :key="option" 
                  :label="option" 
                  :value="option" 
                />
              </el-select>
            </el-form-item>

            <el-form-item label="投递日期" class="filter-item date-range-item">
              <div class="date-range">
                <el-date-picker 
                  v-model="localFilters.applicationDateStart" 
                  type="date" 
                  placeholder="开始日期"
                  clearable
                  value-format="YYYY-MM-DD"
                  class="date-picker"
                  @change="emitChange"
                />
                <span class="date-separator">至</span>
                <el-date-picker 
                  v-model="localFilters.applicationDateEnd" 
                  type="date" 
                  placeholder="结束日期"
                  clearable
                  value-format="YYYY-MM-DD"
                  class="date-picker"
                  @change="emitChange"
                />
              </div>
            </el-form-item>

            <el-form-item label="重视度" class="filter-item priority-item">
              <div class="priority-range">
                <el-input-number 
                  v-model="localFilters.priorityMin" 
                  :min="1" 
                  :max="5" 
                  placeholder="最小"
                  class="priority-input"
                  @change="emitChange"
                />
                <span class="priority-separator">-</span>
                <el-input-number 
                  v-model="localFilters.priorityMax" 
                  :min="1" 
                  :max="5" 
                  placeholder="最大"
                  class="priority-input"
                  @change="emitChange"
                />
              </div>
            </el-form-item>

            <el-form-item label="备注" class="filter-item">
              <el-input 
                v-model="localFilters.remarks" 
                placeholder="搜索备注内容"
                clearable
                class="filter-input"
                @input="emitChange"
              />
            </el-form-item>
          </div>

          <div class="filter-actions">
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </div>
        </el-form>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Filter, ArrowDown, Refresh } from '@element-plus/icons-vue'

export interface FilterConditions {
  company: string
  position: string
  channel: string
  type: string
  status: string
  location: string
  applicationDateStart: string
  applicationDateEnd: string
  priorityMin: number | null
  priorityMax: number | null
  remarks: string
}

const props = defineProps<{
  channelOptions: string[]
  typeOptions: string[]
  statusOptions: string[]
  locationOptions: string[]
  modelValue: FilterConditions
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FilterConditions]
}>()

const isActiveFilterValue = (v: unknown) => v != null && v !== ''

const isCollapsed = ref(false)

const localFilters = reactive<FilterConditions>({
  company: '',
  position: '',
  channel: '',
  type: '',
  status: '',
  location: '',
  applicationDateStart: '',
  applicationDateEnd: '',
  priorityMin: null,
  priorityMax: null,
  remarks: '',
})

watch(() => props.modelValue, (newVal) => {
  Object.assign(localFilters, newVal)
}, { immediate: true, deep: true })

const hasActiveFilters = computed(() => {
  return Object.values(localFilters).some(isActiveFilterValue)
})

const activeFilterCount = computed(() => {
  return Object.values(localFilters).filter(isActiveFilterValue).length
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const emitChange = () => {
  emit('update:modelValue', { ...localFilters })
}

const handleReset = () => {
  const emptyFilters: FilterConditions = {
    company: '',
    position: '',
    channel: '',
    type: '',
    status: '',
    location: '',
    applicationDateStart: '',
    applicationDateEnd: '',
    priorityMin: null,
    priorityMax: null,
    remarks: '',
  }
  Object.assign(localFilters, emptyFilters)
  emit('update:modelValue', { ...emptyFilters })
}
</script>

<style scoped>
.filter-bar {
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid #e4e7ed;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  user-select: none;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #606266;
}

.filter-icon {
  color: #409eff;
}

.collapse-icon {
  font-size: 16px;
  color: #909399;
  transition: transform 0.3s ease;
}

.collapse-icon.rotated {
  transform: rotate(180deg);
}

.filter-content {
  padding: 0 16px 16px;
}

.filter-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.filter-item {
  margin-bottom: 0;
}

.filter-input {
  width: 180px;
}

.filter-select {
  width: 150px;
}

.date-range-item {
  display: flex;
  align-items: center;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-picker {
  width: 140px;
}

.date-separator {
  color: #909399;
  font-size: 14px;
}

.priority-item {
  display: flex;
  align-items: center;
}

.priority-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.priority-input {
  width: 80px;
}

.priority-separator {
  color: #909399;
  font-size: 14px;
}

.filter-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px dashed #e4e7ed;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}

.slide-enter-to,
.slide-leave-from {
  max-height: 500px;
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-input,
  .filter-select {
    width: 100%;
  }

  .date-range {
    flex-direction: column;
  }

  .date-picker {
    width: 100%;
  }

  .priority-range {
    flex-direction: column;
  }

  .priority-input {
    width: 100%;
  }
}
</style>