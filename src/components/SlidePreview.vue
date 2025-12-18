<script setup lang="ts">
import { computed } from 'vue'
import { type SlideData } from '@/types'
import { Image as ImageIcon } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  slide: SlideData
  scale?: number
}>(), {
  scale: 1
})

const styleObj = computed(() => ({
  transform: `scale(${props.scale})`,
  transformOrigin: 'center center',
  width: '1280px',
  height: '720px',
}))
</script>

<template>
  <div
    class="bg-white shadow-lg overflow-hidden relative border border-gray-200"
    :style="styleObj"
  >
    <!-- Background Layer -->
    <img
      v-if="props.slide.imageUrl"
      :src="props.slide.imageUrl"
      alt="Slide background"
      class="absolute inset-0 w-full h-full object-cover z-0"
    />
    <div
      v-else
      class="absolute inset-0 bg-linear-to-br from-indigo-50 to-blue-100 flex items-center justify-center z-0"
    >
      <div class="text-gray-400 flex flex-col items-center">
        <ImageIcon :size="64" />
        <p class="mt-2 text-xl">No Visual Generated</p>
      </div>
    </div>

    <!-- Video Layer (Overlay) -->
    <div
      v-if="props.slide.videoUrl"
      class="absolute top-10 right-10 w-80 h-48 bg-black z-10 shadow-2xl border-2 border-white rounded-lg overflow-hidden"
    >
      <video :src="props.slide.videoUrl" controls class="w-full h-full object-cover" />
    </div>

    <!-- Content Overlay - 只在非整頁圖片時顯示（整頁圖片已包含所有文字內容） -->
    <div 
      v-if="!props.slide.isFullSlideImage && props.slide.imageUrl"
      class="absolute inset-0 z-20 p-16 flex flex-col justify-center bg-black/30 text-white"
    >
      <h1 class="text-6xl font-bold mb-8 drop-shadow-md leading-tight">{{ props.slide.title }}</h1>
      <div class="space-y-4">
        <div
          v-for="(point, idx) in props.slide.contentPoints"
          :key="idx"
          class="flex items-start text-3xl drop-shadow-md"
        >
          <span class="mr-4">•</span>
          <p>{{ point }}</p>
        </div>
      </div>
    </div>
    <!-- 如果沒有圖片，顯示文字內容 -->
    <div 
      v-else-if="!props.slide.imageUrl"
      class="absolute inset-0 z-20 p-16 flex flex-col justify-center text-gray-800 dark:text-gray-200"
    >
      <h1 class="text-6xl font-bold mb-8 leading-tight">{{ props.slide.title }}</h1>
      <div class="space-y-4">
        <div
          v-for="(point, idx) in props.slide.contentPoints"
          :key="idx"
          class="flex items-start text-3xl"
        >
          <span class="mr-4">•</span>
          <p>{{ point }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
