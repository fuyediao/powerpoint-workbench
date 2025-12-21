<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/projectStore'
import { useI18n } from '@/composables/useI18n'
import { generateOutline, generateFullSlideImage, generateVeoVideo } from '@/services/geminiService'
import { AiProvider, type SlideData, SlideStatus } from '@/types'
import SlidePreview from '@/components/SlidePreview.vue'
import ExportModal from '@/components/ExportModal.vue'
import GenerateAllModal from '@/components/GenerateAllModal.vue'
import {
  Sparkles,
  Image as ImageIcon,
  Video,
  Download,
  RefreshCw,
  Type,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Home
} from 'lucide-vue-next'
import { ExportFormat, exportToPDF, exportToImages, exportToPowerPoint } from '@/services/exportService'

const router = useRouter()
const store = useProjectStore()
const { t } = useI18n()

const activeSlideIndex = ref(0)
const isGenerating = ref(false)
const loadingMessage = ref('')
const isPreviewMode = ref(false)

// 計算預覽模式下的縮放比例
const previewScale = computed(() => {
  if (typeof window === 'undefined') return 1
  return Math.min(window.innerWidth / 1280, window.innerHeight / 720)
})
const isExportModalOpen = ref(false)
const isGeneratingAll = ref(false)
const generatingProgress = ref({ current: 0, total: 0 })
const isGenerateAllModalOpen = ref(false)
const isGenerateAllModalMinimized = ref(false)
const generateAllResult = ref<{ success: number; total: number; failed: number } | undefined>(undefined)
const slidesToGenerate = computed(() => store.slides.filter(slide => !slide.imageUrl || slide.status === SlideStatus.ERROR))

const activeSlide = computed(() => store.slides[activeSlideIndex.value] || null)

// Helper to trigger outline generation if slides are empty
onMounted(async () => {
  if (store.slides.length === 0 && !isGenerating.value) {
    // 檢查是否有文本或上傳的文件
    const hasText = store.config.sourceText && store.config.sourceText.trim().length > 0
    const hasFiles = store.uploadedFiles.length > 0
    
    if (!hasText && !hasFiles) {
      // 既沒有文本也沒有文件，返回首頁
      return
    }
    
    isGenerating.value = true
    loadingMessage.value = t.value('status.thinking')
    try {
      if (store.config.provider === AiProvider.GOOGLE && store.config.apiKey) {
        let newSlides: SlideData[]
        
        // 優先使用文件，如果有文件就全部用文件（包括文本文件）
        // 如果只有文本沒有文件，則使用文本
        if (hasFiles) {
          // 如果有上傳的文件，所有文件（包括 txt、markdown）都直接給 Gemini 解析
          const files = store.uploadedFiles.map(uf => uf.file)
          
          // 如果同時有文本輸入，將文本也轉換為 File 對象一起傳給 Gemini
          if (hasText) {
            // 將文本轉換為 Blob，然後轉為 File
            const textBlob = new Blob([store.config.sourceText], { type: 'text/plain' })
            const textFile = new File([textBlob], 'input-text.txt', { type: 'text/plain' })
            files.push(textFile)
          }
          
          newSlides = await generateOutline(
            store.config.apiKey,
            files, // 傳遞文件數組，所有內容都由 Gemini 解析
            store.config.pageCount,
            store.config.style,
            store.config.customStylePrompt
          )
        } else if (hasText) {
          // 如果只有文本，直接傳遞文本字符串
          newSlides = await generateOutline(
            store.config.apiKey,
            store.config.sourceText, // 傳遞文本字符串
            store.config.pageCount,
            store.config.style,
            store.config.customStylePrompt
          )
        } else {
          throw new Error('No content provided')
        }
        
        store.setSlides(newSlides)
      } else {
        // Mock local or fallback
        if (!store.config.apiKey) {
          alert('Please configure API Key in settings first or switch provider.')
          router.push('/')
        }
      }
    } catch (e) {
      console.error(e)
      alert('Failed to generate outline. Check console.')
    } finally {
      isGenerating.value = false
    }
  }
})

const handleGenerateImage = async (slide: SlideData) => {
  if (!store.config.apiKey) {
    alert('API Key Missing')
    return
  }

  store.updateSlide(slide.id, { status: SlideStatus.GENERATING })
  try {
    // 使用 nano banana 生成整頁圖片（包含標題、內容等所有元素）
    const b64 = await generateFullSlideImage(
      store.config.apiKey,
      slide,
      store.config.customStylePrompt,
      '2K' // High quality
    )
    // 標記為整頁圖片，這樣預覽組件就不會疊加文字了
    store.updateSlide(slide.id, { imageUrl: b64, status: SlideStatus.DONE, isFullSlideImage: true })
  } catch (e) {
    console.error(e)
    store.updateSlide(slide.id, { status: SlideStatus.ERROR })
    alert('圖片生成失敗')
  }
}

const handleGenerateVideo = async (slide: SlideData) => {
  if (!store.config.apiKey) {
    alert('API Key Missing')
    return
  }

  const prompt = window.prompt(t.value('veo.prompt'), `Cinematic shot of ${slide.title}`)
  if (!prompt) {
    return
  }

  store.updateSlide(slide.id, { status: SlideStatus.GENERATING })
  try {
    const videoUrl = await generateVeoVideo(store.config.apiKey, prompt)
    store.updateSlide(slide.id, { videoUrl: videoUrl, status: SlideStatus.DONE })
  } catch (e) {
    console.error(e)
    store.updateSlide(slide.id, { status: SlideStatus.ERROR })
    alert('Veo generation failed')
  }
}

const handleGenerateAllImages = () => {
  if (!store.config.apiKey) {
    alert('API Key Missing')
    return
  }

  if (slidesToGenerate.value.length === 0) {
    alert('所有幻燈片都已經有圖片了')
    return
  }

  generateAllResult.value = undefined
  isGenerateAllModalOpen.value = true
}

const confirmGenerateAll = async () => {
  if (!store.config.apiKey) {
    return
  }

  // 在開始生成前，先快照需要生成的投影片列表，避免 computed 屬性在循環過程中動態變化
  const slidesToProcess = [...slidesToGenerate.value]
  const totalSlides = slidesToProcess.length

  isGeneratingAll.value = true
  generatingProgress.value = { current: 0, total: totalSlides }
  generateAllResult.value = undefined
  let successCount = 0
  let failedCount = 0

  try {
    for (let i = 0; i < slidesToProcess.length; i++) {
      const slide = slidesToProcess[i]
      generatingProgress.value.current = i + 1

      store.updateSlide(slide.id, { status: SlideStatus.GENERATING })

      try {
        const b64 = await generateFullSlideImage(
          store.config.apiKey,
          slide,
          store.config.customStylePrompt,
          '2K'
        )
        store.updateSlide(slide.id, {
          imageUrl: b64,
          status: SlideStatus.DONE,
          isFullSlideImage: true
        })
        successCount++
      } catch (e) {
        console.error(`Failed to generate image for slide ${slide.order}:`, e)
        store.updateSlide(slide.id, { status: SlideStatus.ERROR })
        failedCount++
      }

      // 添加小延遲，避免 API 速率限制
      if (i < slidesToProcess.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    generateAllResult.value = {
      success: successCount,
      total: totalSlides,
      failed: failedCount
    }
  } catch (error) {
    console.error('Batch generation failed:', error)
    generateAllResult.value = {
      success: successCount,
      total: totalSlides,
      failed: failedCount + 1
    }
  } finally {
    isGeneratingAll.value = false
  }
}

const closeGenerateAllModal = () => {
  if (!isGeneratingAll.value) {
    isGenerateAllModalOpen.value = false
    isGenerateAllModalMinimized.value = false
    generateAllResult.value = undefined
    generatingProgress.value = { current: 0, total: 0 }
  }
}

const minimizeGenerateAllModal = () => {
  isGenerateAllModalOpen.value = false
  isGenerateAllModalMinimized.value = true
}

const restoreGenerateAllModal = () => {
  isGenerateAllModalOpen.value = true
  isGenerateAllModalMinimized.value = false
}

const goToPrevSlide = () => {
  activeSlideIndex.value = Math.max(0, activeSlideIndex.value - 1)
}

const goToNextSlide = () => {
  activeSlideIndex.value = Math.min(store.slides.length - 1, activeSlideIndex.value + 1)
}

// 處理滾輪事件，用於在中央顯示區域切換幻燈片
const handleWheel = (event: WheelEvent) => {
  // 防止默認滾動行為
  event.preventDefault()
  
  // 滾輪向下（deltaY > 0）切換到下一個
  // 滾輪向上（deltaY < 0）切換到上一個
  if (event.deltaY > 0) {
    goToNextSlide()
  } else if (event.deltaY < 0) {
    goToPrevSlide()
  }
}

const updateSlideTitle = (value: string) => {
  if (activeSlide.value) {
    store.updateSlide(activeSlide.value.id, { title: value })
  }
}

const updateSlideContentPoints = (value: string) => {
  if (activeSlide.value) {
    store.updateSlide(activeSlide.value.id, { contentPoints: value.split('\n') })
  }
}

const updateSlideVisualPrompt = (value: string) => {
  if (activeSlide.value) {
    store.updateSlide(activeSlide.value.id, { visualPrompt: value })
  }
}

const updateSlideSpeakerNotes = (value: string) => {
  if (activeSlide.value) {
    store.updateSlide(activeSlide.value.id, { speakerNotes: value })
  }
}

const handleExport = async (format: ExportFormat) => {
  try {
    switch (format) {
      case ExportFormat.PDF:
        await exportToPDF(store.slides)
        break
      case ExportFormat.IMAGES:
        await exportToImages(store.slides)
        break
      case ExportFormat.POWERPOINT:
        await exportToPowerPoint(store.slides)
        break
    }
  } catch (error) {
    console.error('Export failed:', error)
    alert('導出失敗，請檢查控制台')
  }
}
</script>

<template>
  <!-- Loading State -->
  <div v-if="isGenerating && store.slides.length === 0"
    class="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 flex-col transition-colors">
    <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 dark:border-indigo-400 mb-4"></div>
    <p class="text-xl font-medium text-gray-600 dark:text-gray-300 animate-pulse">{{ loadingMessage }}</p>
    <p class="text-sm text-gray-400 mt-2">Using Gemini 3 Pro (Thinking Mode)</p>
  </div>

  <!-- No Slides State -->
  <div v-else-if="store.slides.length === 0"
    class="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 flex-col gap-6 transition-colors">
    <div class="text-center space-y-4">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200">{{ t('status.no_slides') }}</h2>
      <p class="text-gray-600 dark:text-gray-400">{{ t('status.no_slides_desc') }}</p>
    </div>
    <button @click="router.push('/')"
      class="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-base font-medium shadow-md transition-colors">
      <Home :size="20" />
      {{ t('btn.back_home') }}
    </button>
  </div>

  <!-- Editor -->
  <div v-else class="h-screen flex flex-col bg-gray-100 dark:bg-gray-950 overflow-hidden transition-colors">
    <ExportModal :is-open="isExportModalOpen" :slides="store.slides" @close="isExportModalOpen = false"
      @export="handleExport" />
    <GenerateAllModal :is-open="isGenerateAllModalOpen" :slides-to-generate="slidesToGenerate"
      :is-generating="isGeneratingAll" :progress="generatingProgress" :result="generateAllResult"
      @close="closeGenerateAllModal" @confirm="confirmGenerateAll" @minimize="minimizeGenerateAllModal" />

    <!-- Minimized Floating Button -->
    <div v-if="isGenerateAllModalMinimized && (isGeneratingAll || generateAllResult)"
      class="fixed bottom-6 right-6 z-50">
      <button @click="restoreGenerateAllModal"
        class="flex items-center gap-3 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg transition-all hover:shadow-xl animate-pulse">
        <Sparkles :size="20" />
        <div class="flex flex-col items-start">
          <span class="text-sm font-medium">{{ t('generate_all.title') }}</span>
          <span v-if="isGeneratingAll" class="text-xs opacity-90">
            {{ t('generate_all.progress').replace('{current}', String(generatingProgress.current)).replace('{total}',
              String(generatingProgress.total)) }}
          </span>
          <span v-else-if="generateAllResult" class="text-xs opacity-90">
            {{ generateAllResult.success }}/{{ generateAllResult.total }} {{ t('generate_all.completed') }}
          </span>
        </div>
      </button>
    </div>

    <!-- Toolbar -->
    <header
      class="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0 z-30 transition-colors"
      :class="{ 'absolute top-0 left-0 right-0 bg-transparent dark:bg-transparent border-none': isPreviewMode }">
      <div class="flex items-center gap-4">
        <button v-if="!isPreviewMode" @click="router.push('/')"
          class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400">
          <Home :size="20" />
        </button>
        <h1 v-if="!isPreviewMode" class="font-bold text-lg text-gray-800 dark:text-gray-200">{{ t('app.title') }}</h1>
      </div>
      <div class="flex gap-2">
        <button @click="handleGenerateAllImages" :disabled="isGeneratingAll || store.slides.length === 0"
          class="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-md transition-colors"
          :title="t('btn.generate_all_desc')">
          <RefreshCw v-if="isGeneratingAll" class="animate-spin" :size="16" />
          <Sparkles v-else :size="16" />
          {{ isGeneratingAll ? `${generatingProgress.current}/${generatingProgress.total}` : t('btn.generate_all') }}
        </button>
        <button @click="isPreviewMode = !isPreviewMode"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="isPreviewMode 
            ? 'bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 backdrop-blur' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'">
          <Maximize2 :size="16" />
          {{ isPreviewMode ? t('btn.exit_preview') : t('btn.preview') }}
        </button>
        <button @click="isExportModalOpen = true"
          class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium shadow-md transition-colors">
          <Download :size="16" />
          {{ t('btn.export') }}
        </button>
      </div>
    </header>

    <!-- Main Workspace -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left: Sidebar (Thumbnails) -->
      <aside
        v-if="!isPreviewMode"
        class="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto shrink-0 flex flex-col p-4 gap-4 transition-colors">
        <div v-for="(slide, idx) in store.slides" :key="slide.id" @click="activeSlideIndex = idx" :class="[
          'cursor-pointer rounded-lg border-2 p-2 transition-all',
          activeSlideIndex === idx
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-400'
            : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
        ]">
          <div class="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{{ t('editor.slide_label').replace('{order}', String(slide.order)) }}</div>
          <div class="aspect-video bg-gray-200 dark:bg-gray-800 rounded overflow-hidden relative">
            <img v-if="slide.imageUrl" :src="slide.imageUrl" class="w-full h-full object-cover" />
          </div>
          <div class="text-xs font-medium mt-1 truncate text-gray-700 dark:text-gray-300">{{ slide.title }}</div>
        </div>
      </aside>

      <!-- Center: Canvas -->
      <main
        class="flex-1 bg-gray-100 dark:bg-gray-950 flex items-center justify-center relative overflow-hidden transition-colors"
        :class="isPreviewMode ? 'p-0' : 'p-8'"
        @wheel="handleWheel">
        <div class="relative shadow-2xl transition-all duration-300"
          :class="isPreviewMode ? 'w-full h-full flex items-center justify-center' : 'w-full max-w-4xl'"
          :style="!isPreviewMode ? 'aspect-ratio: 16/9;' : ''">
          <template v-if="activeSlide">
            <div class="transform" :style="isPreviewMode 
              ? `transform: scale(${previewScale}); transform-origin: center center;` 
              : 'zoom: 0.8; transform-origin: center center;'">
              <SlidePreview 
                :key="activeSlide.id" 
                :slide="activeSlide" 
                :scale="1"
                :current-page="activeSlideIndex + 1"
                :total-pages="store.slides.length" />
            </div>
          </template>
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            {{ t('editor.no_slide_selected') }}
          </div>
        </div>

        <!-- Navigation Overlay -->
        <div
          v-if="isPreviewMode"
          class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow backdrop-blur border border-gray-200 dark:border-gray-700 z-10">
          <button :disabled="activeSlideIndex === 0" @click="goToPrevSlide"
            class="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full disabled:opacity-30 text-gray-700 dark:text-gray-200">
            <ChevronLeft />
          </button>
          <span class="py-2 px-2 font-mono text-sm text-gray-700 dark:text-gray-200">{{ activeSlideIndex + 1 }} / {{
            store.slides.length }}</span>
          <button :disabled="activeSlideIndex === store.slides.length - 1" @click="goToNextSlide"
            class="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full disabled:opacity-30 text-gray-700 dark:text-gray-200">
            <ChevronRight />
          </button>
        </div>
      </main>

      <!-- Right: Properties -->
      <aside
        v-if="!isPreviewMode"
        class="w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 overflow-y-auto shrink-0 p-6 flex flex-col gap-6 transition-colors">
        <!-- Text Editor -->
        <div class="space-y-2">
          <h3 class="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <Type :size="18" /> {{ t('editor.structure') }}
          </h3>
          <input v-if="activeSlide"
            class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded font-bold bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            :value="activeSlide.title" @input="updateSlideTitle(($event.target as HTMLInputElement).value)" />
          <textarea v-if="activeSlide"
            class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded h-32 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            :value="activeSlide.contentPoints.join('\n')"
            @input="updateSlideContentPoints(($event.target as HTMLTextAreaElement).value)"
            :placeholder="t('editor.bullet_points_placeholder')" />
        </div>

        <!-- Visual Editor -->
        <div class="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <h3 class="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <ImageIcon :size="18" /> {{ t('editor.visuals') }}
          </h3>

          <div>
            <label class="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">{{ t('editor.prompt') }}</label>
            <textarea v-if="activeSlide"
              class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded h-24 text-sm mt-1 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              :value="activeSlide.visualPrompt"
              @input="updateSlideVisualPrompt(($event.target as HTMLTextAreaElement).value)" />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button v-if="activeSlide" @click="handleGenerateImage(activeSlide)"
              :disabled="activeSlide.status === SlideStatus.GENERATING"
              class="flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-3 rounded hover:bg-indigo-700 disabled:opacity-50 text-sm shadow-sm">
              <RefreshCw v-if="activeSlide.status === SlideStatus.GENERATING" class="animate-spin" :size="16" />
              <Sparkles v-else :size="16" />
              {{ t('btn.generate_slide') }}
            </button>

            <button v-if="activeSlide" @click="handleGenerateVideo(activeSlide)"
              class="flex items-center justify-center gap-2 bg-pink-600 text-white py-2 px-3 rounded hover:bg-pink-700 text-sm shadow-sm">
              <Video :size="16" />
              {{ t('editor.veo_video') }}
            </button>
          </div>
        </div>

        <!-- Speaker Notes -->
        <div class="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-800">
          <h3 class="font-semibold text-gray-700 dark:text-gray-200 text-sm">{{ t('editor.speaker_notes') }}</h3>
          <textarea v-if="activeSlide"
            class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded h-24 text-sm bg-yellow-50 dark:bg-yellow-900/20 text-gray-900 dark:text-yellow-100"
            :value="activeSlide.speakerNotes"
            @input="updateSlideSpeakerNotes(($event.target as HTMLTextAreaElement).value)" />
        </div>
      </aside>
    </div>
  </div>
</template>
