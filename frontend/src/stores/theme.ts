import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export type Theme = 'light' | 'dark';

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>('light');

  // 初始化主題
  function initTheme() {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      theme.value = savedTheme;
    } else {
      theme.value = prefersDark ? 'dark' : 'light';
    }
    
    applyTheme(theme.value);
  }

  // 應用主題到 DOM
  function applyTheme(newTheme: Theme) {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  // 切換主題
  function toggleTheme() {
    const newTheme = theme.value === 'light' ? 'dark' : 'light';
    theme.value = newTheme;
    applyTheme(newTheme);
  }

  // 設置主題
  function setTheme(newTheme: Theme) {
    theme.value = newTheme;
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }

  // 監聽系統主題變化
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        theme.value = e.matches ? 'dark' : 'light';
        applyTheme(theme.value);
      }
    });
  }

  // 監聽主題變化並保存（僅保存，不重複應用，因為已經在函數中應用了）
  watch(theme, (newTheme) => {
    localStorage.setItem('theme', newTheme);
  });

  return {
    theme,
    initTheme,
    toggleTheme,
    setTheme,
  };
});

