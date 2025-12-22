import { createServer } from 'net'

/**
 * 檢查端口是否可用
 * @param {number} port - 要檢查的端口號
 * @returns {Promise<boolean>} - 如果端口可用返回 true，否則返回 false
 */
function checkPort(port) {
  return new Promise((resolve) => {
    const server = createServer()
    
    server.listen(port, () => {
      server.once('close', () => resolve(true))
      server.close()
    })
    
    server.on('error', () => {
      resolve(false)
    })
  })
}

const port = parseInt(process.argv[2] || '5173', 10)

checkPort(port).then((available) => {
  if (!available) {
    console.error(`❌ Port ${port} is already in use. Please close the process using this port or use a different port.`)
    console.error(`   You can find and kill the process using:`)
    console.error(`   Windows: netstat -ano | findstr :${port}`)
    console.error(`   Then: taskkill /PID <PID> /F`)
    process.exit(1)
  } else {
    console.log(`✅ Port ${port} is available`)
    process.exit(0)
  }
}).catch((error) => {
  console.error('❌ Error checking port:', error)
  process.exit(1)
})

