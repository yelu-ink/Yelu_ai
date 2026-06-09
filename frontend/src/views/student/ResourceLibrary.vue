<template>
  <div class="resource-library-container">
    <el-page-header @back="goBack">
      <template #content>
        <span class="page-title">校招资料库</span>
      </template>
    </el-page-header>

    <div class="toolbar">
      <el-select v-model="selectedCategory" placeholder="全部分类" clearable style="width: 200px">
        <el-option label="全部分类" value="" />
        <el-option v-for="item in categories" :key="item" :label="item" :value="item" />
      </el-select>
    </div>

    <div v-loading="loading" class="resource-list">
      <el-empty v-if="!loading && filteredResources.length === 0" description="暂无资料" />

      <el-row v-else :gutter="20">
        <el-col
          v-for="item in filteredResources"
          :key="item.id"
          :span="8"
          :xs="24"
          :sm="12"
          :md="8"
        >
          <el-card class="resource-card" shadow="hover">
            <div class="resource-card-header">
              <h3 class="resource-title">{{ item.title }}</h3>
              <el-tag size="small" type="info">{{ item.category }}</el-tag>
            </div>

            <div class="resource-meta">
              <el-rate :model-value="item.priority" disabled />
              <el-tag size="small" :type="item.contentType === 'file' ? 'primary' : 'success'">
                {{ item.contentType === 'file' ? '文件' : '链接' }}
              </el-tag>
            </div>

            <p class="resource-desc">{{ item.description || '暂无描述' }}</p>

            <div class="resource-actions">
              <el-button
                v-if="item.contentType === 'file'"
                type="primary"
                link
                @click="openFile(item)"
              >
                查看 / 下载
              </el-button>
              <el-button
                v-else
                type="primary"
                link
                @click="openLink(item.linkUrl)"
              >
                打开链接
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import resourceApi, { getResourceFileUrl } from '@/api/resource'
import type { RecruitmentResource } from '@/types'

const router = useRouter()
const loading = ref(false)
const resources = ref<RecruitmentResource[]>([])
const selectedCategory = ref('')

const categories = computed(() => {
  return [...new Set(resources.value.map((item) => item.category))].sort()
})

const filteredResources = computed(() => {
  if (!selectedCategory.value) return resources.value
  return resources.value.filter((item) => item.category === selectedCategory.value)
})

const goBack = () => {
  router.push('/dashboard')
}

const fetchResources = async () => {
  loading.value = true
  try {
    const res = await resourceApi.list()
    resources.value = res.data
  } catch (error) {
    console.error('获取资料失败:', error)
  } finally {
    loading.value = false
  }
}

const openFile = (item: RecruitmentResource) => {
  const url = getResourceFileUrl(item.filePath)
  if (url) window.open(url, '_blank')
}

const openLink = (url?: string) => {
  if (url) window.open(url, '_blank')
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

.toolbar {
  margin: 20px 0;
}

.resource-list {
  min-height: 240px;
}

.resource-card {
  margin-bottom: 20px;
  min-height: 220px;
}

.resource-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.resource-title {
  margin: 0;
  font-size: 16px;
  line-height: 1.4;
  color: #303133;
}

.resource-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 0;
}

.resource-desc {
  min-height: 48px;
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.resource-actions {
  margin-top: 12px;
}
</style>
