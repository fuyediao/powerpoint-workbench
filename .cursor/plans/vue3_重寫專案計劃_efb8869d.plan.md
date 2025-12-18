# Vue 3 重寫 Gemini PowerPoint Workbench 專案

## 第一階段：專案重組

### 1. 備份舊專案

創建 `legacy-react/` 資料夾，將現有 React 代碼移入：

- 移動 `src/` 目錄內容到 `legacy-react/src/`
- 保留根目錄配置文件（如 `.env.local.example`、`metadata.json`）

### 2. 初始化 Vue 3 專案

使用官方命令：

```bash
npm create vue@latest . -- --typescript --router --pinia
```

選項：

- TypeScript: Yes
- Vue Router: Yes
- Pinia（狀態管理）: Yes
- ESLint: Yes

### 3. 安裝 Tailwind CSS v4

```bash
npm install -D tailwindcss @tailwindcss/vite
```

配置 [vite.config.ts](vite.config.ts)，在 CSS 入口引入 `@import "tailwindcss"`

---

## 第二階段：核心架構

### 目錄結構

```
src/
├── assets/
├── components/
│   ├── SettingsModal.vue
│   └── SlidePreview.vue
├── composables/          # Vue 組合式函數
│   ├── useI18n.ts
│   └── useTheme.ts
├── i18n/
│   ├── index.ts
│   └── locales/
│       ├── en.json
│       └── zh-CN.json
├── pages/               # 或 views/
│   ├── Home.vue
│   └── Editor.vue
├── services/
│   └── geminiService.ts  # 可直接複用
├── stores/
│   └── projectStore.ts   # Pinia store
├── types/
│   └── index.ts          # 可直接複用
├── App.vue
├── main.ts
└── router.ts
```

---

## 第三階段：功能重寫

### 重點映射對照表

| React | Vue 3 |

|-------|-------|

| `useState` | `ref` / `reactive` |

| `useEffect` | `onMounted` / `watch` / `watchEffect` |

| `useContext` | Pinia / `provide`+`inject` |

| `useMemo` | `computed` |

| React Router | Vue Router |

| Context Provider | Pinia Store |

| JSX | Vue SFC template |

### 1. 狀態管理：[src/stores/projectStore.ts]

使用 Pinia 替代 React Context：

```typescript
export const useProjectStore = defineStore('project', () => {
  const config = ref<ProjectConfig>({...})
  const slides = ref<SlideData[]>([])
  
  function updateSlide(id: string, data: Partial<SlideData>) {...}
  
  return { config, slides, updateSlide }
})
```

### 2. 國際化：[src/composables/useI18n.ts]

使用組合式函數實現：

```typescript
export function useI18n() {
  const lang = ref<Language>(Language.ZH)
  const t = computed(() => (key: string) => translations[lang.value][key] || key)
  return { lang, setLang, t }
}
```

### 3. 主題切換：[src/composables/useTheme.ts]

```typescript
export function useTheme() {
  const theme = ref<'light' | 'dark'>('light')
  const toggleTheme = () => {...}
  return { theme, toggleTheme }
}
```

### 4. 路由配置：[src/router.ts]

```typescript
const routes = [
  { path: '/', component: () => import('./pages/Home.vue') },
  { path: '/editor', component: () => import('./pages/Editor.vue') }
]
```

### 5. 頁面組件

- **Home.vue**：輸入區、配置選項、開始按鈕
- **Editor.vue**：三欄佈局編輯器
- **SettingsModal.vue**：設置彈窗
- **SlidePreview.vue**：幻燈片預覽

### 6. 服務層

[src/services/geminiService.ts] 可直接複用，無需修改

---

## 第四階段：完善

1. 配置 ESLint 9.15
2. 運行 `npm run lint` 修復所有錯誤
3. 測試所有功能