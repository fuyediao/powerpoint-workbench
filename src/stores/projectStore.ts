import { ref } from 'vue'
import { defineStore } from 'pinia'
import { type ProjectConfig, type SlideData, SlideStyle, AiProvider } from '@/types'

export interface UploadedFile {
  id: string
  name: string
  type: 'text' | 'image' | 'document'
  content: string // 文本內容、圖片 base64/data URL 或 Office 文件的 base64
  file: File
}

export const useProjectStore = defineStore('project', () => {
  const config = ref<ProjectConfig>({
    sourceText: '',
    pageCount: 10,
    style: SlideStyle.CONCISE,
    provider: AiProvider.GOOGLE,
    apiKey: '',
    localEndpoint: 'http://localhost:11434',
    comfyEndpoint: 'http://localhost:8188',
    ollamaModel: '',
    comfyWorkflow: ''
  })

  const slides = ref<SlideData[]>([])
  const uploadedFiles = ref<UploadedFile[]>([])

  function setConfig(newConfig: ProjectConfig) {
    config.value = newConfig
  }

  function updateConfig(partialConfig: Partial<ProjectConfig>) {
    config.value = { ...config.value, ...partialConfig }
  }

  function setSlides(newSlides: SlideData[]) {
    slides.value = newSlides
  }

  function updateSlide(id: string, data: Partial<SlideData>) {
    const index = slides.value.findIndex(s => s.id === id)
    if (index !== -1) {
      slides.value[index] = { ...slides.value[index], ...data }
    }
  }

  function addUploadedFile(file: UploadedFile) {
    uploadedFiles.value.push(file)
    // 不再自動填充到 sourceText，讓用戶手動選擇
  }

  function removeUploadedFile(id: string) {
    const index = uploadedFiles.value.findIndex(f => f.id === id)
    if (index !== -1) {
      uploadedFiles.value.splice(index, 1)
    }
  }

  function clearUploadedFiles() {
    uploadedFiles.value = []
  }

  /**
   * 重置專案：清除所有投影片數據，但保留配置（API Key、Provider 等）
   * 用於開始新專案時清除舊專案數據
   */
  function resetProject() {
    slides.value = []
    // 保留配置中的 API Key 和 Provider 設置，只清除內容相關的配置
    config.value = {
      ...config.value,
      sourceText: '',
      pageCount: 10,
      style: SlideStyle.CONCISE,
      customStylePrompt: undefined
    }
    uploadedFiles.value = []
  }

  /**
   * 完全重置：清除所有數據，包括配置
   * 用於完全重新開始
   */
  function resetAll() {
    slides.value = []
    config.value = {
      sourceText: '',
      pageCount: 10,
      style: SlideStyle.CONCISE,
      provider: AiProvider.GOOGLE,
      apiKey: '',
      localEndpoint: 'http://localhost:11434',
      comfyEndpoint: 'http://localhost:8188',
      ollamaModel: '',
      comfyWorkflow: ''
    }
    uploadedFiles.value = []
  }

  return {
    config,
    slides,
    uploadedFiles,
    setConfig,
    updateConfig,
    setSlides,
    updateSlide,
    addUploadedFile,
    removeUploadedFile,
    clearUploadedFiles,
    resetProject,
    resetAll
  }
})
