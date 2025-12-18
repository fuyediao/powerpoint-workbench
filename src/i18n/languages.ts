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
 * 檢測瀏覽器語言並返回對應的 Language enum
 * 如果沒有匹配的語言，返回英文
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
