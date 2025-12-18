import { SlideStyle } from '@/types'

/**
 * 生成簡報大綱的系統提示詞
 */
export const getOutlinePrompt = (
  slideCount: number,
  style: SlideStyle,
  customPrompt?: string
): string => {
  return `You are a professional presentation designer. 
  Analyze the provided user content and split it into exactly ${slideCount} slides.
  Style: ${style === SlideStyle.CONCISE ? 'Minimal text, bullet points, highly visual' : 'Detailed explanatory text, comprehensive'}.
  ${customPrompt ? `Additional design requirements: ${customPrompt}` : ''}
  
  Return a JSON array where each object has:
  - title: Slide headline
  - contentPoints: Array of strings (main bullet points)
  - speakerNotes: Script for the speaker
  - visualPrompt: A detailed stable-diffusion style image generation prompt to create the background/visual for this slide. DO NOT include text in the image prompt instructions unless it's for a sign or label.
  `
}

/**
 * 研究主題的提示詞
 */
export const getResearchPrompt = (topic: string): string => {
  return `Find 3 key facts about: ${topic}`
}

/**
 * 圖片生成的提示詞模板
 * 注意：實際的圖片生成提示詞來自於每個 slide 的 visualPrompt 字段
 */
export const IMAGE_GENERATION_CONFIG = {
  aspectRatio: '16:9' as const,
  defaultResolution: '1K' as const,
  highQualityResolution: '2K' as const,
  ultraQualityResolution: '4K' as const,
}

/**
 * 視頻生成的提示詞模板
 * 注意：實際的視頻生成提示詞由用戶在編輯器中輸入
 */
export const VIDEO_GENERATION_CONFIG = {
  resolution: '1080p' as const,
  aspectRatio: '16:9' as const,
  numberOfVideos: 1 as const,
}
