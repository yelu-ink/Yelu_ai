export interface RecruitmentStage {
  id: number
  tag: string
  grade: string
  period: string
  description: string
  color: string
  labelPosition: 'top' | 'bottom'
}

export interface StageWithFill extends RecruitmentStage {
  fillRatio: number
}

export interface TimelineProgress {
  today: string
  stages: StageWithFill[]
  markerAfterStage: number | null
  markerPosition: number
}

export const RECRUITMENT_STAGES: RecruitmentStage[] = [
  {
    id: 1,
    tag: '实习',
    grade: '大一/大二/研一学年',
    period: '任意时间段',
    description: '参加各大厂日常实习生招聘',
    color: '#5dade2',
    labelPosition: 'top',
  },
  {
    id: 2,
    tag: '实习',
    grade: '大三/研二学年',
    period: '3月-5月（第二学期）',
    description: '参加春季实习生招聘',
    color: '#f5a623',
    labelPosition: 'bottom',
  },
  {
    id: 3,
    tag: '秋招',
    grade: '大三/研二学年',
    period: '7月-8月（暑期）',
    description: '参加秋季校园招聘提前批',
    color: '#3498db',
    labelPosition: 'top',
  },
  {
    id: 4,
    tag: '秋招',
    grade: '大四/研三学年',
    period: '9月-11月（第一学期）',
    description: '参加秋季校园招聘常规批',
    color: '#f5a623',
    labelPosition: 'bottom',
  },
  {
    id: 5,
    tag: '春招',
    grade: '大四/研三学年',
    period: '3月-5月（第二学期）',
    description: '参加春季校园招聘常规批',
    color: '#3498db',
    labelPosition: 'top',
  },
  {
    id: 6,
    tag: '毕业',
    grade: '大四/研三学年',
    period: '5月-7月',
    description: '毕业',
    color: '#e056a0',
    labelPosition: 'bottom',
  },
]

export function formatToday(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value))
}

function monthProgress(month: number, startMonth: number, endMonth: number): number {
  if (month < startMonth) return 0
  if (month > endMonth) return 1
  return (month - startMonth + 1) / (endMonth - startMonth + 1)
}

export function getTimelineProgress(date = new Date()): TimelineProgress {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const fills = [0, 0, 0, 0, 0, 0]
  let markerAfterStage: number | null = null
  let markerPosition = 0.5

  if (month === 6) {
    fills[0] = 1
    fills[1] = 1
    markerAfterStage = 2
    markerPosition = clamp(day / 30, 0.25, 0.75)
  } else if (month === 12 || month <= 2) {
    fills[0] = month === 12 ? 0.5 : clamp(month / 2)
    if (fills[0] > 0 && fills[0] < 1) {
      markerAfterStage = 0
      markerPosition = fills[0]
    }
  } else if (month >= 3 && month <= 5) {
    fills[0] = 1
    if (month < 5) {
      fills[1] = monthProgress(month, 3, 4)
    } else {
      fills[1] = day <= 15 ? 0.85 : 1
    }
    markerAfterStage = fills[1] >= 1 ? 1 : 0
    markerPosition = fills[1] >= 1 ? 0.5 : clamp(fills[1], 0.2, 0.9)
  } else if (month >= 7 && month <= 8) {
    fills[0] = 1
    fills[1] = 1
    fills[2] = month === 7 ? clamp(0.35 + day / 62) : clamp(0.65 + day / 62)
    markerAfterStage = fills[2] >= 1 ? 2 : 1
    markerPosition = fills[2] >= 1 ? 0.5 : clamp(fills[2], 0.2, 0.9)
  } else if (month >= 9 && month <= 11) {
    fills[0] = 1
    fills[1] = 1
    fills[2] = 1
    fills[3] = monthProgress(month, 9, 11)
    markerAfterStage = fills[3] >= 1 ? 3 : 2
    markerPosition = fills[3] >= 1 ? 0.5 : clamp(fills[3], 0.2, 0.9)
  }

  const stages: StageWithFill[] = RECRUITMENT_STAGES.map((stage, index) => ({
    ...stage,
    fillRatio: clamp(fills[index] ?? 0),
  }))

  return {
    today: formatToday(date),
    stages,
    markerAfterStage,
    markerPosition: clamp(markerPosition),
  }
}

export function getTimelineState(date = new Date()) {
  const progress = getTimelineProgress(date)
  return {
    ...progress,
    currentStageId: progress.markerAfterStage !== null
      ? progress.markerAfterStage + 1
      : progress.stages.findIndex((stage) => stage.fillRatio > 0 && stage.fillRatio < 1) + 1 || 1,
  }
}
