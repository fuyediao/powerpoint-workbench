<script setup lang="ts">
import { useThemeStore } from '../stores/theme';
import { computed } from 'vue';

const themeStore = useThemeStore();

const isDark = computed(() => themeStore.theme === 'dark');

function handleToggle() {
  themeStore.toggleTheme();
}
</script>

<template>
  <button
    class="flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 hover:text-slate-900 
           hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 
           transition-colors"
    :aria-label="isDark ? '切換到淺色模式' : '切換到深色模式'"
    @click="handleToggle"
  >
    <!-- 太陽圖標（淺色模式） -->
    <svg
      v-if="!isDark"
      class="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
    <!-- 月亮圖標（深色模式） -->
    <svg
      v-else
      class="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  </button>
</template>

