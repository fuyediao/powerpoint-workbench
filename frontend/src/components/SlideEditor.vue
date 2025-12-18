<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useProjectStore } from '../stores/project';

const emit = defineEmits<{
  (e: 'preview', imageUrl: string): void;
}>();

const { t } = useI18n();
const projectStore = useProjectStore();

const localTitle = ref('');
const localContent = ref('');
const localImagePrompt = ref('');

// Sync local state with current slide
watch(
  () => projectStore.currentSlide,
  (slide) => {
    if (slide) {
      localTitle.value = slide.title;
      localContent.value = slide.content;
      localImagePrompt.value = slide.imagePrompt;
    }
  },
  { immediate: true }
);

async function saveChanges() {
  if (!projectStore.currentSlide) return;

  await projectStore.updateSlide(projectStore.currentSlide.id, {
    title: localTitle.value,
    content: localContent.value,
    imagePrompt: localImagePrompt.value,
  });
}

async function handleRegenerate() {
  if (!projectStore.currentSlide) return;
  
  await saveChanges();
  await projectStore.regenerateSlide(projectStore.currentSlide.id);
}

async function handleReferenceUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file || !projectStore.currentSlide) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64 = e.target?.result as string;
    await projectStore.updateSlide(projectStore.currentSlide!.id, {
      referenceImageUrl: base64,
    });
  };
  reader.readAsDataURL(file);
  target.value = '';
}

async function removeReference() {
  if (!projectStore.currentSlide) return;
  await projectStore.updateSlide(projectStore.currentSlide.id, {
    referenceImageUrl: null,
  });
}

function handlePreview(imageUrl: string | null) {
  if (imageUrl) {
    emit('preview', imageUrl);
  }
}
</script>

<template>
  <div
    v-if="projectStore.currentSlide"
    class="space-y-6"
  >
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">
        {{ t('editor.editSlide', { n: projectStore.selectedSlideIndex + 1 }) }}
      </h2>
      <div class="flex items-center gap-3">
        <button
          class="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          @click="saveChanges"
        >
          {{ t('common.save') }}
        </button>
        <button
          :disabled="projectStore.currentSlide.status === 'generating'"
          class="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg
                 flex items-center gap-2 transition-all
                 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="handleRegenerate"
        >
          <svg
            :class="['w-4 h-4', projectStore.currentSlide.status === 'generating' && 'animate-spin']"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {{ projectStore.currentSlide.status === 'generating' ? t('editor.generating') : t('editor.regenerate') }}
        </button>
      </div>
    </div>

    <!-- Editor Grid -->
    <div class="grid grid-cols-2 gap-6">
      <!-- Left Column: Text Content -->
      <div class="space-y-4">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {{ t('editor.slideTitle') }}
          </label>
          <input
            v-model="localTitle"
            type="text"
            class="w-full px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            @blur="saveChanges"
          >
        </div>

        <!-- Content -->
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {{ t('editor.slideContent') }}
          </label>
          <textarea
            v-model="localContent"
            rows="6"
            class="w-full px-4 py-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg resize-none
                   focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            @blur="saveChanges"
          />
        </div>

        <!-- Image Prompt -->
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {{ t('editor.imagePrompt') }}
          </label>
          <textarea
            v-model="localImagePrompt"
            rows="4"
            class="w-full px-4 py-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg resize-none
                   focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            @blur="saveChanges"
          />
        </div>
      </div>

      <!-- Right Column: Reference Image -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {{ t('editor.referenceImage') }}
          </label>
          
          <!-- Reference Image Upload/Display -->
          <div class="aspect-video bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden relative">
            <template v-if="projectStore.currentSlide.referenceImageUrl">
              <img
                :src="projectStore.currentSlide.referenceImageUrl"
                alt="Reference"
                class="w-full h-full object-cover cursor-pointer"
                @click="handlePreview(projectStore.currentSlide?.referenceImageUrl || null)"
              >
              <button
                class="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                @click="removeReference"
              >
                <svg
                  class="w-4 h-4"
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
            </template>
            <template v-else>
              <label class="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleReferenceUpload"
                >
                <svg
                  class="w-10 h-10 text-slate-400 dark:text-slate-500 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span class="text-sm text-slate-500 dark:text-slate-400">{{ t('editor.uploadReference') }}</span>
              </label>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div
    v-else
    class="flex items-center justify-center h-64 text-slate-400 dark:text-slate-500"
  >
    {{ t('editor.noContent') }}
  </div>
</template>

