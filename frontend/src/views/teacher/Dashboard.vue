<template>
  <div class="teacher-dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6" :xs="12">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon" style="background: #409eff">
              <el-icon><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.totalClasses }}</div>
              <div class="stat-label">班级数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6" :xs="12">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon" style="background: #67c23a">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.totalStudents }}</div>
              <div class="stat-label">学生总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6" :xs="12">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon" style="background: #e6a23c">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ statistics.totalApplications }}</div>
              <div class="stat-label">投递总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6" :xs="12">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon" style="background: #f56c6c">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ offerCount }}</div>
              <div class="stat-label">Offer 总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>学生名单</span>
          <el-button type="primary" @click="openCreateDialog">
            <el-icon><Plus /></el-icon>
            生成账号
          </el-button>
        </div>
      </template>
      <el-table :data="studentList" style="width: 100%" v-loading="listLoading">
        <el-table-column label="学生姓名" width="120">
          <template #default="{ row }">
            <a
              v-if="row.studentLink"
              :href="row.studentLink"
              target="_blank"
              rel="noopener noreferrer"
              class="student-name-link"
            >
              {{ row.name }}
            </a>
            <span v-else>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="账号" width="140" />
        <el-table-column prop="password" label="密码" width="120">
          <template #default="{ row }">
            <span>{{ row.password || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="className" label="学习方向" width="140" />
        <el-table-column prop="totalApplications" label="投递总数" width="100" sortable />
        <el-table-column label="进展分布" min-width="300">
          <template #default="{ row }">
            <div class="status-tags">
              <el-tag
                v-for="(count, status) in row.statusCount"
                :key="status"
                size="small"
                style="margin-right: 5px; margin-bottom: 5px"
              >
                {{ status }}: {{ count }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditDialog(row)">
              修改信息
            </el-button>
            <el-button type="danger" link @click="confirmDeleteStudent(row)">
              删除信息
            </el-button>
            <el-button type="primary" link @click="viewStudentDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card style="margin-top: 20px">
      <template #header>
        <span>整体进展分布</span>
      </template>
      <div ref="chartRef" style="height: 400px"></div>
    </el-card>

    <!-- 创建学生账号弹窗 -->
    <el-dialog
      v-model="createDialogVisible"
      title="生成学生账号"
      width="450px"
    >
      <el-form :model="newStudent" label-width="100px">
        <el-form-item label="学生姓名" required>
          <el-input v-model="newStudent.name" placeholder="请输入学生姓名" />
        </el-form-item>
        <el-form-item label="学习方向" required>
          <el-select v-model="newStudent.major" placeholder="请选择学习方向" style="width: 100%">
            <el-option
              v-for="option in studyDirectionOptions"
              :key="option"
              :label="option"
              :value="option"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="学生链接">
          <el-input v-model="newStudent.studentLink" placeholder="可填写相关链接" />
        </el-form-item>
      </el-form>

      <template #footer>
          <span class="dialog-footer">
            <el-button @click="createDialogVisible = false">取消</el-button>
            <el-button type="primary" :loading="isCreating" @click="createStudent">生成账号</el-button>
          </span>
        </template>
    </el-dialog>

    <!-- 生成结果弹窗 -->
    <el-dialog
      v-model="resultDialogVisible"
      title="账号生成成功"
      width="400px"
    >
      <div class="result-content">
        <div class="result-item">
          <label>学生姓名</label>
          <span>{{ createdStudent.name }}</span>
        </div>
        <div class="result-item">
          <label>学习方向</label>
          <span>{{ createdStudent.className }}</span>
        </div>
        <div class="result-item highlight">
          <label>账号</label>
          <span>{{ createdStudent.username }}</span>
        </div>
        <div class="result-item highlight">
          <label>密码</label>
          <span>{{ createdStudent.password }}</span>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="copyAccountInfo">一键复制</el-button>
          <el-button type="primary" @click="handleResultClose">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 修改学生信息弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="修改学生信息"
      width="450px"
    >
      <el-form :model="editStudent" label-width="100px">
        <el-form-item label="学生姓名" required>
          <el-input v-model="editStudent.name" placeholder="请输入学生姓名" />
        </el-form-item>
        <el-form-item label="账号" required>
          <el-input v-model="editStudent.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码" required>
          <el-input v-model="editStudent.password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="学习方向" required>
          <el-select v-model="editStudent.className" placeholder="请选择学习方向" style="width: 100%">
            <el-option
              v-for="option in editDirectionOptions"
              :key="option"
              :label="option"
              :value="option"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="学生链接">
          <el-input v-model="editStudent.studentLink" placeholder="可填写相关链接" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="isUpdating" @click="updateStudentInfo">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import { OfficeBuilding, User, Document, TrendCharts, Plus } from '@element-plus/icons-vue'
import teacherApi, { type StudentOverviewItem } from '@/api/teacher'
import type { OverallStatistics } from '@/types'

const STUDY_DIRECTION_OPTIONS = [
  'C++开发',
  'C++测试',
  'Java开发',
  'Java测试',
  '其他',
] as const

const studyDirectionOptions = STUDY_DIRECTION_OPTIONS

const router = useRouter()
const statistics = ref<OverallStatistics>({
  totalClasses: 0,
  totalStudents: 0,
  totalApplications: 0,
  statusCount: {},
})

const studentList = ref<StudentOverviewItem[]>([])
const listLoading = ref(false)
const chartRef = ref<HTMLElement>()
let chart: ECharts | null = null

const createDialogVisible = ref(false)
const resultDialogVisible = ref(false)
const editDialogVisible = ref(false)
const isCreating = ref(false)
const isUpdating = ref(false)
const editingStudentId = ref<number | null>(null)

const newStudent = reactive({
  name: '',
  major: '',
  studentLink: '',
})

const createdStudent = reactive({
  name: '',
  username: '',
  password: '',
  className: '',
})

const editStudent = reactive({
  name: '',
  username: '',
  password: '',
  className: '',
  studentLink: '',
})

const offerCount = computed(() => statistics.value.statusCount['Offer'] || 0)

const editDirectionOptions = computed(() => {
  const current = editStudent.className
  if (current && !STUDY_DIRECTION_OPTIONS.includes(current as typeof STUDY_DIRECTION_OPTIONS[number])) {
    return [current, ...STUDY_DIRECTION_OPTIONS]
  }
  return [...STUDY_DIRECTION_OPTIONS]
})

const fetchStatistics = async () => {
  try {
    const res = await teacherApi.getOverallStatistics()
    statistics.value = res.data
    updateChart()
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const fetchStudentList = async () => {
  listLoading.value = true
  try {
    const res = await teacherApi.getStudentsOverview()
    studentList.value = res.data
  } catch (error: any) {
    console.error('获取学生名单失败:', error)
    ElMessage.error(error.message || '获取学生名单失败')
  } finally {
    listLoading.value = false
  }
}

const updateChart = () => {
  if (!chartRef.value) return

  if (!chart) {
    chart = echarts.init(chartRef.value)
  }

  const statusData = Object.entries(statistics.value.statusCount).map(([name, value]) => ({
    name,
    value,
  }))

  chart.setOption({
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
        radius: ['40%', '70%'],
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

const openCreateDialog = () => {
  newStudent.name = ''
  newStudent.major = ''
  newStudent.studentLink = ''
  createDialogVisible.value = true
}

const createStudent = async () => {
  if (!newStudent.name.trim()) {
    ElMessage.warning('请填写学生姓名')
    return
  }
  if (!newStudent.major) {
    ElMessage.warning('请选择学习方向')
    return
  }

  if (isCreating.value) {
    return
  }

  isCreating.value = true

  try {
    const res = await teacherApi.createStudent({
      name: newStudent.name.trim(),
      major: newStudent.major.trim(),
      studentLink: newStudent.studentLink.trim(),
    })

    if (res.success) {
      createdStudent.name = res.data.name
      createdStudent.username = res.data.username
      createdStudent.password = res.data.password
      createdStudent.className = res.data.className || res.data.major || '未分班'
      createDialogVisible.value = false
      resultDialogVisible.value = true
      fetchStudentList()
      fetchStatistics()
    }
  } catch (error: any) {
    console.error('创建学生账号失败:', error)
    ElMessage.error(error.message || '创建失败')
  } finally {
    isCreating.value = false
  }
}

const handleResultClose = () => {
  resultDialogVisible.value = false
}

const copyAccountInfo = async () => {
  const copyText = `账号：${createdStudent.username}\n密码：${createdStudent.password}`

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(copyText)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = copyText
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    ElMessage.success('账号密码已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败，请手动复制')
  }
}

const viewStudentDetail = (row: StudentOverviewItem) => {
  router.push(`/teacher/class/${encodeURIComponent(row.className)}`)
}

const openEditDialog = (row: StudentOverviewItem) => {
  editingStudentId.value = row.id
  editStudent.name = row.name
  editStudent.username = row.username
  editStudent.password = row.password || ''
  editStudent.className = row.className
  editStudent.studentLink = row.studentLink || ''
  editDialogVisible.value = true
}

const updateStudentInfo = async () => {
  if (!editStudent.name.trim()) {
    ElMessage.warning('请填写学生姓名')
    return
  }
  if (!editStudent.username.trim()) {
    ElMessage.warning('请填写账号')
    return
  }
  if (!editStudent.password) {
    ElMessage.warning('请填写密码')
    return
  }
  if (!editStudent.className) {
    ElMessage.warning('请选择学习方向')
    return
  }
  if (editingStudentId.value === null || isUpdating.value) {
    return
  }

  isUpdating.value = true

  try {
    const res = await teacherApi.updateStudent(editingStudentId.value, {
      name: editStudent.name.trim(),
      username: editStudent.username.trim(),
      password: editStudent.password,
      className: editStudent.className.trim(),
      studentLink: editStudent.studentLink.trim(),
    })

    if (res.success) {
      ElMessage.success('学生信息已更新')
      editDialogVisible.value = false
      fetchStudentList()
      fetchStatistics()
    }
  } catch (error: any) {
    console.error('更新学生信息失败:', error)
    ElMessage.error(error.message || '更新失败')
  } finally {
    isUpdating.value = false
  }
}

const confirmDeleteStudent = async (row: StudentOverviewItem) => {
  try {
    await ElMessageBox.confirm(
      '确定删除该学生及其全部投递记录吗？',
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await teacherApi.deleteStudent(row.id)
    ElMessage.success('学生已删除')
    fetchStudentList()
    fetchStatistics()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除学生失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }
}

onMounted(() => {
  fetchStatistics()
  fetchStudentList()

  setTimeout(() => {
    updateChart()
  }, 100)

  window.addEventListener('resize', () => {
    chart?.resize()
  })
})
</script>

<style scoped>
.teacher-dashboard-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-card {
  margin-bottom: 20px;
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

.status-tags {
  display: flex;
  flex-wrap: wrap;
}

.student-name-link {
  color: #409eff;
  text-decoration: none;
}

.student-name-link:hover {
  text-decoration: underline;
}

.result-content {
  padding: 20px 0;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item label {
  color: #909399;
  font-size: 14px;
}

.result-item span {
  font-weight: 500;
  font-size: 14px;
}

.result-item.highlight span {
  color: #409eff;
  font-size: 16px;
  font-family: 'Courier New', monospace;
}

.dialog-footer {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>