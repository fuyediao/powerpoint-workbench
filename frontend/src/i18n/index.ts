import { createI18n } from 'vue-i18n';
import zhCN from './locales/zh-CN';
import zhTW from './locales/zh-TW';
import en from './locales/en';
import type { Locale } from '../types';

const messages = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'en': en,
};

// Detect browser language
function getDefaultLocale(): Locale {
  const browserLang = navigator.language;
  if (browserLang.startsWith('zh')) {
    return browserLang.includes('TW') || browserLang.includes('HK') ? 'zh-TW' : 'zh-CN';
  }
  return 'en';
}

const savedLocale = localStorage.getItem('locale') as Locale | null;

export const i18n = createI18n({
  legacy: false,
  locale: savedLocale || getDefaultLocale(),
  fallbackLocale: 'en',
  messages,
});

export function setLocale(locale: Locale) {
  i18n.global.locale.value = locale;
  localStorage.setItem('locale', locale);
  document.documentElement.lang = locale;
}

export function getCurrentLocale(): Locale {
  return i18n.global.locale.value as Locale;
}

