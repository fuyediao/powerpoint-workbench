<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { X, Settings, ChevronDown, Check, Cloud, Server, RefreshCw, Cpu, Workflow } from 'lucide-vue-next'
import { useProjectStore } from '@/stores/projectStore'
import { AiProvider } from '@/types'
import { useI18n } from '@/composables/useI18n'
import { getOllamaModels, getComfyUIWorkflows, type OllamaModel, type ComfyUIWorkflow } from '@/services/localAiService'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const store = useProjectStore()
const { t } = useI18n()

const isProviderOpen = ref(false)
const isOllamaModelOpen = ref(false)
const isComfyWorkflowOpen = ref(false)
const providerDropdownRef = ref<HTMLDivElement | null>(null)
const ollamaModelDropdownRef = ref<HTMLDivElement | null>(null)
const comfyWorkflowDropdownRef = ref<HTMLDivElement | null>(null)

const ollamaModels = ref<OllamaModel[]>([])
const comfyWorkflows = ref<ComfyUIWorkflow[]>([])
const isLoadingOllama = ref(false)
const isLoadingComfy = ref(false)
const ollamaError = ref<string | null>(null)
const comfyError = ref<string | null>(null)

// Click outside to close dropdowns
const handleClickOutside = (event: MouseEvent) => {
  if (providerDropdownRef.value && !providerDropdownRef.value.contains(event.target as Node)) {
    isProviderOpen.value = false
  }
  if (ollamaModelDropdownRef.value && !ollamaModelDropdownRef.value.contains(event.target as Node)) {
    isOllamaModelOpen.value = false
  }
  if (comfyWorkflowDropdownRef.value && !comfyWorkflowDropdownRef.value.contains(event.target as Node)) {
    isComfyWorkflowOpen.value = false
  }
}

// 檢測 Ollama 模型
const detectOllamaModels = async () => {
  if (!store.config.localEndpoint) return
  
  isLoadingOllama.value = true
  ollamaError.value = null
  
  try {
    const models = await getOllamaModels(store.config.localEndpoint)
    ollamaModels.value = models
    if (models.length > 0 && !store.config.ollamaModel) {
      // 自動選擇第一個模型
      store.updateConfig({ ollamaModel: models[0].name })
    }
  } catch (error) {
    ollamaError.value = error instanceof Error ? error.message : '無法連接到 Ollama 服務'
    console.error('Failed to fetch Ollama models:', error)
  } finally {
    isLoadingOllama.value = false
  }
}

// 檢測 ComfyUI 工作流
const detectComfyWorkflows = async () => {
  if (!store.config.comfyEndpoint) return
  
  isLoadingComfy.value = true
  comfyError.value = null
  
  try {
    const workflows = await getComfyUIWorkflows(store.config.comfyEndpoint)
    comfyWorkflows.value = workflows
    if (workflows.length > 0 && !store.config.comfyWorkflow) {
      // 自動選擇第一個工作流
      store.updateConfig({ comfyWorkflow: workflows[0].id })
    }
  } catch (error) {
    comfyError.value = error instanceof Error ? error.message : '無法連接到 ComfyUI 服務'
    console.error('Failed to fetch ComfyUI workflows:', error)
  } finally {
    isLoadingComfy.value = false
  }
}

// 當模態框打開且選擇了本地 AI 時，自動檢測
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && store.config.provider === AiProvider.LOCAL) {
    if (store.config.localEndpoint && ollamaModels.value.length === 0) {
      detectOllamaModels()
    }
    if (store.config.comfyEndpoint && comfyWorkflows.value.length === 0) {
      detectComfyWorkflows()
    }
  }
})

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

<template>
  <div v-if="props.isOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[500px] p-6 border border-gray-200 dark:border-gray-700 transition-colors">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-white">
          <Settings :size="20" />
          {{ t('nav.settings') }}
        </h2>
        <button @click="emit('close')" class="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full dark:text-gray-400">
          <X :size="20" />
        </button>
      </div>

      <div class="space-y-4">
        <div class="relative" ref="providerDropdownRef">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ t('settings.provider') }}
          </label>
          <button
            @click.prevent.stop="isProviderOpen = !isProviderOpen"
            type="button"
            class="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-linear-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm transition-all duration-300 flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <Cloud v-if="store.config.provider === AiProvider.GOOGLE" :size="18" class="text-indigo-600 dark:text-indigo-400" />
              <Server v-else :size="18" class="text-indigo-600 dark:text-indigo-400" />
              <span class="font-medium">
                {{ store.config.provider === AiProvider.GOOGLE ? 'Google Gemini (Cloud)' : 'Local AI (Ollama + ComfyUI)' }}
              </span>
            </div>
            <ChevronDown 
              :size="18" 
              class="text-gray-400 dark:text-gray-500 transition-transform duration-300"
              :class="{ 'rotate-180': isProviderOpen }"
            />
          </button>

          <!-- Dropdown Menu -->
          <div
            v-if="isProviderOpen"
            class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <button
              @click.prevent.stop="store.updateConfig({ provider: AiProvider.GOOGLE }); isProviderOpen = false"
              type="button"
              :class="[
                'w-full px-4 py-3 text-left flex items-center gap-3 text-sm font-medium transition-colors',
                store.config.provider === AiProvider.GOOGLE
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              ]"
            >
              <Cloud :size="18" :class="store.config.provider === AiProvider.GOOGLE ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'" />
              <span>Google Gemini (Cloud)</span>
              <Check v-if="store.config.provider === AiProvider.GOOGLE" :size="16" class="ml-auto text-indigo-600 dark:text-indigo-400" />
            </button>
            <button
              @click.prevent.stop="store.updateConfig({ provider: AiProvider.LOCAL }); isProviderOpen = false"
              type="button"
              :class="[
                'w-full px-4 py-3 text-left flex items-center gap-3 text-sm font-medium transition-colors',
                store.config.provider === AiProvider.LOCAL
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              ]"
            >
              <Server :size="18" :class="store.config.provider === AiProvider.LOCAL ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'" />
              <span>Local AI (Ollama + ComfyUI)</span>
              <Check v-if="store.config.provider === AiProvider.LOCAL" :size="16" class="ml-auto text-indigo-600 dark:text-indigo-400" />
            </button>
          </div>
        </div>

        <template v-if="store.config.provider === AiProvider.GOOGLE">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('settings.apiKey') }}
            </label>
            <input
              type="password"
              :value="store.config.apiKey"
              @input="store.updateConfig({ apiKey: ($event.target as HTMLInputElement).value })"
              placeholder="AIza..."
              class="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Get your key from <a href="https://aistudio.google.com/" target="_blank" class="text-indigo-600 dark:text-indigo-400 hover:underline">Google AI Studio</a>.
            </p>
          </div>
        </template>

        <template v-if="store.config.provider === AiProvider.LOCAL">
          <!-- Ollama 配置 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('settings.localUrl') }}
            </label>
            <div class="flex gap-2">
              <input
                type="text"
                :value="store.config.localEndpoint"
                @input="store.updateConfig({ localEndpoint: ($event.target as HTMLInputElement).value })"
                class="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="http://localhost:11434"
              />
              <button
                @click="detectOllamaModels"
                :disabled="isLoadingOllama"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm transition-colors flex items-center gap-2"
                title="檢測 Ollama 模型"
              >
                <RefreshCw :size="16" :class="{ 'animate-spin': isLoadingOllama }" />
                檢測
              </button>
            </div>
          </div>

          <!-- Ollama 模型選擇 -->
          <div class="relative" ref="ollamaModelDropdownRef">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Cpu :size="16" /> Ollama 模型
            </label>
            <button
              @click.prevent.stop="isOllamaModelOpen = !isOllamaModelOpen"
              type="button"
              :disabled="ollamaModels.length === 0 && !isLoadingOllama"
              class="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-linear-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm transition-all duration-300 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="font-medium">
                {{ store.config.ollamaModel || (isLoadingOllama ? '正在檢測...' : '請先檢測模型') }}
              </span>
              <ChevronDown 
                :size="18" 
                class="text-gray-400 dark:text-gray-500 transition-transform duration-300"
                :class="{ 'rotate-180': isOllamaModelOpen }"
              />
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="isOllamaModelOpen && ollamaModels.length > 0"
              class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50 max-h-60 overflow-y-auto"
            >
              <button
                v-for="model in ollamaModels"
                :key="model.name"
                @click.prevent.stop="store.updateConfig({ ollamaModel: model.name }); isOllamaModelOpen = false"
                type="button"
                :class="[
                  'w-full px-4 py-3 text-left flex items-center gap-3 text-sm font-medium transition-colors',
                  store.config.ollamaModel === model.name
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                ]"
              >
                <Cpu :size="16" :class="store.config.ollamaModel === model.name ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'" />
                <div class="flex-1">
                  <div class="font-medium">{{ model.name }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ (model.size / 1024 / 1024 / 1024).toFixed(2) }} GB</div>
                </div>
                <Check v-if="store.config.ollamaModel === model.name" :size="16" class="text-indigo-600 dark:text-indigo-400" />
              </button>
            </div>
            <p v-if="ollamaError" class="text-xs text-red-500 dark:text-red-400 mt-1">{{ ollamaError }}</p>
          </div>

          <!-- ComfyUI 配置 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('settings.comfyUrl') }}
            </label>
            <div class="flex gap-2">
              <input
                type="text"
                :value="store.config.comfyEndpoint"
                @input="store.updateConfig({ comfyEndpoint: ($event.target as HTMLInputElement).value })"
                class="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="http://localhost:8188"
              />
              <button
                @click="detectComfyWorkflows"
                :disabled="isLoadingComfy"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm transition-colors flex items-center gap-2"
                title="檢測 ComfyUI 工作流"
              >
                <RefreshCw :size="16" :class="{ 'animate-spin': isLoadingComfy }" />
                檢測
              </button>
            </div>
          </div>

          <!-- ComfyUI 工作流選擇 -->
          <div class="relative" ref="comfyWorkflowDropdownRef">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Workflow :size="16" /> ComfyUI 工作流
            </label>
            <button
              @click.prevent.stop="isComfyWorkflowOpen = !isComfyWorkflowOpen"
              type="button"
              :disabled="comfyWorkflows.length === 0 && !isLoadingComfy"
              class="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-linear-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm transition-all duration-300 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="font-medium">
                {{ store.config.comfyWorkflow || (isLoadingComfy ? '正在檢測...' : comfyWorkflows.length === 0 ? '請先檢測工作流' : '選擇工作流') }}
              </span>
              <ChevronDown 
                :size="18" 
                class="text-gray-400 dark:text-gray-500 transition-transform duration-300"
                :class="{ 'rotate-180': isComfyWorkflowOpen }"
              />
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="isComfyWorkflowOpen && comfyWorkflows.length > 0"
              class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50 max-h-60 overflow-y-auto"
            >
              <button
                v-for="workflow in comfyWorkflows"
                :key="workflow.id"
                @click.prevent.stop="store.updateConfig({ comfyWorkflow: workflow.id }); isComfyWorkflowOpen = false"
                type="button"
                :class="[
                  'w-full px-4 py-3 text-left flex items-center gap-3 text-sm font-medium transition-colors',
                  store.config.comfyWorkflow === workflow.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                ]"
              >
                <Workflow :size="16" :class="store.config.comfyWorkflow === workflow.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'" />
                <span>{{ workflow.name || workflow.id }}</span>
                <Check v-if="store.config.comfyWorkflow === workflow.id" :size="16" class="ml-auto text-indigo-600 dark:text-indigo-400" />
              </button>
            </div>
            <p v-if="comfyError" class="text-xs text-red-500 dark:text-red-400 mt-1">{{ comfyError }}</p>
            <p v-if="comfyWorkflows.length === 0 && !isLoadingComfy && !comfyError" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              提示：ComfyUI 工作流需要通過自定義 API 獲取，請確保您的 ComfyUI 服務器支持工作流列表 API
            </p>
          </div>
        </template>
      </div>

      <div class="mt-8 flex justify-end">
        <button
          @click="emit('close')"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md transition-colors"
        >
          Save & Close
        </button>
      </div>
    </div>
  </div>
</template>
