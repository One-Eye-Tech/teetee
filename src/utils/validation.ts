/**
 * 手机号验证工具函数
 */

export interface PhoneValidationResult {
  isValid: boolean
  message: string
}

/**
 * 验证手机号格式
 * @param phone 手机号
 * @returns 验证结果
 */
export function validatePhone(phone: string): PhoneValidationResult {
  if (!phone) {
    return {
      isValid: false,
      message: '请输入手机号'
    }
  }
  
  // 移除所有非数字字符
  const cleanedPhone = phone.replace(/\D/g, '')
  
  if (cleanedPhone.length !== 11) {
    return {
      isValid: false,
      message: '请输入正确的手机号'
    }
  }
  
  // 验证手机号格式（以1开头，第二位是3-9）
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(cleanedPhone)) {
    return {
      isValid: false,
      message: '请输入正确的手机号'
    }
  }
  
  return {
    isValid: true,
    message: ''
  }
}

/**
 * 清理手机号，移除所有非数字字符
 * @param phone 手机号
 * @returns 清理后的手机号
 */
export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

/**
 * 格式化手机号显示（如：138 1234 5678）
 * @param phone 手机号
 * @returns 格式化后的手机号
 */
export function formatPhone(phone: string): string {
  const cleaned = cleanPhone(phone)
  if (cleaned.length !== 11) return cleaned
  
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`
}

/**
 * 隐藏手机号中间4位（如：138****5678）
 * @param phone 手机号
 * @returns 隐藏后的手机号
 */
export function maskPhone(phone: string): string {
  const cleaned = cleanPhone(phone)
  if (cleaned.length !== 11) return cleaned
  
  return `${cleaned.slice(0, 3)}****${cleaned.slice(7)}`
}