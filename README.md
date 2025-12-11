# PPT Workbench

基於 AI 的 PPT 製作工作台，使用 Google Gemini 3 Pro 和 Nano Banana Pro 將文字材料轉換為精美的圖文並茂的簡報。

## 功能特點

- **多種輸入方式**：支持粘貼文字或上傳 Markdown、Word、PDF 文檔
- **智能內容拆分**：AI 自動分析文檔結構，根據指定頁數智能拆分內容
- **雙模式設計**：
  - 要點凝練型：適合演講輔助，重點突出
  - 詳細展示型：詳細展示文字內容
- **自定義設計**：支持輸入設計需求，AI 潤色後應用到所有頁面
- **逐頁編輯**：每頁可獨立調整文字、提示詞、參考圖片
- **多語言支持**：簡體中文、繁體中文、English
- **PDF 導出**：生成完成後可導出為 PDF 文件

## 技術棧

### 前端
- Vue 3.5 + TypeScript
- Vite 6
- Tailwind CSS v4
- Pinia (狀態管理)
- Vue Router
- vue-i18n (國際化)

### 後端
- NestJS 10
- TypeORM + SQLite
- Google Generative AI SDK

## 快速開始

### 環境要求
- Node.js 18+
- npm 9+

### 安裝

```bash
# 克隆項目
git clone https://github.com/yourusername/powerpoint-workbench.git
cd powerpoint-workbench

# 安裝前端依賴
cd frontend
npm install

# 安裝後端依賴
cd ../backend
npm install
```

### 配置

1. 獲取 Google Gemini API Key：https://aistudio.google.com/app/apikey

2. 配置後端環境變量：
```bash
cd backend
cp .env.example .env
# 編輯 .env 文件，填入你的 GEMINI_API_KEY
```

### 運行

```bash
# 啟動後端服務 (端口 3000)
cd backend
npm run start:dev

# 啟動前端開發服務器 (端口 5173)
cd frontend
npm run dev
```

訪問 http://localhost:5173 開始使用。

## 項目結構

```
powerpoint-workbench/
├── frontend/                 # Vue3 前端
│   ├── src/
│   │   ├── components/       # UI 組件
│   │   ├── views/            # 頁面視圖
│   │   ├── stores/           # Pinia 狀態管理
│   │   ├── i18n/             # 多語言文件
│   │   ├── services/         # API 服務層
│   │   └── types/            # TypeScript 類型
│   └── package.json
├── backend/                  # NestJS 後端
│   ├── src/
│   │   ├── modules/
│   │   │   ├── document/     # 文檔解析模組
│   │   │   ├── project/      # 項目管理模組
│   │   │   ├── slide/        # 幻燈片模組
│   │   │   ├── ai/           # AI 服務模組
│   │   │   └── export/       # PDF 導出模組
│   │   ├── entities/         # 數據實體
│   │   └── dto/              # 數據傳輸對象
│   └── package.json
└── README.md
```

## 使用流程

1. **輸入內容**：粘貼文字或上傳文檔
2. **配置參數**：選擇頁數 (1-30)、風格模式
3. **生成大綱**：AI 分析內容並生成頁面大綱
4. **逐頁編輯**：調整每頁的文字、圖片提示詞
5. **生成圖片**：為每頁生成配圖
6. **導出 PDF**：下載最終成品

## 開發

```bash
# 前端 lint 檢查
cd frontend
npm run lint

# 後端 lint 檢查
cd backend
npm run lint
```

## License

MIT
