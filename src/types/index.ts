/**
 * 語言枚舉
 * 注意：添加新語言時，請同步更新 src/i18n/languages.ts 中的 languageConfig
 * 此 enum 的值必須與 languageConfig 中的 code 保持一致
 */
export enum Language {
  EN = 'en',
  ZH_CN = 'zh-CN',
  ZH_TW = 'zh-TW'
}

export enum AiProvider {
  GOOGLE = 'google',
  LOCAL = 'local' // Ollama + ComfyUI
}

export enum SlideStyle {
  CONCISE = 'concise',
  DETAILED = 'detailed'
}

export enum SlideStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  DONE = 'done',
  ERROR = 'error'
}

export interface SlideData {
  id: string;
  order: number;
  title: string;
  contentPoints: string[]; // Markdown points
  speakerNotes: string;
  visualPrompt: string; // The prompt for the image generator
  imageUrl?: string; // Generated image URL (base64 or remote)
  videoUrl?: string; // Generated Veo video
  status: SlideStatus;
  isFullSlideImage?: boolean; // 標記是否為整頁圖片（包含所有文字內容）
}

export interface ProjectConfig {
  sourceText: string;
  pageCount: number;
  style: SlideStyle;
  customStylePrompt?: string;
  provider: AiProvider;
  apiKey?: string; // For Google
  proxyEndpoint?: string; // Cloudflare Worker 代理端點（可選）
  useProxy?: boolean; // 是否使用代理
  localEndpoint?: string; // For Ollama
  comfyEndpoint?: string; // For ComfyUI
  ollamaModel?: string; // Selected Ollama model
  comfyWorkflow?: string; // Selected ComfyUI workflow ID or name
}

export interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

export interface SupportedLanguage {
  code: Language;
  label: string;
}
