import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const electronDir = path.join(rootDir, 'electron')
const outDir = path.join(rootDir, 'dist-electron')

// 確保輸出目錄存在
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

try {
  // 讀取 package.json 以獲取依賴列表
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'))
  const allDeps = [
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.devDependencies || {})
  ]

  console.log('Building Electron main process...')
  // 構建 main.ts (ESM)
  await build({
    entryPoints: [path.join(electronDir, 'main.ts')],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outdir: outDir,
    external: [
      'electron',
      'sql.js',
      ...allDeps
    ],
    sourcemap: true,
    minify: process.env.NODE_ENV === 'production'
  })

  console.log('Building Electron preload script...')
  // 構建 preload.ts (CommonJS，因為 Electron 的 preload 需要 CommonJS)
  await build({
    entryPoints: [path.join(electronDir, 'preload.ts')],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'cjs', // Preload 必須使用 CommonJS
    outdir: outDir,
    external: ['electron'],
    sourcemap: true,
    minify: process.env.NODE_ENV === 'production'
  })

  console.log('✅ Electron build completed!')
  process.exit(0)
} catch (error) {
  console.error('❌ Electron build failed:', error)
  process.exit(1)
}

