<template>
  <el-card class="timeline-card" shadow="never">
    <template #header>
      <div class="timeline-header">
        <span>应届生校招时间线</span>
        <span class="timeline-today">更新于 {{ timelineState.today }}</span>
      </div>
    </template>

    <div class="timeline-scroll">
      <div class="timeline-grid">
        <div
          v-for="stage in timelineState.stages"
          :key="`label-top-${stage.id}`"
          class="stage-label top"
        >
          <span v-if="stage.labelPosition === 'top'" class="stage-text">{{ stage.grade }}</span>
        </div>

        <div class="chevron-row">
          <div
            v-for="stage in timelineState.stages"
            :key="`chevron-${stage.id}`"
            class="stage-chevron-wrap"
          >
            <div class="stage-chevron-base">
              <div
                class="stage-chevron-fill"
                :style="{ width: `${stage.fillRatio * 100}%`, background: stage.color }"
              ></div>
              <div class="stage-chevron-inner">
                <span class="stage-tag">{{ stage.tag }}</span>
                <span class="stage-period">{{ stage.period }}</span>
              </div>
            </div>
          </div>

          <div
            v-if="timelineState.markerAfterStage !== null"
            class="progress-marker"
            :style="markerStyle"
          >
            <span class="progress-marker-label">当前进度</span>
          </div>
        </div>

        <div
          v-for="stage in timelineState.stages"
          :key="`label-bottom-${stage.id}`"
          class="stage-label bottom"
        >
          <span v-if="stage.labelPosition === 'bottom'" class="stage-text">{{ stage.grade }}</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getTimelineProgress } from '@/utils/recruitmentTimeline'

const timelineState = computed(() => getTimelineProgress())

const markerStyle = computed(() => {
  const { markerAfterStage, markerPosition } = timelineState.value
  if (markerAfterStage === null) return {}

  const stageCount = timelineState.value.stages.length
  const segmentWidth = 100 / stageCount
  const left = segmentWidth * markerAfterStage + segmentWidth * markerPosition * 0.6

  return { left: `${left}%` }
})
</script>

<style scoped>
.timeline-card {
  width: 100%;
  margin-top: 20px;
}

.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-weight: 600;
}

.timeline-today {
  color: #909399;
  font-weight: 400;
  font-size: 13px;
}

.timeline-scroll {
  width: 100%;
  overflow-x: auto;
}

.timeline-grid {
  min-width: 860px;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  grid-template-rows: auto auto auto;
  gap: 10px 0;
  align-items: center;
}

.stage-label {
  min-height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stage-label.top {
  align-self: end;
}

.stage-label.bottom {
  align-self: start;
}

.stage-text {
  font-size: 13px;
  color: #606266;
  line-height: 1.2;
  text-align: center;
}

.chevron-row {
  grid-column: 1 / -1;
  position: relative;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  align-items: center;
  min-height: 126px;
}

.stage-chevron-wrap {
  width: 100%;
  display: flex;
  align-items: center;
}

.stage-chevron-base {
  position: relative;
  width: 100%;
  min-height: 82px;
  overflow: hidden;
  background: rgba(228, 231, 237, 0.75);
  clip-path: polygon(0 0, calc(100% - 28px) 0, 100% 50%, calc(100% - 28px) 100%, 0 100%, 28px 50%);
}

.stage-chevron-fill {
  position: absolute;
  inset: 0 auto 0 0;
  height: 100%;
  min-width: 0;
  opacity: 0.92;
}

.stage-chevron-inner {
  position: relative;
  z-index: 1;
  min-height: 82px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 14px 26px 14px 34px;
  color: #303133;
}

.stage-tag {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
  color: #303133;
}

.stage-period {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.4;
  color: #303133;
}

.progress-marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  z-index: 2;
  pointer-events: none;
}

.progress-marker::before {
  content: '';
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ffffff;
  border: 3px solid #303133;
  box-shadow: 0 2px 8px rgba(48, 49, 51, 0.16);
  flex: 0 0 auto;
}

.progress-marker-label {
  font-size: 12px;
  color: #303133;
  font-weight: 600;
}

@media (max-width: 859px) {
  .timeline-grid {
    min-width: 860px;
  }
}
</style>
