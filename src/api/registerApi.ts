// 重新导出统一API中的注册相关函数
export {
  sendRegisterCode as sendVerificationCode,
  verifyRegisterCode,
  registerUser,
  type ApiResponse,
  type User
} from './authApiLite'

// 兼容现有代码的函数
export async function verifyCodeAndRegister(
  phone: string, 
  code: string
): Promise<boolean | { email: string } | { message: string } | string> {
  const { verifyRegisterCode } = await import('./authApiLite')
  
  const result = await verifyRegisterCode(phone, code)
  
  if (result.success) {
    return { email: phone } // 返回phone作为email（兼容现有逻辑）
  }
  
  return result.message || 'Invalid code'
}