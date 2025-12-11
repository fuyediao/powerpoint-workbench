import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Project, Slide, StyleMode, InputMode, SlideStatus } from '../types';
import { apiService } from '../services/api';
import { useSettingsStore } from './settings';

export const useProjectStore = defineStore('project', () => {
  // State
  const currentProject = ref<Project | null>(null);
  const inputMode = ref<InputMode>('paste');
  const inputContent = ref('');
  const slideCount = ref(10);
  const styleMode = ref<StyleMode>('concise');
  const customPrompt = ref('');
  const isGenerating = ref(false);
  const selectedSlideIndex = ref(0);
  const error = ref<string | null>(null);

  // Getters
  const hasContent = computed(() => inputContent.value.trim().length > 0);
  const slides = computed(() => currentProject.value?.slides || []);
  const currentSlide = computed(() => slides.value[selectedSlideIndex.value] || null);
  const allSlidesCompleted = computed(() => 
    slides.value.length > 0 && slides.value.every(s => s.status === 'completed')
  );

  // Actions
  function setInputMode(mode: InputMode) {
    inputMode.value = mode;
  }

  function setInputContent(content: string) {
    inputContent.value = content;
  }

  function setSlideCount(count: number) {
    slideCount.value = Math.min(30, Math.max(1, count));
  }

  function setStyleMode(mode: StyleMode) {
    styleMode.value = mode;
  }

  function setCustomPrompt(prompt: string) {
    customPrompt.value = prompt;
  }

  function selectSlide(index: number) {
    if (index >= 0 && index < slides.value.length) {
      selectedSlideIndex.value = index;
    }
  }

  async function generateOutline(locale: string) {
    if (!hasContent.value) return;

    isGenerating.value = true;
    error.value = null;

    try {
      const settingsStore = useSettingsStore();
      const response = await apiService.generateOutline({
        content: inputContent.value,
        slideCount: slideCount.value,
        styleMode: styleMode.value,
        customPrompt: customPrompt.value || undefined,
        locale,
        geminiApiKey: settingsStore.serviceMode === 'cloud' ? settingsStore.geminiApiKey : undefined,
        serviceMode: settingsStore.serviceMode,
      });

      if (response.success && response.data) {
        currentProject.value = response.data;
        selectedSlideIndex.value = 0;
      } else {
        error.value = response.error || 'Failed to generate outline';
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      isGenerating.value = false;
    }
  }

  async function updateSlide(slideId: string, updates: Partial<Slide>) {
    if (!currentProject.value) return;

    const slideIndex = currentProject.value.slides.findIndex(s => s.id === slideId);
    if (slideIndex === -1) return;

    // Update locally first
    const existingSlide = currentProject.value.slides[slideIndex];
    if (existingSlide) {
      Object.assign(existingSlide, updates);
    }

    // Sync with backend
    try {
      await apiService.updateSlide(slideId, updates);
    } catch (err) {
      console.error('Failed to sync slide update:', err);
    }
  }

  async function regenerateSlide(slideId: string) {
    if (!currentProject.value) return;

    const slide = currentProject.value.slides.find(s => s.id === slideId);
    if (!slide) return;

    await updateSlide(slideId, { status: 'generating' as SlideStatus });

    try {
      const globalStyle = styleMode.value === 'custom' 
        ? customPrompt.value 
        : styleMode.value;

      const response = await apiService.generateSlideImage({
        slideId,
        prompt: slide.imagePrompt,
        referenceImageBase64: slide.referenceImageUrl || undefined,
        globalStyle,
      });

      if (response.success && response.data) {
        await updateSlide(slideId, {
          imageUrl: response.data.imageUrl,
          status: 'completed' as SlideStatus,
        });
      } else {
        await updateSlide(slideId, { status: 'error' as SlideStatus });
      }
    } catch {
      await updateSlide(slideId, { status: 'error' as SlideStatus });
    }
  }

  async function generateAllSlides() {
    if (!currentProject.value) return;

    for (const slide of currentProject.value.slides) {
      if (slide.status !== 'completed') {
        await regenerateSlide(slide.id);
      }
    }
  }

  function reset() {
    currentProject.value = null;
    inputContent.value = '';
    slideCount.value = 10;
    styleMode.value = 'concise';
    customPrompt.value = '';
    selectedSlideIndex.value = 0;
    error.value = null;
  }

  return {
    // State
    currentProject,
    inputMode,
    inputContent,
    slideCount,
    styleMode,
    customPrompt,
    isGenerating,
    selectedSlideIndex,
    error,
    // Getters
    hasContent,
    slides,
    currentSlide,
    allSlidesCompleted,
    // Actions
    setInputMode,
    setInputContent,
    setSlideCount,
    setStyleMode,
    setCustomPrompt,
    selectSlide,
    generateOutline,
    updateSlide,
    regenerateSlide,
    generateAllSlides,
    reset,
  };
});

