import { ref, watch, computed, onMounted, onUnmounted } from 'vue'

type ThemeMode = 'system' | 'light' | 'dark'
type ResolvedTheme = 'light' | 'dark'

const themeMode = ref<ThemeMode>('system')
const systemTheme = ref<ResolvedTheme>('light')
let initialized = false
let mediaQuery: MediaQueryList | null = null
let mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null

// 解析實際應用的主題
const theme = computed<ResolvedTheme>(() => {
  if (themeMode.value === 'system') {
    return systemTheme.value
  }
  return themeMode.value
})

// 應用主題到 DOM
function applyTheme() {
  if (typeof window !== 'undefined') {
    const root = window.document.documentElement
    if (theme.value === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }
}

// 監聽系統主題變化
function setupSystemThemeListener() {
  if (typeof window === 'undefined' || !window.matchMedia) return

  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  systemTheme.value = mediaQuery.matches ? 'dark' : 'light'

  mediaQueryListener = (e: MediaQueryListEvent) => {
    systemTheme.value = e.matches ? 'dark' : 'light'
  }

  // 使用 addEventListener（現代瀏覽器）
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', mediaQueryListener)
  } else {
    // 兼容舊瀏覽器
    mediaQuery.addListener(mediaQueryListener)
  }
}

// 移除系統主題監聽器
function removeSystemThemeListener() {
  if (mediaQuery && mediaQueryListener) {
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', mediaQueryListener)
    } else {
      mediaQuery.removeListener(mediaQueryListener)
    }
  }
  mediaQuery = null
  mediaQueryListener = null
}

// 初始化主題
function initializeTheme() {
  if (initialized) return
  initialized = true

  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = window.localStorage.getItem('theme')
    if (saved === 'system' || saved === 'light' || saved === 'dark') {
      themeMode.value = saved
    } else {
      // 如果沒有保存的設置，默認使用系統設置
      themeMode.value = 'system'
    }
  } else {
    themeMode.value = 'system'
  }

  // 設置系統主題監聽器
  setupSystemThemeListener()

  // 立即應用主題
  applyTheme()
}

// 模組載入時立即初始化
initializeTheme()

// 監聽主題模式變化
watch(themeMode, (newMode) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem('theme', newMode)
  }

  // 如果切換到系統模式，重新設置監聽器
  if (newMode === 'system') {
    setupSystemThemeListener()
  } else {
    // 如果切換到用戶選擇模式，移除監聽器
    removeSystemThemeListener()
  }

  applyTheme()
})

// 監聽解析後的主題變化（包括系統主題變化）
watch(theme, () => {
  applyTheme()
})

export function useTheme() {
  // 切換主題（在 system -> light -> dark -> system 之間循環）
  const toggleTheme = () => {
    if (themeMode.value === 'system') {
      // 從系統切換到用戶選擇的主題（與當前系統主題相反）
      themeMode.value = systemTheme.value === 'dark' ? 'light' : 'dark'
    } else if (themeMode.value === 'light') {
      themeMode.value = 'dark'
    } else {
      // 從 dark 切換回 system
      themeMode.value = 'system'
    }
  }

  // 設置主題模式
  const setThemeMode = (mode: ThemeMode) => {
    themeMode.value = mode
  }

  // 組件掛載時確保監聽器已設置
  onMounted(() => {
    if (themeMode.value === 'system') {
      setupSystemThemeListener()
    }
    applyTheme()
  })

  // 組件卸載時清理監聽器
  onUnmounted(() => {
    // 注意：這裡不應該移除監聽器，因為其他組件可能還在使用
    // 只在整個應用關閉時才清理
  })

  return {
    theme, // 解析後的主題（'light' | 'dark'）
    themeMode, // 主題模式（'system' | 'light' | 'dark'）
    toggleTheme,
    setThemeMode
  }
}
