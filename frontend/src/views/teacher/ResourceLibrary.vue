<template>
  <div class="resource-library-container">
    <el-page-header @back="goBack">
      <template #content>
        <span class="page-title">校招资料库管理</span>
      </template>
    </el-page-header>

    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>资料列表</span>
          <el-button type="primary" @click="openCreateDialog">
            <el-icon><Plus /></el-icon>
            新增资料
          </el-button>
        </div>
      </template>

      <el-table :data="resources" v-loading="loading" style="width: 100%">
        <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column label="类型" width="90">
          <template #default="{ row }">
            <el-tag size="small" :type="row.contentType === 'file' ? 'primary' : 'success'">
              {{ row.contentType === 'file' ? '文件' : '链接' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优先级" width="140">
          <template #default="{ row }">
            <el-rate :model-value="row.priority" disabled />
          </template>
        </el-table-column>
        <el-table-column label="内容" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.contentType === 'file'">{{ row.fileName || '文件' }}</span>
            <span v-else>{{ row.linkUrl }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="170">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
            <el-button type="danger" link @click="confirmDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑资料' : '新增资料'"
      width="560px"
      @closed="resetForm"
    >
      <el-form :model="form" label-width="90px">
        <el-form-item label="标题" required>
          <el-input v-model="form.title" placeholder="请输入资料标题" />
        </el-form-item>
        <el-form-item label="分类" required>
          <el-select
            v-model="form.category"
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入分类"
            style="width: 100%"
          >
            <el-option v-for="item in categoryOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="资料描述" />
        </el-form-item>
        <el-form-item label="内容类型" required>
          <el-radio-group v-model="form.contentType">
            <el-radio value="file">上传文件</el-radio>
            <el-radio value="link">填写链接</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.contentType === 'file'" label="文件">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :file-list="fileList"
          >
            <el-button type="primary" plain>选择文件</el-button>
            <template #tip>
              <div class="upload-tip">支持 pdf、Word、txt、图片，最大 10MB</div>
            </template>
          </el-upload>
          <div v-if="isEditing && editingResource?.contentType === 'file' && editingResource.fileName && !selectedFile" class="current-file">
            当前文件：{{ editingResource.fileName }}
          </div>
        </el-form-item>
        <el-form-item v-else label="链接" required>
          <el-input v-model="form.linkUrl" placeholder="https://..." />
        </el-form-item>
        <el-form-item label="优先级">
          <el-rate v-model="form.priority" :max="5" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadFile, UploadInstance } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import resourceApi from '@/api/resource'
import type { RecruitmentResource } from '@/types'

const categoryOptions = ['笔试资料', '面试经验', '简历模板', '内推信息', '其他']

const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEditing = ref(false)
const resources = ref<RecruitmentResource[]>([])
const editingResource = ref<RecruitmentResource | null>(null)
const selectedFile = ref<File | null>(null)
const fileList = ref<UploadFile[]>([])
const uploadRef = ref<UploadInstance>()

const form = reactive({
  title: '',
  category: '',
  description: '',
  contentType: 'file' as 'file' | 'link',
  linkUrl: '',
  priority: 3,
})

const goBack = () => {
  router.push('/teacher/dashboard')
}

const formatDate = (value: string) => {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 16)
}

const fetchResources = async () => {
  loading.value = true
  try {
    const res = await resourceApi.listForTeacher()
    resources.value = res.data
  } catch (error) {
    console.error('获取资料失败:', error)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.title = ''
  form.category = ''
  form.description = ''
  form.contentType = 'file'
  form.linkUrl = ''
  form.priority = 3
  selectedFile.value = null
  fileList.value = []
  editingResource.value = null
  uploadRef.value?.clearFiles()
}

const openCreateDialog = () => {
  isEditing.value = false
  resetForm()
  dialogVisible.value = true
}

const openEditDialog = (row: RecruitmentResource) => {
  isEditing.value = true
  editingResource.value = row
  form.title = row.title
  form.category = row.category
  form.description = row.description || ''
  form.contentType = row.contentType
  form.linkUrl = row.linkUrl || ''
  form.priority = row.priority
  selectedFile.value = null
  fileList.value = []
  dialogVisible.value = true
}

const handleFileChange = (file: UploadFile) => {
  selectedFile.value = file.raw || null
  fileList.value = file.raw ? [file] : []
}

const handleFileRemove = () => {
  selectedFile.value = null
  fileList.value = []
}

const buildFormData = () => {
  const formData = new FormData()
  formData.append('title', form.title.trim())
  formData.append('category', form.category.trim())
  formData.append('description', form.description.trim())
  formData.append('contentType', form.contentType)
  formData.append('priority', String(form.priority))
  if (form.contentType === 'link') {
    formData.append('linkUrl', form.linkUrl.trim())
  } else if (selectedFile.value) {
    formData.append('file', selectedFile.value)
  }
  return formData
}

const submitForm = async () => {
  if (!form.title.trim()) {
    ElMessage.warning('请填写资料标题')
    return
  }
  if (!form.category.trim()) {
    ElMessage.warning('请填写资料分类')
    return
  }
  if (form.contentType === 'link' && !form.linkUrl.trim()) {
    ElMessage.warning('请填写链接地址')
    return
  }
  if (form.contentType === 'file' && !selectedFile.value && !isEditing.value) {
    ElMessage.warning('请上传资料文件')
    return
  }
  if (form.contentType === 'file' && isEditing.value && !selectedFile.value && editingResource.value?.contentType !== 'file') {
    ElMessage.warning('请上传资料文件')
    return
  }

  submitting.value = true
  try {
    const formData = buildFormData()
    if (isEditing.value && editingResource.value) {
      await resourceApi.update(editingResource.value.id, formData)
      ElMessage.success('资料已更新')
    } else {
      await resourceApi.create(formData)
      ElMessage.success('资料已创建')
    }
    dialogVisible.value = false
    fetchResources()
  } catch (error) {
    console.error('保存资料失败:', error)
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async (row: RecruitmentResource) => {
  try {
    await ElMessageBox.confirm(`确定删除资料「${row.title}」吗？`, '删除确认', {
      type: 'warning',
    })
    await resourceApi.remove(row.id)
    ElMessage.success('资料已删除')
    fetchResources()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除资料失败:', error)
    }
  }
}

onMounted(() => {
  fetchResources()
})
</script>

<style scoped>
.resource-library-container {
  padding: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-tip {
  color: #909399;
  font-size: 12px;
}

.current-file {
  margin-top: 8px;
  color: #606266;
  font-size: 13px;
}
</style>
