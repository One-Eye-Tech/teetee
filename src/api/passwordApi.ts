// 重新导出统一API中的密码相关函数
export {
  sendResetPasswordCode,
  resetPassword,
  verifyRegisterCode as verifyPasswordResetCode,
  type ApiResponse
} from './authApiLite'

// 兼容现有代码的函数
export async function sendPasswordResetCode(email: string): Promise<boolean> {
  const { sendResetPasswordCode } = await import('./authApiLite')
  
  const result = await sendResetPasswordCode(email) // email实际上是phone
  return result.success
}

export async function resendPasswordResetCode(email: string): Promise<boolean> {
  return sendPasswordResetCode(email)
}

export async function changePassword(
  email: string, 
  _code: string, 
  newPassword: string
): Promise<boolean> {
  const { resetPassword } = await import('./authApiLite')
  
  const result = await resetPassword(email, newPassword) // email实际上是phone
  return result.success
}