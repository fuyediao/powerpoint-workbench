import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export type ServiceMode = 'cloud' | 'offline';

export interface OllamaModel {
  name: string;
  size: number;
  modifiedAt: string;
}

export interface ComfyUIModel {
  name: string;
  type: string;
}

export const useSettingsStore = defineStore('settings', () => {
  // 服務模式
  const serviceMode = ref<ServiceMode>('cloud');

  // 雲端服務配置
  const geminiApiKey = ref('');
  const nanoBananaApiKey = ref('');

  // Ollama 配置
  const ollamaUrl = ref('http://localhost:11434');
  const ollamaModel = ref('');
  const ollamaConnected = ref(false);
  const ollamaAvailableModels = ref<string[]>([]);

  // ComfyUI 配置
  const comfyuiUrl = ref('http://localhost:8000');
  const comfyuiModel = ref('');
  const comfyuiWorkflow = ref('');
  const comfyuiConnected = ref(false);
  const comfyuiAvailableModels = ref<string[]>([]);

  // 檢測狀態
  const isDetecting = ref(false);
  const detectError = ref<string | null>(null);

  // 初始化設置
  function initSettings() {
    // 服務模式
    const savedServiceMode = localStorage.getItem('serviceMode') as ServiceMode | null;
    if (savedServiceMode) {
      serviceMode.value = savedServiceMode;
    }

    // 雲端 API Keys
    const savedGeminiKey = localStorage.getItem('geminiApiKey');
    const savedNanoBananaKey = localStorage.getItem('nanoBananaApiKey');
    if (savedGeminiKey) {
      geminiApiKey.value = savedGeminiKey;
    }
    if (savedNanoBananaKey) {
      nanoBananaApiKey.value = savedNanoBananaKey;
    }

    // Ollama 配置
    const savedOllamaUrl = localStorage.getItem('ollamaUrl');
    const savedOllamaModel = localStorage.getItem('ollamaModel');
    if (savedOllamaUrl) {
      ollamaUrl.value = savedOllamaUrl;
    }
    if (savedOllamaModel) {
      ollamaModel.value = savedOllamaModel;
    }

    // ComfyUI 配置
    const savedComfyuiUrl = localStorage.getItem('comfyuiUrl');
    const savedComfyuiModel = localStorage.getItem('comfyuiModel');
    const savedComfyuiWorkflow = localStorage.getItem('comfyuiWorkflow');
    if (savedComfyuiUrl) {
      comfyuiUrl.value = savedComfyuiUrl;
    }
    if (savedComfyuiModel) {
      comfyuiModel.value = savedComfyuiModel;
    }
    if (savedComfyuiWorkflow) {
      comfyuiWorkflow.value = savedComfyuiWorkflow;
    }
  }

  // 保存設置
  function saveSettings() {
    // 服務模式
    localStorage.setItem('serviceMode', serviceMode.value);

    // 雲端 API Keys
    if (geminiApiKey.value) {
      localStorage.setItem('geminiApiKey', geminiApiKey.value);
    } else {
      localStorage.removeItem('geminiApiKey');
    }
    if (nanoBananaApiKey.value) {
      localStorage.setItem('nanoBananaApiKey', nanoBananaApiKey.value);
    } else {
      localStorage.removeItem('nanoBananaApiKey');
    }

    // Ollama 配置
    localStorage.setItem('ollamaUrl', ollamaUrl.value);
    if (ollamaModel.value) {
      localStorage.setItem('ollamaModel', ollamaModel.value);
    } else {
      localStorage.removeItem('ollamaModel');
    }

    // ComfyUI 配置
    localStorage.setItem('comfyuiUrl', comfyuiUrl.value);
    if (comfyuiModel.value) {
      localStorage.setItem('comfyuiModel', comfyuiModel.value);
    } else {
      localStorage.removeItem('comfyuiModel');
    }
    if (comfyuiWorkflow.value) {
      localStorage.setItem('comfyuiWorkflow', comfyuiWorkflow.value);
    } else {
      localStorage.removeItem('comfyuiWorkflow');
    }
  }

  // 獲取 Ollama 代理 URL（開發環境使用代理避免 CORS）
  function getOllamaProxyUrl(): string {
    // 如果是默認的 localhost 地址，使用 Vite 代理
    if (ollamaUrl.value === 'http://localhost:11434' || ollamaUrl.value === 'http://127.0.0.1:11434') {
      return '/ollama-proxy';
    }
    return ollamaUrl.value;
  }

  // 獲取 ComfyUI 代理 URL（開發環境使用代理避免 CORS）
  function getComfyUIProxyUrl(): string {
    // 如果是默認的 localhost 地址，使用 Vite 代理
    if (comfyuiUrl.value === 'http://localhost:8000' || comfyuiUrl.value === 'http://127.0.0.1:8000' || 
        comfyuiUrl.value === 'http://localhost:8188' || comfyuiUrl.value === 'http://127.0.0.1:8188') {
      return '/comfyui-proxy';
    }
    return comfyuiUrl.value;
  }

  // 檢測 Ollama 連接
  async function checkOllamaConnection(): Promise<boolean> {
    try {
      const proxyUrl = getOllamaProxyUrl();
      const response = await fetch(`${proxyUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json() as { models?: Array<{ name: string }> };
        ollamaConnected.value = true;
        if (data.models && Array.isArray(data.models)) {
          ollamaAvailableModels.value = data.models.map((m) => m.name);
          // 如果沒有選擇模型但有可用模型，自動選擇第一個
          if (!ollamaModel.value && ollamaAvailableModels.value.length > 0) {
            ollamaModel.value = ollamaAvailableModels.value[0];
          }
        }
        return true;
      }
      ollamaConnected.value = false;
      return false;
    } catch {
      ollamaConnected.value = false;
      ollamaAvailableModels.value = [];
      return false;
    }
  }

  // 檢測 ComfyUI 連接
  async function checkComfyUIConnection(): Promise<boolean> {
    try {
      const proxyUrl = getComfyUIProxyUrl();
      const response = await fetch(`${proxyUrl}/system_stats`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        comfyuiConnected.value = true;

        // 嘗試獲取可用的 checkpoint 模型
        try {
          const objectInfoResponse = await fetch(`${proxyUrl}/object_info/CheckpointLoaderSimple`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
          });

          if (objectInfoResponse.ok) {
            const objectInfo = await objectInfoResponse.json() as {
              CheckpointLoaderSimple?: {
                input?: {
                  required?: {
                    ckpt_name?: [string[]];
                  };
                };
              };
            };
            const ckptNames = objectInfo?.CheckpointLoaderSimple?.input?.required?.ckpt_name?.[0];
            if (Array.isArray(ckptNames)) {
              comfyuiAvailableModels.value = ckptNames;
              // 如果沒有選擇模型但有可用模型，自動選擇第一個
              if (!comfyuiModel.value && comfyuiAvailableModels.value.length > 0) {
                comfyuiModel.value = comfyuiAvailableModels.value[0];
              }
            }
          }
        } catch {
          // 無法獲取模型列表，但服務仍然連接
        }

        return true;
      }
      comfyuiConnected.value = false;
      return false;
    } catch {
      comfyuiConnected.value = false;
      comfyuiAvailableModels.value = [];
      return false;
    }
  }

  // 自動檢測所有離線服務
  async function autoDetectServices() {
    isDetecting.value = true;
    detectError.value = null;

    try {
      // 並行檢測 Ollama 和 ComfyUI
      const [ollamaResult, comfyuiResult] = await Promise.all([
        checkOllamaConnection(),
        checkComfyUIConnection(),
      ]);

      // 如果離線服務可用且當前是雲端模式且沒有設置過服務模式，建議切換到離線
      const savedServiceMode = localStorage.getItem('serviceMode');
      if (!savedServiceMode && (ollamaResult || comfyuiResult)) {
        // 可以在這裡添加提示用戶切換到離線模式的邏輯
      }
    } catch (error) {
      detectError.value = error instanceof Error ? error.message : '檢測失敗';
    } finally {
      isDetecting.value = false;
    }
  }

  // 設置服務模式
  function setServiceMode(mode: ServiceMode) {
    serviceMode.value = mode;
    saveSettings();
  }

  // 監聽變化並自動保存
  watch([geminiApiKey, nanoBananaApiKey, ollamaUrl, ollamaModel, comfyuiUrl, comfyuiModel, comfyuiWorkflow], () => {
    saveSettings();
  });

  return {
    // 服務模式
    serviceMode,
    setServiceMode,

    // 雲端服務
    geminiApiKey,
    nanoBananaApiKey,

    // Ollama
    ollamaUrl,
    ollamaModel,
    ollamaConnected,
    ollamaAvailableModels,
    checkOllamaConnection,

    // ComfyUI
    comfyuiUrl,
    comfyuiModel,
    comfyuiWorkflow,
    comfyuiConnected,
    comfyuiAvailableModels,
    checkComfyUIConnection,

    // 檢測
    isDetecting,
    detectError,
    autoDetectServices,

    // 通用
    initSettings,
    saveSettings,
  };
});
