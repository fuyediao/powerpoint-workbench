<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useProjectStore } from '../stores/project';

const emit = defineEmits<{
  (e: 'enlarge', imageUrl: string): void;
}>();

const { t } = useI18n();
const projectStore = useProjectStore();

function handleEnlarge() {
  if (projectStore.currentSlide?.imageUrl) {
    emit('enlarge', projectStore.currentSlide.imageUrl);
  }
}
</script>

<template>
  <div
    v-if="projectStore.currentSlide"
    class="space-y-4"
  >
    <!-- Generated Image Preview -->
    <div
      class="aspect-video bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden cursor-pointer group relative"
      @click="handleEnlarge"
    >
      <template v-if="projectStore.currentSlide.imageUrl">
        <img
          :src="projectStore.currentSlide.imageUrl"
          :alt="projectStore.currentSlide.title"
          class="w-full h-full object-cover"
        >
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div class="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-slate-800/90 px-3 py-1.5 rounded-full text-sm text-slate-700 dark:text-slate-200">
            {{ t('editor.clickToEnlarge') }}
          </div>
        </div>
      </template>
      <template v-else-if="projectStore.currentSlide.status === 'generating'">
        <div class="w-full h-full flex flex-col items-center justify-center gap-3">
          <svg
            class="w-10 h-10 text-blue-500 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span class="text-sm text-slate-500 dark:text-slate-400">{{ t('editor.generating') }}</span>
        </div>
      </template>
      <template v-else>
        <div class="w-full h-full flex items-center justify-center">
          <svg
            class="w-12 h-12 text-slate-300 dark:text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </template>
    </div>

    <!-- Slide Details -->
    <div class="space-y-3">
      <div>
        <h3 class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
          {{ t('editor.slideTitle') }}
        </h3>
        <p class="text-slate-800 dark:text-slate-200">
          {{ projectStore.currentSlide.title || '-' }}
        </p>
      </div>

      <div>
        <h3 class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
          {{ t('editor.slideContent') }}
        </h3>
        <p class="text-sm text-slate-600 dark:text-slate-300 line-clamp-4">
          {{ projectStore.currentSlide.content || '-' }}
        </p>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div
    v-else
    class="flex items-center justify-center h-48 text-slate-400 dark:text-slate-500 text-sm"
  >
    {{ t('editor.noContent') }}
  </div>
</template>

