import { Language } from '@/types'
import { translations } from './languages'

export { translations }

export function getTranslation(lang: Language, key: string): string {
  const langTranslations = translations[lang] as Record<string, string>
  return langTranslations[key] || key
}
