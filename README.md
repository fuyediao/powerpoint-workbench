# Gemini PPT Workbench

<div align="center">

**專業的 AI 驅動 PowerPoint 生成工作台**

使用 Google Gemini 3 Pro、Nano Banana Pro 和 Veo 將文檔轉換為視覺化投影片

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://reactjs.org/)
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
- **React 19.2**: 使用最新的 React 特性
- **TypeScript 5.8**: 完整的類型安全
- **Vite 6.2**: 極速開發體驗
- **React Router 7.10**: 客戶端路由

### UI 設計
- **Tailwind CSS v4**: 現代化的 utility-first CSS 框架
- **Lucide React**: 精美的圖標庫
- **自定義主題系統**: 支持深色/淺色模式切換

### AI 整合
- **Google GenAI SDK**: 官方 Gemini API 整合
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
- **Gemini API Key**: 從 [Google AI Studio](https://ai.google.dev/) 獲取

### 安裝步驟

1. **克隆項目**
```bash
git clone <repository-url>
cd powerpointworkbench-0.2
```

2. **安裝依賴**
```bash
npm install
```

3. **配置環境變量**

創建 `.env.local` 文件並設置您的 API 密鑰：
```env
GEMINI_API_KEY=your_api_key_here
```

4. **啟動開發服務器**
```bash
npm run dev
```

應用將在 `http://localhost:3000` 啟動

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
powerpointworkbench-0.2/
├── src/                          # 源代碼目錄
│   ├── components/               # React 組件
│   │   ├── SettingsModal.tsx    # 設置彈窗組件
│   │   └── SlidePreview.tsx     # 投影片預覽組件
│   ├── pages/                    # 頁面組件
│   │   └── Editor.tsx           # 編輯器主頁面
│   ├── services/                 # 服務層
│   │   └── geminiService.ts     # Gemini API 服務
│   ├── App.tsx                   # 應用主組件
│   ├── index.tsx                 # 應用入口
│   ├── i18n.tsx                  # 國際化配置
│   ├── store.tsx                 # 全局狀態管理
│   ├── theme.tsx                 # 主題管理
│   ├── types.ts                  # TypeScript 類型定義
│   └── constants.ts              # 常量定義
├── index.html                    # HTML 入口文件
├── vite.config.ts               # Vite 配置
├── tsconfig.json                # TypeScript 配置
├── package.json                 # 項目依賴
├── metadata.json                # 項目元數據
└── README.md                    # 項目說明文檔
```

### 目錄說明

- **`src/components/`**: 可復用的 UI 組件
- **`src/pages/`**: 頁面級組件
- **`src/services/`**: API 調用和業務邏輯
- **`src/`**: 核心應用邏輯和配置

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

#### `App.tsx`
- 應用根組件
- 路由配置
- 全局 Provider 設置

#### `Editor.tsx`
- 投影片編輯器主界面
- 三欄布局：縮略圖、畫布、屬性面板
- 實時預覽和編輯功能

#### `geminiService.ts`
- Gemini API 封裝
- 支持文本生成、圖像生成、視頻生成
- 錯誤處理和重試邏輯

### 3. 狀態管理

使用 React Context API 進行全局狀態管理：

- **ProjectProvider**: 項目配置和投影片數據
- **I18nProvider**: 多語言狀態
- **ThemeProvider**: 主題切換狀態

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

1. 在 `src/types.ts` 中定義類型
2. 在 `src/services/` 中實現業務邏輯
3. 在 `src/components/` 或 `src/pages/` 中創建 UI 組件
4. 更新 `src/i18n.tsx` 添加翻譯
5. 運行 `npm run lint` 檢查代碼質量

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
export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
});
```

### TypeScript 配置 (`tsconfig.json`)

- **Target**: ES2022
- **Module**: ESNext
- **JSX**: react-jsx
- **Strict Mode**: 啟用

### 路徑別名

使用 `@/` 作為 `src/` 的別名：

```typescript
import { SlidePreview } from '@/components/SlidePreview';
import { generateOutline } from '@/services/geminiService';
```

## 🔌 API 整合

### Gemini 3 Pro (Thinking Mode)

用於智能分析和大綱生成：

```typescript
const response = await ai.models.generateContent({
  model: 'gemini-3-pro-preview',
  contents: text,
  config: {
    thinkingConfig: { thinkingBudget: 32768 },
    responseMimeType: 'application/json',
  },
});
```

### Nano Banana Pro (Image Generation)

用於高質量圖像生成：

```typescript
const response = await ai.models.generateContent({
  model: 'gemini-3-pro-image-preview',
  config: {
    imageConfig: {
      aspectRatio: '16:9',
      imageSize: '2K',
    },
  },
});
```

### Veo 3.1 Fast (Video Generation)

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
});
```

## 🎨 樣式系統

### Tailwind CSS v4

項目使用 Tailwind CSS v4 的最新特性：

- **CDN 集成**: 通過 CDN 快速加載
- **深色模式**: `class` 策略
- **自定義滾動條**: 針對深色/淺色模式優化

### 主題切換

```typescript
const { theme, toggleTheme } = useTheme();

// 切換主題
toggleTheme();
```

## 🌍 國際化

### 支持的語言

- `en`: English
- `zh-CN`: 簡體中文

### 添加新語言

1. 在 `src/constants.ts` 中添加語言代碼
2. 在 `src/i18n.tsx` 中添加翻譯字典
3. 更新 `Language` 枚舉

## 📝 授權協議

本項目為私有項目。未經授權，禁止複製、分發或修改。

---

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request！

在提交 PR 之前，請確保：

1. ✅ 代碼通過 ESLint 檢查
2. ✅ 所有類型定義正確
3. ✅ 遵循項目代碼規範
4. ✅ 添加必要的註釋和文檔

## 📞 聯繫方式

如有問題或建議，請通過以下方式聯繫：

- 提交 Issue
- 發送郵件至項目維護者

---

<div align="center">

**使用 ❤️ 和 ☕ 構建**

Powered by Google Gemini AI

</div>
