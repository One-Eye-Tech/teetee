// @ts-nocheck
// Auth API Mock 实现
import type { 
  User, 
  LoginResponse, 
  ApiResponse, 
  UpdateUserProfile,
  Address,
  AddressRequest,
  Size,
  Color,
  Model,
  ClothingStyle,
  Category
} from '../authApi'

import { 
  getCurrentUser as getMockCurrentUser,
  mockLogin,
  mockRegister,
  mockLogout,
  updateUser,
  mockUsers
} from '../../mocks/users'

import {
  getAllClothingStyles,
  getAllColors,
  getAllSizes,
  getAllModels
} from '../../mocks/styles'

import {
  getUserAddresses as getMockUserAddresses,
  addAddress as addMockAddress,
  updateAddress as updateMockAddress,
  deleteAddress as deleteMockAddress
} from '../../mocks/addresses'

// 延迟函数，模拟网络请求
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms))

// 模拟验证码存储
const verificationCodes = new Map<string, { code: string; expiry: number }>()

// ==================== 认证相关API ====================

export async function sendResetPasswordCode(phone: string): Promise<ApiResponse> {
  await delay()
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  verificationCodes.set(`reset_${phone}`, { code, expiry: Date.now() + 5 * 60 * 1000 })
  console.log(`[Mock] 重置密码验证码: ${code}`)
  return { success: true, message: '验证码发送成功' }
}

export async function resetPassword(phone: string, _password: string): Promise<ApiResponse> {
  await delay()
  const user = mockUsers.find(u => u.phone === phone)
  if (!user) {
    return { success: false, message: '用户不存在' }
  }
  return { success: true, message: '密码重置成功' }
}

export async function loginOrRegisterByCode(
  phone: string,
  code: string,
  rememberMe: boolean = false
): Promise<ApiResponse<LoginResponse>> {
  await delay()
  
  // 验证验证码
  const storedCode = verificationCodes.get(`login_${phone}`)
  if (!storedCode || storedCode.code !== code || storedCode.expiry < Date.now()) {
    return { success: false, message: '验证码错误或已过期' }
  }
  
  const user = mockLogin(phone, '')
  if (!user) {
    return { success: false, message: '登录失败' }
  }
  
  const loginData: LoginResponse = {
    token: `mock_token_${user.id}_${Date.now()}`,
    tokenType: 'Bearer',
    expiresIn: rememberMe ? 7 * 24 * 3600 : 24 * 3600,
    user: user as User
  }
  
  return { success: true, data: loginData, message: '登录成功' }
}

export async function loginByPassword(
  phone: string,
  password: string,
  rememberMe: boolean = false
): Promise<ApiResponse<LoginResponse>> {
  await delay()
  
  const user = mockLogin(phone, password)
  if (!user) {
    return { success: false, message: '手机号或密码错误' }
  }
  
  const loginData: LoginResponse = {
    token: `mock_token_${user.id}_${Date.now()}`,
    tokenType: 'Bearer',
    expiresIn: rememberMe ? 7 * 24 * 3600 : 24 * 3600,
    user: user as User
  }
  
  return { success: true, data: loginData, message: '登录成功' }
}

export async function getCurrentUser(): Promise<ApiResponse<User>> {
  await delay()
  const user = getMockCurrentUser()
  if (!user) {
    return { success: false, message: '未登录' }
  }
  return { success: true, data: user as User, message: '获取用户信息成功' }
}

export async function validateToken(_token: string): Promise<ApiResponse<boolean>> {
  await delay()
  const user = getMockCurrentUser()
  return { success: true, data: !!user, message: 'Token验证成功' }
}

// ==================== 注册相关API ====================

export async function sendRegisterCode(phone: string): Promise<ApiResponse> {
  await delay()
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  verificationCodes.set(`register_${phone}`, { code, expiry: Date.now() + 5 * 60 * 1000 })
  verificationCodes.set(`login_${phone}`, { code, expiry: Date.now() + 5 * 60 * 1000 })
  console.log(`[Mock] 注册验证码: ${code}`)
  return { success: true, message: '验证码发送成功' }
}

export async function verifyRegisterCode(phone: string, code: string): Promise<ApiResponse<boolean>> {
  await delay()
  const storedCode = verificationCodes.get(`register_${phone}`)
  if (!storedCode || storedCode.code !== code || storedCode.expiry < Date.now()) {
    return { success: false, data: false, message: '验证码错误或已过期' }
  }
  return { success: true, data: true, message: '验证码验证成功' }
}

export async function registerUser(
  phone: string,
  _password: string,
  _code?: string
): Promise<ApiResponse<User>> {
  await delay()
  const user = mockRegister(phone)
  return { success: true, data: user as User, message: '注册成功' }
}

// ==================== 管理员认证API ====================

export async function sendAdminCode(phone: string): Promise<ApiResponse> {
  await delay()
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  verificationCodes.set(`admin_${phone}`, { code, expiry: Date.now() + 5 * 60 * 1000 })
  console.log(`[Mock] 管理员验证码: ${code}`)
  return { success: true, message: '验证码发送成功' }
}

export async function adminLogin(phone: string, code: string): Promise<ApiResponse<{token: string}>> {
  await delay()
  const storedCode = verificationCodes.get(`admin_${phone}`)
  if (!storedCode || storedCode.code !== code || storedCode.expiry < Date.now()) {
    return { success: false, message: '验证码错误或已过期' }
  }
  
  const token = `mock_admin_token_${Date.now()}`
  localStorage.setItem('adminToken', token)
  
  return { success: true, data: { token }, message: '管理员登录成功' }
}

// ==================== 工具函数 ====================

export function logout(): void {
  mockLogout()
}

export function getStoredUser(): User | null {
  return getMockCurrentUser() as User | null
}

export function getStoredToken(): string | null {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
}

export function isLoggedIn(): boolean {
  return !!getStoredToken()
}

export function isRememberMe(): boolean {
  return localStorage.getItem('rememberMe') === 'true'
}

export function getTokenExpiresIn(): number {
  const expiresIn = localStorage.getItem('tokenExpiresIn') || sessionStorage.getItem('tokenExpiresIn')
  return expiresIn ? parseInt(expiresIn) : 0
}

export function isTokenExpiringSoon(): boolean {
  const expiresIn = getTokenExpiresIn()
  return expiresIn > 0 && expiresIn < 3600
}

// ==================== 用户资料管理 ====================

export async function updateCurrentUserProfile(profileData: UpdateUserProfile): Promise<ApiResponse<User>> {
  await delay()
  const currentUser = getMockCurrentUser()
  if (!currentUser) {
    return { success: false, message: '未登录' }
  }
  
  const updatedUser = updateUser(currentUser.id, profileData)
  if (!updatedUser) {
    return { success: false, message: '更新失败' }
  }
  
  return { success: true, data: updatedUser as User, message: '用户资料更新成功' }
}

export async function uploadUserAvatar(file: File): Promise<ApiResponse<string>> {
  await delay()
  
  // 将文件转换为 Base64 URL
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const avatarUrl = reader.result as string
      resolve({
        success: true,
        data: avatarUrl,
        message: '头像上传成功'
      })
    }
    reader.readAsDataURL(file)
  })
}

// ==================== 地址管理 ====================

export async function getUserAddresses(): Promise<ApiResponse<Address[]>> {
  await delay()
  const currentUser = getMockCurrentUser()
  if (!currentUser) {
    return { success: false, message: '未登录' }
  }
  
  const addresses = getMockUserAddresses(currentUser.id)
  return { success: true, data: addresses as Address[], message: '获取地址列表成功' }
}

export async function deleteAddress(addressId: number): Promise<ApiResponse<void>> {
  await delay()
  const success = deleteMockAddress(addressId)
  if (!success) {
    return { success: false, message: '删除地址失败' }
  }
  return { success: true, message: '删除地址成功' }
}

export async function addAddress(addressData: AddressRequest): Promise<ApiResponse<Address>> {
  await delay()
  const currentUser = getMockCurrentUser()
  if (!currentUser) {
    return { success: false, message: '未登录' }
  }
  
  const newAddress = addMockAddress(currentUser.id, {
    recipientName: addressData.recipientName,
    phone: addressData.phoneNumber,
    province: addressData.province,
    city: addressData.city,
    district: addressData.area,
    detailAddress: addressData.detailedAddress,
    isDefault: false
  })
  
  return { success: true, data: newAddress as Address, message: '添加地址成功' }
}

export async function updateAddress(addressId: number, addressData: AddressRequest): Promise<ApiResponse<Address>> {
  await delay()
  const updatedAddress = updateMockAddress(addressId, {
    recipientName: addressData.recipientName,
    phone: addressData.phoneNumber,
    province: addressData.province,
    city: addressData.city,
    district: addressData.area,
    detailAddress: addressData.detailedAddress
  })
  
  if (!updatedAddress) {
    return { success: false, message: '更新地址失败' }
  }
  
  return { success: true, data: updatedAddress as Address, message: '更新地址成功' }
}

// ==================== 定制页面相关API ====================

export async function getAllSizes(_categoryId?: number, _styleId?: number): Promise<ApiResponse<Size[]>> {
  await delay()
  const sizes = getAllSizes()
  return { 
    success: true, 
    data: sizes.map(s => ({
      ...s,
      orderIndex: s.id,
      categoryId: 1,
      categoryName: 'T恤',
      createdTime: new Date().toISOString()
    })) as Size[], 
    message: '获取尺码列表成功' 
  }
}

export async function getAllColors(_categoryId?: number, _styleId?: number): Promise<ApiResponse<Color[]>> {
  await delay()
  const colors = getAllColors()
  return { 
    success: true, 
    data: colors.map(c => ({
      ...c,
      categoryId: 1,
      categoryName: 'T恤',
      createdTime: new Date().toISOString()
    })) as Color[], 
    message: '获取颜色列表成功' 
  }
}

export async function getAllModels(): Promise<ApiResponse<Model[]>> {
  await delay()
  const models = getAllModels()
  return { 
    success: true, 
    data: models.map(m => ({
      id: m.id,
      categoryId: m.clothingStyleId,
      categoryName: '服装',
      frontUrl: m.imageUrl,
      backUrl: m.imageUrl,
      priceR: m.price,
      onShelves: true,
      color: '',
      name: m.name,
      description: m.description || '',
      styleId: m.clothingStyleId,
      styleName: '',
      createdTime: new Date().toISOString(),
      updatedTime: new Date().toISOString()
    })) as Model[], 
    message: '获取模型列表成功' 
  }
}

export async function getModelsByStyle(styleId: number): Promise<ApiResponse<Model[]>> {
  await delay()
  const allModels = getAllModels()
  const filtered = allModels.filter(m => m.clothingStyleId === styleId)
  return { 
    success: true, 
    data: filtered.map(m => ({
      id: m.id,
      categoryId: m.clothingStyleId,
      categoryName: '服装',
      frontUrl: m.imageUrl,
      backUrl: m.imageUrl,
      priceR: m.price,
      onShelves: true,
      color: '',
      name: m.name,
      description: m.description || '',
      styleId: m.clothingStyleId,
      styleName: '',
      createdTime: new Date().toISOString(),
      updatedTime: new Date().toISOString()
    })) as Model[], 
    message: '获取模型列表成功' 
  }
}

export async function getAllActiveClothingStyles(): Promise<ApiResponse<ClothingStyle[]>> {
  await delay()
  const styles = getAllClothingStyles()
  return { 
    success: true, 
    data: styles.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description || '',
      category: 'clothing',
      basePrice: 99,
      isActive: true,
      sortOrder: s.id,
      colorVariants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })) as ClothingStyle[], 
    message: '获取服装款式列表成功' 
  }
}

export async function getAllActiveClothingStylesWithColors(): Promise<ApiResponse<ClothingStyle[]>> {
  await delay()
  return getAllActiveClothingStyles()
}

export async function getAllCategories(): Promise<ApiResponse<Category[]>> {
  await delay()
  return { 
    success: true, 
    data: [
      { id: 1, name: 'T恤', createdTime: new Date().toISOString() },
      { id: 2, name: '卫衣', createdTime: new Date().toISOString() },
      { id: 3, name: 'Polo衫', createdTime: new Date().toISOString() }
    ], 
    message: '获取产品类别成功' 
  }
}

// 兼容旧版本的导出
export interface LoginResult {
  success: boolean
  user?: { id: string; phone: string; userName?: string; roleId?: string }
  message?: string
}

export async function login(phone: string, password: string, rememberMe: boolean): Promise<LoginResult> {
  const result = await loginByPassword(phone, password, rememberMe)
  
  if (result.success && result.data) {
    return {
      success: true,
      user: {
        id: result.data.user.id.toString(),
        phone: result.data.user.phone,
        userName: result.data.user.username,
        roleId: result.data.user.roleId?.toString() || '1'
      }
    }
  }
  
  return {
    success: false,
    message: result.message
  }
}

// 创建一个 mock api 实例（用于其他模块导入）
export const api = {
  get: async (_url: string, _config?: any) => ({ data: {} }),
  post: async (_url: string, _data?: any, _config?: any) => ({ data: {} }),
  put: async (_url: string, _data?: any, _config?: any) => ({ data: {} }),
  delete: async (_url: string, _config?: any) => ({ data: {} })
}
