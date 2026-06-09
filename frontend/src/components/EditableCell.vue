<template>
  <div
    class="cell-root"
    :class="{ 'is-editing': isEditing }"
    @dblclick="startEdit"
  >
    <template v-if="!isEditing">
      <span v-if="hasValue" class="cell-text">
        <slot :value="value">{{ value }}</slot>
      </span>
      <span v-else class="cell-text cell-empty">双击编辑</span>
    </template>

    <template v-else>
      <el-input
        v-if="type === 'text'"
        ref="inputRef"
        v-model="editValue"
        class="cell-editor"
        @keyup.enter="commit"
        @keyup.escape="cancel"
        @blur="commit"
      />
      <el-input
        v-else
        ref="inputRef"
        v-model="editValue"
        class="cell-editor cell-editor--textarea"
        type="textarea"
        :rows="4"
        @keyup.escape="cancel"
        @blur="commit"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { ElInput } from 'element-plus'

interface Props {
  value: string | number | undefined
  row: any
  field: string
  type?: 'text' | 'textarea'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
})

const emit = defineEmits<{
  update: [field: string, value: any]
}>()

const isEditing = ref(false)
const editValue = ref<string | number>('')
const inputRef = ref<InstanceType<typeof ElInput>>()

const hasValue = computed(
  () => props.value !== undefined && props.value !== null && props.value !== ''
)

const focusAndSelectAll = () => {
  const el = inputRef.value
  if (!el) return
  el.focus()
  const nativeEl = props.type === 'textarea' ? el.textarea : el.input
  nativeEl?.select()
}

const startEdit = () => {
  if (isEditing.value) return
  isEditing.value = true
  editValue.value = props.value ?? ''
  nextTick(focusAndSelectAll)
}

const commit = () => {
  if (!isEditing.value) return
  isEditing.value = false
  if (editValue.value !== (props.value ?? '')) {
    emit('update', props.field, editValue.value)
  }
}

const cancel = () => {
  isEditing.value = false
}
</script>
