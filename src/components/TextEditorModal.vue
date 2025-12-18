<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Maximize2 } from 'lucide-vue-next'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

const props = defineProps<{
  isOpen: boolean
  content: string
}>()

const emit = defineEmits<{
  close: []
  update: [content: string]
}>()

const editedContent = ref(props.content)

// 當 props.content 變化時，同步到 editedContent
watch(() => props.content, (newContent) => {
  editedContent.value = newContent
}, { immediate: true })

// 當彈窗打開時，同步內容
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    editedContent.value = props.content
  }
})

const handleSave = () => {
  emit('update', editedContent.value)
  emit('close')
}

const handleClose = () => {
  // 關閉時恢復原始內容
  editedContent.value = props.content
  emit('close')
}
</script>

<template>
  <div v-if="props.isOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-1">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-7xl h-[98vh] flex flex-col border border-gray-200 dark:border-gray-700 transition-colors">
      <!-- Header -->
      <div class="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <h2 class="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-white">
          <Maximize2 :size="20" />
          {{ t('input.label') }}
        </h2>
        <button 
          @click="handleClose" 
          class="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full dark:text-gray-400 transition-colors"
        >
          <X :size="20" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-hidden p-3">
        <textarea
          v-model="editedContent"
          class="text-editor-textarea w-full h-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all placeholder-gray-400 dark:placeholder-gray-500 font-mono text-sm"
          :placeholder="t('input.placeholder')"
        />
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-3 p-3 border-t border-gray-200 dark:border-gray-700 shrink-0">
        <button
          @click="handleClose"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
        >
          {{ t('export.cancel') }}
        </button>
        <button
          @click="handleSave"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md transition-colors"
        >
          {{ t('generate_all.confirm') || '保存' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定義滾動條樣式 - 淺色模式 */
.text-editor-textarea::-webkit-scrollbar {
  width: 12px;
}

.text-editor-textarea::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 6px;
}

.text-editor-textarea::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 6px;
  border: 2px solid #f3f4f6;
}

.text-editor-textarea::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* 深色模式滾動條樣式 */
.dark .text-editor-textarea::-webkit-scrollbar-track {
  background: #374151;
}

.dark .text-editor-textarea::-webkit-scrollbar-thumb {
  background: #4b5563;
  border: 2px solid #374151;
}

.dark .text-editor-textarea::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

/* Firefox 滾動條樣式 */
.text-editor-textarea {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f3f4f6;
}

.dark .text-editor-textarea {
  scrollbar-color: #4b5563 #374151;
}
</style>
