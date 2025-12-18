<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useProjectStore } from '../stores/project';
import { apiService } from '../services/api';

const { t } = useI18n();
const projectStore = useProjectStore();

const isDragging = ref(false);
const uploadError = ref<string | null>(null);

interface UrlInputItem {
  id: string;
  url: string;
  isFetching: boolean;
}

const urlInputs = ref<UrlInputItem[]>([
  { id: '1', url: '', isFetching: false },
]);


function handleTextInput(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  projectStore.setInputContent(target.value);
}

function appendContent(newContent: string) {
  const current = projectStore.inputContent;
  if (current) {
    projectStore.setInputContent(current + '\n\n' + newContent);
  } else {
    projectStore.setInputContent(newContent);
  }
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    await processFile(file);
  }
  target.value = '';
}

async function handleDrop(event: DragEvent) {
  event.preventDefault();
  isDragging.value = false;
  
  const file = event.dataTransfer?.files[0];
  if (file) {
    await processFile(file);
  }
}

async function processFile(file: File) {
  uploadError.value = null;
  
  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    uploadError.value = t('errors.fileTooLarge');
    return;
  }

  // Check if it's an image file
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  
  if (imageTypes.includes(file.type) || imageExtensions.includes(fileExtension)) {
    // Handle image files - send to backend for OCR or image description
    uploadError.value = null;
    try {
      // For now, we'll show a message that image support is coming
      // In the future, this could be sent to backend for OCR or image description
      uploadError.value = t('input.imageDropzone') + ' - ' + t('common.loading');
      // TODO: Implement image processing via backend API
      // const response = await apiService.processImage(file);
      // if (response.success && response.data) {
      //   projectStore.setInputContent(response.data.content);
      // }
    } catch {
      uploadError.value = t('errors.uploadFailed');
    }
    return;
  }

  // Check file type for documents
  const validTypes = [
    'text/plain',
    'text/markdown',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
  ];
  const validExtensions = ['.txt', '.md', '.pdf', '.docx', '.xlsx', '.xls', '.csv'];
  
  if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
    uploadError.value = t('errors.invalidFormat');
    return;
  }

  // For txt and md files, read directly
  if (file.type === 'text/plain' || fileExtension === '.txt' || fileExtension === '.md') {
    const text = await file.text();
    appendContent(text);
    return;
  }

  // For other files, send to backend for parsing
  const response = await apiService.parseDocument(file);
  if (response.success && response.data) {
    appendContent(response.data.content);
  } else {
    uploadError.value = response.error || t('errors.parseFailed');
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault();
  isDragging.value = true;
}

function handleDragLeave() {
  isDragging.value = false;
}

function addUrlInput() {
  if (urlInputs.value.length >= 10) {
    return;
  }
  const newId = String(Date.now());
  urlInputs.value.push({ id: newId, url: '', isFetching: false });
}

function removeUrlInput(id: string) {
  if (urlInputs.value.length > 1) {
    urlInputs.value = urlInputs.value.filter(item => item.id !== id);
  }
}

async function handleFetchUrl(item: UrlInputItem) {
  if (!item.url.trim()) {
    uploadError.value = t('input.urlError');
    return;
  }

  item.isFetching = true;
  uploadError.value = null;

  try {
    // Try to fetch content from URL
    // For now, we'll use a simple fetch - in production, this should go through backend
    const response = await fetch(item.url);
    if (!response.ok) {
      throw new Error('Failed to fetch');
    }
    const html = await response.text();
    
    // Simple HTML to text conversion (in production, use a proper HTML parser)
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const text = doc.body.innerText || doc.body.textContent || '';
    
    appendContent(text.trim());
    item.url = '';
  } catch {
    uploadError.value = t('input.urlError');
  } finally {
    item.isFetching = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Paste Text Area -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {{ t('input.pasteText') }}
        </label>
        <button
          v-if="projectStore.inputContent"
          class="text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
          @click="projectStore.setInputContent('')"
        >
          {{ t('common.clear') }}
        </button>
      </div>
      <textarea
        :value="projectStore.inputContent"
        :placeholder="t('input.placeholder')"
        class="w-full h-32 p-4 text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl
                 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                 placeholder:text-slate-400 dark:placeholder:text-slate-500"
        @input="handleTextInput"
      />
    </div>

    <!-- From URL Area -->
    <div>
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {{ t('input.fromUrl') }}
      </label>
      <div class="space-y-2">
        <div
          v-for="item in urlInputs"
          :key="item.id"
          class="flex gap-2"
        >
          <input
            v-model="item.url"
            type="url"
            :placeholder="t('input.urlPlaceholder')"
            class="flex-1 px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg
                   border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                   placeholder:text-slate-400 dark:placeholder:text-slate-500"
            @keyup.enter="handleFetchUrl(item)"
          >
          <button
            :disabled="item.isFetching || !item.url.trim()"
            class="px-4 py-2.5 bg-blue-500 text-white font-medium rounded-lg
                   hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                   flex items-center justify-center"
            :title="t('input.fetchUrl')"
            @click="handleFetchUrl(item)"
          >
            <svg
              v-if="item.isFetching"
              class="w-4 h-4 animate-spin"
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
            <svg
              v-else
              class="w-4 h-4"
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
          </button>
          <button
            v-if="urlInputs.length > 1"
            class="px-3 py-2.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors
                   flex items-center justify-center"
            :title="t('common.delete')"
            @click="removeUrlInput(item.id)"
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
        </div>
        <button
          v-if="urlInputs.length < 10"
          class="w-full px-4 py-2.5 border-2 border-dashed border-slate-300 dark:border-slate-600 
                 text-slate-500 dark:text-slate-400 rounded-lg hover:border-blue-400 dark:hover:border-blue-500
                 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
          @click="addUrlInput"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span class="text-sm">{{ t('input.addUrl') }}</span>
        </button>
      </div>
    </div>

    <!-- File Upload Area -->
    <div>
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {{ t('input.uploadFile') }}
      </label>
      <label
        :class="[
          'block w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors',
          'flex flex-col items-center justify-center gap-2',
          isDragging
            ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
        ]"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      >
        <input
          type="file"
          accept=".txt,.md,.pdf,.docx,.xlsx,.xls,.csv,.jpg,.jpeg,.png,.gif,.webp"
          class="hidden"
          @change="handleFileSelect"
        >
        <svg
          class="w-8 h-8 text-slate-400 dark:text-slate-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <span class="text-xs text-slate-500 dark:text-slate-400">{{ t('input.dropzone') }}</span>
        <span class="text-xs text-slate-400 dark:text-slate-500">{{ t('input.supportedFormats') }}</span>
      </label>
    </div>

    <!-- Error Message -->
    <div
      v-if="uploadError"
      class="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400"
    >
      {{ uploadError }}
    </div>
  </div>
</template>

