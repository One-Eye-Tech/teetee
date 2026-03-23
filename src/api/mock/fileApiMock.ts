// @ts-nocheck
// File API Mock 实现

// 延迟函数，模拟网络请求
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

// 上传定制图片（转换为 Base64 存储）
export const uploadCustomizationImage = async (file: File): Promise<string> => {
  await delay()
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      resolve(base64String)
    }
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    reader.readAsDataURL(file)
  })
}

// Base64 转 File 对象
export const base64ToFile = (base64String: string, filename: string): File => {
  const arr = base64String.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  
  return new File([u8arr], filename, { type: mime })
}

// Canvas 截图上传
export const uploadCanvasImage = async (canvas: HTMLCanvasElement, filename: string = 'canvas.png'): Promise<string> => {
  await delay()
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve(reader.result as string)
        }
        reader.readAsDataURL(blob)
      } else {
        resolve('')
      }
    }, 'image/png')
  })
}

// 上传图片（通用）
export const uploadImage = async (file: File): Promise<string> => {
  return uploadCustomizationImage(file)
}
