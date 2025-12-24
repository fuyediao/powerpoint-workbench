/**
 * 數據庫服務（僅在 Electron 環境中可用）
 * 用於保存和讀取用戶配置，如 API Key
 */

// 檢查是否在 Electron 環境中
const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined

/**
 * 保存配置到數據庫
 */
export async function saveConfigToDatabase(key: string, value: string): Promise<boolean> {
  if (!isElectron || !window.electronAPI?.db) {
    console.warn('Database API not available. Running in web mode?')
    // 在 Web 模式下，使用 localStorage 作為後備
    try {
      localStorage.setItem(`config_${key}`, value)
      return true
    } catch {
      return false
    }
  }

  try {
    const result = await window.electronAPI.db.saveConfig(key, value)
    return result.success
  } catch (error) {
    console.error('Failed to save config to database:', error)
    return false
  }
}

/**
 * 從數據庫讀取配置
 */
export async function getConfigFromDatabase(key: string): Promise<string | null> {
  if (!isElectron || !window.electronAPI?.db) {
    console.warn('Database API not available. Running in web mode?')
    // 在 Web 模式下，使用 localStorage 作為後備
    try {
      return localStorage.getItem(`config_${key}`)
    } catch {
      return null
    }
  }

  try {
    const result = await window.electronAPI.db.getConfig(key)
    if (result.success) {
      return result.value
    }
    return null
  } catch (error) {
    console.error('Failed to get config from database:', error)
    return null
  }
}

/**
 * 從數據庫刪除配置
 */
export async function deleteConfigFromDatabase(key: string): Promise<boolean> {
  if (!isElectron || !window.electronAPI?.db) {
    console.warn('Database API not available. Running in web mode?')
    // 在 Web 模式下，使用 localStorage 作為後備
    try {
      localStorage.removeItem(`config_${key}`)
      return true
    } catch {
      return false
    }
  }

  try {
    const result = await window.electronAPI.db.deleteConfig(key)
    return result.success
  } catch (error) {
    console.error('Failed to delete config from database:', error)
    return false
  }
}

/**
 * 從數據庫獲取所有配置
 */
export async function getAllConfigFromDatabase(): Promise<Record<string, string>> {
  if (!isElectron || !window.electronAPI?.db) {
    console.warn('Database API not available. Running in web mode?')
    // 在 Web 模式下，使用 localStorage 作為後備
    const config: Record<string, string> = {}
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('config_')) {
          const configKey = key.replace('config_', '')
          const value = localStorage.getItem(key)
          if (value) {
            config[configKey] = value
          }
        }
      }
    } catch {
      // 忽略錯誤
    }
    return config
  }

  try {
    const result = await window.electronAPI.db.getAllConfig()
    if (result.success) {
      return result.config
    }
    return {}
  } catch (error) {
    console.error('Failed to get all config from database:', error)
    return {}
  }
}

// 配置鍵名常量
export const CONFIG_KEYS = {
  API_KEY: 'apiKey',
  PROXY_ENDPOINT: 'proxyEndpoint',
  USE_PROXY: 'useProxy',
  LOCAL_ENDPOINT: 'localEndpoint',
  COMFY_ENDPOINT: 'comfyEndpoint',
  OLLAMA_MODEL: 'ollamaModel',
  COMFY_WORKFLOW: 'comfyWorkflow',
} as const

