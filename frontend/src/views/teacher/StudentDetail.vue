<template>
  <div class="student-detail-container">
    <el-page-header @back="$router.back()">
      <template #content>
        <div class="header-content">
          <span class="student-name">{{ studentName }}</span>
          <span>学习方向：{{ studentClassName }}</span>
          <span>投递总数：{{ statistics.total }}</span>
        </div>
      </template>
    </el-page-header>

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
        <span>投递渠道分布</span>
      </template>
      <div ref="channelChartRef" style="height: 300px"></div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import teacherApi from '@/api/teacher'
import type { Statistics } from '@/types'

const route = useRoute()
const studentId = computed(() => Number(route.params.studentId))

const studentName = computed(() => String(route.query.name || '学生'))
const studentClassName = computed(() => String(route.query.className || '-'))

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

const fetchStatistics = async () => {
  if (Number.isNaN(studentId.value)) return

  try {
    const res = await teacherApi.getStudentStatistics(studentId.value)
    statistics.value = res.data
    initCharts()
  } catch (error) {
    console.error('获取学生统计失败:', error)
  }
}

const initCharts = () => {
  if (statusChartRef.value) {
    if (!statusChart) {
      statusChart = echarts.init(statusChartRef.value)
    }
    const statusData = Object.entries(statistics.value.statusCount).map(([name, value]) => ({
      name,
      value,
    }))
    statusChart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { orient: 'vertical', left: 'left' },
      series: [{
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
      }],
    })
  }

  if (trendChartRef.value) {
    if (!trendChart) {
      trendChart = echarts.init(trendChartRef.value)
    }
    const trendData = Object.entries(statistics.value.trend)
    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: trendData.map(([date]) => date.slice(5)),
        axisLabel: { rotate: 45 },
      },
      yAxis: { type: 'value', minInterval: 1 },
      series: [{
        data: trendData.map(([, count]) => count),
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.3 },
        itemStyle: { color: '#409eff' },
      }],
    })
  }

  if (channelChartRef.value) {
    if (!channelChart) {
      channelChart = echarts.init(channelChartRef.value)
    }
    const channelData = Object.entries(statistics.value.channelCount)
    channelChart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: {
        type: 'category',
        data: channelData.map(([name]) => name),
        axisLabel: { rotate: 45 },
      },
      yAxis: { type: 'value', minInterval: 1 },
      series: [{
        data: channelData.map(([, count]) => count),
        type: 'bar',
        itemStyle: { color: '#67c23a' },
      }],
    })
  }
}

const handleResize = () => {
  statusChart?.resize()
  trendChart?.resize()
  channelChart?.resize()
}

onMounted(() => {
  fetchStatistics()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  statusChart?.dispose()
  trendChart?.dispose()
  channelChart?.dispose()
  statusChart = null
  trendChart = null
  channelChart = null
})
</script>

<style scoped>
.student-detail-container {
  padding: 20px;
}

.header-content {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 14px;
  color: #606266;
}

.student-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
</style>
