import { ref, watch } from 'vue'

type Theme = 'light' | 'dark'

const theme = ref<Theme>('light')
let initialized = false

function applyTheme() {
  if (typeof window !== 'undefined') {
    const root = window.document.documentElement
    if (theme.value === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme.value)
  }
}

// 立即初始化（模組載入時）
function initializeTheme() {
  if (initialized) return
  initialized = true
  
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = window.localStorage.getItem('theme')
    if (saved === 'dark' || saved === 'light') {
      theme.value = saved
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme.value = 'dark'
    }
  }
  applyTheme()
}

// 模組載入時立即初始化
initializeTheme()

// 監聽主題變化
watch(theme, () => {
  applyTheme()
})

export function useTheme() {
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return {
    theme,
    toggleTheme
  }
}
