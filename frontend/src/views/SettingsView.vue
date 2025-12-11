<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useSettingsStore, type ServiceMode } from '../stores/settings';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import ThemeToggle from '../components/ThemeToggle.vue';
import SetupGuideModal from '../components/SetupGuideModal.vue';

const { t } = useI18n();
const router = useRouter();
const settingsStore = useSettingsStore();

const showOllamaGuide = ref(false);
const showComfyUIGuide = ref(false);

onMounted(() => {
  settingsStore.initSettings();
});

function handleSave() {
  settingsStore.saveSettings();
  router.push({ name: 'home' });
}

function handleCancel() {
  router.push({ name: 'home' });
}

function setServiceMode(mode: ServiceMode) {
  settingsStore.setServiceMode(mode);
}

async function handleCheckOllama() {
  await settingsStore.checkOllamaConnection();
}

async function handleCheckComfyUI() {
  await settingsStore.checkComfyUIConnection();
}
</script>

<template>
  <div class="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col overflow-hidden">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
      <div class="flex items-center gap-3">
        <button
          class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          @click="handleCancel"
        >
          <svg
            class="w-5 h-5 text-slate-600 dark:text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <span class="text-xl font-semibold text-slate-800 dark:text-slate-100">{{ t('settings.title') }}</span>
      </div>
      <div class="flex items-center gap-3">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto pt-20">
      <div class="max-w-2xl mx-auto px-6 py-12">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-8">
          <!-- Service Mode Switch -->
          <div class="mb-8">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              {{ t('settings.serviceMode') }}
            </h2>
            <div class="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600">
              <button
                :class="[
                  'flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2',
                  settingsStore.serviceMode === 'cloud'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                ]"
                @click="setServiceMode('cloud')"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                  />
                </svg>
                {{ t('settings.cloudMode') }}
              </button>
              <button
                :class="[
                  'flex-1 py-3 px-4 text-sm font-medium transition-colors border-l border-slate-200 dark:border-slate-600 flex items-center justify-center gap-2',
                  settingsStore.serviceMode === 'offline'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                ]"
                @click="setServiceMode('offline')"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {{ t('settings.offlineMode') }}
              </button>
            </div>
          </div>

          <!-- Cloud Mode Settings -->
          <div
            v-if="settingsStore.serviceMode === 'cloud'"
            class="space-y-6"
          >
            <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {{ t('settings.apiKeys') }}
            </h3>
            
            <!-- Gemini API Key -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {{ t('settings.geminiApiKey') }}
              </label>
              <input
                v-model="settingsStore.geminiApiKey"
                type="password"
                :placeholder="t('settings.apiKeyPlaceholder')"
                class="w-full px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg
                       border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                       placeholder:text-slate-400 dark:placeholder:text-slate-500"
              >
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {{ t('settings.geminiApiKeyDesc') }}
              </p>
            </div>

            <!-- Nano Banana API Key -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {{ t('settings.nanoBananaApiKey') }}
              </label>
              <input
                v-model="settingsStore.nanoBananaApiKey"
                type="password"
                :placeholder="t('settings.apiKeyPlaceholder')"
                class="w-full px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg
                       border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                       placeholder:text-slate-400 dark:placeholder:text-slate-500"
              >
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {{ t('settings.nanoBananaApiKeyDesc') }}
              </p>
            </div>
          </div>

          <!-- Offline Mode Settings -->
          <div
            v-else
            class="space-y-8"
          >
            <!-- Ollama Settings -->
            <div class="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {{ t('settings.ollamaTitle') }}
                </h3>
                <div class="flex items-center gap-2">
                  <!-- Connection Status -->
                  <span
                    v-if="settingsStore.isDetecting"
                    class="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400"
                  >
                    <svg
                      class="w-4 h-4 animate-spin"
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
                    {{ t('settings.detecting') }}
                  </span>
                  <span
                    v-else-if="settingsStore.ollamaConnected"
                    class="flex items-center gap-1 text-sm text-green-600 dark:text-green-400"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {{ t('settings.connected') }}
                  </span>
                  <span
                    v-else
                    class="flex items-center gap-1 text-sm text-red-600 dark:text-red-400"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    {{ t('settings.disconnected') }}
                  </span>
                </div>
              </div>

              <div class="space-y-4">
                <!-- Ollama URL -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {{ t('settings.ollamaUrl') }}
                  </label>
                  <div class="flex gap-2">
                    <input
                      v-model="settingsStore.ollamaUrl"
                      type="text"
                      placeholder="http://localhost:11434"
                      class="flex-1 px-4 py-2.5 bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 rounded-lg
                             border border-slate-200 dark:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                             placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    >
                    <button
                      class="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                      :disabled="settingsStore.isDetecting"
                      @click="handleCheckOllama"
                    >
                      <svg
                        v-if="settingsStore.isDetecting"
                        class="w-4 h-4 animate-spin"
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
                      {{ t('settings.checkConnection') }}
                    </button>
                  </div>
                </div>

                <!-- Ollama Model -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {{ t('settings.ollamaModel') }}
                  </label>
                  <select
                    v-if="settingsStore.ollamaAvailableModels.length > 0"
                    v-model="settingsStore.ollamaModel"
                    class="w-full px-4 py-2.5 bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 rounded-lg
                           border border-slate-200 dark:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option
                      v-for="model in settingsStore.ollamaAvailableModels"
                      :key="model"
                      :value="model"
                    >
                      {{ model }}
                    </option>
                  </select>
                  <input
                    v-else
                    v-model="settingsStore.ollamaModel"
                    type="text"
                    :placeholder="t('settings.ollamaModelPlaceholder')"
                    class="w-full px-4 py-2.5 bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 rounded-lg
                           border border-slate-200 dark:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                           placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  >
                  <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {{ t('settings.ollamaModelDesc') }}
                  </p>
                </div>

                <!-- Setup Guide Button -->
                <button
                  class="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  @click="showOllamaGuide = true"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {{ t('settings.viewSetupGuide') }}
                </button>
              </div>
            </div>

            <!-- ComfyUI Settings -->
            <div class="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {{ t('settings.comfyuiTitle') }}
                </h3>
                <div class="flex items-center gap-2">
                  <!-- Connection Status -->
                  <span
                    v-if="settingsStore.isDetecting"
                    class="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400"
                  >
                    <svg
                      class="w-4 h-4 animate-spin"
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
                    {{ t('settings.detecting') }}
                  </span>
                  <span
                    v-else-if="settingsStore.comfyuiConnected"
                    class="flex items-center gap-1 text-sm text-green-600 dark:text-green-400"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {{ t('settings.connected') }}
                  </span>
                  <span
                    v-else
                    class="flex items-center gap-1 text-sm text-red-600 dark:text-red-400"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    {{ t('settings.disconnected') }}
                  </span>
                </div>
              </div>

              <div class="space-y-4">
                <!-- ComfyUI URL -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {{ t('settings.comfyuiUrl') }}
                  </label>
                  <div class="flex gap-2">
                    <input
                      v-model="settingsStore.comfyuiUrl"
                      type="text"
                      placeholder="http://localhost:8188"
                      class="flex-1 px-4 py-2.5 bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 rounded-lg
                             border border-slate-200 dark:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                             placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    >
                    <button
                      class="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                      :disabled="settingsStore.isDetecting"
                      @click="handleCheckComfyUI"
                    >
                      <svg
                        v-if="settingsStore.isDetecting"
                        class="w-4 h-4 animate-spin"
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
                      {{ t('settings.checkConnection') }}
                    </button>
                  </div>
                </div>

                <!-- ComfyUI Model -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {{ t('settings.comfyuiModel') }}
                  </label>
                  <select
                    v-if="settingsStore.comfyuiAvailableModels.length > 0"
                    v-model="settingsStore.comfyuiModel"
                    class="w-full px-4 py-2.5 bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 rounded-lg
                           border border-slate-200 dark:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option
                      v-for="model in settingsStore.comfyuiAvailableModels"
                      :key="model"
                      :value="model"
                    >
                      {{ model }}
                    </option>
                  </select>
                  <input
                    v-else
                    v-model="settingsStore.comfyuiModel"
                    type="text"
                    :placeholder="t('settings.comfyuiModelPlaceholder')"
                    class="w-full px-4 py-2.5 bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 rounded-lg
                           border border-slate-200 dark:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                           placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  >
                  <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {{ t('settings.comfyuiModelDesc') }}
                  </p>
                </div>

                <!-- ComfyUI Workflow -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {{ t('settings.comfyuiWorkflow') }}
                  </label>
                  <textarea
                    v-model="settingsStore.comfyuiWorkflow"
                    rows="6"
                    :placeholder="t('settings.comfyuiWorkflowPlaceholder')"
                    class="w-full px-4 py-2.5 bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 rounded-lg
                           border border-slate-200 dark:border-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                           placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono text-sm resize-none"
                  />
                  <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {{ t('settings.comfyuiWorkflowDesc') }}
                  </p>
                </div>

                <!-- Setup Guide Button -->
                <button
                  class="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  @click="showComfyUIGuide = true"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {{ t('settings.viewSetupGuide') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-8 flex justify-end gap-3">
            <button
              class="px-6 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              @click="handleCancel"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              class="px-6 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
              @click="handleSave"
            >
              {{ t('common.save') }}
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Setup Guide Modals -->
    <SetupGuideModal
      v-if="showOllamaGuide"
      type="ollama"
      @close="showOllamaGuide = false"
    />
    <SetupGuideModal
      v-if="showComfyUIGuide"
      type="comfyui"
      @close="showComfyUIGuide = false"
    />
  </div>
</template>
