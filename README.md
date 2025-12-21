# Gemini PPT Workbench

<div align="center">

**專業的 AI 驅動 PowerPoint 生成工作台**

使用 Google Gemini 3 Pro、Nano Banana Pro 和 Veo 將文檔轉換為視覺化投影片

支持本地 AI（Ollama + ComfyUI）作為備選方案

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Vue](https://img.shields.io/badge/Vue-3.5-4fc08d.svg)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)](https://tailwindcss.com/)

</div>

## 📋 目錄

- [功能特色](#功能特色)
- [技術架構](#技術架構)
- [快速開始](#快速開始)
- [項目結構](#項目結構)
- [核心功能](#核心功能)
- [開發指南](#開發指南)
- [配置說明](#配置說明)
- [API 整合](#api-整合)
- [授權協議](#授權協議)

## ✨ 功能特色

### 🤖 AI 驅動的投影片生成
- **Gemini 3 Pro (Thinking Mode)**: 智能分析文本內容，自動生成投影片大綱
- **Nano Banana Pro**: 高質量圖像生成（支持 1K/2K/4K 解析度）
- **Veo 3.1 Fast**: 電影級視頻背景生成
- **本地 AI 支持**: 支持 Ollama（文本生成）和 ComfyUI（圖像生成）作為備選方案

### 🎨 專業設計工具
- **雙重風格模式**: 簡潔模式（Concise）與詳細模式（Detailed）
- **自定義樣式提示**: 支持自定義設計要求
- **即時預覽**: 實時編輯與預覽投影片
- **響應式布局**: 適配各種螢幕尺寸

### 🌐 多語言支持
- 英文（English）
- 簡體中文（Simplified Chinese）
- 繁體中文（Traditional Chinese）

### 🎯 進階功能
- **深色模式**: 完整的深色主題支持
- **拖放編輯**: 直觀的投影片編輯界面
- **演講者備註**: 為每張投影片添加演講稿
- **批量生成**: 一次生成多張投影片

## 🏗️ 技術架構

### 前端框架
- **Vue 3.5**: 使用 Composition API 和最新的 Vue 特性
- **TypeScript 5.8**: 完整的類型安全
- **Vite 6.2**: 極速開發體驗
- **Vue Router 4.5**: 客戶端路由
- **Pinia 2.3**: 狀態管理

### UI 設計
- **Tailwind CSS v4**: 現代化的 utility-first CSS 框架
- **Lucide Vue Next**: 精美的圖標庫
- **自定義主題系統**: 支持深色/淺色模式切換

### AI 整合
- **Google GenAI SDK**: 官方 Gemini API 整合
- **本地 AI 支持**: Ollama（文本生成）和 ComfyUI（圖像生成）
- **多模型支持**: 文本、圖像、視頻生成
- **Search Grounding**: 實時搜索增強

### 開發規範
- **SOLID 原則**: 遵循面向對象設計原則
- **camelCase 命名**: 統一的變量命名規範
- **ESLint 9.15**: 嚴格的代碼質量檢查
- **無 any 類型**: 完整的 TypeScript 類型定義

## 🚀 快速開始

### 前置需求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **API 密鑰**（可選）:
  - **Gemini API Key**: 從 [Google AI Studio](https://ai.google.dev/) 獲取（使用 Google AI 時需要）
  - **本地 AI**（可選）: 安裝 [Ollama](https://ollama.ai/) 和 [ComfyUI](https://github.com/comfyanonymous/ComfyUI)

### 安裝步驟

1. **克隆項目**
```bash
git clone <repository-url>
cd powerpoint-workbench
```

2. **安裝依賴**
```bash
npm install
```

3. **配置環境變量**（可選）

如果需要使用 Google Gemini API，創建 `.env.local` 文件並設置您的 API 密鑰：
```env
GEMINI_API_KEY=your_api_key_here
```

**或者使用本地 AI**：
- 確保 Ollama 運行在 `http://localhost:11434`
- 確保 ComfyUI 運行在 `http://localhost:8188`
- 在應用設置中選擇「本地 AI」作為提供商

4. **啟動開發服務器**
```bash
npm run dev
```

應用將在 `http://localhost:5173` 啟動（Vite 默認端口）

5. **構建生產版本**
```bash
npm run build
```

6. **預覽生產版本**
```bash
npm run preview
```

## 📁 項目結構

```
powerpoint-workbench/
├── src/                          # 源代碼目錄
│   ├── components/               # Vue 組件
│   │   ├── ExportModal.vue      # 導出彈窗組件
│   │   ├── GenerateAllModal.vue # 批量生成彈窗
│   │   ├── SettingsModal.vue    # 設置彈窗組件
│   │   ├── SlidePreview.vue    # 投影片預覽組件
│   │   └── TextEditorModal.vue # 文本編輯器彈窗
│   ├── composables/              # 組合式函數
│   │   ├── useI18n.ts           # 國際化組合式函數
│   │   └── useTheme.ts          # 主題切換組合式函數
│   ├── i18n/                     # 國際化配置
│   │   ├── index.ts             # 國際化入口
│   │   ├── languages.ts         # 語言配置
│   │   └── locales/             # 翻譯文件
│   │       ├── en.json          # 英文翻譯
│   │       ├── zh-CN.json       # 簡體中文翻譯
│   │       └── zh-TW.json       # 繁體中文翻譯
│   ├── pages/                    # 頁面組件
│   │   ├── Editor.vue           # 編輯器主頁面
│   │   └── Home.vue             # 首頁
│   ├── prompts/                  # AI 提示詞
│   │   └── index.ts             # 提示詞配置
│   ├── services/                 # 服務層
│   │   ├── exportService.ts     # 導出服務
│   │   ├── geminiService.ts     # Gemini API 服務
│   │   └── localAiService.ts    # 本地 AI 服務
│   ├── stores/                   # Pinia 狀態管理
│   │   └── projectStore.ts      # 項目狀態存儲
│   ├── types/                    # TypeScript 類型定義
│   │   └── index.ts             # 類型定義
│   ├── assets/                   # 靜態資源
│   │   └── main.css             # 主樣式文件
│   ├── App.vue                   # 應用根組件
│   ├── main.ts                   # 應用入口
│   ├── router.ts                 # 路由配置
│   └── constants.ts              # 常量定義
├── index.html                    # HTML 入口文件
├── vite.config.ts               # Vite 配置
├── tsconfig.json                # TypeScript 配置
├── tsconfig.app.json            # 應用 TypeScript 配置
├── tsconfig.node.json           # Node TypeScript 配置
├── eslint.config.js             # ESLint 配置
├── .stylelintrc.json            # Stylelint 配置
├── .vscode/                      # VS Code 配置
│   └── settings.json            # 工作區設置（包含 i18n Ally 配置）
├── .i18n-ally.yml               # i18n Ally 插件配置
├── package.json                 # 項目依賴
├── metadata.json                # 項目元數據
└── README.md                    # 項目說明文檔
```

### 目錄說明

- **`src/components/`**: 可復用的 Vue 組件
- **`src/composables/`**: Vue 3 Composition API 組合式函數
- **`src/pages/`**: 頁面級組件
- **`src/services/`**: API 調用和業務邏輯
- **`src/stores/`**: Pinia 狀態管理
- **`src/i18n/`**: 國際化配置和翻譯文件
- **`src/types/`**: TypeScript 類型定義

## 🔧 核心功能

### 1. 投影片生成流程

```typescript
// 1. 輸入文本內容
const sourceText = "您的演示文稿內容...";

// 2. 使用 Gemini 3 Pro 生成大綱
const slides = await generateOutline(
  apiKey,
  sourceText,
  pageCount,
  style,
  customPrompt
);

// 3. 為每張投影片生成視覺元素
for (const slide of slides) {
  const image = await generateSlideImage(
    apiKey,
    slide.visualPrompt,
    '2K'
  );
}
```

### 2. 主要組件

#### `App.vue`
- 應用根組件
- 路由視圖容器

#### `Home.vue`
- 項目首頁
- 文本輸入和文件上傳
- 項目配置設置
- 支持 Google AI 和本地 AI 選擇

#### `Editor.vue`
- 投影片編輯器主界面
- 三欄布局：縮略圖、畫布、屬性面板
- 實時預覽和編輯功能

#### `geminiService.ts`
- Gemini API 封裝
- 支持文本生成、圖像生成、視頻生成
- 錯誤處理和重試邏輯

#### `localAiService.ts`
- 本地 AI 服務封裝
- Ollama API 整合（文本生成）
- ComfyUI API 整合（圖像生成）

### 3. 狀態管理

使用 Pinia 進行全局狀態管理：

- **projectStore**: 項目配置、投影片數據和上傳文件管理
- **useI18n**: 多語言狀態（組合式函數）
- **useTheme**: 主題切換狀態（組合式函數）

## 💻 開發指南

### 代碼規範

1. **變量命名**: 使用 camelCase
```typescript
const slideData: SlideData = {...};
const apiKey: string = "...";
```

2. **類型定義**: 禁止使用 `any`
```typescript
// ❌ 錯誤
const data: any = fetchData();

// ✅ 正確
const data: SlideData[] = fetchData();
```

3. **SOLID 原則**
- 單一職責原則（SRP）
- 開放封閉原則（OCP）
- 里氏替換原則（LSP）
- 接口隔離原則（ISP）
- 依賴反轉原則（DIP）

### 添加新功能

1. 在 `src/types/index.ts` 中定義類型
2. 在 `src/services/` 中實現業務邏輯
3. 在 `src/components/` 或 `src/pages/` 中創建 Vue 組件
4. 在 `src/composables/` 中創建組合式函數（如需要）
5. 更新 `src/i18n/locales/` 中的翻譯文件
6. 運行 `npm run lint` 檢查代碼質量

### 調試技巧

```bash
# 開發模式（帶熱重載）
npm run dev

# 類型檢查
npx tsc --noEmit

# 代碼檢查
npm run lint
```

## ⚙️ 配置說明

### Vite 配置 (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

### TypeScript 配置 (`tsconfig.json`)

- **Target**: ES2022
- **Module**: ESNext
- **JSX**: preserve（Vue SFC）
- **Strict Mode**: 啟用

### 路徑別名

使用 `@/` 作為 `src/` 的別名：

```typescript
import SlidePreview from '@/components/SlidePreview.vue'
import { generateOutline } from '@/services/geminiService'
import { useProjectStore } from '@/stores/projectStore'
```

### i18n Ally 配置

項目已預配置 i18n Ally 插件，配置文件位於：

- **`.vscode/settings.json`**: VS Code 工作區設置
- **`.i18n-ally.yml`**: i18n Ally 專用配置

主要配置項：

```yaml
# 翻譯文件路徑
localesPaths:
  - src/i18n/locales

# 鍵名風格：nested（點號分隔）
keystyle: nested

# 支持的語言
locales:
  - en
  - zh-CN
  - zh-TW

# 源語言和顯示語言
sourceLanguage: en
displayLanguage: zh-CN
```

如需自定義配置，請編輯 `.i18n-ally.yml` 文件。詳細配置選項請參考 [i18n Ally 文檔](https://github.com/lokalise/i18n-ally)。

## 🔌 API 整合

### Google Gemini API

#### Gemini 3 Pro (Thinking Mode)

用於智能分析和大綱生成：

```typescript
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey })
const response = await ai.models.generateContent({
  model: 'gemini-3-pro-preview',
  contents: text,
  config: {
    systemInstruction: prompt,
    thinkingConfig: { thinkingBudget: 32768 },
    responseMimeType: 'application/json',
  },
})
```

#### Nano Banana Pro (Image Generation)

用於高質量圖像生成：

```typescript
const response = await ai.models.generateContent({
  model: 'gemini-3-pro-image-preview',
  contents: prompt,
  config: {
    imageConfig: {
      aspectRatio: '16:9',
      imageSize: '2K',
    },
  },
})
```

#### Veo 3.1 Fast (Video Generation)

用於視頻背景生成：

```typescript
const operation = await ai.models.generateVideos({
  model: 'veo-3.1-fast-generate-preview',
  prompt: prompt,
  config: {
    numberOfVideos: 1,
    resolution: '1080p',
    aspectRatio: '16:9'
  }
})
```

### 本地 AI API

#### Ollama (文本生成)

用於本地文本生成和大綱生成：

```typescript
import { generateOutlineWithOllama } from '@/services/localAiService'

const slides = await generateOutlineWithOllama({
  endpoint: 'http://localhost:11434',
  model: 'llama3.2',
  text: sourceText,
  count: pageCount,
  style: SlideStyle.CONCISE
})
```

#### ComfyUI (圖像生成)

用於本地圖像生成：

```typescript
import { generateImageWithComfyUI } from '@/services/localAiService'

const imageUrl = await generateImageWithComfyUI({
  endpoint: 'http://localhost:8188',
  workflowId: 'workflow_name',
  prompt: visualPrompt
})
```

## 🎨 樣式系統

### Tailwind CSS v4

項目使用 Tailwind CSS v4 的最新特性：

- **CDN 集成**: 通過 CDN 快速加載
- **深色模式**: `class` 策略
- **自定義滾動條**: 針對深色/淺色模式優化

### 主題切換

```typescript
import { useTheme } from '@/composables/useTheme'

const { theme, toggleTheme } = useTheme()

// 切換主題
toggleTheme()
```

## 🌍 國際化

### 支持的語言

- `en`: English（英文）
- `zh-CN`: 簡體中文（Simplified Chinese）
- `zh-TW`: 繁體中文（Traditional Chinese）

### 開發工具

項目已配置 **i18n Ally** 插件，提供強大的國際化開發體驗：

#### 安裝 i18n Ally

1. 在 VS Code/Cursor 中打開擴展面板（`Ctrl+Shift+X`）
2. 搜索 "i18n Ally"
3. 點擊安裝並重載窗口

#### 功能特性

- **懸停預覽**: 在代碼中懸停翻譯鍵即可查看所有語言的翻譯內容
- **內聯編輯**: 直接在代碼中編輯翻譯，無需打開 JSON 文件
- **缺失檢測**: 自動檢測並標記缺失的翻譯鍵
- **使用追蹤**: 顯示翻譯鍵在代碼中的使用位置
- **快速重構**: 支持批量替換和重構翻譯調用
- **多語言對比**: 並排查看所有語言的翻譯內容

#### 配置文件

項目包含以下配置文件：

- **`.vscode/settings.json`**: VS Code 工作區設置
- **`.i18n-ally.yml`**: i18n Ally 專用配置

配置已針對項目結構優化：
- 翻譯文件路徑：`src/i18n/locales`
- 鍵名風格：nested（點號分隔，如 `"app.title"`）
- 框架支持：Vue 3 + 通用模式
- 源語言：`en`
- 顯示語言：`zh-CN`

### 添加新語言

1. 在 `src/types/index.ts` 中的 `Language` 枚舉添加新語言代碼
2. 在 `src/i18n/languages.ts` 中的 `languageConfig` 添加語言配置
3. 在 `src/i18n/locales/` 目錄下創建對應的 JSON 翻譯文件
4. 在 `src/constants.ts` 中的 `SUPPORTED_LANGUAGES` 添加新語言
5. 更新 `.i18n-ally.yml` 中的 `locales` 和 `localeDisplayNames` 配置

## 📝 授權協議

本項目為私有項目。未經授權，禁止複製、分發或修改。

---

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request！

在提交 PR 之前，請確保：

1. ✅ 代碼通過 ESLint 檢查（`npm run lint`）
2. ✅ 樣式通過 Stylelint 檢查（`npm run lint:style`）
3. ✅ 所有類型定義正確，不使用 `any`
4. ✅ 遵循項目代碼規範（camelCase 命名、SOLID 原則）
5. ✅ 添加必要的註釋和文檔
6. ✅ 更新相關的國際化翻譯文件

## 📞 聯繫方式

如有問題或建議，請通過以下方式聯繫：

- 提交 Issue
- 發送郵件至項目維護者

---

<div align="center">

**使用 ❤️ 和 ☕ 構建**

Powered by Google Gemini AI

</div>
