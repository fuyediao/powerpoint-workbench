<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useProjectStore } from '../stores/project';
import SlideList from '../components/SlideList.vue';
import SlideEditor from '../components/SlideEditor.vue';
import SlidePreview from '../components/SlidePreview.vue';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import ThemeToggle from '../components/ThemeToggle.vue';
import { apiService } from '../services/api';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();

const isExporting = ref(false);
const showPreviewModal = ref(false);
const previewImageUrl = ref('');

onMounted(async () => {
  const projectId = route.params.projectId as string;
  if (projectId && !projectStore.currentProject) {
    const response = await apiService.getProject(projectId);
    if (response.success && response.data) {
      projectStore.currentProject = response.data;
    } else {
      router.push({ name: 'home' });
    }
  }
  
  if (!projectStore.currentProject) {
    router.push({ name: 'home' });
  }
});

function goBack() {
  projectStore.reset();
  router.push({ name: 'home' });
}

async function handleExportPdf() {
  if (!projectStore.currentProject) return;
  
  isExporting.value = true;
  try {
    const response = await apiService.exportPdf(projectStore.currentProject.id);
    if (response.success && response.data) {
      window.open(response.data.downloadUrl, '_blank');
    }
  } finally {
    isExporting.value = false;
  }
}

function openPreview(imageUrl: string) {
  previewImageUrl.value = imageUrl;
  showPreviewModal.value = true;
}

function closePreview() {
  showPreviewModal.value = false;
  previewImageUrl.value = '';
}
</script>

<template>
  <div class="h-screen bg-slate-100 dark:bg-slate-900 flex flex-col overflow-hidden">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      <div class="flex items-center gap-4">
        <button
          class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          @click="goBack"
        >
          <svg
            class="w-5 h-5 text-slate-600 dark:text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
            <svg
              class="w-5 h-5 text-white"
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
          <span class="text-lg font-semibold text-slate-800 dark:text-slate-100">{{ projectStore.currentProject?.title || t('header.title') }}</span>
        </div>
      </div>
      
      <div class="flex items-center gap-4">
        <button
          class="flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 dark:text-slate-300 
                 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 
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
        <button
          :disabled="!projectStore.allSlidesCompleted || isExporting"
          class="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-medium rounded-lg
                 flex items-center gap-2 transition-all duration-200
                 hover:shadow-lg hover:shadow-emerald-500/25
                 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="handleExportPdf"
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
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>{{ isExporting ? t('export.exporting') : t('export.exportPdf') }}</span>
        </button>
        <LanguageSwitcher />
      </div>
    </header>

    <!-- Main Editor -->
    <div class="flex-1 flex overflow-hidden pt-12">
      <!-- Slide List (Left) -->
      <aside class="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-y-auto shrink-0">
        <div class="p-4">
          <h2 class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
            {{ t('editor.slideList') }}
          </h2>
          <SlideList @preview="openPreview" />
        </div>
      </aside>

      <!-- Editor (Center) -->
      <main class="flex-1 overflow-y-auto">
        <div class="p-6">
          <SlideEditor @preview="openPreview" />
        </div>
      </main>

      <!-- Preview (Right) -->
      <aside class="w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 overflow-y-auto shrink-0">
        <div class="p-4">
          <h2 class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
            {{ t('common.preview') }}
          </h2>
          <SlidePreview @enlarge="openPreview" />
        </div>
      </aside>
    </div>

    <!-- Preview Modal -->
    <Teleport to="body">
      <div
        v-if="showPreviewModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 dark:bg-black/90 backdrop-blur-sm"
        @click="closePreview"
      >
        <div class="relative max-w-5xl max-h-[90vh] p-2">
          <button
            class="absolute -top-10 right-0 p-2 text-white hover:text-slate-300 transition-colors"
            @click="closePreview"
          >
            <svg
              class="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <img
            :src="previewImageUrl"
            alt="Preview"
            class="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
            @click.stop
          >
        </div>
      </div>
    </Teleport>
  </div>
</template>

