<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { setLocale, getCurrentLocale } from '../i18n';
import type { Locale } from '../types';

const { locale } = useI18n();
const isOpen = ref(false);
let closeTimeout: ReturnType<typeof setTimeout> | null = null;

const languages: { code: Locale; name: string; flag: string }[] = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

const defaultLanguage = { code: 'en' as Locale, name: 'English', flag: '🇺🇸' };
const currentLanguage = computed(() => {
  return languages.find(l => l.code === locale.value) ?? defaultLanguage;
});

function selectLanguage(code: Locale) {
  setLocale(code);
  isOpen.value = false;
  if (closeTimeout) {
    clearTimeout(closeTimeout);
    closeTimeout = null;
  }
}

function toggleDropdown() {
  isOpen.value = !isOpen.value;
  if (closeTimeout) {
    clearTimeout(closeTimeout);
    closeTimeout = null;
  }
}

function closeDropdown() {
  // 使用短延遲，避免鼠標移動時立即關閉
  closeTimeout = setTimeout(() => {
    isOpen.value = false;
    closeTimeout = null;
  }, 150);
}

function cancelClose() {
  if (closeTimeout) {
    clearTimeout(closeTimeout);
    closeTimeout = null;
  }
}
</script>

<template>
  <div
    class="relative"
    @mouseleave="closeDropdown"
    @mouseenter="cancelClose"
  >
    <button
      class="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 
             dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
      @click="toggleDropdown"
      @mouseenter="cancelClose"
    >
      <span class="text-base">{{ currentLanguage.flag }}</span>
      <span>{{ currentLanguage.name }}</span>
      <svg
        :class="['w-4 h-4 transition-transform', isOpen && 'rotate-180']"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <!-- 連接區域，確保鼠標移動時不會觸發關閉 -->
    <div
      v-if="isOpen"
      class="absolute right-0 top-full w-40 h-1"
      @mouseenter="cancelClose"
    />
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50"
        @mouseenter="cancelClose"
        @mouseleave="closeDropdown"
      >
        <button
          v-for="lang in languages"
          :key="lang.code"
          :class="[
            'w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors',
            lang.code === getCurrentLocale()
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
          ]"
          @click="selectLanguage(lang.code)"
        >
          <span class="text-base">{{ lang.flag }}</span>
          <span>{{ lang.name }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

