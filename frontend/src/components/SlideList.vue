<script setup lang="ts">
import { useProjectStore } from '../stores/project';

const emit = defineEmits<{
  (e: 'preview', imageUrl: string): void;
}>();

const projectStore = useProjectStore();

function selectSlide(index: number) {
  projectStore.selectSlide(index);
}

function handlePreview(imageUrl: string | null) {
  if (imageUrl) {
    emit('preview', imageUrl);
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-emerald-500';
    case 'generating':
      return 'bg-amber-500 animate-pulse';
    case 'error':
      return 'bg-red-500';
    default:
      return 'bg-slate-300';
  }
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="(slide, index) in projectStore.slides"
      :key="slide.id"
      :class="[
        'relative p-3 rounded-xl cursor-pointer transition-all duration-200',
        projectStore.selectedSlideIndex === index
          ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500 dark:ring-blue-400'
          : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700'
      ]"
      @click="selectSlide(index)"
    >
      <!-- Status Indicator -->
      <div class="absolute top-2 right-2">
        <div :class="['w-2 h-2 rounded-full', getStatusColor(slide.status)]" />
      </div>

      <!-- Thumbnail -->
      <div
        class="aspect-video bg-slate-200 dark:bg-slate-600 rounded-lg overflow-hidden mb-2"
        @click.stop="handlePreview(slide.imageUrl)"
      >
        <img
          v-if="slide.imageUrl"
          :src="slide.imageUrl"
          :alt="`Slide ${index + 1}`"
          class="w-full h-full object-cover"
        >
        <div
          v-else
          class="w-full h-full flex items-center justify-center"
        >
          <svg
            class="w-8 h-8 text-slate-400 dark:text-slate-500"
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
      </div>

      <!-- Slide Info -->
      <div class="flex items-center gap-2">
        <span class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ index + 1 }}</span>
        <span class="text-sm text-slate-700 dark:text-slate-300 truncate flex-1">{{ slide.title || `Slide ${index + 1}` }}</span>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="projectStore.slides.length === 0"
      class="text-center py-8 text-slate-400 dark:text-slate-500 text-sm"
    >
      No slides yet
    </div>
  </div>
</template>

