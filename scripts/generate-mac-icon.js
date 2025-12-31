/**
 * 生成 macOS 圖標腳本
 * 從 ICO 文件創建符合 macOS 要求的圖標（至少 512x512）
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { Buffer } from 'buffer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const buildDir = path.join(__dirname, '..', 'build')
const iconPngPath = path.join(buildDir, 'icon-512.png')

// 確保 build 目錄存在
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true })
}

// 如果已經存在圖標，直接返回
if (fs.existsSync(iconPngPath)) {
  console.log('✅ macOS icon already exists')
  process.exit(0)
}

// 嘗試使用 sharp 創建一個基本的 512x512 PNG
try {
  // 動態導入 sharp（如果可用）
  const sharp = await import('sharp').catch(() => null)
  
  if (sharp) {
    const sharpModule = sharp.default || sharp
    
    // 創建一個基本的 512x512 PNG 圖標
    // 使用一個簡單的顏色作為占位符
    const svg = `
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" fill="#4A90E2"/>
        <text x="256" y="280" font-family="Arial, sans-serif" font-size="120" fill="white" text-anchor="middle" font-weight="bold">PPT</text>
      </svg>
    `
    
    await sharpModule(Buffer.from(svg))
      .png()
      .toFile(iconPngPath)
    
    console.log('✅ macOS icon (512x512 PNG) created')
    console.log('⚠️  This is a placeholder icon. Please replace with a proper icon.')
    process.exit(0)
  }
} catch (error) {
  console.warn('⚠️  Could not create PNG with sharp:', error.message)
}

// 如果轉換失敗，提供有用的錯誤信息
const handleFailure = () => {
  if (!fs.existsSync(iconPngPath)) {
    console.error('❌ Cannot create macOS icon without sharp library.')
    console.error('   Please install sharp: npm install --save-dev sharp')
    console.error('   Or create a 512x512 PNG icon manually at: build/icon-512.png')
    console.error('   The build will fail without a proper icon.')
    process.exit(1)
  }
}

handleFailure()

