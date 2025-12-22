---
name: 將 Web 應用轉換為 Electron 桌面應用
overview: 將現有的 Vue 3 + Vite Web 應用轉換為 Electron 桌面應用程式，使用最新穩定版 Electron 和 electron-builder 進行打包分發。
todos:
  - id: install-deps
    content: 安裝 Electron 和 electron-builder 依賴包
    status: completed
  - id: create-main-process
    content: 創建 Electron 主進程文件 (electron/main.ts)，包含窗口管理和開發/生產模式處理
    status: completed
    dependencies:
      - install-deps
  - id: update-vite-config
    content: 修改 Vite 配置以支持 Electron 環境
    status: completed
  - id: update-package-json
    content: 更新 package.json：添加 Electron 相關腳本和 electron-builder 配置
    status: completed
    dependencies:
      - install-deps
  - id: handle-router
    content: 調整路由配置以適配 Electron 環境
    status: completed
  - id: create-preload
    content: 創建預載入腳本（如需要暴露安全的 Node.js API）
    status: completed
    dependencies:
      - create-main-process
  - id: verify-services
    content: 驗證 AI 服務調用在 Electron 環境中正常工作
    status: completed
    dependencies:
      - create-main-process
  - id: test-build
    content: 測試開發模式和生產模式構建，確保應用正常運行
    status: completed
    dependencies:
      - create-main-process
      - update-package-json
---

# 將 Web 應用轉換為 Electron 桌面應用

## 項目概況

這是一個基於 Vue 3 + Vite + TypeScript 的 AI 驅動 PowerPoint 生成工作台，當前為純 Web 應用。需要將其轉換為 Electron 桌面應用程式。

## 技術架構

當前技術棧：

- Vue 3.5.13 + Vite 6.2 + TypeScript 5.8
- Vue Router (Hash History)
- Pinia 狀態管理
- Google Gemini API 整合
- 本地 AI 服務支持 (Ollama + ComfyUI)

目標架構：

```javascript
┌─────────────────────────────────────┐
│      Electron Main Process          │
│  (Node.js - 窗口管理、系統整合)      │
└──────────────┬──────────────────────┘
               │ IPC Communication
┌──────────────▼──────────────────────┐
│      Electron Renderer Process      │
│  (Chromium - Vue 3 應用運行於此)     │
│  - Vite Dev Server (開發模式)        │
│  - 打包後的靜態文件 (生產模式)        │
└─────────────────────────────────────┘
```



## 實施步驟

### 1. 安裝 Electron 依賴

**文件**: `package.json`

- 添加 Electron 和 electron-builder 到 devDependencies
- 安裝版本：Electron 最新穩定版（~33.x），electron-builder ~25.x
- 添加必要的類型定義 `@types/node`（已存在）

### 2. 創建 Electron 主進程文件

**新文件**: `electron/main.ts`創建 Electron 主進程入口文件，負責：

- 創建和管理應用窗口
- 處理系統集成（菜單、托盤等）
- 處理 IPC 通信（如需要）
- 開發模式下連接到 Vite 開發服務器
- 生產模式下加載打包後的 HTML 文件
- 窗口配置（大小、標題、是否可調整等）

**關鍵配置**：

- 開發模式：`loadURL('http://localhost:5173')`
- 生產模式：`loadFile('dist/index.html')`
- 啟用 Node.js 集成（如需要訪問本地文件系統）
- 配置安全選項（CSP、上下文隔離等）

### 3. 修改 Vite 配置

**文件**: `vite.config.ts`

- 配置 `base` 為相對路徑（Electron 不需要絕對路徑）
- 確保構建輸出適合 Electron
- 可能需要調整資源路徑處理

### 4. 更新路由配置

**文件**: `src/router.ts`

- 當前使用 `createWebHashHistory`，Electron 中可以保留或改為 `createWebHistory`
- 建議保留 Hash History 以確保兼容性，或使用 `process.env.ELECTRON ? createWebHashHistory : createWebHistory` 條件判斷

### 5. 更新 package.json 腳本和配置

**文件**: `package.json`添加以下腳本：

- `electron:dev`: 開發模式，同時啟動 Vite 和 Electron
- `electron:build`: 構建 Vue 應用的生產版本
- `electron:pack`: 打包 Electron 應用（不創建安裝程序）
- `electron:dist`: 構建並打包可分發的應用程式
- `electron`: 啟動 Electron（需要先構建）

添加 electron-builder 配置：

- 應用圖標和元數據
- 構建目標平台（Windows、macOS、Linux）
- 自動更新配置（可選）
- 文件資源配置

### 6. 創建 Electron 預載入腳本（可選）

**新文件**: `electron/preload.ts`如果需要暴露安全的 Node.js API 給渲染進程：

- 使用 `contextBridge` 暴露有限的安全 API
- 避免直接暴露完整的 Node.js API

### 7. 處理環境變量和 API 調用

**文件**: `src/services/geminiService.ts`, `src/services/localAiService.ts`確保在 Electron 環境中：

- API 調用正常工作
- 網絡請求不受影響
- 本地服務連接（Ollama、ComfyUI）正常

可能需要添加環境檢測：

```typescript
const isElectron = typeof window !== 'undefined' && window.process?.type === 'renderer'
```



### 8. 配置文件資源

**新文件**: `electron-builder.yml` 或 `package.json` 中的 `build` 配置配置：

- 應用圖標路徑
- 額外資源文件
- 排除不必要的文件
- 自動更新服務器（如需要）

### 9. 開發工具配置

創建開發輔助腳本：

- 使用 `concurrently` 或 `wait-on` 確保 Vite 服務器啟動後再啟動 Electron
- 配置開發環境的熱重載

### 10. TypeScript 配置調整

**文件**: `tsconfig.json`, `tsconfig.node.json`

- 確保 Node.js 類型的正確引用
- 為 Electron 主進程創建單獨的 tsconfig（如需要）

### 11. 測試和驗證

- 在開發模式下測試應用功能
- 驗證 AI API 調用正常
- 測試文件上傳和下載功能
- 驗證本地 AI 服務連接
- 測試打包後的應用程式

## 文件結構變化

新增文件：

```javascript
powerpoint-workbench/
├── electron/
│   ├── main.ts          # Electron 主進程
│   └── preload.ts       # 預載入腳本（可選）
├── electron-builder.yml # electron-builder 配置（可選）
└── assets/
    └── icon.png         # 應用圖標
```

修改文件：

- `package.json` - 添加依賴、腳本和構建配置
- `vite.config.ts` - 調整構建配置
- `src/router.ts` - 可能調整路由模式
- `tsconfig.json` - 類型配置調整

## 注意事項

1. **安全性**：確保上下文隔離和預載入腳本的安全使用
2. **性能**：Electron 應用較 Web 應用體積更大，注意優化
3. **跨平台**：確保代碼在不同操作系統上都能正常運行
4. **路徑處理**：Electron 中的文件路徑需要使用 `app.getPath()` 等 API
5. **網絡請求**：確保 Gemini API 和本地 AI 服務的網絡連接正常
6. **更新機制**：可考慮實現自動更新功能（使用 electron-updater）

## 後續優化（可選）

- 添加應用菜單和快捷鍵
- 實現系統托盤功能