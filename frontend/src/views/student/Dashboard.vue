<template>
  <div class="dashboard-container">
    <el-row :gutter="20" class="top-row">
      <el-col :span="12" :xs="24">
        <el-card class="ranking-card">
          <template #header>
            <div class="card-header ranking-header">
              <span>校招投递量排名</span>
              <el-alert
                v-if="rankingData.isBottom40 && rankingData.warningMessage"
                :title="rankingData.warningMessage"
                type="warning"
                :closable="false"
                show-icon
                class="ranking-warning"
              />
            </div>
          </template>
          <el-table
            :data="rankingData.rankings"
            style="width: 100%"
            max-height="360"
            v-loading="rankingLoading"
            :row-class-name="getRankingRowClass"
          >
            <el-table-column label="排名" width="80" align="center">
              <template #default="{ row }">
                <span
                  :class="{
                    'rank-danger': row.isCurrentUser && rankingData.isBottom40,
                    'rank-current': row.isCurrentUser && !rankingData.isBottom40,
                  }"
                >
                  {{ row.rank }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="姓名" width="140">
              <template #default="{ row }">
                <span>{{ row.maskedName }}</span>
                <el-tag v-if="row.isCurrentUser" type="primary" size="small" class="current-tag">
                  当前账号
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="className" label="学习方向" min-width="140" />
            <el-table-column prop="totalApplications" label="投递总数" width="100" align="center" sortable />
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="12" :xs="24">
        <el-card class="recommendation-card">
          <template #header>
            <div class="card-header">
              <span>校招公司投递推荐（实时更新）</span>
            </div>
          </template>
          <el-table
            :data="recommendations"
            style="width: 100%"
            max-height="360"
            v-loading="recommendLoading"
          >
            <el-table-column prop="company" label="公司" min-width="120" show-overflow-tooltip />
            <el-table-column prop="position" label="岗位" min-width="100" show-overflow-tooltip />
            <el-table-column prop="applicationDate" label="投递时间" width="110" />
            <el-table-column prop="channel" label="渠道" width="100" show-overflow-tooltip />
            <el-table-column prop="type" label="类型" width="100" />
            <el-table-column prop="location" label="地点" width="80" show-overflow-tooltip />
            <el-table-column label="进展" width="110">
              <template #default="{ row }">
                <el-tag v-if="row.status" :type="getStatusType(row.status)" size="small">
                  {{ row.status }}
                </el-tag>
                <span v-else class="text-muted">—</span>
              </template>
            </el-table-column>
            <el-table-column label="热度" width="80" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.applicationCount > 1" type="info" size="small">
                  {{ row.applicationCount }}人投递
                </el-tag>
                <span v-else class="text-muted">—</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="stats-card">
      <template #header>
        <div class="card-header">
          <span>投递统计</span>
          <div class="header-actions">
            <el-button @click="goToResourceLibrary">
              <el-icon><FolderOpened /></el-icon>
              校招资料库
            </el-button>
            <el-button @click="goToApplications">
              <el-icon><List /></el-icon>
              查看投递记录
            </el-button>
            <el-button type="primary" @click="goToApplicationsWithAdd">
              <el-icon><Plus /></el-icon>
              新增投递
            </el-button>
          </div>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="8" :xs="24">
          <div class="stat-item">
            <div class="stat-icon" style="background: #409eff">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.total }}</div>
              <div class="stat-label">投递总数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="8" :xs="24">
          <div class="stat-item">
            <div class="stat-icon" style="background: #67c23a">
              <el-icon><SuccessFilled /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ offerCount }}</div>
              <div class="stat-label">Offer 数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="8" :xs="24">
          <div class="stat-item">
            <div class="stat-icon" style="background: #e6a23c">
              <el-icon><VideoPlay /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ interviewCount }}</div>
              <div class="stat-label">面试中</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <RecruitmentTimeline />

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12" :xs="24">
        <el-card>
          <template #header>
            <span>进展分布</span>
          </template>
          <div ref="statusChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12" :xs="24">
        <el-card>
          <template #header>
            <span>投递趋势（近 7 天）</span>
          </template>
          <div ref="trendChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>投递渠道分布</span>
        </div>
      </template>
      <div ref="channelChartRef" style="height: 300px"></div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { Document, SuccessFilled, VideoPlay, List, Plus, FolderOpened } from '@element-plus/icons-vue'
import RecruitmentTimeline from '@/components/RecruitmentTimeline.vue'
import applicationApi from '@/api/application'
import type { ApplicationRanking, ApplicationRecommendation, Statistics } from '@/types'

const router = useRouter()

const rankingLoading = ref(false)
const recommendLoading = ref(false)
const recommendations = ref<ApplicationRecommendation[]>([])
let recommendPollTimer: ReturnType<typeof setInterval> | null = null
const rankingData = ref<ApplicationRanking>({
  rankings: [],
  currentRank: 0,
  totalStudents: 0,
  isBottom40: false,
})

const statistics = ref<Statistics>({
  total: 0,
  statusCount: {},
  typeCount: {},
  channelCount: {},
  trend: {},
})

const statusChartRef = ref<HTMLElement>()
const trendChartRef = ref<HTMLElement>()
const channelChartRef = ref<HTMLElement>()

let statusChart: ECharts | null = null
let trendChart: ECharts | null = null
let channelChart: ECharts | null = null

const offerCount = computed(() => statistics.value.statusCount['Offer'] || 0)
const interviewCount = computed(() => statistics.value.statusCount['面试中'] || 0)

const goToApplications = () => {
  router.push('/applications')
}

const goToResourceLibrary = () => {
  router.push('/resources')
}

const goToApplicationsWithAdd = () => {
  router.push('/applications?add=true')
}

const getRankingRowClass = ({ row }: { row: { isCurrentUser: boolean } }) => {
  return row.isCurrentUser ? 'current-user-row' : ''
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

const fetchRecommendations = async () => {
  recommendLoading.value = true
  try {
    const res = await applicationApi.getRecommendations()
    recommendations.value = res.data
  } catch (error) {
    console.error('获取投递推荐失败:', error)
  } finally {
    recommendLoading.value = false
  }
}

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    fetchRecommendations()
  }
}

const fetchRanking = async () => {
  rankingLoading.value = true
  try {
    const res = await applicationApi.getRanking()
    rankingData.value = res.data
  } catch (error) {
    console.error('获取投递量排名失败:', error)
  } finally {
    rankingLoading.value = false
  }
}

const fetchStatistics = async () => {
  try {
    const res = await applicationApi.getStatistics()
    statistics.value = res.data
    initCharts()
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const initCharts = () => {
  // 进展分布饼图
  if (statusChartRef.value) {
    statusChart = echarts.init(statusChartRef.value)
    const statusData = Object.entries(statistics.value.statusCount).map(([name, value]) => ({
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
  }

  // 趋势折线图
  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
    const trendData = Object.entries(statistics.value.trend)

    trendChart.setOption({
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        data: trendData.map(([date]) => date.slice(5)),
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
      },
      series: [
        {
          data: trendData.map(([, count]) => count),
          type: 'line',
          smooth: true,
          areaStyle: {
            opacity: 0.3,
          },
          itemStyle: {
            color: '#409eff',
          },
        },
      ],
    })
  }

  // 渠道分布柱状图
  if (channelChartRef.value) {
    channelChart = echarts.init(channelChartRef.value)
    const channelData = Object.entries(statistics.value.channelCount)

    channelChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      xAxis: {
        type: 'category',
        data: channelData.map(([name]) => name),
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
      },
      series: [
        {
          data: channelData.map(([, count]) => count),
          type: 'bar',
          itemStyle: {
            color: '#67c23a',
          },
        },
      ],
    })
  }
}

onMounted(() => {
  fetchRanking()
  fetchStatistics()
  fetchRecommendations()
  recommendPollTimer = setInterval(fetchRecommendations, 30000)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('resize', () => {
    statusChart?.resize()
    trendChart?.resize()
    channelChart?.resize()
  })
})

onUnmounted(() => {
  if (recommendPollTimer) {
    clearInterval(recommendPollTimer)
  }
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.top-row {
  margin-bottom: 20px;
}

.ranking-card,
.recommendation-card {
  height: 100%;
}

.ranking-card {
  margin-bottom: 0;
}

.recommendation-card {
  margin-bottom: 0;
}

.text-muted {
  color: #c0c4cc;
}

@media (max-width: 767px) {
  .top-row .el-col + .el-col {
    margin-top: 20px;
  }
}

.ranking-header {
  flex-wrap: wrap;
  gap: 12px;
}

.ranking-warning {
  flex: 1;
  min-width: 280px;
  margin: 0;
}

.current-tag {
  margin-left: 8px;
}

.rank-danger {
  color: #f56c6c;
  font-weight: bold;
  font-size: 16px;
}

.rank-current {
  color: #409eff;
  font-weight: bold;
  font-size: 16px;
}

:deep(.current-user-row) {
  background-color: #ecf5ff !important;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 10px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28px;
  margin-right: 15px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 5px;
}
</style>
