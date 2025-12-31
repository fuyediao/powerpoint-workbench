<script setup lang="ts">
import { ref } from 'vue'
import { X, FileText, Image, Presentation, Download } from 'lucide-vue-next'
import { ExportFormat } from '@/types'
import { useI18n } from '@/composables/useI18n'
import type { SlideData } from '@/types'
import { computed } from 'vue'

const { t } = useI18n()

const props = defineProps<{
  isOpen: boolean
  slides: SlideData[]
}>()

const emit = defineEmits<{
  close: []
  export: [format: ExportFormat]
}>()

const selectedFormat = ref<ExportFormat | null>(null)
const isExporting = ref(false)

const formats = computed(() => [
  {
    value: ExportFormat.PDF,
    label: t.value('export.pdf'),
    description: t.value('export.pdf_desc'),
    icon: FileText,
    color: 'text-red-600 dark:text-red-400'
  },
  {
    value: ExportFormat.IMAGES,
    label: t.value('export.images'),
    description: t.value('export.images_desc'),
    icon: Image,
    color: 'text-blue-600 dark:text-blue-400'
  },
  {
    value: ExportFormat.POWERPOINT,
    label: t.value('export.pptx'),
    description: t.value('export.pptx_desc'),
    icon: Presentation,
    color: 'text-orange-600 dark:text-orange-400'
  }
])

const handleExport = async () => {
  if (!selectedFormat.value) return

  isExporting.value = true
  emit('export', selectedFormat.value)
  
  // 等待一小段時間讓導出開始
  await new Promise(resolve => setTimeout(resolve, 500))
  
  isExporting.value = false
  emit('close')
  selectedFormat.value = null
}
</script>

<template>
  <div v-if="props.isOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[500px] p-6 border border-gray-200 dark:border-gray-700 transition-colors">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-white">
          <Download :size="20" />
          {{ t('export.title') }}
        </h2>
        <button 
          @click="emit('close')" 
          :disabled="isExporting"
          class="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full dark:text-gray-400 disabled:opacity-50"
        >
          <X :size="20" />
        </button>
      </div>

      <div class="space-y-3 mb-6">
        <div 
          v-for="format in formats"
          :key="format.value"
          @click="selectedFormat = format.value"
          :class="[
            'p-4 border-2 rounded-xl cursor-pointer transition-all',
            selectedFormat === format.value
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
              : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
          ]"
        >
          <div class="flex items-start gap-3">
            <component 
              :is="format.icon" 
              :size="24" 
              :class="format.color"
            />
            <div class="flex-1">
              <div class="font-semibold text-gray-900 dark:text-white mb-1">
                {{ format.label }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                {{ format.description }}
              </div>
            </div>
            <div 
              v-if="selectedFormat === format.value"
              class="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center"
            >
              <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="text-xs text-gray-500 dark:text-gray-400 mb-4">
        {{ t('export.slides_count').replace('{count}', String(props.slides.length)) }}
      </div>

      <div class="flex justify-end gap-3">
        <button
          @click="emit('close')"
          :disabled="isExporting"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors disabled:opacity-50"
        >
          {{ t('export.cancel') }}
        </button>
        <button
          @click="handleExport"
          :disabled="!selectedFormat || isExporting"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Download v-if="!isExporting" :size="16" />
          <div v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          {{ isExporting ? t('export.exporting') : t('export.export') }}
        </button>
      </div>
    </div>
  </div>
</template>
