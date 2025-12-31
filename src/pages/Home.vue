<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '@/composables/useI18n'
import { useTheme } from '@/composables/useTheme'
import { useProjectStore } from '@/stores/projectStore'
import { Language, SlideStyle, AiProvider, type SupportedLanguage } from '@/types'
import { SUPPORTED_LANGUAGES } from '@/constants'
import { Settings, FileText, Upload, Globe, Palette, Moon, Sun, X, ChevronDown, Check, Maximize2 } from 'lucide-vue-next'
import type { UploadedFile } from '@/stores/projectStore'
import { h, defineAsyncComponent } from 'vue'

// 動態導入 Modal 組件以減少初始 bundle 大小
const SettingsModal = defineAsyncComponent(() => import('@/components/SettingsModal.vue'))
const TextEditorModal = defineAsyncComponent(() => import('@/components/TextEditorModal.vue'))

// 動態導入國旗組件（按需加載）
let UnitedStatesFlag: ((props: { size?: number }) => ReturnType<typeof h>) | null = null
let ChinaFlag: ((props: { size?: number }) => ReturnType<typeof h>) | null = null
let TaiwanFlag: ((props: { size?: number }) => ReturnType<typeof h>) | null = null

// 預加載國旗組件（在組件掛載時）
const loadFlagIcons = async () => {
  if (!UnitedStatesFlag) {
    const flagIcons = await import('@/flag/FlagIcons.vue')
    UnitedStatesFlag = flagIcons.UnitedStatesFlag
    ChinaFlag = flagIcons.ChinaFlag
    TaiwanFlag = flagIcons.TaiwanFlag
  }
}

const router = useRouter()
const store = useProjectStore()
const { t, lang, setLang } = useI18n()
const { theme, themeMode, toggleTheme } = useTheme()

const isSettingsOpen = ref(false)
const isLanguageOpen = ref(false)
const isStyleOpen = ref(false)
const isTextEditorOpen = ref(false)
const languageDropdownRef = ref<HTMLDivElement | null>(null)
const styleDropdownRef = ref<HTMLDivElement | null>(null)

// Click outside to close dropdowns
const handleClickOutside = (event: MouseEvent) => {
  if (languageDropdownRef.value && !languageDropdownRef.value.contains(event.target as Node)) {
    isLanguageOpen.value = false
  }
  if (styleDropdownRef.value && !styleDropdownRef.value.contains(event.target as Node)) {
    isStyleOpen.value = false
  }
}

onMounted(async () => {
  document.addEventListener('mousedown', handleClickOutside)
  // 預加載國旗組件
  await loadFlagIcons()
  // 當返回首頁時，如果有舊的投影片數據，清除它們（但保留配置）
  // 這樣可以確保開始新專案時不會顯示舊專案的內容
  if (store.slides.length > 0) {
    store.resetProject()
  }
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

const handleStart = () => {
  if (!store.config.sourceText && store.uploadedFiles.length === 0) {
    alert(t.value('Please enter some text or upload a file.'))
    return
  }

  if (store.config.provider === AiProvider.GOOGLE && !store.config.apiKey) {
    isSettingsOpen.value = true
    return
  }

  // 開始新專案前，確保清除舊的投影片數據
  if (store.slides.length > 0) {
    store.resetProject()
  }

  router.push('/editor')
}

const handleFileUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) {
    return
  }

  // 直接存儲文件對象，所有文件都直接給 Gemini API 解析
  for (const file of Array.from(files)) {
    const fileId = crypto.randomUUID()
    
    // 判斷文件類型（用於顯示）
    let fileType: 'text' | 'image' | 'document' = 'document'
    if (file.type.startsWith('image/')) {
      fileType = 'image'
    } else if (file.type.startsWith('text/') || 
               file.name.endsWith('.txt') || 
               file.name.endsWith('.md') || 
               file.name.endsWith('.json')) {
      fileType = 'text'
    }
    
    // 對於圖片，生成預覽（僅用於 UI 顯示）
    if (fileType === 'image') {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string
        const uploadedFile: UploadedFile = {
          id: fileId,
          name: file.name,
          type: fileType,
          content: dataUrl, // 僅用於預覽顯示
          file: file
        }
        store.addUploadedFile(uploadedFile)
      }
      reader.readAsDataURL(file)
    } else {
      // 其他文件類型（包括 txt、markdown）直接存儲，全部交給 AI 解析
      const uploadedFile: UploadedFile = {
        id: fileId,
        name: file.name,
        type: fileType,
        content: '', // 不需要預覽，AI 會直接解析文件內容
        file: file
      }
      store.addUploadedFile(uploadedFile)
    }
  }

  // 清空 input，允許重複選擇相同文件
  target.value = ''
}

const removeFile = (id: string) => {
  store.removeUploadedFile(id)
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const handleTextUpdate = (content: string) => {
  store.updateConfig({ sourceText: content })
}

// 根據語言代碼獲取對應的國旗組件
const getFlagComponent = (langCode: string) => {
  switch (langCode) {
    case 'en':
      return UnitedStatesFlag ? h(UnitedStatesFlag, { size: 16 }) : h(Globe, { size: 16 })
    case 'zh-CN':
      return ChinaFlag ? h(ChinaFlag, { size: 16 }) : h(Globe, { size: 16 })
    case 'zh-TW':
      return TaiwanFlag ? h(TaiwanFlag, { size: 16 }) : h(Globe, { size: 16 })
    default:
      return h(Globe, { size: 16 })
  }
}

// 獲取主題切換按鈕的標籤
const getThemeLabel = () => {
  if (themeMode.value === 'system') {
    return t.value('theme.system')
  } else if (themeMode.value === 'dark') {
    return t.value('theme.switch_to_light')
  } else {
    return t.value('theme.switch_to_dark')
  }
}
</script>

<template>
  <div
    class="h-screen overflow-hidden bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col transition-colors duration-300">
    <SettingsModal :is-open="isSettingsOpen" @close="isSettingsOpen = false" />
    <TextEditorModal 
      :is-open="isTextEditorOpen" 
      :content="store.config.sourceText"
      @close="isTextEditorOpen = false"
      @update="handleTextUpdate"
    />

    <!-- Nav -->
    <nav class="flex justify-between items-center p-6 px-12 shrink-0">
      <div
        class="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
        {{ t('app.title') }}
      </div>
      <div class="flex gap-3 items-center">
        <!-- Language Dropdown -->
        <div class="relative" ref="languageDropdownRef">
          <button @click.prevent.stop="isLanguageOpen = !isLanguageOpen" type="button" aria-label="Select language"
            :title="SUPPORTED_LANGUAGES.find((l: SupportedLanguage) => l.code === lang)?.label"
            class="w-11 h-11 p-0 flex items-center justify-center bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-full hover:bg-linear-to-r hover:from-indigo-50 hover:via-purple-50 hover:to-pink-50 dark:hover:from-gray-700 dark:hover:via-gray-700 dark:hover:to-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:border-indigo-500 dark:focus:border-indigo-400 cursor-pointer shadow-sm transition-all duration-300">
            <Globe :size="18" class="text-indigo-600 dark:text-indigo-400 transition-colors" />
          </button>

          <!-- Dropdown Menu -->
          <div v-if="isLanguageOpen"
            class="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <button v-for="language in SUPPORTED_LANGUAGES" :key="language.code"
              @click.prevent.stop="setLang(language.code as Language); isLanguageOpen = false" type="button" :class="[
                'w-full px-4 py-3 text-left flex items-center gap-3 text-sm font-medium transition-colors',
                lang === language.code
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              ]">
              <div class="shrink-0 w-4 h-4 flex items-center justify-center">
                <component :is="getFlagComponent(language.code)" />
              </div>
              <span>{{ language.label }}</span>
              <span v-if="lang === language.code" class="ml-auto text-indigo-600 dark:text-indigo-400">✓</span>
            </button>
          </div>
        </div>

        <!-- Theme Toggle -->
        <button @click.prevent.stop="toggleTheme()" type="button"
          :aria-label="getThemeLabel()"
          :title="getThemeLabel()"
          class="p-2.5 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:bg-linear-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-full shadow-sm transition-all duration-300 group">
          <Sun v-if="theme === 'dark'" :size="18" class="transition-transform duration-300 group-hover:rotate-180" />
          <Moon v-else :size="18" class="transition-transform duration-300 group-hover:rotate-12" />
        </button>

        <!-- Settings Button -->
        <button @click.prevent.stop="isSettingsOpen = true" type="button" :aria-label="t('nav.settings')"
          :title="t('nav.settings')"
          class="w-11 h-11 p-0 flex items-center justify-center bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:bg-linear-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm rounded-full text-indigo-600 dark:text-indigo-400 transition-all duration-300">
          <Settings :size="18" />
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full p-6 overflow-y-auto scrollbar-hidden">
      <h1 class="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 text-center leading-tight drop-shadow-sm">
        {{ t('home.welcome') }}
      </h1>

      <div
        class="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-black/30 p-8 border border-indigo-100 dark:border-gray-700 transition-colors duration-300">
        <!-- Input Section -->
        <div class="mb-6">
          <label class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <FileText :size="16" /> {{ t('input.label') }}
          </label>
          <div class="relative">
            <textarea :value="store.config.sourceText"
              @input="store.updateConfig({ sourceText: ($event.target as HTMLTextAreaElement).value })"
              class="w-full h-40 p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
              :placeholder="t('input.placeholder')" />
            <div class="absolute bottom-4 right-4 flex gap-2">
              <button
                @click="isTextEditorOpen = true"
                class="cursor-pointer flex items-center gap-2 bg-white dark:bg-gray-600 px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 text-sm font-medium text-gray-600 dark:text-gray-200 transition-colors"
                :title="t('input.expand') || '展開編輯'"
              >
                <Maximize2 :size="14" />
                {{ t('input.expand') || '展開' }}
              </button>
              <label
                class="cursor-pointer flex items-center gap-2 bg-white dark:bg-gray-600 px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 text-sm font-medium text-gray-600 dark:text-gray-200 transition-colors">
                <Upload :size="14" />
                {{ t('input.upload') }}
                <input type="file" class="hidden"
                  accept=".txt,.md,.json,.pdf,.csv,.xlsx,.xls,.jpg,.jpeg,.png,.gif,.webp" multiple
                  @change="handleFileUpload" />
              </label>
            </div>
          </div>
          <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {{ t('input.file_upload_hint') }}
          </p>

          <!-- Uploaded Files List -->
          <div v-if="store.uploadedFiles.length > 0" class="mt-4 space-y-2">
            <div class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
              {{ t('input.uploaded_files').replace('{count}', String(store.uploadedFiles.length)) }}
            </div>
            <div class="space-y-2 max-h-48 overflow-y-auto">
              <div v-for="file in store.uploadedFiles" :key="file.id"
                class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <!-- Image Preview -->
                <div v-if="file.type === 'image'" class="shrink-0">
                  <img :src="file.content" :alt="file.name"
                    class="w-12 h-12 object-cover rounded border border-gray-200 dark:border-gray-600" />
                </div>
                <!-- Text File Icon -->
                <div v-else-if="file.type === 'text'" class="shrink-0">
                  <FileText :size="24" class="text-indigo-600 dark:text-indigo-400" />
                </div>
                <!-- Office Document Icon -->
                <div v-else-if="file.type === 'document'" class="shrink-0">
                  <FileText :size="24" class="text-blue-600 dark:text-blue-400" />
                </div>

                <!-- File Info -->
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {{ file.name }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    <span v-if="file.type === 'image'">{{ t('input.file_type_image') }}</span>
                    <span v-else-if="file.type === 'document'">{{ t('input.file_type_document') }}</span>
                    <span v-else>{{ t('input.file_type_text') }}</span>
                    · {{ formatFileSize(file.file.size) }}
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center gap-2">
                  <!-- File Type Badge -->
                  <span class="shrink-0 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded"
                    :title="t('input.file_ai_parse_hint')">
                    {{ file.type === 'image' ? t('input.file_type_badge_image') : file.type === 'text' ? t('input.file_type_badge_text') : t('input.file_type_badge_document') }}
                  </span>
                  <!-- Remove Button -->
                  <button @click="removeFile(file.id)"
                    class="shrink-0 p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    :aria-label="t('input.remove_file').replace('{name}', file.name)">
                    <X :size="16" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Configuration -->
        <div class="space-y-6 mb-8">
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {{ t('config.pages') }}
              <span class="ml-2 text-indigo-600 dark:text-indigo-400 font-bold">{{ store.config.pageCount }}</span>
            </label>
            <input type="range" :min="1" :max="50" :value="store.config.pageCount"
              @input="store.updateConfig({ pageCount: parseInt(($event.target as HTMLInputElement).value) })"
              class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400" />
            <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1</span>
              <span>50</span>
            </div>
          </div>
          <div class="relative" ref="styleDropdownRef">
            <label class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Palette :size="16" /> {{ t('config.style') }}
            </label>
            <button @click.prevent.stop="isStyleOpen = !isStyleOpen" type="button"
              class="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-linear-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm transition-all duration-300 flex items-center justify-between">
              <span class="font-medium">
                {{ store.config.style === SlideStyle.CONCISE ? t('style.concise') : t('style.detailed') }}
              </span>
              <ChevronDown :size="18" class="text-gray-400 dark:text-gray-500 transition-transform duration-300"
                :class="{ 'rotate-180': isStyleOpen }" />
            </button>

            <!-- Dropdown Menu -->
            <div v-if="isStyleOpen"
              class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <button @click.prevent.stop="store.updateConfig({ style: SlideStyle.CONCISE }); isStyleOpen = false"
                type="button" :class="[
                  'w-full px-4 py-3 text-left flex items-center gap-3 text-sm font-medium transition-colors',
                  store.config.style === SlideStyle.CONCISE
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                ]">
                <Palette :size="16"
                  :class="store.config.style === SlideStyle.CONCISE ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'" />
                <span>{{ t('style.concise') }}</span>
                <Check v-if="store.config.style === SlideStyle.CONCISE" :size="16"
                  class="ml-auto text-indigo-600 dark:text-indigo-400" />
              </button>
              <button @click.prevent.stop="store.updateConfig({ style: SlideStyle.DETAILED }); isStyleOpen = false"
                type="button" :class="[
                  'w-full px-4 py-3 text-left flex items-center gap-3 text-sm font-medium transition-colors',
                  store.config.style === SlideStyle.DETAILED
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                ]">
                <Palette :size="16"
                  :class="store.config.style === SlideStyle.DETAILED ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'" />
                <span>{{ t('style.detailed') }}</span>
                <Check v-if="store.config.style === SlideStyle.DETAILED" :size="16"
                  class="ml-auto text-indigo-600 dark:text-indigo-400" />
              </button>
            </div>
          </div>
        </div>

        <div class="mb-8">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{{ t('config.custom')
          }}</label>
          <input type="text" :placeholder="t('config.custom_placeholder')" :value="store.config.customStylePrompt || ''"
            @input="store.updateConfig({ customStylePrompt: ($event.target as HTMLInputElement).value })"
            class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-400 dark:placeholder-gray-500" />
        </div>

        <button @click="handleStart"
          class="w-full py-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.01] transition-all">
          {{ t('home.start') }}
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* 隱藏滾動條但保留滾動功能 */
.scrollbar-hidden {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 和 Edge */
}

.scrollbar-hidden::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
</style>
