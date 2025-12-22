import { contextBridge, ipcRenderer } from 'electron'

// 暴露受保護的方法，允許渲染進程使用
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },
  // 數據庫 API
  db: {
    saveConfig: (key: string, value: string) => ipcRenderer.invoke('db:save-config', key, value),
    getConfig: (key: string) => ipcRenderer.invoke('db:get-config', key),
    deleteConfig: (key: string) => ipcRenderer.invoke('db:delete-config', key),
    getAllConfig: () => ipcRenderer.invoke('db:get-all-config')
  }
})

// 聲明全局類型，以便在渲染進程中使用
declare global {
  interface Window {
    electronAPI: {
      platform: string
      versions: {
        node: string
        chrome: string
        electron: string
      }
    }
  }
}

