import { type SlideData } from '@/types'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

/**
 * 創建幻燈片的 Canvas（使用 SlidePreview 組件）
 */
async function createSlideCanvas(slide: SlideData): Promise<HTMLCanvasElement | null> {
  // 創建一個臨時的容器來渲染幻燈片
  const tempContainer = document.createElement('div')
  tempContainer.style.position = 'absolute'
  tempContainer.style.left = '-9999px'
  tempContainer.style.top = '-9999px'
  tempContainer.style.width = '1280px'
  tempContainer.style.height = '720px'
  tempContainer.style.backgroundColor = '#ffffff'
  document.body.appendChild(tempContainer)

  // 創建背景層
  if (slide.imageUrl) {
    const bgImg = document.createElement('img')
    bgImg.src = slide.imageUrl
    bgImg.style.width = '100%'
    bgImg.style.height = '100%'
    bgImg.style.objectFit = 'cover'
    bgImg.style.position = 'absolute'
    tempContainer.appendChild(bgImg)
    
    // 等待圖片加載
    await new Promise((resolve, reject) => {
      bgImg.onload = resolve
      bgImg.onerror = reject
      // 超時處理
      setTimeout(() => resolve(null), 5000)
    })
  } else {
    const bgGradient = document.createElement('div')
    bgGradient.style.width = '100%'
    bgGradient.style.height = '100%'
    bgGradient.style.background = 'linear-gradient(to bottom right, #e0e7ff, #dbeafe)'
    bgGradient.style.position = 'absolute'
    tempContainer.appendChild(bgGradient)
  }

  // 如果是整頁圖片（已包含所有文字內容），則不疊加文字
  // 否則添加文字疊加層
  if (!slide.isFullSlideImage) {
    // 創建內容層
    const contentLayer = document.createElement('div')
    contentLayer.style.position = 'absolute'
    contentLayer.style.inset = '0'
    contentLayer.style.padding = '64px'
    contentLayer.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'
    contentLayer.style.color = '#ffffff'
    contentLayer.style.display = 'flex'
    contentLayer.style.flexDirection = 'column'
    contentLayer.style.justifyContent = 'center'
    tempContainer.appendChild(contentLayer)

    // 添加標題
    const title = document.createElement('h1')
    title.textContent = slide.title
    title.style.fontSize = '60px'
    title.style.fontWeight = 'bold'
    title.style.marginBottom = '32px'
    title.style.lineHeight = '1.2'
    title.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)'
    contentLayer.appendChild(title)

    // 添加要點
    slide.contentPoints.forEach((point) => {
      const pointDiv = document.createElement('div')
      pointDiv.textContent = `• ${point}`
      pointDiv.style.fontSize = '30px'
      pointDiv.style.marginBottom = '16px'
      pointDiv.style.lineHeight = '1.4'
      pointDiv.style.textShadow = '1px 1px 2px rgba(0,0,0,0.5)'
      contentLayer.appendChild(pointDiv)
    })
  }

  // 等待渲染完成
  await new Promise(resolve => setTimeout(resolve, 200))

  try {
    // 使用 html2canvas 轉換為 canvas
    const canvas = await html2canvas(tempContainer, {
      width: 1280,
      height: 720,
      scale: 1,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })

    document.body.removeChild(tempContainer)
    return canvas
  } catch (error) {
    console.error('Failed to create canvas:', error)
    document.body.removeChild(tempContainer)
    return null
  }
}

/**
 * 將幻燈片導出為 PDF
 */
export async function exportToPDF(slides: SlideData[], filename = 'presentation.pdf'): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [1280, 720] // 16:9 比例
  })

  for (let i = 0; i < slides.length; i++) {
    if (i > 0) {
      pdf.addPage()
    }

    const slide = slides[i]
    const canvas = await createSlideCanvas(slide)
    
    if (canvas) {
      const imgData = canvas.toDataURL('image/png', 0.95)
      pdf.addImage(imgData, 'PNG', 0, 0, 1280, 720, undefined, 'FAST')
    } else {
      console.warn(`Failed to create canvas for slide ${i + 1}`)
    }
  }

  pdf.save(filename)
}

/**
 * 將幻燈片導出為圖片（ZIP 文件）
 */
export async function exportToImages(slides: SlideData[], filename = 'presentation-images.zip'): Promise<void> {
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()

  const promises = slides.map(async (slide, index) => {
    const canvas = await createSlideCanvas(slide)
    if (canvas) {
      return new Promise<void>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            zip.file(`slide-${String(index + 1).padStart(2, '0')}.png`, blob)
          }
          resolve()
        }, 'image/png', 0.95)
      })
    }
    return Promise.resolve()
  })

  await Promise.all(promises)

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(zipBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 將幻燈片導出為 PowerPoint
 * 使用整頁圖片方式，每頁都是完整的圖片（包含所有內容）
 */
export async function exportToPowerPoint(slides: SlideData[], filename = 'presentation.pptx'): Promise<void> {
  try {
    const PptxGenJS = (await import('pptxgenjs')).default
    const pptx = new PptxGenJS()

    // 設置幻燈片尺寸為 16:9
    pptx.layout = 'LAYOUT_WIDE'
    pptx.defineLayout({ name: 'CUSTOM', width: 10, height: 5.625 })

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i]
      const slideObj = pptx.addSlide()

      // 使用 createSlideCanvas 生成整頁圖片（包含背景、標題、內容等所有元素）
      const canvas = await createSlideCanvas(slide)
      
      if (canvas) {
        // 將 canvas 轉換為 base64 圖片
        const imgData = canvas.toDataURL('image/png', 0.95)
        
        // pptxgenjs 需要移除 data: 前綴，只保留 base64 部分
        const base64Data = imgData.includes(',') ? imgData.split(',')[1] : imgData
        const formattedData = `image/png;base64,${base64Data}`
        
        // 將整頁圖片添加到幻燈片（使用 addImage 方法，更可靠）
        try {
          slideObj.addImage({
            data: formattedData,
            x: 0,
            y: 0,
            w: 10,
            h: 5.625,
            sizing: { type: 'contain', w: 10, h: 5.625 }
          })
        } catch (imgError) {
          console.error(`Failed to add image for slide ${i + 1}:`, imgError)
          // 如果添加圖片失敗，嘗試使用背景方式
          try {
            slideObj.background = { 
              data: formattedData,
              path: formattedData
            }
          } catch (bgError) {
            console.error(`Failed to set background for slide ${i + 1}:`, bgError)
            // 如果都失敗，使用純色背景並添加文字
            slideObj.background = { color: '1F2937' }
            slideObj.addText(slide.title, {
              x: 0.5,
              y: 1,
              w: 9,
              h: 1,
              fontSize: 44,
              bold: true,
              color: 'FFFFFF',
              align: 'left',
              valign: 'top'
            })
            const pointsText = slide.contentPoints.map(p => `• ${p}`).join('\n')
            slideObj.addText(pointsText, {
              x: 0.5,
              y: 2.2,
              w: 9,
              h: 4,
              fontSize: 28,
              color: 'FFFFFF',
              align: 'left',
              valign: 'top',
              bullet: false
            })
          }
        }
      } else {
        // 如果無法生成 canvas，回退到原來的邏輯
        console.warn(`Failed to create canvas for slide ${i + 1}, using fallback method`)
        
        // 添加背景圖片（如果有）
        if (slide.imageUrl) {
          try {
            // 如果是 base64 數據，需要格式化
            if (slide.imageUrl.startsWith('data:')) {
              const base64Data = slide.imageUrl.includes(',') ? slide.imageUrl.split(',')[1] : slide.imageUrl
              const formattedData = `image/png;base64,${base64Data}`
              slideObj.addImage({
                data: formattedData,
                x: 0,
                y: 0,
                w: 10,
                h: 5.625
              })
            } else {
              slideObj.background = { path: slide.imageUrl }
            }
          } catch {
            slideObj.background = { color: '1F2937' }
          }
        } else {
          slideObj.background = { color: '1F2937' }
        }

        // 添加標題
        slideObj.addText(slide.title, {
          x: 0.5,
          y: 1,
          w: 9,
          h: 1,
          fontSize: 44,
          bold: true,
          color: 'FFFFFF',
          align: 'left',
          valign: 'top'
        })

        // 添加內容要點
        const pointsText = slide.contentPoints.map(p => `• ${p}`).join('\n')
        slideObj.addText(pointsText, {
          x: 0.5,
          y: 2.2,
          w: 9,
          h: 4,
          fontSize: 28,
          color: 'FFFFFF',
          align: 'left',
          valign: 'top',
          bullet: false
        })
      }
    }

    // 使用正確的 writeFile 方法
    pptx.writeFile(filename)
  } catch (error) {
    console.error('PowerPoint export failed:', error)
    throw new Error(`PowerPoint 導出失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
  }
}
