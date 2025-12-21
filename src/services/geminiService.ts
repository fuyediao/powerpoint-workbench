import { GoogleGenAI, Type } from '@google/genai'
import * as XLSX from 'xlsx'
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
 * Upload file to Gemini Files API
 * 使用 @google/genai SDK 的 files.upload 方法
 */
export const uploadFileToGemini = async (
  apiKey: string,
  file: File
): Promise<string> => {
  const ai = getClient(apiKey)
  
  try {
    // 獲取正確的 MIME type
    const mimeType = getMimeType(file)
    
    // 上傳文件到 Gemini Files API
    // 直接傳遞 File 對象（它是 Blob 的子類），SDK 可以自動獲取 size
    const uploadResult = await ai.files.upload({
      file: file,
      config: {
        mimeType: mimeType,
        displayName: file.name,
      }
    })
    
    // 處理不同的返回值結構
    if (uploadResult.file && uploadResult.file.uri) {
      return uploadResult.file.uri
    } 
    
    // 檢查是否直接包含 uri
    const resultWithUri = uploadResult as unknown as { uri: string }
    if (resultWithUri.uri) {
      return resultWithUri.uri
    }
    
    throw new Error(`Upload failed: unexpected response structure ${JSON.stringify(uploadResult)}`)
  } catch (error) {
    console.error('File upload failed:', error)
    throw error
  }
}

/**
 * Get correct MIME type for file
 */
const getMimeType = (file: File): string => {
  // 如果文件已有 MIME type，使用它
  if (file.type) {
    return file.type
  }
  
  // 根據文件擴展名推斷 MIME type
  const ext = file.name.toLowerCase().split('.').pop()
  const mimeTypes: Record<string, string> = {
    'txt': 'text/plain',
    'md': 'text/markdown',
    'json': 'application/json',
    'csv': 'text/csv',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp'
  }
  
  return mimeTypes[ext || ''] || 'application/octet-stream'
}

/**
 * Convert Excel file to CSV text
 * 使用 xlsx 庫將 Excel 文件轉換為 CSV 格式
 */
const excelToCsv = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // 將所有工作表轉換為 CSV 並合併
        const csvParts: string[] = []
        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName]
          const csv = XLSX.utils.sheet_to_csv(worksheet)
          if (csv.trim()) {
            csvParts.push(`=== Sheet: ${sheetName} ===\n${csv}`)
          }
        }
        
        resolve(csvParts.join('\n\n'))
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Convert File to inline data for smaller files (< 20MB)
 * 對於文本文件，直接讀取文本內容；對於其他文件，轉換為 base64
 */
const fileToInlineData = async (file: File): Promise<{ mimeType: string; data: string } | { text: string }> => {
  const mimeType = getMimeType(file)
  
  // 對於文本文件（txt, md, json, csv 等），直接讀取文本內容
  if (mimeType.startsWith('text/') || 
      file.name.endsWith('.txt') || 
      file.name.endsWith('.md') || 
      file.name.endsWith('.json') ||
      file.name.endsWith('.csv')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const text = reader.result as string
        resolve({ text })
      }
      reader.onerror = reject
      reader.readAsText(file, 'UTF-8')
    })
  }
  
  // 對於其他文件（圖片、PDF、Office 文檔等），轉換為 base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // 移除 data:image/png;base64, 前綴
      const base64Data = result.includes(',') ? result.split(',')[1] : result
      resolve({
        mimeType: mimeType,
        data: base64Data
      })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Uses Gemini 3 Pro (Thinking) to analyze text and split into slide outline
 * Now supports both text and files (images, PDFs, documents, etc.)
 */
export const generateOutline = async (
  apiKey: string,
  textOrFiles: string | File[],
  count: number,
  style: SlideStyle,
  customPrompt?: string
): Promise<SlideData[]> => {
  const ai = getClient(apiKey)

  const systemInstruction = getOutlinePrompt(count, style, customPrompt)

  try {
    let contents: unknown

    // 如果是文件數組，處理文件上傳
    if (Array.isArray(textOrFiles)) {
      const parts: unknown[] = []
      
      for (const file of textOrFiles) {
        try {
          const mimeType = getMimeType(file)
          
          // 判斷文件類型，決定使用 inline data 還是 Files API
          const isTextFile = mimeType.startsWith('text/') || 
                            file.name.endsWith('.txt') || 
                            file.name.endsWith('.md') || 
                            file.name.endsWith('.json') ||
                            file.name.endsWith('.csv')
          
          const isImageFile = mimeType.startsWith('image/')
          
          const isPdfFile = mimeType === 'application/pdf'
          
          const isOfficeFile = mimeType.includes('officedocument') || 
                              mimeType.includes('msword') || 
                              mimeType.includes('ms-excel') || 
                              mimeType.includes('ms-powerpoint')
          
          // 文本文件：直接讀取文本內容
          if (isTextFile) {
            const fileData = await fileToInlineData(file)
            if ('text' in fileData) {
              parts.push({
                text: fileData.text
              })
            }
          }
          // 圖片和 PDF：使用 inline data（小文件）或 Files API（大文件）
          else if (isImageFile || isPdfFile) {
            if (file.size < 20 * 1024 * 1024) {
              // 小文件：使用 inline data
              const fileData = await fileToInlineData(file)
              if ('mimeType' in fileData) {
                parts.push({
                  inlineData: fileData
                })
              }
            } else {
              // 大文件：使用 Files API
              const fileUri = await uploadFileToGemini(apiKey, file)
              parts.push({
                fileData: {
                  mimeType: mimeType,
                  fileUri: fileUri
                }
              })
            }
          }
          // Office 文件處理
          else if (isOfficeFile) {
            const ext = file.name.split('.').pop()?.toLowerCase()
            
            // Excel 文件：自動轉換為 CSV
            if (ext === 'xlsx' || ext === 'xls') {
              const csvContent = await excelToCsv(file)
              parts.push({
                text: `[Excel 文件: ${file.name}]\n${csvContent}`
              })
            }
            // Word 和 PPT：提示用戶轉換為 PDF
            else {
              let suggestion = '請先將文件轉換為 PDF 格式後再上傳'
              if (ext === 'pptx' || ext === 'ppt') {
                suggestion = '請先將 PowerPoint 轉換為 PDF 格式後再上傳'
              } else if (ext === 'docx' || ext === 'doc') {
                suggestion = '請先將 Word 轉換為 PDF 格式後再上傳（這樣可以保留圖片）'
              }
              throw new Error(`不支持 ${ext?.toUpperCase()} 格式。${suggestion}`)
            }
          }
          // 其他未知類型：嘗試使用 Files API
          else {
            const fileUri = await uploadFileToGemini(apiKey, file)
            parts.push({
              fileData: {
                mimeType: mimeType,
                fileUri: fileUri
              }
            })
          }
        } catch (fileError) {
          console.error(`Failed to process file ${file.name}:`, fileError)
          // 繼續處理其他文件，不中斷整個流程
        }
      }
      
      if (parts.length === 0) {
        throw new Error('No files were successfully processed')
      }
      
      // 添加提示文本
      parts.push({
        text: '\n\n請分析以上文件內容，並根據要求生成幻燈片大綱。'
      })
      
      // 使用正確的格式：contents 應該是包含 parts 的對象
      contents = { parts }
    } else {
      // 純文本輸入
      contents = textOrFiles
    }

    // 構建請求參數
    const requestParams: {
      model: string
      contents: unknown
      config: {
        systemInstruction: string
        thinkingConfig: { thinkingBudget: number }
        responseMimeType: string
        responseSchema: {
          type: Type
          items: {
            type: Type
            properties: {
              title: { type: Type }
              contentPoints: { type: Type; items: { type: Type } }
              speakerNotes: { type: Type }
              visualPrompt: { type: Type }
            }
            required: string[]
          }
        }
      }
    } = {
      model: 'gemini-3-pro-preview',
      contents: contents,
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
    }

    const response = await ai.models.generateContent(requestParams)

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
