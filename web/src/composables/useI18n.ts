import { ref, computed, watch } from 'vue'
import { Language } from '@/types'
import { getTranslation } from '@/i18n'
import { detectBrowserLanguage } from '@/i18n/languages'

// 檢測瀏覽器語言，如果沒有匹配的則使用英文
const detectedLang = detectBrowserLanguage()
const lang = ref<Language>(detectedLang)

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

export function useI18n() {
  const setLang = (newLang: Language) => {
    lang.value = newLang
    updateHtmlLang(newLang)
  }

  // 監聽語言變化
  watch(lang, (newLang) => {
    updateHtmlLang(newLang)
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
