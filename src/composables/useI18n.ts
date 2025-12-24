import { ref, computed, watch } from 'vue'
import { Language } from '@/types'
import { getTranslation } from '@/i18n'
import { detectBrowserLanguage, detectSystemLanguage } from '@/i18n/languages'

// localStorage 鍵名
const LANGUAGE_STORAGE_KEY = 'app_language'

// 從 localStorage 讀取保存的語言
function getSavedLanguage(): Language | null {
  if (typeof localStorage === 'undefined') {
    return null
  }
  
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (saved && Object.values(Language).includes(saved as Language)) {
      return saved as Language
    }
  } catch (error) {
    console.warn('Failed to read saved language:', error)
  }
  
  return null
}

// 保存語言到 localStorage
function saveLanguage(lang: Language): void {
  if (typeof localStorage === 'undefined') {
    return
  }
  
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
  } catch (error) {
    console.warn('Failed to save language:', error)
  }
}

// 初始化語言：優先使用保存的語言，否則使用系統/瀏覽器語言
const savedLang = getSavedLanguage()
const initialLang = savedLang || detectBrowserLanguage()
const lang = ref<Language>(initialLang)

// 更新 HTML lang 屬性
const updateHtmlLang = (newLang: Language) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = newLang
  }
}

// 初始化時設置 lang 屬性
if (typeof document !== 'undefined') {
  updateHtmlLang(lang.value)
}

// 異步檢測系統語言（僅在沒有保存的語言時）
if (!savedLang) {
  detectSystemLanguage().then((systemLang) => {
    // 只有在當前語言還是初始瀏覽器語言時才更新
    // 避免覆蓋用戶可能已經手動切換的語言
    if (lang.value === initialLang && systemLang !== initialLang) {
      lang.value = systemLang
      updateHtmlLang(systemLang)
    }
  }).catch((error) => {
    console.warn('Failed to detect system language:', error)
  })
}

export function useI18n() {
  const setLang = (newLang: Language) => {
    lang.value = newLang
    updateHtmlLang(newLang)
    saveLanguage(newLang) // 保存用戶選擇
  }

  // 監聽語言變化並保存
  watch(lang, (newLang) => {
    updateHtmlLang(newLang)
    saveLanguage(newLang)
  })

  const t = computed(() => {
    return (key: string): string => getTranslation(lang.value, key)
  })

  return {
    lang,
    setLang,
    t
  }
}
