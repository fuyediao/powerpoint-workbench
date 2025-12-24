# Gemini PPT Workbench

<div align="center">

**🌐 Language / 简体中文 / 繁體中文**

[English](README.md) | [简体中文](README_CN.md) | [繁體中文](README_TW.md)

</div>

<div align="center">

**Professional AI-Powered PowerPoint Generation Workbench**

Transform documents into visual slides using Google Gemini 3 Pro, Nano Banana Pro, and Veo

Supports local AI (Ollama + ComfyUI) as an alternative

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Vue](https://img.shields.io/badge/Vue-3.5-4fc08d.svg)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Electron](https://img.shields.io/badge/Electron-33-47848f.svg)](https://www.electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933.svg)](https://nodejs.org/)
[![ESLint](https://img.shields.io/badge/ESLint-9.15-4b32c3.svg)](https://eslint.org/)
[![License](https://img.shields.io/badge/License-AGPL--3.0-green.svg)](LICENSE)

</div>

## 📋 Table of Contents

- [Features](#features)
- [Technical Architecture](#technical-architecture)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Core Features](#core-features)
- [Development Guide](#development-guide)
- [Electron Desktop Application](#electron-desktop-application)
- [Configuration](#configuration)
- [API Integration](#api-integration)
- [License](#license)

## ✨ Features

### 🤖 AI-Powered Slide Generation
- **Gemini 3 Pro (Thinking Mode)**: Intelligent text analysis, automatic slide outline generation
- **Nano Banana Pro**: High-quality image generation (supports 1K/2K/4K resolution)
- **Veo 3.1 Fast**: Cinematic video background generation
- **Local AI Support**: Supports Ollama (text generation) and ComfyUI (image generation) as alternatives

### 🎨 Professional Design Tools
- **Dual Style Modes**: Concise mode and Detailed mode
- **Custom Style Prompts**: Support for custom design requirements
- **Real-time Preview**: Live editing and preview of slides
- **Responsive Layout**: Adapts to various screen sizes

### 🌐 Multi-language Support
- **Complete Multi-language Coverage**: All UI elements support multiple languages
- **Supported Languages**:
  - English 🇺🇸
  - Simplified Chinese 🇨🇳
  - Traditional Chinese 🇹🇼
- **Dynamic Language Switching**: Switch languages in real-time without restarting the application
- **Flag Icons**: Language selector displays corresponding flag icons for intuitive visual recognition

### 🎯 Advanced Features
- **Dark Mode**: Complete dark theme support
- **Drag-and-Drop Editing**: Intuitive slide editing interface
- **Speaker Notes**: Add speaker scripts for each slide
- **Batch Generation**: Generate multiple slides at once
- **File Upload Support**: 
  - Text files (.txt, .md, .json, .csv)
  - Image files (.jpg, .jpeg, .png, .gif, .webp)
  - PDF files
  - Excel files (.xlsx, .xls) automatically converted to CSV format
  - Word and PPT files need to be converted to PDF before uploading
- **Smart Navigation**: Scroll to switch slides, page number display

### 🖥️ Electron Desktop Application
- **Cross-platform Support**: Windows, macOS, Linux
- **Local Data Storage**: Securely save API Key and configuration using SQLite
- **Offline Functionality**: Supports local AI services (Ollama + ComfyUI)
- **Native Experience**: Standalone desktop application, no browser required

## 🏗️ Technical Architecture

### Frontend Framework
- **Vue 3.5**: Using Composition API and latest Vue features
- **TypeScript 5.8**: Complete type safety
- **Vite 6.2**: Lightning-fast development experience
- **Vue Router 4.5**: Client-side routing
- **Pinia 2.3**: State management
- **xlsx**: Excel file parsing and conversion
- **mammoth**: Word document parsing (reserved)

### UI Design
- **Tailwind CSS v4**: Modern utility-first CSS framework
- **Lucide Vue Next**: Beautiful icon library
- **Custom Theme System**: Supports dark/light mode switching

### AI Integration
- **Google GenAI SDK**: Official Gemini API integration
- **Local AI Support**: Ollama (text generation) and ComfyUI (image generation)
- **Multi-model Support**: Text, image, and video generation
- **Search Grounding**: Real-time search enhancement

### Desktop Application
- **Electron 33.0**: Cross-platform desktop application framework
- **SQLite (sql.js)**: Local database storage
- **electron-builder**: Application packaging and distribution

### Development Standards
- **SOLID Principles**: Follows object-oriented design principles
- **camelCase Naming**: Unified variable naming convention
- **ESLint 9.15**: Strict code quality checks
- **No any Types**: Complete TypeScript type definitions

## 🚀 Quick Start

### Prerequisites

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **API Keys** (optional):
  - **Gemini API Key**: Get from [Google AI Studio](https://ai.google.dev/) (required when using Google AI)
  - **Local AI** (optional): Install [Ollama](https://ollama.ai/) and [ComfyUI](https://github.com/comfyanonymous/ComfyUI)

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd powerpoint-workbench
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables** (optional)

If you need to use Google Gemini API, create a `.env.local` file and set your API key:
```env
GEMINI_API_KEY=your_api_key_here
```

**Or use Local AI**:
- Ensure Ollama is running on `http://localhost:11434`
- Ensure ComfyUI is running on `http://localhost:8188`
- Select "Local AI" as the provider in the application settings

4. **Start the development server**

**Web Application Mode**:

**Method 1: Using npm command**
```bash
npm run dev
```

**Method 2: Using Windows batch script (recommended for Windows users)**
```bash
# Double-click to run or execute in command line
dev.bat
```

The application will start at `http://localhost:5173` (Vite default port)

**Electron Desktop Application Mode**:
```bash
npm run electron:dev
```

This command will:
1. Build Electron main process and preload scripts
2. Start Vite development server (http://localhost:5173)
3. Wait for the server to be ready, then launch the Electron application

**Launch Electron only** (requires `npm run dev` to be running first):
```bash
npm run electron
```

5. **Build production version**

**Web Application**:
```bash
npm run build
```

**Electron Desktop Application**:
```bash
npm run electron:build
```

This will:
1. Build Electron main process files to `dist-electron/`
2. Build Vue application to `dist/`

6. **Preview production version**

**Web Application**:
```bash
npm run preview
```

**Package Electron Application**:
```bash
npm run electron:dist
```

This will create distributable installers, output to `dist-electron/` directory:
- **Windows**: NSIS installer (.exe)
- **macOS**: DMG file
- **Linux**: AppImage file

### Publishing to GitHub Releases

The project is configured with GitHub Actions for automated build and release workflow. To publish a new version:

1. **Update version number**: Update the `version` field in `package.json` (e.g., `0.1.4`)

2. **Create Git tag**:
   ```bash
   git add .
   git commit -m "chore: bump version to 0.1.4"
   git tag v0.1.4
   git push origin main
   git push origin v0.1.4
   ```

3. **Automatic build and release**: After pushing the tag, GitHub Actions will automatically:
   - Build the application on Windows, macOS, and Linux
   - Create a GitHub Release
   - Upload installers for all platforms

4. **Manual trigger**: You can also manually trigger the build from the GitHub Actions page

Published installers can be downloaded from the [GitHub Releases](https://github.com/YOUR_USERNAME/powerpoint-workbench/releases) page.

**Note**:
- Tag format must be `v*` (e.g., `v0.1.4`)
- Releases will automatically read update content from `CHANGELOG.md`
- If code signing is needed, configure certificates in GitHub Secrets

## 📁 Project Structure

```
powerpoint-workbench/
├── electron/                     # Electron desktop application
│   ├── main.ts                  # Electron main process (window management, app lifecycle)
│   ├── preload.ts               # Preload script (secure API exposure)
│   └── database.ts              # SQLite database operations
├── src/                          # Source code directory
│   ├── components/               # Vue components
│   │   ├── ExportModal.vue      # Export modal component
│   │   ├── GenerateAllModal.vue # Batch generation modal
│   │   ├── SettingsModal.vue    # Settings modal component
│   │   ├── SlidePreview.vue    # Slide preview component
│   │   └── TextEditorModal.vue # Text editor modal
│   ├── composables/              # Composable functions
│   │   ├── useI18n.ts           # Internationalization composable
│   │   └── useTheme.ts          # Theme switching composable
│   ├── i18n/                     # Internationalization configuration
│   │   ├── index.ts             # Internationalization entry
│   │   ├── languages.ts         # Language configuration
│   │   └── locales/             # Translation files
│   │       ├── en.json          # English translations
│   │       ├── zh-CN.json       # Simplified Chinese translations
│   │       └── zh-TW.json       # Traditional Chinese translations
│   ├── flag/                     # Flag icon components
│   │   └── FlagIcons.vue       # Flag icon library (200+ countries/regions)
│   ├── pages/                    # Page components
│   │   ├── Editor.vue           # Editor main page
│   │   └── Home.vue             # Home page
│   ├── prompts/                  # AI prompts
│   │   └── index.ts             # Prompt configuration
│   ├── services/                 # Service layer
│   │   ├── databaseService.ts   # Database service (Electron)
│   │   ├── exportService.ts     # Export service
│   │   ├── geminiService.ts     # Gemini API service
│   │   └── localAiService.ts    # Local AI service
│   ├── utils/                    # Utility functions
│   │   └── ipChecker.ts         # IP detection utility
│   ├── stores/                   # Pinia state management
│   │   └── projectStore.ts      # Project state store
│   ├── types/                    # TypeScript type definitions
│   │   └── index.ts             # Type definitions
│   ├── assets/                   # Static assets
│   │   └── main.css             # Main stylesheet
│   ├── App.vue                   # Application root component
│   ├── main.ts                   # Application entry
│   ├── router.ts                 # Router configuration
│   └── constants.ts              # Constant definitions
├── dist-electron/                # Electron build output
│   ├── main.js                  # Built main process
│   └── preload.js               # Built preload script
├── dist/                         # Vue application build output
├── scripts/                      # Build scripts
│   └── build-electron.js        # Electron build script
├── index.html                    # HTML entry file
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
├── tsconfig.app.json            # Application TypeScript configuration
├── tsconfig.node.json           # Node TypeScript configuration
├── eslint.config.js             # ESLint configuration
├── .stylelintrc.json            # Stylelint configuration
├── .vscode/                      # VS Code configuration
│   └── settings.json            # Workspace settings (includes i18n Ally configuration)
├── .i18n-ally.yml               # i18n Ally plugin configuration
├── dev.bat                      # Windows development server startup script
├── package.json                 # Project dependencies
├── metadata.json                # Project metadata
└── README.md                    # Project documentation
```

### Directory Description

- **`electron/`**: Electron desktop application related files
  - **`main.ts`**: Electron main process, responsible for window management and application lifecycle
  - **`preload.ts`**: Preload script, securely exposes Node.js APIs to renderer process
  - **`database.ts`**: SQLite database operations for local configuration storage
- **`src/components/`**: Reusable Vue components
- **`src/composables/`**: Vue 3 Composition API composable functions
- **`src/pages/`**: Page-level components
- **`src/services/`**: API calls and business logic
  - **`databaseService.ts`**: Database service wrapper, supports Electron and Web modes
- **`src/stores/`**: Pinia state management
- **`src/i18n/`**: Internationalization configuration and translation files
- **`src/flag/`**: Flag icon component library, contains 200+ country/region flag icons
- **`src/types/`**: TypeScript type definitions
- **`src/utils/`**: Utility functions (e.g., IP detection)
- **`dist-electron/`**: Electron build output directory
- **`scripts/`**: Build and utility scripts

## 🔧 Core Features

### 1. Slide Generation Workflow

```typescript
// 1. Input text content or upload files
const sourceText = "Your presentation content...";
// Or upload files (supports text, images, PDF, Excel)
const files: File[] = [/* uploaded files */];

// 2. Use Gemini 3 Pro to generate outline
// Supports text string or file array
const slides = await generateOutline(
  apiKey,
  sourceText, // or files
  pageCount,
  style,
  customPrompt
);

// 3. Generate visual elements for each slide
for (const slide of slides) {
  const image = await generateFullSlideImage(
    apiKey,
    slide,
    customStylePrompt,
    '2K'
  );
}
```

### 2. Main Components

#### `App.vue`
- Application root component
- Router view container

#### `Home.vue`
- Project home page
- Text input and file upload
- Supports multiple file formats (text, images, PDF, Excel)
- Excel files automatically converted to CSV
- Project configuration settings
- Supports Google AI and Local AI selection

#### `Editor.vue`
- Slide editor main interface
- Three-column layout: thumbnails, canvas, properties panel
- Real-time preview and editing functionality
- Scroll to switch slides
- Page number display (current page/total pages)

#### `geminiService.ts`
- Gemini API wrapper
- Supports text generation, image generation, video generation
- Multi-modal file processing (text, images, PDF)
- Excel files automatically converted to CSV
- Error handling and retry logic

#### `localAiService.ts`
- Local AI service wrapper
- Ollama API integration (text generation)
- ComfyUI API integration (image generation)

### 3. State Management

Using Pinia for global state management:

- **projectStore**: Project configuration, slide data, and uploaded file management
- **useI18n**: Multi-language state (composable function)
- **useTheme**: Theme switching state (composable function)

## 💻 Development Guide

### Electron Desktop Application

#### Development Mode

**Start development environment**:
```bash
npm run electron:dev
```

This command will:
1. Build Electron main process and preload scripts
2. Start Vite development server (http://localhost:5173)
3. Wait for the server to be ready, then launch the Electron application

**Launch Electron only** (requires `npm run dev` to be running first):
```bash
npm run electron
```

#### Build and Package

**Build production version**:
```bash
npm run electron:build
```

This will:
1. Build Electron main process files to `dist-electron/`
2. Build Vue application to `dist/`

**Package distributable application**:
```bash
npm run electron:dist
```

This will create distributable installers, output to `dist-electron/` directory:
- **Windows**: NSIS installer (.exe)
- **macOS**: DMG file
- **Linux**: AppImage file

#### Configuration

**Window Configuration**:

Window size and behavior are configured in `electron/main.ts`:
- Default size: 1400x900
- Minimum size: 1000x600
- Title bar style: macOS uses `hiddenInset`, other platforms use default
- Menu bar: Auto-hide (production mode)
- Developer tools: Enabled in development mode, disabled in production mode

**Build Configuration**:

electron-builder configuration is in the `build` field of `package.json`:
- App ID: `com.gemini.ppt.workbench`
- Product name: `Gemini PPT Workbench`
- Output directory: `dist-electron`

**Database Storage**:

- Database type: SQLite (using `sql.js`)
- Database location: `app.getPath('userData')/app.db`
  - Windows: `%APPDATA%\gemini-ppt-workbench\app.db`
  - macOS: `~/Library/Application Support/gemini-ppt-workbench/app.db`
  - Linux: `~/.config/gemini-ppt-workbench/app.db`
- Stored content: API Key, proxy configuration, local AI configuration, etc.

#### Notes

1. **Development Mode**: Electron connects to Vite development server, supports hot reload
2. **Production Mode**: Electron loads packaged static files
3. **Security**:
   - Context isolation enabled
   - Node.js integration disabled (renderer process)
   - Uses preload script to securely expose APIs
   - Developer tools and shortcuts (Alt, Ctrl+Shift+I, F12) disabled in production mode
4. **Network Requests**: All API calls (Gemini, local AI services) work normally in Electron
5. **Data Persistence**: Configuration is automatically saved to local SQLite database

#### Troubleshooting

**Electron window is blank**:
- Ensure Vite development server is running (development mode)
- Ensure `npm run electron:build` has been run (production mode)
- Check console for error messages

**Build failure**:
- Ensure all dependencies are installed: `npm install`
- Check Node.js version (recommended >= 18.0.0)
- Check for TypeScript type errors
- Check build script output for error messages

**Port is occupied**:
- If port 5173 is occupied, you can:
  - **Windows**: Use `netstat -ano | findstr :5173` to find the process, then use `taskkill /PID <PID> /F` to terminate
  - **macOS/Linux**: Use `lsof -ti:5173 | xargs kill -9` to terminate the process occupying the port
- Or modify `vite.config.ts` to use a different port

**Development mode startup failure**:
- Check if other Vite instances are running
- Ensure `dist-electron/` directory has correct permissions
- Check terminal output for detailed error messages
- Build script now automatically checks ports and provides clear error messages

**Packaging failure**:
- Ensure `npm run electron:build` has been run first
- Check if `build` configuration in `package.json` is correct
- Check if icon file exists (if custom icon is specified)

**Database issues**:
- Check application data directory permissions
- Confirm SQLite WASM files are loaded correctly
- Check console for error messages

### Code Standards

1. **Variable Naming**: Use camelCase
```typescript
const slideData: SlideData = {...};
const apiKey: string = "...";
```

2. **Type Definitions**: Prohibit using `any`
```typescript
// ❌ Wrong
const data: any = fetchData();

// ✅ Correct
const data: SlideData[] = fetchData();
```

3. **SOLID Principles**
- Single Responsibility Principle (SRP)
- Open-Closed Principle (OCP)
- Liskov Substitution Principle (LSP)
- Interface Segregation Principle (ISP)
- Dependency Inversion Principle (DIP)

### Adding New Features

1. Define types in `src/types/index.ts`
2. Implement business logic in `src/services/`
3. Create Vue components in `src/components/` or `src/pages/`
4. Create composable functions in `src/composables/` (if needed)
5. Update translation files in `src/i18n/locales/`
6. Run `npm run lint` to check code quality

### Debugging Tips

```bash
# Development mode (with hot reload)
npm run dev
# Or use Windows batch script
dev.bat

# Type checking
npx tsc --noEmit

# Code checking
npm run lint
```

## ⚙️ Configuration

### Vite Configuration (`vite.config.ts`)

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

### TypeScript Configuration (`tsconfig.json`)

- **Target**: ES2022
- **Module**: ESNext
- **JSX**: preserve (Vue SFC)
- **Strict Mode**: Enabled

### Path Aliases

Use `@/` as an alias for `src/`:

```typescript
import SlidePreview from '@/components/SlidePreview.vue'
import { generateOutline } from '@/services/geminiService'
import { useProjectStore } from '@/stores/projectStore'
```

### i18n Ally Configuration

The project is pre-configured with the i18n Ally plugin. Configuration files are located at:

- **`.vscode/settings.json`**: VS Code workspace settings
- **`.i18n-ally.yml`**: i18n Ally specific configuration

Main configuration items:

```yaml
# Translation file paths
localesPaths:
  - src/i18n/locales

# Key style: nested (dot-separated)
keystyle: nested

# Supported languages
locales:
  - en
  - zh-CN
  - zh-TW

# Source language and display language
sourceLanguage: en
displayLanguage: zh-CN
```

To customize the configuration, edit the `.i18n-ally.yml` file. For detailed configuration options, refer to the [i18n Ally documentation](https://github.com/lokalise/i18n-ally).

## 🔌 API Integration

### Google Gemini API

#### Gemini 3 Pro (Thinking Mode)

Used for intelligent analysis and outline generation:

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

Used for high-quality image generation:

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

Used for video background generation:

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

### Local AI API

#### Ollama (Text Generation)

Used for local text generation and outline generation:

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

#### ComfyUI (Image Generation)

Used for local image generation:

```typescript
import { generateImageWithComfyUI } from '@/services/localAiService'

const imageUrl = await generateImageWithComfyUI({
  endpoint: 'http://localhost:8188',
  workflowId: 'workflow_name',
  prompt: visualPrompt
})
```

## 🎨 Styling System

### Tailwind CSS v4

The project uses the latest features of Tailwind CSS v4:

- **CDN Integration**: Fast loading via CDN
- **Dark Mode**: `class` strategy
- **Custom Scrollbar**: Optimized for dark/light modes

### Theme Switching

```typescript
import { useTheme } from '@/composables/useTheme'

const { theme, toggleTheme } = useTheme()

// Switch theme
toggleTheme()
```

## 🌍 Internationalization

### Supported Languages

- `en`: English
- `zh-CN`: Simplified Chinese
- `zh-TW`: Traditional Chinese

### Multi-language Coverage

The project has complete multi-language support, including:
- ✅ Application title and navigation
- ✅ All UI elements on the home page
- ✅ File upload prompts and labels
- ✅ All interface elements in the editor
- ✅ Settings panel
- ✅ Export and generation functions
- ✅ Error messages and status information
- ✅ Language selector (with flag icons)

### Development Tools

The project is configured with the **i18n Ally** plugin, providing a powerful internationalization development experience:

#### Installing i18n Ally

1. Open the extensions panel in VS Code/Cursor (`Ctrl+Shift+X`)
2. Search for "i18n Ally"
3. Click install and reload the window

#### Features

- **Hover Preview**: Hover over translation keys in code to view translations in all languages
- **Inline Editing**: Edit translations directly in code without opening JSON files
- **Missing Detection**: Automatically detect and mark missing translation keys
- **Usage Tracking**: Show where translation keys are used in code
- **Quick Refactoring**: Support batch replacement and refactoring of translation calls
- **Multi-language Comparison**: View translations in all languages side by side

#### Configuration Files

The project includes the following configuration files:

- **`.vscode/settings.json`**: VS Code workspace settings
- **`.i18n-ally.yml`**: i18n Ally specific configuration

Configuration is optimized for the project structure:
- Translation file path: `src/i18n/locales`
- Key style: nested (dot-separated, e.g., `"app.title"`)
- Framework support: Vue 3 + generic mode
- Source language: `en`
- Display language: `zh-CN`

### Adding New Languages

1. Add new language code to `Language` enum in `src/types/index.ts`
2. Add language configuration to `languageConfig` in `src/i18n/languages.ts`
3. Create corresponding JSON translation file in `src/i18n/locales/` directory
4. Add new language to `SUPPORTED_LANGUAGES` in `src/constants.ts`
5. Update `locales` and `localeDisplayNames` configuration in `.i18n-ally.yml`

## 📝 License

This project is licensed under the [GNU Affero General Public License v3.0](LICENSE) (AGPL-3.0).

The AGPL-3.0 License allows you to:
- ✅ Commercial use
- ✅ Modify
- ✅ Distribute
- ✅ Private use
- ✅ Patent use

**Requirements**:
- ✅ License and copyright notice must be included
- ✅ State changes made to the code
- ✅ Disclose source code (copyleft)
- ✅ Same license must be used for derivative works
- ✅ **Network use**: If you modify and run the program on a server, you must provide source code to all users who interact with it remotely

**Limitations**:
- ❌ Liability disclaimer
- ❌ No warranty

**Note**: AGPL-3.0 is specifically designed for network server software. If you modify this program and make it available over a network, you must provide the source code to all users who interact with it remotely.

For detailed terms, please refer to the [LICENSE](LICENSE) file.

---

## 🌐 Official Website

[PowerPoint-workbench](https://powerpoint.xiaoboqi.qzz.io)

## 🤝 Contributing

Welcome to submit Issues and Pull Requests!

Before submitting a PR, please ensure:

1. ✅ Code passes ESLint checks (`npm run lint`)
2. ✅ Styles pass Stylelint checks (`npm run lint:style`)
3. ✅ All type definitions are correct, no `any` types
4. ✅ Follow project code standards (camelCase naming, SOLID principles)
5. ✅ Add necessary comments and documentation
6. ✅ Update relevant internationalization translation files

## 📞 Contact

For questions or suggestions, please contact us through:

- Submit an Issue
- Send an email to the project maintainer

---

<div align="center">

**Built with ❤️ and ☕**

Powered by Google Gemini AI

</div>
