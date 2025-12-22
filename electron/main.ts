import { app, BrowserWindow, ipcMain, Tray, nativeImage, Menu } from 'electron'
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
let tray: Tray | null = null
let shouldQuit = false

const createWindow = (): void => {
  // 判斷是否為開發模式
  const isDev = !!VITE_DEV_SERVER_URL
  
  // 設置應用圖標
  const iconPath = path.join(process.env.APP_ROOT || __dirname, 'public', 'icon', 'favicon.ico')
  let appIcon: nativeImage | undefined
  try {
    appIcon = nativeImage.createFromPath(iconPath)
    if (appIcon.isEmpty()) {
      appIcon = undefined
    }
  } catch {
    // 如果圖標加載失敗，嘗試其他路徑
    try {
      const altIconPath = path.join(__dirname, '..', 'public', 'icon', 'favicon.ico')
      appIcon = nativeImage.createFromPath(altIconPath)
      if (appIcon.isEmpty()) {
        appIcon = undefined
      }
    } catch {
      appIcon = undefined
    }
  }
  
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    icon: appIcon, // 設置窗口圖標
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
  
  // 如果圖標加載成功，也設置應用圖標（用於任務欄等）
  if (appIcon && process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(appIcon) // macOS Dock 圖標
  }

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

  // 處理窗口關閉事件（最小化到托盤而不是關閉）
  win.on('close', (event) => {
    if (!shouldQuit) {
      event.preventDefault()
      win?.hide()
      
      // 在 Windows 和 Linux 上顯示通知
      if (process.platform !== 'darwin' && tray) {
        tray.displayBalloon({
          title: 'Gemini PPT Workbench',
          content: '應用已最小化到系統托盤，點擊托盤圖標可重新打開窗口。'
        })
      }
    }
  })
}

// 創建系統托盤
function createTray() {
  // 創建托盤圖標，使用 favicon.ico
  let trayIcon: nativeImage
  const rootPath = process.env.APP_ROOT || path.join(__dirname, '..')
  
  // 嘗試多個可能的圖標路徑
  const possiblePaths = [
    path.join(rootPath, 'public', 'icon', 'favicon.ico'),
    path.join(rootPath, 'dist', 'public', 'icon', 'favicon.ico'),
    path.join(__dirname, '..', 'public', 'icon', 'favicon.ico'),
    path.join(__dirname, '..', '..', 'public', 'icon', 'favicon.ico')
  ]
  
  let iconLoaded = false
  for (const iconPath of possiblePaths) {
    try {
      trayIcon = nativeImage.createFromPath(iconPath)
      if (!trayIcon.isEmpty()) {
        // 調整圖標大小以適應托盤（Windows 通常使用 16x16，macOS 使用 22x22）
        const size = process.platform === 'darwin' ? 22 : 16
        trayIcon = trayIcon.resize({ width: size, height: size })
        iconLoaded = true
        break
      }
    } catch {
      // 繼續嘗試下一個路徑
      continue
    }
  }
  
  if (!iconLoaded) {
    console.warn('Failed to load tray icon, using fallback')
    trayIcon = nativeImage.createEmpty()
  }

  tray = new Tray(trayIcon)

  // 創建托盤菜單
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '顯示窗口',
      click: () => {
        if (win) {
          if (win.isMinimized()) {
            win.restore()
          }
          win.show()
          win.focus()
        } else {
          createWindow()
        }
      }
    },
    {
      label: '最小化到托盤',
      click: () => {
        if (win) {
          win.hide()
        }
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        shouldQuit = true
        if (win) {
          win.destroy()
        }
        app.quit()
      }
    }
  ])

  tray.setToolTip('Gemini PPT Workbench')
  tray.setContextMenu(contextMenu)

  // 點擊托盤圖標顯示/隱藏窗口
  tray.on('click', () => {
    if (win) {
      if (win.isVisible()) {
        win.hide()
      } else {
        if (win.isMinimized()) {
          win.restore()
        }
        win.show()
        win.focus()
      }
    } else {
      createWindow()
    }
  })

  // 雙擊托盤圖標顯示窗口
  tray.on('double-click', () => {
    if (win) {
      if (win.isMinimized()) {
        win.restore()
      }
      win.show()
      win.focus()
    } else {
      createWindow()
    }
  })
}

// 當所有窗口關閉時不退出應用（因為有托盤）
app.on('window-all-closed', () => {
  // 不再自動退出，讓應用在托盤中運行
  // macOS 上仍然需要特殊處理
  if (process.platform === 'darwin') {
    // macOS 上，如果沒有窗口，創建一個
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  }
})

app.on('activate', () => {
  // 在 macOS 上，當單擊停靠欄圖標且沒有其他窗口打開時，
  // 通常在應用程序中重新創建一個窗口
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// 應用準備就緒時創建窗口和托盤
app.whenReady().then(() => {
  createWindow()
  createTray()
})

// 應用退出時關閉數據庫和清理托盤
app.on('will-quit', () => {
  closeDatabase()
  if (tray) {
    tray.destroy()
    tray = null
  }
})

// 處理應用退出前的事件
app.on('before-quit', () => {
  shouldQuit = true
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

// IPC 處理器：獲取系統語言
ipcMain.handle('app:get-locale', () => {
  return app.getLocale()
})

