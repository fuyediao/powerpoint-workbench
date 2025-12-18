/**
 * Ollama API 服務
 */

export interface OllamaModel {
  name: string
  model: string
  size: number
  digest: string
  modified_at: string
}

/**
 * 檢測 Ollama 服務是否可用
 */
export async function checkOllamaConnection(endpoint: string): Promise<boolean> {
  try {
    const response = await fetch(`${endpoint}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * 獲取 Ollama 可用模型列表
 */
export async function getOllamaModels(endpoint: string): Promise<OllamaModel[]> {
  try {
    const response = await fetch(`${endpoint}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.models || []
  } catch (error) {
    console.error('Failed to fetch Ollama models:', error)
    throw error
  }
}

/**
 * ComfyUI API 服務
 */

export interface ComfyUIWorkflow {
  id: string
  name: string
  category?: string
}

/**
 * 檢測 ComfyUI 服務是否可用
 */
export async function checkComfyUIConnection(endpoint: string): Promise<boolean> {
  try {
    const response = await fetch(`${endpoint}/system_stats`, {
      method: 'GET'
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * 獲取 ComfyUI 工作流列表
 * 注意：ComfyUI 的工作流通常存儲在文件系統中，需要通過自定義 API 或文件系統訪問
 * 這裡提供一個基礎實現，實際可能需要根據您的 ComfyUI 配置調整
 */
export async function getComfyUIWorkflows(endpoint: string): Promise<ComfyUIWorkflow[]> {
  try {
    // ComfyUI 的工作流通常需要通過自定義端點獲取
    // 這裡嘗試獲取工作流列表（如果您的 ComfyUI 有相關 API）
    const response = await fetch(`${endpoint}/workflows`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      // 如果端點不存在，返回空數組
      if (response.status === 404) {
        return []
      }
      throw new Error(`ComfyUI API error: ${response.statusText}`)
    }

    const data = await response.json()
    // 根據實際 API 響應格式調整
    return Array.isArray(data) ? data : data.workflows || []
  } catch (error) {
    console.error('Failed to fetch ComfyUI workflows:', error)
    // 返回空數組而不是拋出錯誤，因為工作流 API 可能不存在
    return []
  }
}

/**
 * 獲取 ComfyUI 工作流文件列表（從文件系統）
 * 這需要 ComfyUI 服務器支持文件列表 API
 */
export async function getComfyUIWorkflowFiles(endpoint: string): Promise<string[]> {
  try {
    // 嘗試從 ComfyUI 的對象信息 API 獲取工作流
    const response = await fetch(`${endpoint}/object_info`, {
      method: 'GET'
    })

    if (!response.ok) {
      return []
    }

    // ComfyUI 的工作流通常存儲在 workflows 目錄
    // 這裡返回一個提示，實際實現需要根據您的 ComfyUI 配置
    return []
  } catch {
    return []
  }
}

