import enTranslations from './locales/en.json'
import zhCnTranslations from './locales/zh-CN.json'
import zhTwTranslations from './locales/zh-TW.json'
import { Language } from '@/types'

type Translations = typeof enTranslations

/**
 * 統一的語言配置 - 只需在這裡添加新語言
 * 添加新語言時：
 * 1. 在此數組中添加配置
 * 2. 在 src/types/index.ts 的 Language enum 中添加對應的枚舉值
 * 3. 創建對應的翻譯文件（如 zh-JP.json）
 */
export const languageConfig = [
  {
    code: 'en' as const,
    enumKey: 'EN' as const,
    label: 'English',
    translations: enTranslations
  },
  {
    code: 'zh-CN' as const,
    enumKey: 'ZH_CN' as const,
    label: '简体中文',
    translations: zhCnTranslations
  },
  {
    code: 'zh-TW' as const,
    enumKey: 'ZH_TW' as const,
    label: '繁體中文',
    translations: zhTwTranslations
  }
] as const

// 導出語言代碼類型
export type LanguageCode = typeof languageConfig[number]['code']

// 生成 translations 對象
export const translations = languageConfig.reduce((acc, lang) => {
  acc[lang.code] = lang.translations
  return acc
}, {} as Record<LanguageCode, Translations>) as Record<LanguageCode, Translations>

// 生成 SUPPORTED_LANGUAGES 數組
import { type SupportedLanguage } from '@/types'

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = languageConfig.map(lang => ({
  code: lang.code as Language,
  label: lang.label
}))

/**
 * 從語言代碼字符串匹配到支持的 Language enum
 */
function matchLanguageCode(langCode: string): Language | null {
  const supportedCodes = languageConfig.map(lang => lang.code)
  
  // 嘗試完全匹配（例如：zh-CN）
  const exactMatch = supportedCodes.find(code => code === langCode)
  if (exactMatch) {
    return exactMatch as Language
  }
  
  // 嘗試語言代碼匹配（例如：zh-CN 匹配 zh）
  const langBase = langCode.split('-')[0]
  const langMatch = supportedCodes.find(code => code.startsWith(langBase))
  if (langMatch) {
    return langMatch as Language
  }
  
  return null
}

/**
 * 檢測系統/瀏覽器語言並返回對應的 Language enum
 * 優先級：Electron 系統語言 > 瀏覽器語言 > 默認英文
 */
export async function detectSystemLanguage(): Promise<Language> {
  // 1. 優先使用 Electron 系統語言
  if (typeof window !== 'undefined' && window.electronAPI?.app) {
    try {
      const systemLocale = await window.electronAPI.app.getLocale()
      const matched = matchLanguageCode(systemLocale)
      if (matched) {
        return matched
      }
    } catch (error) {
      console.warn('Failed to get system locale:', error)
    }
  }
  
  // 2. 使用瀏覽器語言
  if (typeof navigator !== 'undefined') {
    const browserLanguages = navigator.languages || [navigator.language]
    
    for (const browserLang of browserLanguages) {
      const matched = matchLanguageCode(browserLang)
      if (matched) {
        return matched
      }
    }
  }
  
  // 3. 默認返回英文
  return Language.EN
}

/**
 * 檢測瀏覽器語言並返回對應的 Language enum（同步版本，用於初始化）
 * 如果沒有匹配的語言，返回英文
 * @deprecated 使用 detectSystemLanguage() 替代，此函數保留用於向後兼容
 */
export function detectBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') {
    return Language.EN
  }

  // 獲取瀏覽器語言列表
  const browserLanguages = navigator.languages || [navigator.language]
  
  // 支持的語言代碼列表
  const supportedCodes = languageConfig.map(lang => lang.code)
  
  // 遍歷瀏覽器語言，尋找匹配的語言
  for (const browserLang of browserLanguages) {
    // 嘗試完全匹配（例如：zh-CN）
    const exactMatch = supportedCodes.find(code => code === browserLang)
    if (exactMatch) {
      return exactMatch as Language
    }
    
    // 嘗試語言代碼匹配（例如：zh-CN 匹配 zh）
    const langCode = browserLang.split('-')[0]
    const langMatch = supportedCodes.find(code => code.startsWith(langCode))
    if (langMatch) {
      return langMatch as Language
    }
  }
  
  // 如果都沒有匹配，返回英文
  return Language.EN
}
