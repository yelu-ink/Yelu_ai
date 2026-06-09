<template>
  <div class="direction-overview">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>学习方向数据</span>
            <el-select
              :model-value="className"
              placeholder="请选择学习方向"
              style="width: 200px; margin-left: 16px"
              @update:model-value="handleDirectionChange"
            >
              <el-option
                v-for="option in directionOptions"
                :key="option"
                :label="option"
                :value="option"
              />
            </el-select>
          </div>
          <div v-if="className" class="header-stats">
            <span>学生数：{{ stats.studentCount }}</span>
            <span>投递总数：{{ stats.totalApplications }}</span>
            <span>人均投递：{{ stats.avgApplications }}</span>
          </div>
        </div>
      </template>

      <template v-if="className">
        <el-row :gutter="20">
          <el-col :span="12" :xs="24">
            <el-card shadow="never" class="inner-card">
              <template #header>
                <span>进展分布</span>
              </template>
              <div ref="statusChartRef" style="height: 300px"></div>
            </el-card>
          </el-col>
          <el-col :span="12" :xs="24">
            <el-card shadow="never" class="inner-card">
              <template #header>
                <span>学生投递排名</span>
              </template>
              <el-table :data="studentRanks" style="width: 100%" :show-header="false">
                <el-table-column type="index" label="#" width="50" />
                <el-table-column prop="studentName" label="学生姓名" />
                <el-table-column prop="count" label="投递数" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getRankType(row.count)">{{ row.count }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>
        </el-row>

        <el-card shadow="never" class="inner-card applications-card">
          <template #header>
            <div class="card-header">
              <span>投递记录详情<span v-if="applications.length" class="record-count">（共 {{ applications.length }} 条）</span></span>
              <el-button type="success" @click="handleExport">
                <el-icon><Download /></el-icon>
                导出 Excel
              </el-button>
            </div>
          </template>

          <el-table
            :key="`${className}-${currentPage}`"
            :data="paginatedApplications"
            style="width: 100%"
            max-height="520"
            v-loading="loading"
          >
            <el-table-column prop="user.name" label="学生" width="100" />
            <el-table-column prop="user.className" label="班级" width="120" />
            <el-table-column prop="company" label="公司" min-width="150" />
            <el-table-column prop="position" label="岗位" min-width="120" />
            <el-table-column prop="applicationDate" label="投递时间" width="110" sortable />
            <el-table-column prop="channel" label="渠道" width="100" />
            <el-table-column prop="status" label="进展" width="110">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="location" label="地点" width="100" />
          </el-table>

          <div class="pagination-wrap">
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="applications.length"
              layout="total, prev, pager, next, jumper"
              background
              hide-on-single-page="false"
              @current-change="handlePageChange"
            />
          </div>
        </el-card>
      </template>

      <el-empty v-else description="请选择学习方向查看数据" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { Download } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import teacherApi from '@/api/teacher'
import type { ClassStatistics, Application } from '@/types'

const props = defineProps<{
  className: string
  directionOptions: string[]
}>()

const emit = defineEmits<{
  'update:className': [value: string]
}>()

const stats = ref<ClassStatistics>({
  className: '',
  studentCount: 0,
  totalApplications: 0,
  avgApplications: '0',
  statusCount: {},
  studentRanks: [],
})
const applications = ref<(Application & { user?: { name: string; className: string } })[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(15)

const paginatedApplications = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return applications.value.slice(start, start + pageSize.value)
})
const statusChartRef = ref<HTMLElement>()
const studentRanks = ref<Array<{ studentId: number; studentName: string; count: number }>>([])
let statusChart: ECharts | null = null

const handleDirectionChange = (value: string) => {
  emit('update:className', value)
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const fetchClassStats = async () => {
  if (!props.className) return

  try {
    const res = await teacherApi.getClassStatistics(props.className)
    stats.value = res.data
    studentRanks.value = res.data.studentRanks
    await nextTick()
    initStatusChart()
  } catch (error) {
    console.error('获取班级统计失败:', error)
  }
}

const fetchApplications = async () => {
  if (!props.className) return

  loading.value = true
  try {
    const res = await teacherApi.getApplications({ className: props.className })
    applications.value = res.data
    currentPage.value = 1
  } catch (error) {
    console.error('获取投递记录失败:', error)
  } finally {
    loading.value = false
  }
}

const loadDirectionData = async () => {
  if (!props.className) {
    applications.value = []
    studentRanks.value = []
    currentPage.value = 1
    return
  }
  await Promise.all([fetchClassStats(), fetchApplications()])
}

const initStatusChart = () => {
  if (!statusChartRef.value) return

  if (!statusChart) {
    statusChart = echarts.init(statusChartRef.value)
  }

  const statusData = Object.entries(stats.value.statusCount).map(([name, value]) => ({
    name,
    value,
  }))

  statusChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        type: 'pie',
        radius: '60%',
        data: statusData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  })
  statusChart.resize()
}

const handleExport = async () => {
  if (!props.className) return

  try {
    const blob = await teacherApi.exportApplications({ className: props.className })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${props.className}_投递记录.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出失败:', error)
  }
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, '' | 'success' | 'warning' | 'info' | 'primary' | 'danger'> = {
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

const getRankType = (count: number) => {
  if (count >= 10) return 'success'
  if (count >= 5) return 'primary'
  if (count >= 3) return 'warning'
  return 'info'
}

const handleResize = () => {
  statusChart?.resize()
}

watch(
  () => applications.value.length,
  () => {
    const maxPage = Math.max(1, Math.ceil(applications.value.length / pageSize.value))
    if (currentPage.value > maxPage) {
      currentPage.value = maxPage
    }
  }
)

watch(
  () => props.className,
  () => {
    loadDirectionData()
  }
)

onMounted(() => {
  loadDirectionData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  statusChart?.dispose()
  statusChart = null
})
</script>

<style scoped>
.direction-overview {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-weight: 600;
}

.header-stats {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 14px;
  color: #606266;
  font-weight: 400;
}

.inner-card {
  margin-bottom: 20px;
}

.applications-card {
  margin-bottom: 0;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.record-count {
  margin-left: 6px;
  font-size: 13px;
  font-weight: 400;
  color: #909399;
}

@media (max-width: 768px) {
  .header-stats {
    width: 100%;
    flex-wrap: wrap;
    gap: 10px;
  }
}
</style>
