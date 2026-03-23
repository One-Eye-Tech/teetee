import { api } from './authApiLite'
import { config } from '../config'

/**
 * 上传定制图片到MinIO
 * @param file 图片文件
 * @returns Promise<string> 返回图片URL
 */
export async function uploadCustomizationImage(file: File): Promise<string> {
  if (config.USE_MOCK) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(new Error('图片读取失败'))
      reader.readAsDataURL(file)
    })
  }

  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/v1/files/upload-customization-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    return response.data as string // 直接返回URL字符串
  } catch (error: any) {
    console.error('图片上传失败:', error)
    throw new Error(error.response?.data || '图片上传失败')
  }
}

/**
 * 将Base64转换为File对象
 * @param base64Data Base64数据
 * @param fileName 文件名
 * @returns File对象
 */
export function base64ToFile(base64Data: string, fileName: string): File {
  // 去掉data:image/jpeg;base64,前缀
  const base64Content = base64Data.split(',')[1] || base64Data
  
  // 将Base64转换为字节数组
  const byteCharacters = atob(base64Content)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  
  // 创建File对象
  return new File([byteArray], fileName, { type: 'image/jpeg' })
}

/**
 * 上传Canvas截图到MinIO
 * @param canvas Canvas元素
 * @param fileName 文件名
 * @returns Promise<string> 返回图片URL
 */
export async function uploadCanvasImage(canvas: HTMLCanvasElement, fileName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error('Canvas转换为Blob失败'))
        return
      }
      
      try {
        // 使用PNG格式保持透明度，确保文件名也是.png后缀
        const pngFileName = fileName.replace(/\.(jpe?g|webp)$/i, '.png')
        const file = new File([blob], pngFileName, { type: 'image/png' })
        
        console.log('[文件上传] PNG文件信息:', {
          fileName: pngFileName,
          fileSize: `${(file.size / 1024).toFixed(2)}KB`,
          fileType: file.type,
          blobSize: `${(blob.size / 1024).toFixed(2)}KB`
        })
        
        const imageUrl = await uploadCustomizationImage(file)
        
        console.log('[文件上传] 上传成功，后端返回URL:', imageUrl)
        console.log('[文件上传] 注意：后端可能已将PNG转换为WebP格式，但透明度应该保留')
        
        resolve(imageUrl)
      } catch (error) {
        console.error('[文件上传] 上传失败:', error)
        reject(error)
      }
    }, 'image/png', 1.0) // PNG格式，质量1.0（无损）
  })
}