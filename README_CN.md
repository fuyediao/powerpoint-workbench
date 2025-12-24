# Gemini PPT Workbench

<div align="center">

**🌐 语言 / Language / 語言**

[English](README.md) | [简体中文](README_CN.md) | [繁體中文](README_TW.md)

</div>

<div align="center">

**专业的 AI 驱动 PowerPoint 生成工作台**

使用 Google Gemini 3 Pro、Nano Banana Pro 和 Veo 将文档转换为可视化幻灯片

支持本地 AI（Ollama + ComfyUI）作为备选方案

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Vue](https://img.shields.io/badge/Vue-3.5-4fc08d.svg)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)](https://tailwindcss.com/)

</div>

## 📋 目录

- [功能特色](#功能特色)
- [技术架构](#技术架构)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [核心功能](#核心功能)
- [开发指南](#开发指南)
- [Electron 桌面应用](#electron-桌面应用)
- [配置说明](#配置说明)
- [API 整合](#api-整合)
- [授权协议](#授权协议)

## ✨ 功能特色

### 🤖 AI 驱动的幻灯片生成
- **Gemini 3 Pro (Thinking Mode)**: 智能分析文本内容，自动生成幻灯片大纲
- **Nano Banana Pro**: 高质量图像生成（支持 1K/2K/4K 分辨率）
- **Veo 3.1 Fast**: 电影级视频背景生成
- **本地 AI 支持**: 支持 Ollama（文本生成）和 ComfyUI（图像生成）作为备选方案

### 🎨 专业设计工具
- **双重风格模式**: 简洁模式（Concise）与详细模式（Detailed）
- **自定义样式提示**: 支持自定义设计要求
- **即时预览**: 实时编辑与预览幻灯片
- **响应式布局**: 适配各种屏幕尺寸

### 🌐 多语言支持
- **完整的多语言覆盖**: 所有 UI 元素均已支持多语言
- **支持的语言**:
  - 英文（English）🇺🇸
  - 简体中文（Simplified Chinese）🇨🇳
  - 繁体中文（Traditional Chinese）🇹🇼
- **动态语言切换**: 实时切换语言，无需重启应用
- **国旗图标**: 语言选择器显示对应的国旗图标，提供更直观的视觉识别

### 🎯 进阶功能
- **深色模式**: 完整的深色主题支持
- **拖放编辑**: 直观的幻灯片编辑界面
- **演讲者备注**: 为每张幻灯片添加演讲稿
- **批量生成**: 一次生成多张幻灯片
- **文件上传支持**: 
  - 支持文本文件（.txt, .md, .json, .csv）
  - 支持图片文件（.jpg, .jpeg, .png, .gif, .webp）
  - 支持 PDF 文件
  - Excel 文件（.xlsx, .xls）自动转换为 CSV 格式
  - Word 和 PPT 文件需转换为 PDF 后上传
- **智能导航**: 滚轮切换幻灯片，页码显示

### 🖥️ Electron 桌面应用
- **跨平台支持**: Windows、macOS、Linux
- **本地数据存储**: 使用 SQLite 安全保存 API Key 和配置
- **离线功能**: 支持本地 AI 服务（Ollama + ComfyUI）
- **原生体验**: 无需浏览器，独立桌面应用

## 🏗️ 技术架构

### 前端框架
- **Vue 3.5**: 使用 Composition API 和最新的 Vue 特性
- **TypeScript 5.8**: 完整的类型安全
- **Vite 6.2**: 极速开发体验
- **Vue Router 4.5**: 客户端路由
- **Pinia 2.3**: 状态管理
- **xlsx**: Excel 文件解析和转换
- **mammoth**: Word 文档解析（预留）

### UI 设计
- **Tailwind CSS v4**: 现代化的 utility-first CSS 框架
- **Lucide Vue Next**: 精美的图标库
- **自定义主题系统**: 支持深色/浅色模式切换

### AI 整合
- **Google GenAI SDK**: 官方 Gemini API 整合
- **本地 AI 支持**: Ollama（文本生成）和 ComfyUI（图像生成）
- **多模型支持**: 文本、图像、视频生成
- **Search Grounding**: 实时搜索增强

### 桌面应用
- **Electron 33.0**: 跨平台桌面应用框架
- **SQLite (sql.js)**: 本地数据库存储
- **electron-builder**: 应用打包和分发

### 开发规范
- **SOLID 原则**: 遵循面向对象设计原则
- **camelCase 命名**: 统一的变量命名规范
- **ESLint 9.15**: 严格的代码质量检查
- **无 any 类型**: 完整的 TypeScript 类型定义

## 🚀 快速开始

### 前置需求

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **API 密钥**（可选）:
  - **Gemini API Key**: 从 [Google AI Studio](https://ai.google.dev/) 获取（使用 Google AI 时需要）
  - **本地 AI**（可选）: 安装 [Ollama](https://ollama.ai/) 和 [ComfyUI](https://github.com/comfyanonymous/ComfyUI)

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd powerpoint-workbench
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**（可选）

如果需要使用 Google Gemini API，创建 `.env.local` 文件并设置您的 API 密钥：
```env
GEMINI_API_KEY=your_api_key_here
```

**或者使用本地 AI**：
- 确保 Ollama 运行在 `http://localhost:11434`
- 确保 ComfyUI 运行在 `http://localhost:8188`
- 在应用设置中选择「本地 AI」作为提供商

4. **启动开发服务器**

**Web 应用模式**：

**方式一：使用 npm 命令**
```bash
npm run dev
```

**方式二：使用 Windows 批处理脚本（推荐 Windows 用户）**
```bash
# 双击运行或在命令行执行
dev.bat
```

应用将在 `http://localhost:5173` 启动（Vite 默认端口）

**Electron 桌面应用模式**：
```bash
npm run electron:dev
```

这个命令会：
1. 构建 Electron 主进程和预加载脚本
2. 启动 Vite 开发服务器（http://localhost:5173）
3. 等待服务器就绪后启动 Electron 应用

**仅启动 Electron**（需要先运行 `npm run dev`）：
```bash
npm run electron
```

5. **构建生产版本**

**Web 应用**：
```bash
npm run build
```

**Electron 桌面应用**：
```bash
npm run electron:build
```

这会：
1. 构建 Electron 主进程文件到 `dist-electron/`
2. 构建 Vue 应用到 `dist/`

6. **预览生产版本**

**Web 应用**：
```bash
npm run preview
```

**打包 Electron 应用**：
```bash
npm run electron:dist
```

这会创建可分发的安装程序，输出到 `dist-electron/` 目录：
- **Windows**: NSIS 安装程序（.exe）
- **macOS**: DMG 文件
- **Linux**: AppImage 文件

### 发布到 GitHub Releases

项目已配置 GitHub Actions 自动构建和发布流程。要发布新版本：

1. **更新版本号**：在 `package.json` 中更新 `version` 字段（例如：`0.1.4`）

2. **创建 Git 标签**：
   ```bash
   git add .
   git commit -m "chore: bump version to 0.1.4"
   git tag v0.1.4
   git push origin main
   git push origin v0.1.4
   ```

3. **自动构建和发布**：推送标签后，GitHub Actions 会自动：
   - 在 Windows、macOS 和 Linux 上构建应用
   - 创建 GitHub Release
   - 上传所有平台的安装包

4. **手动触发**：也可以通过 GitHub Actions 页面手动触发构建

发布的安装包可以在 [GitHub Releases](https://github.com/YOUR_USERNAME/powerpoint-workbench/releases) 页面下载。

**注意**：
- 标签格式必须为 `v*`（例如：`v0.1.4`）
- 发布会自动从 `CHANGELOG.md` 读取更新内容
- 如果需要代码签名，请在 GitHub Secrets 中配置证书

## 📁 项目结构

```
powerpoint-workbench/
├── electron/                     # Electron 桌面应用
│   ├── main.ts                  # Electron 主进程（窗口管理、应用生命周期）
│   ├── preload.ts               # 预加载脚本（安全的 API 暴露）
│   └── database.ts              # SQLite 数据库操作
├── src/                          # 源代码目录
│   ├── components/               # Vue 组件
│   │   ├── ExportModal.vue      # 导出弹窗组件
│   │   ├── GenerateAllModal.vue # 批量生成弹窗
│   │   ├── SettingsModal.vue    # 设置弹窗组件
│   │   ├── SlidePreview.vue    # 幻灯片预览组件
│   │   └── TextEditorModal.vue # 文本编辑器弹窗
│   ├── composables/              # 组合式函数
│   │   ├── useI18n.ts           # 国际化组合式函数
│   │   └── useTheme.ts          # 主题切换组合式函数
│   ├── i18n/                     # 国际化配置
│   │   ├── index.ts             # 国际化入口
│   │   ├── languages.ts         # 语言配置
│   │   └── locales/             # 翻译文件
│   │       ├── en.json          # 英文翻译
│   │       ├── zh-CN.json       # 简体中文翻译
│   │       └── zh-TW.json       # 繁体中文翻译
│   ├── flag/                     # 国旗图标组件
│   │   └── FlagIcons.vue       # 国旗图标库（200+ 个国家/地区）
│   ├── pages/                    # 页面组件
│   │   ├── Editor.vue           # 编辑器主页面
│   │   └── Home.vue             # 首页
│   ├── prompts/                  # AI 提示词
│   │   └── index.ts             # 提示词配置
│   ├── services/                 # 服务层
│   │   ├── databaseService.ts   # 数据库服务（Electron）
│   │   ├── exportService.ts     # 导出服务
│   │   ├── geminiService.ts     # Gemini API 服务
│   │   └── localAiService.ts    # 本地 AI 服务
│   ├── utils/                    # 工具函数
│   │   └── ipChecker.ts         # IP 检测工具
│   ├── stores/                   # Pinia 状态管理
│   │   └── projectStore.ts      # 项目状态存储
│   ├── types/                    # TypeScript 类型定义
│   │   └── index.ts             # 类型定义
│   ├── assets/                   # 静态资源
│   │   └── main.css             # 主样式文件
│   ├── App.vue                   # 应用根组件
│   ├── main.ts                   # 应用入口
│   ├── router.ts                 # 路由配置
│   └── constants.ts              # 常量定义
├── dist-electron/                # Electron 构建输出
│   ├── main.js                  # 构建后的主进程
│   └── preload.js               # 构建后的预加载脚本
├── dist/                         # Vue 应用的构建输出
├── scripts/                      # 构建脚本
│   └── build-electron.js        # Electron 构建脚本
├── index.html                    # HTML 入口文件
├── vite.config.ts               # Vite 配置
├── tsconfig.json                # TypeScript 配置
├── tsconfig.app.json            # 应用 TypeScript 配置
├── tsconfig.node.json           # Node TypeScript 配置
├── eslint.config.js             # ESLint 配置
├── .stylelintrc.json            # Stylelint 配置
├── .vscode/                      # VS Code 配置
│   └── settings.json            # 工作区设置（包含 i18n Ally 配置）
├── .i18n-ally.yml               # i18n Ally 插件配置
├── dev.bat                      # Windows 开发服务器启动脚本
├── package.json                 # 项目依赖
├── metadata.json                # 项目元数据
└── README.md                    # 项目说明文档
```

### 目录说明

- **`electron/`**: Electron 桌面应用相关文件
  - **`main.ts`**: Electron 主进程，负责窗口管理和应用生命周期
  - **`preload.ts`**: 预加载脚本，安全地暴露 Node.js API 给渲染进程
  - **`database.ts`**: SQLite 数据库操作，用于本地存储配置
- **`src/components/`**: 可复用的 Vue 组件
- **`src/composables/`**: Vue 3 Composition API 组合式函数
- **`src/pages/`**: 页面级组件
- **`src/services/`**: API 调用和业务逻辑
  - **`databaseService.ts`**: 数据库服务封装，支持 Electron 和 Web 模式
- **`src/stores/`**: Pinia 状态管理
- **`src/i18n/`**: 国际化配置和翻译文件
- **`src/flag/`**: 国旗图标组件库，包含 200+ 个国家/地区的国旗图标
- **`src/types/`**: TypeScript 类型定义
- **`src/utils/`**: 工具函数（如 IP 检测等）
- **`dist-electron/`**: Electron 构建输出目录
- **`scripts/`**: 构建和工具脚本

## 🔧 核心功能

### 1. 幻灯片生成流程

```typescript
// 1. 输入文本内容或上传文件
const sourceText = "您的演示文稿内容...";
// 或上传文件（支持文本、图片、PDF、Excel）
const files: File[] = [/* 上传的文件 */];

// 2. 使用 Gemini 3 Pro 生成大纲
// 支持文本字符串或文件数组
const slides = await generateOutline(
  apiKey,
  sourceText, // 或 files
  pageCount,
  style,
  customPrompt
);

// 3. 为每张幻灯片生成视觉元素
for (const slide of slides) {
  const image = await generateFullSlideImage(
    apiKey,
    slide,
    customStylePrompt,
    '2K'
  );
}
```

### 2. 主要组件

#### `App.vue`
- 应用根组件
- 路由视图容器

#### `Home.vue`
- 项目首页
- 文本输入和文件上传
- 支持多种文件格式（文本、图片、PDF、Excel）
- Excel 文件自动转换为 CSV
- 项目配置设置
- 支持 Google AI 和本地 AI 选择

#### `Editor.vue`
- 幻灯片编辑器主界面
- 三栏布局：缩略图、画布、属性面板
- 实时预览和编辑功能
- 滚轮切换幻灯片
- 页码显示（当前页/总页数）

#### `geminiService.ts`
- Gemini API 封装
- 支持文本生成、图像生成、视频生成
- 多模态文件处理（文本、图片、PDF）
- Excel 文件自动转换为 CSV
- 错误处理和重试逻辑

#### `localAiService.ts`
- 本地 AI 服务封装
- Ollama API 整合（文本生成）
- ComfyUI API 整合（图像生成）

### 3. 状态管理

使用 Pinia 进行全局状态管理：

- **projectStore**: 项目配置、幻灯片数据和上传文件管理
- **useI18n**: 多语言状态（组合式函数）
- **useTheme**: 主题切换状态（组合式函数）

## 💻 开发指南

### Electron 桌面应用

#### 开发模式

**启动开发环境**：
```bash
npm run electron:dev
```

这个命令会：
1. 构建 Electron 主进程和预加载脚本
2. 启动 Vite 开发服务器（http://localhost:5173）
3. 等待服务器就绪后启动 Electron 应用

**仅启动 Electron**（需要先运行 `npm run dev`）：
```bash
npm run electron
```

#### 构建和打包

**构建生产版本**：
```bash
npm run electron:build
```

这会：
1. 构建 Electron 主进程文件到 `dist-electron/`
2. 构建 Vue 应用到 `dist/`

**打包可分发的应用程序**：
```bash
npm run electron:dist
```

这会创建可分发的安装程序，输出到 `dist-electron/` 目录：
- **Windows**: NSIS 安装程序（.exe）
- **macOS**: DMG 文件
- **Linux**: AppImage 文件

#### 配置说明

**窗口配置**：

窗口大小和行为在 `electron/main.ts` 中配置：
- 默认大小：1400x900
- 最小大小：1000x600
- 标题栏样式：macOS 使用 `hiddenInset`，其他平台使用默认
- 菜单栏：自动隐藏（生产模式）
- 开发者工具：开发模式启用，生产模式禁用

**构建配置**：

electron-builder 配置在 `package.json` 的 `build` 字段中：
- 应用 ID：`com.gemini.ppt.workbench`
- 产品名称：`Gemini PPT Workbench`
- 输出目录：`dist-electron`

**数据库存储**：

- 数据库类型：SQLite（使用 `sql.js`）
- 数据库位置：`app.getPath('userData')/app.db`
  - Windows: `%APPDATA%\gemini-ppt-workbench\app.db`
  - macOS: `~/Library/Application Support/gemini-ppt-workbench/app.db`
  - Linux: `~/.config/gemini-ppt-workbench/app.db`
- 存储内容：API Key、代理配置、本地 AI 配置等

#### 注意事项

1. **开发模式**：Electron 会连接到 Vite 开发服务器，支持热重载
2. **生产模式**：Electron 会加载打包后的静态文件
3. **安全性**：
   - 上下文隔离已启用
   - Node.js 集成已禁用（渲染进程）
   - 使用预加载脚本安全地暴露 API
   - 生产模式下禁用开发者工具和快捷键（Alt、Ctrl+Shift+I、F12）
4. **网络请求**：所有 API 调用（Gemini、本地 AI 服务）在 Electron 中都能正常工作
5. **数据持久化**：配置会自动保存到本地 SQLite 数据库

#### 故障排除

**Electron 窗口空白**：
- 确保 Vite 开发服务器正在运行（开发模式）
- 确保已运行 `npm run electron:build`（生产模式）
- 检查控制台是否有错误信息

**构建失败**：
- 确保所有依赖已安装：`npm install`
- 检查 Node.js 版本（建议 >= 18.0.0）
- 检查是否有 TypeScript 类型错误
- 检查构建脚本输出是否有错误信息

**端口被占用**：
- 如果提示端口 5173 已被占用，可以：
  - **Windows**: 使用 `netstat -ano | findstr :5173` 查找进程，然后使用 `taskkill /PID <PID> /F` 终止
  - **macOS/Linux**: 使用 `lsof -ti:5173 | xargs kill -9` 终止占用端口的进程
- 或者修改 `vite.config.ts` 使用其他端口

**开发模式启动失败**：
- 检查是否有其他 Vite 实例正在运行
- 确保 `dist-electron/` 目录权限正确
- 查看终端输出的详细错误信息
- 构建脚本现在会自动检查端口并提供清晰的错误提示

**打包失败**：
- 确保已先运行 `npm run electron:build`
- 检查 `package.json` 中的 `build` 配置是否正确
- 检查图标文件是否存在（如果指定了自定义图标）

**数据库问题**：
- 检查应用数据目录权限
- 确认 SQLite WASM 文件正确加载
- 查看控制台错误信息

### 代码规范

1. **变量命名**: 使用 camelCase
```typescript
const slideData: SlideData = {...};
const apiKey: string = "...";
```

2. **类型定义**: 禁止使用 `any`
```typescript
// ❌ 错误
const data: any = fetchData();

// ✅ 正确
const data: SlideData[] = fetchData();
```

3. **SOLID 原则**
- 单一职责原则（SRP）
- 开放封闭原则（OCP）
- 里氏替换原则（LSP）
- 接口隔离原则（ISP）
- 依赖反转原则（DIP）

### 添加新功能

1. 在 `src/types/index.ts` 中定义类型
2. 在 `src/services/` 中实现业务逻辑
3. 在 `src/components/` 或 `src/pages/` 中创建 Vue 组件
4. 在 `src/composables/` 中创建组合式函数（如需要）
5. 更新 `src/i18n/locales/` 中的翻译文件
6. 运行 `npm run lint` 检查代码质量

### 调试技巧

```bash
# 开发模式（带热重载）
npm run dev
# 或使用 Windows 批处理脚本
dev.bat

# 类型检查
npx tsc --noEmit

# 代码检查
npm run lint
```

## ⚙️ 配置说明

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
- **Strict Mode**: 启用

### 路径别名

使用 `@/` 作为 `src/` 的别名：

```typescript
import SlidePreview from '@/components/SlidePreview.vue'
import { generateOutline } from '@/services/geminiService'
import { useProjectStore } from '@/stores/projectStore'
```

### i18n Ally 配置

项目已预配置 i18n Ally 插件，配置文件位于：

- **`.vscode/settings.json`**: VS Code 工作区设置
- **`.i18n-ally.yml`**: i18n Ally 专用配置

主要配置项：

```yaml
# 翻译文件路径
localesPaths:
  - src/i18n/locales

# 键名风格：nested（点号分隔）
keystyle: nested

# 支持的语言
locales:
  - en
  - zh-CN
  - zh-TW

# 源语言和显示语言
sourceLanguage: en
displayLanguage: zh-CN
```

如需自定义配置，请编辑 `.i18n-ally.yml` 文件。详细配置选项请参考 [i18n Ally 文档](https://github.com/lokalise/i18n-ally)。

## 🔌 API 整合

### Google Gemini API

#### Gemini 3 Pro (Thinking Mode)

用于智能分析和大纲生成：

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

用于高质量图像生成：

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

用于视频背景生成：

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

用于本地文本生成和大纲生成：

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

#### ComfyUI (图像生成)

用于本地图像生成：

```typescript
import { generateImageWithComfyUI } from '@/services/localAiService'

const imageUrl = await generateImageWithComfyUI({
  endpoint: 'http://localhost:8188',
  workflowId: 'workflow_name',
  prompt: visualPrompt
})
```

## 🎨 样式系统

### Tailwind CSS v4

项目使用 Tailwind CSS v4 的最新特性：

- **CDN 集成**: 通过 CDN 快速加载
- **深色模式**: `class` 策略
- **自定义滚动条**: 针对深色/浅色模式优化

### 主题切换

```typescript
import { useTheme } from '@/composables/useTheme'

const { theme, toggleTheme } = useTheme()

// 切换主题
toggleTheme()
```

## 🌍 国际化

### 支持的语言

- `en`: English（英文）
- `zh-CN`: 简体中文（Simplified Chinese）
- `zh-TW`: 繁体中文（Traditional Chinese）

### 多语言覆盖范围

项目已实现完整的多语言支持，包括：
- ✅ 应用标题和导航
- ✅ 首页所有 UI 元素
- ✅ 文件上传提示和标签
- ✅ 编辑器所有界面元素
- ✅ 设置面板
- ✅ 导出和生成功能
- ✅ 错误提示和状态信息
- ✅ 语言选择器（带国旗图标）

### 开发工具

项目已配置 **i18n Ally** 插件，提供强大的国际化开发体验：

#### 安装 i18n Ally

1. 在 VS Code/Cursor 中打开扩展面板（`Ctrl+Shift+X`）
2. 搜索 "i18n Ally"
3. 点击安装并重载窗口

#### 功能特性

- **悬停预览**: 在代码中悬停翻译键即可查看所有语言的翻译内容
- **内联编辑**: 直接在代码中编辑翻译，无需打开 JSON 文件
- **缺失检测**: 自动检测并标记缺失的翻译键
- **使用追踪**: 显示翻译键在代码中的使用位置
- **快速重构**: 支持批量替换和重构翻译调用
- **多语言对比**: 并排查看所有语言的翻译内容

#### 配置文件

项目包含以下配置文件：

- **`.vscode/settings.json`**: VS Code 工作区设置
- **`.i18n-ally.yml`**: i18n Ally 专用配置

配置已针对项目结构优化：
- 翻译文件路径：`src/i18n/locales`
- 键名风格：nested（点号分隔，如 `"app.title"`）
- 框架支持：Vue 3 + 通用模式
- 源语言：`en`
- 显示语言：`zh-CN`

### 添加新语言

1. 在 `src/types/index.ts` 中的 `Language` 枚举添加新语言代码
2. 在 `src/i18n/languages.ts` 中的 `languageConfig` 添加语言配置
3. 在 `src/i18n/locales/` 目录下创建对应的 JSON 翻译文件
4. 在 `src/constants.ts` 中的 `SUPPORTED_LANGUAGES` 添加新语言
5. 更新 `.i18n-ally.yml` 中的 `locales` 和 `localeDisplayNames` 配置

## 📝 授权协议

本项目采用 [GNU 通用公共许可证 v2.0](LICENSE) (GPL-2.0)。

GPL-2.0 许可证允许您：
- ✅ 商业使用
- ✅ 修改
- ✅ 分发
- ✅ 私人使用
- ✅ 专利使用

**要求**：
- ✅ 必须包含许可证和版权声明
- ✅ 必须说明对代码所做的更改
- ✅ 必须公开源代码（Copyleft）
- ✅ 衍生作品必须使用相同许可证

**限制**：
- ❌ 责任免除
- ❌ 无担保

详细条款请参阅 [LICENSE](LICENSE) 文件。

---

## 🌐 官网

[PowerPoint-workbench](https://powerpoint.xiaoboqi.qzz.io)

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

在提交 PR 之前，请确保：

1. ✅ 代码通过 ESLint 检查（`npm run lint`）
2. ✅ 样式通过 Stylelint 检查（`npm run lint:style`）
3. ✅ 所有类型定义正确，不使用 `any`
4. ✅ 遵循项目代码规范（camelCase 命名、SOLID 原则）
5. ✅ 添加必要的注释和文档
6. ✅ 更新相关的国际化翻译文件

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件至项目维护者

---

<div align="center">

**使用 ❤️ 和 ☕ 构建**

Powered by Google Gemini AI

</div>


