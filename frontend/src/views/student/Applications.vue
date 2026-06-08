<template>
  <div class="applications-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>投递记录管理</span>
          <div class="header-actions">
            <el-button @click="goToDashboard">
              <el-icon><ArrowLeft /></el-icon>
              返回看板
            </el-button>
            <el-button @click="refreshData">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 筛选栏 -->
      <FilterBar
        :model-value="filters"
        :channel-options="channelOptions"
        :type-options="typeOptions"
        :status-options="statusOptions"
        :location-options="locationOptions"
        @update:model-value="syncFilters"
      />

      <!-- 筛选状态标签 -->
      <div v-if="activeFilters.length > 0" class="filter-tags">
        <div class="filter-tags-label">
          <el-icon><Filter /></el-icon>
          <span>已选条件：</span>
        </div>
        <div class="filter-tags-list">
          <el-tag 
            v-for="(tag, index) in activeFilters" 
            :key="index" 
            closable 
            @close="removeFilter(tag.key)"
          >
            {{ tag.label }}: {{ tag.value }}
          </el-tag>
          <el-button size="small" type="text" @click="clearAllFilters">
            清除全部
          </el-button>
        </div>
      </div>

      <!-- 结果统计 -->
      <div class="result-stats">
        <span>共 <strong>{{ filteredApplications.length }}</strong> 条记录</span>
        <span v-if="filteredApplications.length !== applications.length" class="filtered-hint">
          （已筛选，原始 {{ applications.length }} 条）
        </span>
      </div>

      <div class="table-tip">
        <el-icon><InfoFilled /></el-icon>
        <span>双击单元格可直接编辑，修改后自动保存</span>
      </div>

      <!-- 表格 -->
      <el-table 
        ref="tableRef"
        :data="tableData" 
        style="width: 100%" 
        v-loading="loading"
        border
        class="editable-table"
        :header-cell-style="{ 'user-select': 'none' }"
        :span-method="spanMethod"
        :row-class-name="rowClassName"
        @header-dragend="handleHeaderDragend"
        @row-contextmenu="handleRowContextMenu"
        @row-click="handleRowClick"
      >
        <el-table-column label="#" width="50" align="center">
          <template #default="{ row, $index }">
            <template v-if="row.isAddRow">
              <div class="add-row-trigger">
                <el-icon><Plus /></el-icon>
              </div>
            </template>
            <template v-else>
              {{ $index + 1 }}
            </template>
          </template>
        </el-table-column>
        
        <el-table-column label="公司" min-width="180" resizable>
          <template #default="{ row }">
            <template v-if="!row.isAddRow">
              <editable-cell 
                :value="row.company" 
                :row="row" 
                field="company"
                @update="(field, val) => handleCellUpdate(row, field, val)"
              />
            </template>
          </template>
        </el-table-column>
        
        <el-table-column label="岗位" min-width="150" resizable>
          <template #default="{ row }">
            <template v-if="!row.isAddRow">
              <editable-select-cell 
                :value="row.position" 
                :row="row" 
                field="position"
                :options="positionOptions"
                @update="(field, val) => handleCellUpdate(row, field, val)"
              />
            </template>
          </template>
        </el-table-column>
        
        <el-table-column label="投递时间" width="120" resizable>
          <template #default="{ row }">
            <template v-if="!row.isAddRow">
              <editable-date-cell 
                :value="row.applicationDate" 
                :row="row" 
                field="applicationDate"
                @update="(field, val) => handleCellUpdate(row, field, val)"
              />
            </template>
          </template>
        </el-table-column>
        
        <el-table-column label="渠道" width="120" resizable>
          <template #default="{ row }">
            <template v-if="!row.isAddRow">
              <editable-select-cell 
                :value="row.channel" 
                :row="row" 
                field="channel"
                :options="channelOptions"
                @update="(field, val) => handleCellUpdate(row, field, val)"
              />
            </template>
          </template>
        </el-table-column>
        
        <el-table-column label="类型" width="100" resizable>
          <template #default="{ row }">
            <template v-if="!row.isAddRow">
              <editable-select-cell 
                :value="row.type" 
                :row="row" 
                field="type"
                :options="typeOptions"
                @update="(field, val) => handleCellUpdate(row, field, val)"
              />
            </template>
          </template>
        </el-table-column>
        
        <el-table-column label="进展" width="120" resizable>
          <template #default="{ row }">
            <template v-if="!row.isAddRow">
              <editable-select-cell 
                :value="row.status" 
                :row="row" 
                field="status"
                :options="statusOptions"
                @update="(field, val) => handleCellUpdate(row, field, val)"
              >
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.value)" size="small">{{ scope.value }}</el-tag>
                </template>
              </editable-select-cell>
            </template>
          </template>
        </el-table-column>
        
        <el-table-column label="地点" width="100" resizable>
          <template #default="{ row }">
            <template v-if="!row.isAddRow">
              <editable-select-cell 
                :value="row.location" 
                :row="row" 
                field="location"
                :options="locationOptions"
                @update="(field, val) => handleCellUpdate(row, field, val)"
              />
            </template>
          </template>
        </el-table-column>
        
        <el-table-column label="重视度" width="100" resizable>
          <template #default="{ row }">
            <template v-if="!row.isAddRow">
              <div class="rate-cell">
                <el-rate
                  v-model="row.priority"
                  :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                  @change="handlePriorityChange(row)"
                  style="font-size: 14px"
                />
              </div>
            </template>
          </template>
        </el-table-column>
        
        <el-table-column label="备注" min-width="200" resizable>
          <template #default="{ row }">
            <template v-if="!row.isAddRow">
              <editable-cell 
                :value="row.remarks" 
                :row="row" 
                field="remarks"
                type="textarea"
                @update="(field, val) => handleCellUpdate(row, field, val)"
              />
            </template>
          </template>
        </el-table-column>
      </el-table>

      <!-- 右键菜单 -->
      <div 
        v-if="contextMenuVisible" 
        class="context-menu"
        :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
      >
        <div class="context-menu-item" @click="handleDelete(selectedRow)">
          <el-icon><Delete /></el-icon>
          <span>删除此行</span>
        </div>
        <div class="context-menu-item" @click="openPresetManager">
          <el-icon><Setting /></el-icon>
          <span>管理预设值</span>
        </div>
      </div>

      <!-- 预设值管理对话框 -->
      <el-dialog
        v-model="presetDialogVisible"
        title="管理预设值"
        width="500px"
      >
        <div class="preset-manager">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="岗位" name="position">
              <div class="preset-options">
                <div 
                  v-for="(option, index) in positionOptions" 
                  :key="option"
                  class="preset-option-item"
                >
                  <span>{{ option }}</span>
                  <el-button 
                    type="danger" 
                    size="small" 
                    circle
                    @click="removePreset('position', index)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
              <div class="add-preset">
                <el-input 
                  v-model="newPresetValue" 
                  placeholder="输入新的岗位"
                  @keyup.enter="addPreset('position')"
                />
                <el-button type="primary" @click="addPreset('position')">添加</el-button>
              </div>
            </el-tab-pane>
            <el-tab-pane label="渠道" name="channel">
              <div class="preset-options">
                <div 
                  v-for="(option, index) in channelOptions" 
                  :key="option"
                  class="preset-option-item"
                >
                  <span>{{ option }}</span>
                  <el-button 
                    type="danger" 
                    size="small" 
                    circle
                    @click="removePreset('channel', index)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
              <div class="add-preset">
                <el-input 
                  v-model="newPresetValue" 
                  placeholder="输入新的渠道"
                  @keyup.enter="addPreset('channel')"
                />
                <el-button type="primary" @click="addPreset('channel')">添加</el-button>
              </div>
            </el-tab-pane>
            <el-tab-pane label="类型" name="type">
              <div class="preset-options">
                <div 
                  v-for="(option, index) in typeOptions" 
                  :key="option"
                  class="preset-option-item"
                >
                  <span>{{ option }}</span>
                  <el-button 
                    type="danger" 
                    size="small" 
                    circle
                    @click="removePreset('type', index)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
              <div class="add-preset">
                <el-input 
                  v-model="newPresetValue" 
                  placeholder="输入新的类型"
                  @keyup.enter="addPreset('type')"
                />
                <el-button type="primary" @click="addPreset('type')">添加</el-button>
              </div>
            </el-tab-pane>
            <el-tab-pane label="进展" name="status">
              <div class="preset-options">
                <div 
                  v-for="(option, index) in statusOptions" 
                  :key="option"
                  class="preset-option-item"
                >
                  <span>{{ option }}</span>
                  <el-button 
                    type="danger" 
                    size="small" 
                    circle
                    @click="removePreset('status', index)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
              <div class="add-preset">
                <el-input 
                  v-model="newPresetValue" 
                  placeholder="输入新的进展"
                  @keyup.enter="addPreset('status')"
                />
                <el-button type="primary" @click="addPreset('status')">添加</el-button>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="presetDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="savePresets">保存</el-button>
          </span>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, InfoFilled, ArrowLeft, Delete, Setting, Filter } from '@element-plus/icons-vue'
import applicationApi from '@/api/application'
import userConfigApi from '@/api/user-config'
import type { Application } from '@/types'
import EditableCell from '@/components/EditableCell.vue'
import EditableSelectCell from '@/components/EditableSelectCell.vue'
import EditableDateCell from '@/components/EditableDateCell.vue'
import FilterBar, { type FilterConditions } from '@/components/FilterBar.vue'
import { sortedCities } from '@/utils/cities'

const router = useRouter()
const route = useRoute()
const tableRef = ref()

const applications = ref<Application[]>([])
const loading = ref(false)

const filters = reactive<FilterConditions>({
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

const formatFilterDate = (val: string | Date | null | undefined) => {
  if (!val) return ''
  if (val instanceof Date) return val.toISOString().split('T')[0]
  return String(val)
}

const normalizeFilterValue = (value: FilterConditions): FilterConditions => ({
  ...value,
  applicationDateStart: formatFilterDate(value.applicationDateStart),
  applicationDateEnd: formatFilterDate(value.applicationDateEnd),
})

const syncFilters = (value: FilterConditions) => {
  Object.assign(filters, normalizeFilterValue(value))
}

// 筛选后的应用列表
const filteredApplications = computed(() => {
  return applications.value.filter(item => {
    if (filters.company && !(item.company ?? '').toLowerCase().includes(filters.company.toLowerCase())) return false
    if (filters.position && !(item.position ?? '').toLowerCase().includes(filters.position.toLowerCase())) return false
    if (filters.channel && item.channel !== filters.channel) return false
    if (filters.type && item.type !== filters.type) return false
    if (filters.status && item.status !== filters.status) return false
    if (filters.location && item.location !== filters.location) return false
    if (filters.applicationDateStart && item.applicationDate < filters.applicationDateStart) return false
    if (filters.applicationDateEnd && item.applicationDate > filters.applicationDateEnd) return false
    if (filters.priorityMin != null && (item.priority ?? 0) < filters.priorityMin) return false
    if (filters.priorityMax != null && (item.priority ?? 0) > filters.priorityMax) return false
    if (filters.remarks && !(item.remarks ?? '').toLowerCase().includes(filters.remarks.toLowerCase())) return false
    return true
  })
})

// 当前激活的筛选条件标签
const activeFilters = computed(() => {
  const tags: Array<{ key: string; label: string; value: string }> = []
  if (filters.company) tags.push({ key: 'company', label: '公司', value: filters.company })
  if (filters.position) tags.push({ key: 'position', label: '岗位', value: filters.position })
  if (filters.channel) tags.push({ key: 'channel', label: '渠道', value: filters.channel })
  if (filters.type) tags.push({ key: 'type', label: '类型', value: filters.type })
  if (filters.status) tags.push({ key: 'status', label: '进展', value: filters.status })
  if (filters.location) tags.push({ key: 'location', label: '地点', value: filters.location })
  if (filters.applicationDateStart) tags.push({ key: 'applicationDateStart', label: '开始日期', value: filters.applicationDateStart })
  if (filters.applicationDateEnd) tags.push({ key: 'applicationDateEnd', label: '结束日期', value: filters.applicationDateEnd })
  if (filters.priorityMin != null) tags.push({ key: 'priorityMin', label: '最低重视度', value: filters.priorityMin.toString() })
  if (filters.priorityMax != null) tags.push({ key: 'priorityMax', label: '最高重视度', value: filters.priorityMax.toString() })
  if (filters.remarks) tags.push({ key: 'remarks', label: '备注', value: filters.remarks })
  return tags
})

// 表格数据，包含添加行按钮
const tableData = computed(() => {
  return [...filteredApplications.value, { isAddRow: true }]
})

// 右键菜单相关
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const selectedRow = ref<any>(null)

// 预设值管理相关
const presetDialogVisible = ref(false)
const activeTab = ref('position')
const newPresetValue = ref('')

// 选项数据
const channelOptions = ref([
  'Boss 直聘',
  '实习僧',
  '公司官网',
  '内推',
  '智联招聘',
  '牛客网',
  '其他',
])

const typeOptions = ref([
  '实习',
  '秋招正式批',
])

const statusOptions = ref([
  '已投递/未处理',
  '简历筛选',
  '笔试/测评',
  '面试中',
  'OC',
  'Offer',
  '已拒',
  '已结束',
])

// 岗位选项（从 localStorage 读取或初始值）
const defaultPositionOptions = [
  '后端开发',
  '前端开发',
  '全栈开发',
  '移动端开发',
  '测试开发',
  '算法工程师',
  '数据分析师',
  '产品经理',
  '运营',
]

const positionOptions = ref<string[]>([])

// 初始化岗位选项
const initPositionOptions = () => {
  const saved = localStorage.getItem('position-options')
  if (saved) {
    positionOptions.value = JSON.parse(saved)
  } else {
    positionOptions.value = defaultPositionOptions
  }
}

const locationOptions = sortedCities

const fetchApplications = async () => {
  loading.value = true
  try {
    const res = await applicationApi.list()
    applications.value = res.data
  } catch (error) {
    console.error('获取投递记录失败:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  fetchApplications()
}

const goToDashboard = () => {
  router.push('/dashboard')
}

// 移除单个筛选条件
const removeFilter = (key: string) => {
  (filters as any)[key] = key.startsWith('priority') ? null : ''
}

// 清除所有筛选条件
const clearAllFilters = () => {
  Object.keys(filters).forEach(key => {
    (filters as any)[key] = key.startsWith('priority') ? null : ''
  })
}

// 新增一行
const handleAddRow = async () => {
  try {
    const defaultData = {
      company: '新公司',
      position: '岗位名称',
      applicationDate: new Date().toISOString().split('T')[0],
      channel: '',
      type: '秋招正式批',
      status: '已投递/未处理',
      location: '',
      priority: 3,
      remarks: '',
    }
    
    const res = await applicationApi.create(defaultData)
    applications.value.unshift(res.data)
    ElMessage.success('新增成功，双击单元格可编辑')
  } catch (error: any) {
    console.error('新增失败:', error)
  }
}

// 单元格更新
const handleCellUpdate = async (row: any, field: string, value: any) => {
  try {
    await applicationApi.update(row.id, { [field]: value })
    row[field] = value
    
    ElMessage.success('保存成功')
  } catch (error: any) {
    console.error('更新失败:', error)
    ElMessage.error('更新失败：' + (error.message || '未知错误'))
  }
}

// 重视度改变
const handlePriorityChange = async (row: Application) => {
  try {
    await applicationApi.update(row.id, { priority: row.priority })
  } catch (error: any) {
    console.error('更新失败:', error)
  }
}

// 删除记录
const handleDelete = async (row: Application) => {
  try {
    await ElMessageBox.confirm('确定要删除这条投递记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await applicationApi.delete(row.id)
    ElMessage.success('删除成功')
    fetchApplications()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

// 处理列宽拖动
const handleHeaderDragend = async (newWidth: number, oldWidth: number, column: any, event: Event) => {
  const columnKey = column.property || column.label
  const configKey = `table-column-width-${columnKey}`
  try {
    await userConfigApi.save(configKey, newWidth.toString())
  } catch (error) {
    console.error('保存列宽失败:', error)
    localStorage.setItem(configKey, newWidth.toString())
  }
}

// 处理行右键菜单
const handleRowContextMenu = (row: any, column: any, event: MouseEvent) => {
  if (row.isAddRow) {
    return
  }
  
  event.preventDefault()
  event.stopPropagation()
  
  selectedRow.value = row
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY
  contextMenuVisible.value = true
}

// 打开预设值管理对话框
const openPresetManager = () => {
  contextMenuVisible.value = false
  presetDialogVisible.value = true
  newPresetValue.value = ''
  activeTab.value = 'position'
}

// 添加预设值
const addPreset = (type: string) => {
  if (!newPresetValue.value.trim()) {
    ElMessage.warning('请输入预设值内容')
    return
  }
  
  switch (type) {
    case 'position':
      if (!positionOptions.value.includes(newPresetValue.value.trim())) {
        positionOptions.value.push(newPresetValue.value.trim())
      } else {
        ElMessage.warning('该预设值已存在')
      }
      break
    case 'channel':
      if (!channelOptions.value.includes(newPresetValue.value.trim())) {
        channelOptions.value.push(newPresetValue.value.trim())
      } else {
        ElMessage.warning('该预设值已存在')
      }
      break
    case 'type':
      if (!typeOptions.value.includes(newPresetValue.value.trim())) {
        typeOptions.value.push(newPresetValue.value.trim())
      } else {
        ElMessage.warning('该预设值已存在')
      }
      break
    case 'status':
      if (!statusOptions.value.includes(newPresetValue.value.trim())) {
        statusOptions.value.push(newPresetValue.value.trim())
      } else {
        ElMessage.warning('该预设值已存在')
      }
      break
  }
  newPresetValue.value = ''
}

// 删除预设值
const removePreset = (type: string, index: number) => {
  switch (type) {
    case 'position':
      positionOptions.value.splice(index, 1)
      break
    case 'channel':
      channelOptions.value.splice(index, 1)
      break
    case 'type':
      typeOptions.value.splice(index, 1)
      break
    case 'status':
      statusOptions.value.splice(index, 1)
      break
  }
}

// 保存预设值
const savePresets = () => {
  localStorage.setItem('position-options', JSON.stringify(positionOptions.value))
  localStorage.setItem('channel-options', JSON.stringify(channelOptions.value))
  localStorage.setItem('type-options', JSON.stringify(typeOptions.value))
  localStorage.setItem('status-options', JSON.stringify(statusOptions.value))
  
  ElMessage.success('预设值保存成功')
  presetDialogVisible.value = false
}

// 初始化所有预设值
const initPresets = () => {
  initPositionOptions()
  
  const savedChannel = localStorage.getItem('channel-options')
  if (savedChannel) {
    channelOptions.value = JSON.parse(savedChannel)
  }
  
  const savedType = localStorage.getItem('type-options')
  if (savedType) {
    typeOptions.value = JSON.parse(savedType)
  }
  
  const savedStatus = localStorage.getItem('status-options')
  if (savedStatus) {
    statusOptions.value = JSON.parse(savedStatus)
  }
}

// 关闭右键菜单
const closeContextMenu = () => {
  contextMenuVisible.value = false
  selectedRow.value = null
}

// 加载用户配置并应用列宽
const loadUserConfigs = async () => {
  try {
    const response = await userConfigApi.getList()
    if (response.success && response.data) {
      const configs = response.data
      nextTick(() => {
        if (tableRef.value) {
          configs.forEach(config => {
            if (config.configKey.startsWith('table-column-width-')) {
              const columnKey = config.configKey.replace('table-column-width-', '')
              const width = parseInt(config.configValue)
              if (!isNaN(width)) {
                const columns = tableRef.value.columns
                const column = columns.find(col => col.property === columnKey || col.label === columnKey)
                if (column) {
                  column.width = width
                }
              }
            }
          })
          tableRef.value.doLayout()
        }
      })
    }
  } catch (error) {
    console.error('加载用户配置失败:', error)
    loadFromLocalStorage()
  }
}

// 从localStorage加载列宽
const loadFromLocalStorage = () => {
  nextTick(() => {
    if (tableRef.value) {
      const columns = tableRef.value.columns
      columns.forEach(column => {
        const columnKey = column.property || column.label
        const configKey = `table-column-width-${columnKey}`
        const widthStr = localStorage.getItem(configKey)
        if (widthStr) {
          const width = parseInt(widthStr)
          if (!isNaN(width)) {
            column.width = width
          }
        }
      })
      tableRef.value.doLayout()
    }
  })
}

onMounted(async () => {
  initPresets()
  await fetchApplications()
  await loadUserConfigs()
  
  if (route.query.add === 'true') {
    await handleAddRow()
  }
  
  document.addEventListener('click', closeContextMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu)
})

// 合并添加行的所有列为一个单元格
const spanMethod = ({ row, columnIndex }: { row: any; column: any; rowIndex: number; columnIndex: number }) => {
  if (row.isAddRow) {
    if (columnIndex === 0) {
      return { rowspan: 1, colspan: 10 }
    } else {
      return { rowspan: 0, colspan: 0 }
    }
  }
  return { rowspan: 1, colspan: 1 }
}

// 添加行的行样式
const rowClassName = ({ row }: { row: any }) => {
  return row.isAddRow ? 'add-row' : ''
}

// 行点击事件（用于添加行）
const handleRowClick = (row: any) => {
  if (row.isAddRow) {
    handleAddRow()
  }
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    '已投递/未处理': 'info',
    '简历筛选': '',
    '笔试/测评': 'warning',
    '面试中': 'primary',
    'OC': 'success',
    'Offer': 'success',
    '已拒': 'danger',
    '已结束': 'info',
  }
  return typeMap[status] || ''
}
</script>

<style scoped>
.applications-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* 筛选状态标签 */
.filter-tags {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #fffbe6;
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid #ffe58f;
}

.filter-tags-label {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #d48806;
  font-weight: 500;
  flex-shrink: 0;
}

.filter-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

/* 结果统计 */
.result-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
}

.result-stats strong {
  color: #409eff;
  font-size: 16px;
}

.filtered-hint {
  color: #909399;
  font-size: 12px;
}

.table-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  color: #909399;
  font-size: 13px;
}

/* 列宽拖动把手 */
.editable-table :deep(.el-table__header .el-table__cell) {
  overflow: visible;
}

.editable-table :deep(.el-table__header .el-table__cell:hover::after) {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 8px;
  cursor: col-resize;
  background-color: transparent;
}

.editable-table :deep(.el-table__header .el-table__cell.el-table__cell--resizing:hover::after) {
  background-color: #409eff;
  opacity: 0.5;
}

/* 右键菜单 */
.context-menu {
  position: fixed;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  z-index: 9999;
  min-width: 120px;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
  transition: background-color 0.2s;
}

.context-menu-item:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.context-menu-item .el-icon {
  font-size: 16px;
}

/* 重视度（rate）单元格——保持 cell-root 的 padding 一致 */
.rate-cell {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 12px;
  box-sizing: border-box;
}

/* 添加行：飞书风格，整行一体 */
.editable-table :deep(.add-row td) {
  border-right: none !important;
}

.editable-table :deep(.add-row:hover td) {
  background-color: #f5f7fa !important;
}

.add-row-trigger {
  width: 100%;
  height: 100%;
  min-height: 40px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
  cursor: pointer;
  color: #c0c4cc;
  font-size: 16px;
}

.add-row-trigger:hover {
  color: #409eff;
}

.editable-table :deep(.add-row) {
  cursor: pointer;
}

/* 预设值管理对话框 */
.preset-manager {
  padding: 10px 0;
}

.preset-options {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
}

.preset-option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  border-bottom: 1px solid #f0f0f0;
}

.preset-option-item:last-child {
  border-bottom: none;
}

.add-preset {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.add-preset .el-input {
  flex: 1;
}

.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .filter-tags {
    flex-direction: column;
  }
  
  .result-stats {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>