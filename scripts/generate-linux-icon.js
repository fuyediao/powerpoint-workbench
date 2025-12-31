/**
 * 生成 Linux 圖標腳本
 * 從 ICO 文件創建 PNG 圖標，或生成一個基本的 PNG 圖標
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { Buffer } from 'buffer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const buildDir = path.join(__dirname, '..', 'build')
const iconPath = path.join(buildDir, 'icon.png')
const icoPath = path.join(__dirname, '..', 'public', 'icon', 'favicon.ico')

// 確保 build 目錄存在
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true })
}

// 如果已經存在 PNG 圖標，直接返回
if (fs.existsSync(iconPath)) {
  console.log('✅ Linux icon already exists')
  process.exit(0)
}

// 嘗試使用 sharp 轉換 ICO 為 PNG
try {
  // 動態導入 sharp（如果可用）
  const sharp = await import('sharp').catch(() => null)
  
  if (sharp && fs.existsSync(icoPath)) {
    const sharpModule = sharp.default || sharp
    await sharpModule(icoPath)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(iconPath)
    console.log('✅ Linux icon generated from ICO file')
    process.exit(0)
  }
} catch (error) {
  console.warn('⚠️  Could not convert ICO to PNG:', error.message)
}

// 如果轉換失敗，創建一個基本的 PNG 圖標
// 使用一個簡單的方法：複製 ICO 文件並重命名（electron-builder 可能會處理）
// 或者創建一個最小的有效 PNG
const createBasicPNG = () => {
  // 如果 ICO 文件存在，嘗試直接複製（某些情況下 electron-builder 可以處理）
  if (fs.existsSync(icoPath)) {
    try {
      // 直接複製 ICO 文件作為臨時解決方案
      // 注意：這可能不會完全解決問題，但可以讓構建繼續
      fs.copyFileSync(icoPath, iconPath)
      console.log('⚠️  Copied ICO as PNG placeholder. Consider creating a proper PNG icon.')
      return
    } catch (error) {
      console.warn('⚠️  Could not copy ICO file:', error.message)
    }
  }
  
  // 最後的備選方案：創建一個最小的有效 PNG
  // 這是一個 1x1 透明 PNG
  const minimalPNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  )
  
  fs.writeFileSync(iconPath, minimalPNG)
  console.log('⚠️  Created minimal placeholder PNG icon. Please replace with a proper 512x512 PNG icon.')
}

createBasicPNG()

