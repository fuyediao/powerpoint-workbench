<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useProjectStore } from '../stores/project';
import InputPanel from '../components/InputPanel.vue';
import ConfigPanel from '../components/ConfigPanel.vue';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import ThemeToggle from '../components/ThemeToggle.vue';
import type { Locale } from '../types';
import { getCurrentLocale } from '../i18n';

const { t } = useI18n();
const router = useRouter();
const projectStore = useProjectStore();

const canGenerate = computed(() => projectStore.hasContent && !projectStore.isGenerating);

async function handleGenerate() {
  const locale: Locale = getCurrentLocale();
  await projectStore.generateOutline(locale);
  
  if (projectStore.currentProject) {
    router.push({ name: 'editor', params: { projectId: projectStore.currentProject.id } });
  }
}
</script>

<template>
  <div class="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col overflow-hidden">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
          <svg
            class="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        </div>
        <span class="text-xl font-semibold text-slate-800 dark:text-slate-100">{{ t('header.title') }}</span>
      </div>
      <div class="flex items-center gap-3">
        <button
          class="flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 dark:text-slate-300 
                 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 
                 transition-colors"
          :aria-label="t('settings.title')"
          @click="router.push({ name: 'settings' })"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto pt-20">
      <div class="max-w-4xl mx-auto px-6 py-12">
        <!-- Hero Section -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            {{ t('header.subtitle') }}
          </h1>
          <p class="text-lg text-slate-500 dark:text-slate-400">
            {{ t('header.poweredBy') }}
          </p>
        </div>

        <!-- Input Card -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-8 mb-8">
          <InputPanel />
        
          <div class="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700">
            <ConfigPanel />
          </div>

          <!-- Generate Button -->
          <div class="mt-8 flex justify-end">
            <button
              :disabled="!canGenerate"
              class="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-medium rounded-xl
                   flex items-center gap-2 transition-all duration-200
                   hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
              @click="handleGenerate"
            >
              <span>{{ t('config.generateOutline') }}</span>
              <svg
                v-if="!projectStore.isGenerating"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <svg
                v-else
                class="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </button>
          </div>

          <!-- Error Message -->
          <div
            v-if="projectStore.error"
            class="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400"
          >
            {{ projectStore.error }}
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

