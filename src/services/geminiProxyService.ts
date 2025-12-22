/**
 * 通過 Cloudflare Worker 代理調用 Gemini API
 * 用於繞過地區限制
 */

import { type SlideData, SlideStyle, SlideStatus } from '@/types'
import { getOutlinePrompt, IMAGE_GENERATION_CONFIG } from '@/prompts'
import * as XLSX from 'xlsx'

interface ProxyConfig {
  proxyEndpoint: string
  apiKey: string
}

/**
 * 通過代理發送請求到 Gemini API
 */
async function proxyRequest(
  config: ProxyConfig,
  path: string,
  method: string = 'POST',
  body?: unknown
): Promise<Response> {
  // 確保 proxyEndpoint 以 / 結尾，path 以 / 開頭
  const baseUrl = config.proxyEndpoint.endsWith('/') 
    ? config.proxyEndpoint.slice(0, -1) 
    : config.proxyEndpoint
  const apiPath = path.startsWith('/') ? path : `/${path}`
  const url = `${baseUrl}${apiPath}`
  
  console.log('Proxy request:', { url, method, hasBody: !!body })
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': config.apiKey,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorData: { error?: { message?: string; code?: number } } = {}
    try {
      errorData = JSON.parse(errorText)
    } catch {
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`)
    }
    throw new Error(errorData.error?.message || `API Error: ${response.status}`)
  }

  return response
}

/**
 * 獲取文件的 MIME 類型
 */
function getMimeType(file: File): string {
  if (file.type) {
    return file.type
  }
  
  const ext = file.name.toLowerCase().split('.').pop()
  const mimeTypes: Record<string, string> = {
    'txt': 'text/plain',
    'md': 'text/markdown',
    'json': 'application/json',
    'csv': 'text/csv',
    'pdf': 'application/pdf',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp'
  }
  
  return mimeTypes[ext || ''] || 'application/octet-stream'
}

/**
 * 將文件轉換為 inline data
 */
async function fileToInlineData(file: File): Promise<{ mimeType: string; data: string } | { text: string }> {
  const mimeType = getMimeType(file)
  
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
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
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
 * Excel 轉 CSV
 */
async function excelToCsv(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
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

interface ParsedSlideItem {
  title: string
  contentPoints: string[]
  speakerNotes?: string
  visualPrompt: string
}

/**
 * 通過代理生成投影片大綱
 */
export async function generateOutlineWithProxy(
  proxyEndpoint: string,
  apiKey: string,
  textOrFiles: string | File[],
  count: number,
  style: SlideStyle,
  customPrompt?: string
): Promise<SlideData[]> {
  const config: ProxyConfig = { proxyEndpoint, apiKey }
  const systemInstruction = getOutlinePrompt(count, style, customPrompt)

  try {
    let contents: unknown

    // 處理文件或文本
    if (Array.isArray(textOrFiles)) {
      const parts: unknown[] = []
      
      for (const file of textOrFiles) {
        try {
          const mimeType = getMimeType(file)
          
          const isTextFile = mimeType.startsWith('text/') || 
                            file.name.endsWith('.txt') || 
                            file.name.endsWith('.md') || 
                            file.name.endsWith('.json') ||
                            file.name.endsWith('.csv')
          
          const isImageFile = mimeType.startsWith('image/')
          const isPdfFile = mimeType === 'application/pdf'
          const isOfficeFile = mimeType.includes('officedocument') || 
                              mimeType.includes('msword') || 
                              mimeType.includes('ms-excel')
          
          if (isTextFile) {
            const fileData = await fileToInlineData(file)
            if ('text' in fileData) {
              parts.push({ text: fileData.text })
            }
          } else if (isImageFile || isPdfFile) {
            if (file.size < 20 * 1024 * 1024) {
              const fileData = await fileToInlineData(file)
              if ('mimeType' in fileData) {
                parts.push({ inlineData: fileData })
              }
            } else {
              throw new Error('Large files (>20MB) are not supported via proxy. Please use direct API or compress the file.')
            }
          } else if (isOfficeFile) {
            const ext = file.name.split('.').pop()?.toLowerCase()
            if (ext === 'xlsx' || ext === 'xls') {
              const csvContent = await excelToCsv(file)
              parts.push({
                text: `[Excel 文件: ${file.name}]\n${csvContent}`
              })
            } else {
              throw new Error(`不支持 ${ext?.toUpperCase()} 格式。請先轉換為 PDF 格式。`)
            }
          }
        } catch (fileError) {
          console.error(`Failed to process file ${file.name}:`, fileError)
        }
      }
      
      if (parts.length === 0) {
        throw new Error('No files were successfully processed')
      }
      
      parts.push({
        text: '\n\n請分析以上文件內容，並根據要求生成幻燈片大綱。'
      })
      
      contents = { parts }
    } else {
      contents = textOrFiles
    }

    // 構建請求體
    const requestBody = {
      contents: contents,
      systemInstruction: systemInstruction,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              title: { type: 'STRING' },
              contentPoints: { type: 'ARRAY', items: { type: 'STRING' } },
              speakerNotes: { type: 'STRING' },
              visualPrompt: { type: 'STRING' },
            },
            required: ['title', 'contentPoints', 'visualPrompt'],
          },
        },
      },
    }

    // 通過代理發送請求
    // Cloudflare Worker 會自動轉發路徑到 Gemini API
    const response = await proxyRequest(
      config,
      '/v1beta/models/gemini-3-pro-preview:generateContent',
      'POST',
      requestBody
    )

    const responseData = await response.json()
    
    // 解析響應
    if (responseData.candidates?.[0]?.content?.parts?.[0]?.text) {
      const text = responseData.candidates[0].content.parts[0].text
      const parsed = JSON.parse(text) as ParsedSlideItem[]
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
    console.error('Outline generation failed (proxy):', error)
    throw error
  }
}

/**
 * 通過代理生成圖片
 */
export async function generateFullSlideImageWithProxy(
  proxyEndpoint: string,
  apiKey: string,
  slide: SlideData,
  customStylePrompt?: string,
  resolution: '1K' | '2K' | '4K' = '2K'
): Promise<string> {
  const config: ProxyConfig = { proxyEndpoint, apiKey }

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
    const requestBody = {
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: IMAGE_GENERATION_CONFIG.aspectRatio,
          imageSize: resolution,
        },
      },
    }

    const response = await proxyRequest(
      config,
      '/v1beta/models/gemini-3-pro-image-preview:generateContent',
      'POST',
      requestBody
    )

    const responseData = await response.json()

    // 提取圖片
    for (const part of responseData.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
      }
    }
    
    throw new Error('No image data returned')
  } catch (error) {
    console.error('Full slide image generation failed (proxy):', error)
    throw error
  }
}

