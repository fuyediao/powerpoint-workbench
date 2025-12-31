import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  base: './', // 相對路徑，適配 Electron
  plugins: [
    vue(),
    tailwindcss(),
    // 構建分析工具（只在構建時啟用）
    process.env.ANALYZE === 'true' && visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    strictPort: true
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // 將 node_modules 中的大型庫拆分為單獨的 chunk
          if (id.includes('node_modules')) {
            // Vue 相關
            if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
              return 'vue-vendor'
            }
            // Google GenAI SDK
            if (id.includes('@google/genai')) {
              return 'genai-vendor'
            }
            // 圖標庫
            if (id.includes('lucide-vue-next')) {
              return 'icons-vendor'
            }
            // 導出相關庫（只在需要時加載）
            if (id.includes('pptxgenjs')) {
              return 'pptx-vendor'
            }
            if (id.includes('jszip')) {
              return 'zip-vendor'
            }
            if (id.includes('jspdf')) {
              return 'pdf-vendor'
            }
            if (id.includes('html2canvas')) {
              return 'canvas-vendor'
            }
            // XLSX 庫（只在需要時加載）
            if (id.includes('xlsx')) {
              return 'xlsx-vendor'
            }
            // 其他 node_modules
            return 'vendor'
          }
          // 將 FlagIcons 拆分為單獨的 chunk（因為它很大）
          if (id.includes('flag/FlagIcons')) {
            return 'flags'
          }
        },
      },
    },
    // 啟用 gzip 壓縮
    reportCompressedSize: true,
    // 減少 chunk 大小警告閾值
    chunkSizeWarningLimit: 500,
  },
})
