// Project types
export interface Project {
  id: string;
  title: string;
  sourceContent: string;
  styleMode: StyleMode;
  customPrompt: string;
  slideCount: number;
  locale: string;
  createdAt: string;
  updatedAt: string;
  slides: Slide[];
}

export interface Slide {
  id: string;
  projectId: string;
  pageNumber: number;
  title: string;
  content: string;
  imagePrompt: string;
  imageUrl: string | null;
  referenceImageUrl: string | null;
  status: SlideStatus;
  createdAt: string;
}

export type StyleMode = 'concise' | 'detailed' | 'custom';

export type SlideStatus = 'pending' | 'generating' | 'completed' | 'error';

export type InputMode = 'paste' | 'upload' | 'fromUrl';

export interface GenerateOutlineRequest {
  content: string;
  slideCount: number;
  styleMode: StyleMode;
  customPrompt?: string;
  locale: string;
  geminiApiKey?: string;
  serviceMode?: 'cloud' | 'offline';
}

export interface GenerateSlideImageRequest {
  slideId: string;
  prompt: string;
  referenceImageBase64?: string;
  globalStyle: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// i18n
export type Locale = 'zh-CN' | 'zh-TW' | 'en';

