<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useProjectStore } from '../stores/project';
import type { StyleMode } from '../types';
import { computed } from 'vue';

const { t } = useI18n();
const projectStore = useProjectStore();

const sliderProgress = computed(() => {
  const min = 1;
  const max = 30;
  const value = projectStore.slideCount;
  return ((value - min) / (max - min)) * 100;
});

function handleSlideCountChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const value = parseInt(target.value, 10);
  if (!isNaN(value)) {
    projectStore.setSlideCount(value);
  }
}

function handleStyleModeChange(mode: StyleMode) {
  projectStore.setStyleMode(mode);
}

function handleCustomPromptChange(event: Event) {
  const target = event.target as HTMLInputElement;
  projectStore.setCustomPrompt(target.value);
}
</script>

<template>
  <div class="space-y-6">
    <!-- Slide Count -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {{ t('config.slideCount') }}
          <span class="text-slate-400 dark:text-slate-500 font-normal">{{ t('config.slideCountRange') }}</span>
        </label>
        <span class="text-sm font-semibold text-blue-600 dark:text-blue-400">
          {{ projectStore.slideCount }}
        </span>
      </div>
      <input
        type="range"
        min="1"
        max="30"
        :value="projectStore.slideCount"
        :style="{ '--slider-progress': `${sliderProgress}%` }"
        class="w-full appearance-none cursor-pointer slider-thumb"
        @input="handleSlideCountChange"
      >
    </div>

    <!-- Style Mode -->
    <div>
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {{ t('config.styleMode') }}
      </label>
      <div class="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600">
        <button
          :class="[
            'flex-1 py-2.5 px-4 text-sm font-medium transition-colors',
            projectStore.styleMode === 'concise'
              ? 'bg-blue-500 text-white'
              : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
          ]"
          @click="handleStyleModeChange('concise')"
        >
          {{ t('config.concise') }}
        </button>
        <button
          :class="[
            'flex-1 py-2.5 px-4 text-sm font-medium transition-colors border-l border-slate-200 dark:border-slate-600',
            projectStore.styleMode === 'detailed'
              ? 'bg-blue-500 text-white'
              : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
          ]"
          @click="handleStyleModeChange('detailed')"
        >
          {{ t('config.detailed') }}
        </button>
      </div>
    </div>

    <!-- Custom Prompt -->
    <div>
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {{ t('config.customPrompt') }}
      </label>
      <input
        type="text"
        :value="projectStore.customPrompt"
        :placeholder="t('config.customPromptPlaceholder')"
        class="w-full px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg
               border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50
               placeholder:text-slate-400 dark:placeholder:text-slate-500"
        @input="handleCustomPromptChange"
      >
    </div>
  </div>
</template>

