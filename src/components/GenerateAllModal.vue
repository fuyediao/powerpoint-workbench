<script setup lang="ts">
import { computed } from 'vue'
import { X, Sparkles, CheckCircle, XCircle, AlertCircle, Minimize2 } from 'lucide-vue-next'
import { useI18n } from '@/composables/useI18n'
import type { SlideData } from '@/types'

const { t } = useI18n()

const props = defineProps<{
  isOpen: boolean
  slidesToGenerate: SlideData[]
  isGenerating: boolean
  progress: { current: number; total: number }
  result?: { success: number; total: number; failed: number }
}>()

const emit = defineEmits<{
  close: []
  confirm: []
  minimize: []
}>()

const progressPercentage = computed(() => {
  if (props.progress.total === 0) return 0
  return Math.round((props.progress.current / props.progress.total) * 100)
})

const handleClose = () => {
  if (!props.isGenerating) {
    emit('close')
  }
}

const handleConfirm = () => {
  emit('confirm')
}

const handleMinimize = () => {
  emit('minimize')
}
</script>

<template>
  <div v-if="props.isOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[500px] max-w-[90vw] p-6 border border-gray-200 dark:border-gray-700 transition-colors">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-white">
          <Sparkles :size="20" />
          {{ t('generate_all.title') }}
        </h2>
        <div class="flex items-center gap-2">
          <button 
            v-if="props.isGenerating"
            @click="handleMinimize" 
            class="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full dark:text-gray-400 transition-colors"
            :title="t('generate_all.minimize')"
          >
            <Minimize2 :size="20" />
          </button>
          <button 
            @click="handleClose" 
            :disabled="props.isGenerating"
            class="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <X :size="20" />
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="space-y-4">
        <!-- Confirmation State -->
        <div v-if="!props.isGenerating && !props.result" class="space-y-4">
          <div class="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <AlertCircle :size="20" class="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div class="flex-1">
              <p class="text-sm text-gray-700 dark:text-gray-300">
                {{ t('generate_all.confirm_message').replace('{count}', String(props.slidesToGenerate.length)) }}
              </p>
            </div>
          </div>

          <div class="text-sm text-gray-600 dark:text-gray-400">
            <p>{{ t('generate_all.confirm_desc') }}</p>
          </div>
        </div>

        <!-- Generating State -->
        <div v-if="props.isGenerating" class="space-y-4">
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4">
              <Sparkles class="animate-pulse text-indigo-600 dark:text-indigo-400" :size="32" />
            </div>
            <p class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
              {{ t('generate_all.generating') }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ t('generate_all.progress').replace('{current}', String(props.progress.current)).replace('{total}', String(props.progress.total)) }}
            </p>
          </div>

          <!-- Progress Bar -->
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              class="bg-indigo-600 h-full transition-all duration-300 ease-out"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>

          <div class="text-center text-xs text-gray-500 dark:text-gray-400">
            {{ progressPercentage }}%
          </div>
        </div>

        <!-- Result State -->
        <div v-if="props.result && !props.isGenerating" class="space-y-4">
          <div 
            :class="[
              'flex items-start gap-3 p-4 rounded-lg border',
              props.result.failed === 0
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            ]"
          >
            <CheckCircle 
              v-if="props.result.failed === 0" 
              :size="20" 
              class="text-green-600 dark:text-green-400 mt-0.5 shrink-0" 
            />
            <XCircle 
              v-else 
              :size="20" 
              class="text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" 
            />
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                {{ props.result.failed === 0 ? t('generate_all.success') : t('generate_all.partial_success') }}
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ t('generate_all.result_message')
                  .replace('{success}', String(props.result.success))
                  .replace('{total}', String(props.result.total))
                  .replace('{failed}', String(props.result.failed))
                }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="flex justify-end gap-3 mt-6">
        <button
          v-if="!props.isGenerating && !props.result"
          @click="handleClose"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
        >
          {{ t('generate_all.cancel') }}
        </button>
        <button
          v-if="!props.isGenerating && !props.result"
          @click="handleConfirm"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow-md transition-colors flex items-center gap-2"
        >
          <Sparkles :size="16" />
          {{ t('generate_all.confirm') }}
        </button>
        <button
          v-if="props.result && !props.isGenerating"
          @click="handleClose"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md transition-colors"
        >
          {{ t('generate_all.close') }}
        </button>
      </div>
    </div>
  </div>
</template>

