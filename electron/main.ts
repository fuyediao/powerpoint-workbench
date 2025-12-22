import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { saveConfig, getConfig, deleteConfig, getAllConfig, closeDatabase } from './database'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite 插件的限制
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'] || process.env.VITE_DEV_SERVER_URL
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const PRELOAD_JS = path.join(MAIN_DIST, 'preload.js')
export const MAIN_JS = path.join(MAIN_DIST, 'main.js')

process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL 
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let win: BrowserWindow | null = null

const createWindow = (): void => {
  // 判斷是否為開發模式
  const isDev = !!VITE_DEV_SERVER_URL
  
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      preload: PRELOAD_JS,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      devTools: isDev // 開發模式下啟用，生產模式下禁用
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    autoHideMenuBar: true, // 自動隱藏菜單欄
    show: false
  })

  // 隱藏菜單欄
  win.setMenuBarVisibility(false)

  // 攔截鍵盤事件，禁用 Alt 鍵和 Ctrl+Shift+I（僅在生產模式下）
  if (!isDev) {
    win.webContents.on('before-input-event', (event, input) => {
      // 禁用 Alt 鍵
      if (input.key === 'Alt' || input.key === 'AltLeft' || input.key === 'AltRight') {
        event.preventDefault()
        return
      }
      
      // 禁用 Ctrl+Shift+I (開發者工具)
      if (input.control && input.shift && input.key.toLowerCase() === 'i') {
        event.preventDefault()
        return
      }
      
      // 禁用 F12 (開發者工具)
      if (input.key === 'F12') {
        event.preventDefault()
        return
      }
    })
  }

  // 窗口準備好後顯示，避免白屏
  win.once('ready-to-show', () => {
    win?.show()
  })

  // 測試程序化 API
  // win.webContents.openDevTools()

  if (VITE_DEV_SERVER_URL) {
    // 開發模式：連接到 Vite 開發服務器
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // 生產模式：加載打包後的 HTML 文件
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  win.on('closed', () => {
    win = null
  })
}

// 當所有窗口關閉時退出應用（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // 在 macOS 上，當單擊停靠欄圖標且沒有其他窗口打開時，
  // 通常在應用程序中重新創建一個窗口
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// 應用準備就緒時創建窗口
app.whenReady().then(() => {
  createWindow()
})

// 應用退出時關閉數據庫
app.on('will-quit', () => {
  closeDatabase()
})

// IPC 處理器：保存配置
ipcMain.handle('db:save-config', async (_event, key: string, value: string) => {
  try {
    await saveConfig(key, value)
    return { success: true }
  } catch (error) {
    console.error('Failed to save config:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

// IPC 處理器：獲取配置
ipcMain.handle('db:get-config', async (_event, key: string) => {
  try {
    const value = await getConfig(key)
    return { success: true, value }
  } catch (error) {
    console.error('Failed to get config:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

// IPC 處理器：刪除配置
ipcMain.handle('db:delete-config', async (_event, key: string) => {
  try {
    await deleteConfig(key)
    return { success: true }
  } catch (error) {
    console.error('Failed to delete config:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

// IPC 處理器：獲取所有配置
ipcMain.handle('db:get-all-config', async () => {
  try {
    const config = await getAllConfig()
    return { success: true, config }
  } catch (error) {
    console.error('Failed to get all config:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

