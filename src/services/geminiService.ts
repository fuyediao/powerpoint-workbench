import { GoogleGenAI, Type } from '@google/genai'
import { type SlideData, SlideStyle, SlideStatus } from '@/types'
import { getOutlinePrompt, getResearchPrompt, IMAGE_GENERATION_CONFIG, VIDEO_GENERATION_CONFIG } from '@/prompts'

// Helper to get client
const getClient = (apiKey: string) => {
  return new GoogleGenAI({ apiKey })
}

export const checkVeoKey = async () => {
  if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
    const hasKey = await window.aistudio.hasSelectedApiKey()
    if (!hasKey && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey()
    }
  }
}

interface ParsedSlideItem {
  title: string
  contentPoints: string[]
  speakerNotes?: string
  visualPrompt: string
}

/**
 * Uses Gemini 3 Pro (Thinking) to analyze text and split into slide outline
 */
export const generateOutline = async (
  apiKey: string,
  text: string,
  count: number,
  style: SlideStyle,
  customPrompt?: string
): Promise<SlideData[]> => {
  const ai = getClient(apiKey)

  const systemInstruction = getOutlinePrompt(count, style, customPrompt)

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: text,
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 32768 }, // Max thinking for Pro
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              contentPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              speakerNotes: { type: Type.STRING },
              visualPrompt: { type: Type.STRING },
            },
            required: ['title', 'contentPoints', 'visualPrompt'],
          },
        },
      },
    })

    if (response.text) {
      const parsed = JSON.parse(response.text) as ParsedSlideItem[]
      return parsed.map((item: ParsedSlideItem, index: number) => ({
        id: crypto.randomUUID(),
        order: index + 1,
        title: item.title,
        contentPoints: item.contentPoints,
        speakerNotes: item.speakerNotes || '',
        visualPrompt: item.visualPrompt,
        status: SlideStatus.PENDING
      }))
    }
    throw new Error('No JSON response from Gemini')
  } catch (error) {
    console.error('Outline generation failed:', error)
    throw error
  }
}

/**
 * Uses Gemini 3 Pro Image Preview (Nano Banana Pro) to generate slide visual
 */
export const generateSlideImage = async (
  apiKey: string,
  prompt: string,
  resolution: '1K' | '2K' | '4K' = '1K'
): Promise<string> => {
  const ai = getClient(apiKey)

  try {
    // Using generateContent for Nano Banana models as per guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: IMAGE_GENERATION_CONFIG.aspectRatio,
          imageSize: resolution,
        },
      },
    })

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
      }
    }
    throw new Error('No image data returned')
  } catch (error) {
    console.error('Image generation failed:', error)
    throw error
  }
}

/**
 * Uses Gemini 3 Pro Image Preview (Nano Banana Pro) to generate complete slide image
 * 生成包含標題、內容點等所有元素的整頁幻燈片圖片
 */
export const generateFullSlideImage = async (
  apiKey: string,
  slide: SlideData,
  customStylePrompt?: string,
  resolution: '1K' | '2K' | '4K' = '2K'
): Promise<string> => {
  const ai = getClient(apiKey)

  // 構建完整的 prompt，包含標題和內容點
  const contentText = slide.contentPoints.map((point, index) => `${index + 1}. ${point}`).join('\n')
  const fullPrompt = `Create a professional presentation slide image (16:9 aspect ratio) with the following content:

Title: "${slide.title}"

Content Points:
${contentText}

Visual Style: ${slide.visualPrompt}
${customStylePrompt ? `Additional Style Requirements: ${customStylePrompt}` : ''}

Requirements:
- The slide should be a complete, ready-to-use presentation slide
- Include the title text prominently at the top
- Include all content points clearly visible
- Use a professional, modern design style
- Ensure good contrast and readability
- The layout should be balanced and visually appealing
- Background should complement the content without overwhelming it
- Use appropriate typography and spacing
- The image should look like a finished PowerPoint slide with all text and visual elements integrated

Generate a high-quality presentation slide image that includes all the text content and visual elements in a cohesive design.`

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: IMAGE_GENERATION_CONFIG.aspectRatio,
          imageSize: resolution,
        },
      },
    })

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
      }
    }
    throw new Error('No image data returned')
  } catch (error) {
    console.error('Full slide image generation failed:', error)
    throw error
  }
}

/**
 * Uses Veo for video generation
 */
export const generateVeoVideo = async (
  apiKey: string,
  prompt: string
): Promise<string> => {
  // Ensure Key Selection for Veo
  await checkVeoKey()

  // Create new instance after key check to ensure validity
  const safeAi = new GoogleGenAI({ apiKey })

  try {
    let operation = await safeAi.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: VIDEO_GENERATION_CONFIG.numberOfVideos,
        resolution: VIDEO_GENERATION_CONFIG.resolution,
        aspectRatio: VIDEO_GENERATION_CONFIG.aspectRatio
      }
    })

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000))
      operation = await safeAi.operations.getVideosOperation({ operation })
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri
    if (!videoUri) {
      throw new Error('No video URI returned')
    }

    // In a real app, you might need to fetch the blob if the URI isn't publicly accessible directly
    // but the guide implies fetching with key.
    return `${videoUri}&key=${apiKey}`

  } catch (error) {
    console.error('Veo generation failed:', error)
    throw error
  }
}

/**
 * Search Grounding for enriching content (Supplementary)
 */
export const researchTopic = async (apiKey: string, topic: string) => {
  const ai = getClient(apiKey)
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: getResearchPrompt(topic),
    config: {
      tools: [{ googleSearch: {} }]
    }
  })
  return response.text
}
