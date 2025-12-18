<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  type: 'ollama' | 'comfyui';
}>();

const emit = defineEmits<{
  close: [];
}>();

const { t } = useI18n();
const copiedIndex = ref<number | null>(null);

const title = computed(() => {
  return props.type === 'ollama' 
    ? t('setupGuide.ollamaTitle') 
    : t('setupGuide.comfyuiTitle');
});

const steps = computed(() => {
  if (props.type === 'ollama') {
    return [
      {
        title: t('setupGuide.ollama.step1Title'),
        description: t('setupGuide.ollama.step1Desc'),
        command: `# 方法一：使用 winget 安裝（推薦）
winget install Ollama.Ollama

# 方法二：下載安裝包
# 訪問 https://ollama.ai/download 下載 Windows 版本`,
      },
      {
        title: t('setupGuide.ollama.step2Title'),
        description: t('setupGuide.ollama.step2Desc'),
        command: `# Ollama 安裝後會自動作為服務運行
# 如果需要手動啟動，在終端執行：
ollama serve`,
      },
      {
        title: t('setupGuide.ollama.step3Title'),
        description: t('setupGuide.ollama.step3Desc'),
        command: `# 下載推薦的模型（選擇其中一個）

# Llama 3.2 (3B) - 輕量級，適合一般對話
ollama pull llama3.2

# Qwen 2.5 (7B) - 中文支持良好
ollama pull qwen2.5

# Mistral (7B) - 高性能通用模型
ollama pull mistral`,
      },
      {
        title: t('setupGuide.ollama.step4Title'),
        description: t('setupGuide.ollama.step4Desc'),
        command: `# 查看已安裝的模型
ollama list

# 測試模型
ollama run llama3.2 "Hello, how are you?"`,
      },
    ];
  } else {
    return [
      {
        title: t('setupGuide.comfyui.step1Title'),
        description: t('setupGuide.comfyui.step1Desc'),
        command: `# 方法一：使用桌面版（推薦，最簡單）
# 從 https://github.com/comfyanonymous/ComfyUI/releases 下載 Windows 桌面版
# 解壓後雙擊 ComfyUI.exe 即可啟動

# 方法二：從源代碼安裝
# 確保已安裝 Python 3.10+ 和 Git
python --version
git --version

# 如果沒有安裝 Python，可以從 https://python.org 下載
# 或使用 winget:
winget install Python.Python.3.11`,
      },
      {
        title: t('setupGuide.comfyui.step2Title'),
        description: t('setupGuide.comfyui.step2Desc'),
        command: `# 如果使用桌面版，跳過此步驟

# 如果從源代碼安裝：
# 克隆 ComfyUI 倉庫
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI

# 創建虛擬環境（推薦）
python -m venv venv
.\\venv\\Scripts\\Activate.ps1`,
      },
      {
        title: t('setupGuide.comfyui.step3Title'),
        description: t('setupGuide.comfyui.step3Desc'),
        command: `# 如果使用桌面版，跳過此步驟

# 如果從源代碼安裝：
# 安裝 PyTorch（NVIDIA GPU）
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# 安裝 ComfyUI 依賴
pip install -r requirements.txt`,
      },
      {
        title: t('setupGuide.comfyui.step4Title'),
        description: t('setupGuide.comfyui.step4Desc'),
        command: `# 下載 Stable Diffusion XL 模型
# 從 https://civitai.com 或 https://huggingface.co 下載模型

# 桌面版：將 .safetensors 文件放入
# C:\\Users\\你的用戶名\\AppData\\Local\\Programs\\ComfyUI\\resources\\app.asar.unpacked\\node_modules\\ComfyUI\\models\\checkpoints\\

# 源代碼版：將 .safetensors 文件放入
# ComfyUI/models/checkpoints/ 目錄

# 推薦模型：
# - SDXL Base 1.0
# - DreamShaper XL
# - Juggernaut XL`,
      },
      {
        title: t('setupGuide.comfyui.step5Title'),
        description: t('setupGuide.comfyui.step5Desc'),
        command: `# 桌面版：雙擊 ComfyUI.exe 啟動
# 啟動後 ComfyUI 窗口會自動打開
# API 服務器默認在 http://localhost:8188 運行

# 源代碼版：運行以下命令
python main.py

# 啟動後訪問 http://localhost:8188
# 確保 API 可用（默認已啟用）`,
      },
    ];
  }
});

async function copyCommand(command: string, index: number) {
  try {
    await navigator.clipboard.writeText(command);
    copiedIndex.value = index;
    setTimeout(() => {
      copiedIndex.value = null;
    }, 2000);
  } catch (error) {
    console.error('Failed to copy:', error);
  }
}

function handleClose() {
  emit('close');
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      @click.self="handleClose"
    >
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">
            {{ title }}
          </h2>
          <button
            class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            @click="handleClose"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6">
          <div class="space-y-6">
            <div
              v-for="(step, index) in steps"
              :key="index"
              class="relative"
            >
              <!-- Step Number -->
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {{ index + 1 }}
                </div>
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    {{ step.title }}
                  </h3>
                  <p class="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {{ step.description }}
                  </p>
                  
                  <!-- Command Block -->
                  <div class="relative bg-slate-900 rounded-lg overflow-hidden">
                    <div class="flex items-center justify-between px-4 py-2 bg-slate-800">
                      <span class="text-xs text-slate-400">PowerShell</span>
                      <button
                        class="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                        @click="copyCommand(step.command, index)"
                      >
                        <svg
                          v-if="copiedIndex === index"
                          class="w-4 h-4 text-green-400"
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
                        <svg
                          v-else
                          class="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        {{ copiedIndex === index ? t('common.copied') : t('common.copy') }}
                      </button>
                    </div>
                    <pre class="p-4 text-sm text-green-400 overflow-x-auto"><code>{{ step.command }}</code></pre>
                  </div>
                </div>
              </div>

              <!-- Connector Line -->
              <div
                v-if="index < steps.length - 1"
                class="absolute left-4 top-10 bottom-0 w-px bg-slate-200 dark:bg-slate-600 -translate-x-1/2"
                style="height: calc(100% - 2rem)"
              />
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
          <div class="flex items-center justify-between">
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ t('setupGuide.note') }}
            </p>
            <button
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              @click="handleClose"
            >
              {{ t('common.close') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

