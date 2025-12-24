import initSqlJs, { Database as SqlJsDatabase } from 'sql.js'
import { app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

// 在 ESM 中獲取 __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 獲取用戶數據目錄
const userDataPath = app.getPath('userData')
const dbPath = path.join(userDataPath, 'app.db')

// 確保目錄存在
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true })
}

// SQL.js 實例和數據庫
let SQL: typeof initSqlJs | null = null
let db: SqlJsDatabase | null = null

// 初始化 SQL.js
async function initSQL(): Promise<typeof initSqlJs> {
  if (!SQL) {
    // 在 Electron 中，sql.js 會自動處理 WASM 文件加載
    // 如果遇到問題，可以通過 locateFile 自定義路徑
    SQL = await initSqlJs({
      locateFile: (file: string) => {
        // 嘗試多個可能的路徑
        const possiblePaths = [
          // 開發模式：從項目根目錄
          path.join(process.cwd(), 'node_modules/sql.js/dist', file),
          // 生產模式：從應用路徑
          path.join(app.getAppPath(), 'node_modules/sql.js/dist', file),
          // 備用：從構建後的目錄
          path.join(path.dirname(__dirname), 'node_modules/sql.js/dist', file)
        ]
        
        for (const possiblePath of possiblePaths) {
          if (fs.existsSync(possiblePath)) {
            return possiblePath
          }
        }
        // 如果找不到，返回原文件名（讓 sql.js 自己處理）
        return file
      }
    })
  }
  return SQL
}

// 獲取數據庫實例
async function getDatabase(): Promise<SqlJsDatabase> {
  if (!db) {
    const SQLModule = await initSQL()
    
    // 如果數據庫文件存在，加載它
    if (fs.existsSync(dbPath)) {
      const buffer = fs.readFileSync(dbPath)
      db = new SQLModule.Database(buffer)
    } else {
      // 創建新數據庫
      db = new SQLModule.Database()
      await initializeDatabase(db)
      // 保存到文件
      saveDatabaseToFile()
    }
  }
  return db
}

// 初始化數據庫表結構
function initializeDatabase(database: SqlJsDatabase): void {
  // 創建配置表
  database.run(`
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )
  `)

  // 創建索引
  database.run(`
    CREATE INDEX IF NOT EXISTS idx_config_key ON config(key)
  `)
}

// 保存數據庫到文件
function saveDatabaseToFile(): void {
  if (db) {
    const data = db.export()
    const buffer = Buffer.from(data)
    fs.writeFileSync(dbPath, buffer)
  }
}

// 保存配置
export async function saveConfig(key: string, value: string): Promise<void> {
  const database = await getDatabase()
  database.run(`
    INSERT INTO config (key, value, updated_at)
    VALUES (?, ?, strftime('%s', 'now'))
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = excluded.updated_at
  `, [key, value])
  saveDatabaseToFile()
}

// 獲取配置
export async function getConfig(key: string): Promise<string | null> {
  const database = await getDatabase()
  const stmt = database.prepare('SELECT value FROM config WHERE key = ?')
  stmt.bind([key])
  if (stmt.step()) {
    const result = stmt.getAsObject() as { value: string }
    stmt.free()
    return result.value
  }
  stmt.free()
  return null
}

// 刪除配置
export async function deleteConfig(key: string): Promise<void> {
  const database = await getDatabase()
  database.run('DELETE FROM config WHERE key = ?', [key])
  saveDatabaseToFile()
}

// 獲取所有配置
export async function getAllConfig(): Promise<Record<string, string>> {
  const database = await getDatabase()
  const stmt = database.prepare('SELECT key, value FROM config')
  
  const config: Record<string, string> = {}
  while (stmt.step()) {
    const row = stmt.getAsObject() as { key: string; value: string }
    config[row.key] = row.value
  }
  stmt.free()
  return config
}

// 關閉數據庫連接
export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}

