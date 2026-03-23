import axios from 'axios'
import { API_BASE_URL } from '@/config'

// 使用统一配置的API基础URL
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// 请求拦截器 - 添加JWT token
api.interceptors.request.use((config) => {
  // 定义不需要认证的公开接口（只包括GET请求）
  const publicGetEndpoints = [
    '/v1/works',
    '/v1/products',
    '/v1/models',
    '/v1/sizes',
    '/v1/colors',
    '/v1/clothing-styles',
    '/v1/avatars/list',
    '/v1/home-banners',
    '/v1/product-categories'
  ]
  
  // 检查当前请求是否为公开接口（只对GET请求生效）
  const isPublicEndpoint = config.method?.toUpperCase() === 'GET' && 
    publicGetEndpoints.some(endpoint => config.url?.startsWith(endpoint))
  
  // 只有非公开接口才添加认证头
  if (!isPublicEndpoint) {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // 添加设备ID (如果有)
    const deviceId = localStorage.getItem('deviceId') || generateDeviceId()
    if (deviceId) {
      config.headers['X-Device-Id'] = deviceId
      localStorage.setItem('deviceId', deviceId)
    }
  }
  
  return config
})

// 响应拦截器 - 处理统一错误和token过期
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 检查是否为公开接口
    const publicEndpoints = [
      '/v1/works',
      '/v1/products', 
      '/v1/models',
      '/v1/sizes',
      '/v1/colors',
      '/v1/clothing-styles',
      '/v1/avatars/list',
      '/v1/home-banners',
      '/v1/product-categories'
    ]
    
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      error.config?.url?.includes(endpoint)
    )
    
    // 只有非公开接口的认证错误才触发登出
    if (!isPublicEndpoint && (error.response?.status === 401 || error.response?.status === 500)) {
      // Token过期或无效，或者后端JWT解析错误，清除本地存储
      console.warn('Token过期或认证失败，清除本地存储')
      localStorage.removeItem('authToken')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('tokenExpiresIn')
      localStorage.removeItem('sso_token')
      sessionStorage.removeItem('authToken')
      sessionStorage.removeItem('userInfo')
      sessionStorage.removeItem('tokenExpiresIn')
      
      // 触发全局登出状态同步
      try {
        // 使用正确的SSO事件key
        localStorage.setItem('sso_event', JSON.stringify({
          type: 'logout',
          timestamp: Date.now()
        }))
        // 立即移除，触发storage事件
        localStorage.removeItem('sso_event')
      } catch (e) {
        console.error('触发登出事件失败:', e)
      }
    } else if (isPublicEndpoint) {
      // 公开接口错误，只记录日志
      console.warn(`公开接口访问失败: ${error.config?.url}`, error.response?.status)
    }
    
    return Promise.reject(error)
  }
)

// 生成设备ID
function generateDeviceId(): string {
  return 'web_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
}

// 导出api实例供其他模块使用
export { api }

// ==================== 类型定义 ====================

export interface User {
  id: number
  username: string
  phone: string
  avatar: string
  personalProfile?: string
  gender?: string
  roleId: number
  enabled: boolean
  createdTime: string
  updatedTime: string
}

export interface LoginResponse {
  token: string
  tokenType: string
  expiresIn?: number
  user: User
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  code?: string
}

// ==================== 认证相关API ====================

/**
 * 发送重置密码验证码
 * POST /api/auth/send-code
 */
export async function sendResetPasswordCode(phone: string): Promise<ApiResponse> {
  try {
      await api.post('/auth/send-code', { phone })
    return { success: true, message: '验证码发送成功' }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.response?.data || '发送验证码失败'
    }
  }
}

/**
 * 重置密码
 * POST /api/auth/reset-password
 */
export async function resetPassword(phone: string, password: string): Promise<ApiResponse> {
  try {
      await api.post('/auth/reset-password', { phone, password })
    return { success: true, message: '密码重置成功' }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.response?.data || '密码重置失败'
    }
  }
}

/**
 * 手机号+验证码登录或注册
 * POST /api/auth/login-or-register
 */
export async function loginOrRegisterByCode(
  phone: string, 
  code: string, 
  rememberMe: boolean = false,
  deviceId?: string
): Promise<ApiResponse<LoginResponse>> {
  try {
      const response = await api.post('/auth/login-or-register', {
      phone,
      code,
      rememberMe,
      deviceId: deviceId || localStorage.getItem('deviceId')
    })
    
    const loginData = response.data
    
    // 根据rememberMe决定存储位置
    if (rememberMe) {
      localStorage.setItem('authToken', loginData.token)
      localStorage.setItem('userInfo', JSON.stringify(loginData.user))
      localStorage.setItem('rememberMe', 'true')
      localStorage.setItem('tokenExpiresIn', loginData.expiresIn?.toString() || '')
    } else {
      sessionStorage.setItem('authToken', loginData.token)
      sessionStorage.setItem('userInfo', JSON.stringify(loginData.user))
      sessionStorage.setItem('tokenExpiresIn', loginData.expiresIn?.toString() || '')
      // 清除可能存在的localStorage数据
      localStorage.removeItem('authToken')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('rememberMe')
      localStorage.removeItem('tokenExpiresIn')
    }
    
    return {
      success: true,
      data: loginData,
      message: '登录成功'
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.response?.data || '登录失败'
    }
  }
}

/**
 * 手机号+密码登录
 * POST /api/auth/login
 */
export async function loginByPassword(
  phone: string, 
  password: string, 
  rememberMe: boolean = false,
  deviceId?: string
): Promise<ApiResponse<LoginResponse>> {
  try {
      const response = await api.post('/auth/login', {
      phone,
      password,
      rememberMe,
      deviceId: deviceId || localStorage.getItem('deviceId')
    })
    
    const loginData = response.data
    
    // 根据rememberMe决定存储位置
    if (rememberMe) {
      localStorage.setItem('authToken', loginData.token)
      localStorage.setItem('userInfo', JSON.stringify(loginData.user))
      localStorage.setItem('rememberMe', 'true')
      localStorage.setItem('tokenExpiresIn', loginData.expiresIn?.toString() || '')
    } else {
      sessionStorage.setItem('authToken', loginData.token)
      sessionStorage.setItem('userInfo', JSON.stringify(loginData.user))
      sessionStorage.setItem('tokenExpiresIn', loginData.expiresIn?.toString() || '')
      // 清除可能存在的localStorage数据
      localStorage.removeItem('authToken')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('rememberMe')
      localStorage.removeItem('tokenExpiresIn')
    }
    
    return {
      success: true,
      data: loginData,
      message: '登录成功'
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.response?.data || '登录失败'
    }
  }
}

/**
 * 获取当前用户信息
 * GET /api/auth/me
 */
export async function getCurrentUser(): Promise<ApiResponse<User>> {
  try {
      const response = await api.get('/auth/me')
    return {
      success: true,
      data: response.data,
      message: '获取用户信息成功'
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.response?.data || '获取用户信息失败'
    }
  }
}

/**
 * 验证token是否有效
 * GET /api/auth/validate
 */
export async function validateToken(token: string): Promise<ApiResponse<boolean>> {
  try {
      const response = await api.get('/auth/validate', {
      params: { token }
    })
    return {
      success: true,
      data: response.data,
      message: 'Token验证成功'
    }
  } catch (error: any) {
    return {
      success: false,
      data: false,
      message: 'Token无效或已过期'
    }
  }
}

// ==================== 注册相关API ====================

/**
 * 发送注册验证码
 * POST /api/register/send-code
 */
export async function sendRegisterCode(phone: string): Promise<ApiResponse> {
  try {
      await api.post('/register/send-code', { phone })
    return { success: true, message: '验证码发送成功' }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.response?.data || '发送验证码失败'
    }
  }
}

/**
 * 验证注册验证码（不完成注册）
 * POST /api/register/verify-code
 */
export async function verifyRegisterCode(phone: string, code: string): Promise<ApiResponse<boolean>> {
  try {
      const response = await api.post('/register/verify-code', { phone, code })
    return {
      success: true,
      data: response.data,
      message: '验证码验证成功'
    }
  } catch (error: any) {
    return {
      success: false,
      data: false,
      message: error.response?.data?.message || error.response?.data || '验证码错误或已过期'
    }
  }
}

/**
 * 注册用户（不验证验证码）
 * POST /api/register/register
 */
export async function registerUser(
  phone: string, 
  password: string, 
  code?: string
): Promise<ApiResponse<User>> {
  try {
      const response = await api.post('/register/register', {
      phone,
      password,
      code
    })
    return {
      success: true,
      data: response.data,
      message: '注册成功'
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.response?.data || '注册失败'
    }
  }
}

// ==================== 管理员认证API ====================

/**
 * 发送管理员验证码
 * POST /api/auth/admin/send-code
 */
export async function sendAdminCode(phone: string): Promise<ApiResponse> {
  try {
      await api.post('/auth/admin/send-code', { phone })
    return { success: true, message: '验证码发送成功' }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.response?.data || '发送验证码失败'
    }
  }
}

/**
 * 管理员登录
 * POST /api/auth/admin/login
 */
export async function adminLogin(phone: string, code: string): Promise<ApiResponse<{token: string}>> {
  try {
      const response = await api.post('/auth/admin/login', { phone, code })
    
    // 保存管理员token
    localStorage.setItem('adminToken', response.data.token)
    
    return {
      success: true,
      data: response.data,
      message: '管理员登录成功'
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.response?.data || '管理员登录失败'
    }
  }
}

// ==================== 工具函数 ====================

/**
 * 退出登录
 */
export function logout(): void {
  localStorage.removeItem('authToken')
  localStorage.removeItem('userInfo')
  localStorage.removeItem('rememberMe')
  localStorage.removeItem('tokenExpiresIn')
  localStorage.removeItem('adminToken')
  sessionStorage.removeItem('authToken')
  sessionStorage.removeItem('userInfo')
  sessionStorage.removeItem('tokenExpiresIn')
}

/**
 * 获取本地存储的用户信息
 */
export function getStoredUser(): User | null {
  try {
    const userStr = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo')
    return userStr ? JSON.parse(userStr) : null
  } catch {
    return null
  }
}

/**
 * 获取本地存储的token
 */
export function getStoredToken(): string | null {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
}

/**
 * 检查是否已登录
 */
export function isLoggedIn(): boolean {
  return !!getStoredToken()
}

/**
 * 检查是否为记住我状态
 */
export function isRememberMe(): boolean {
  return localStorage.getItem('rememberMe') === 'true'
}

/**
 * 获取token过期时间（秒）
 */
export function getTokenExpiresIn(): number {
  const expiresIn = localStorage.getItem('tokenExpiresIn') || sessionStorage.getItem('tokenExpiresIn')
  return expiresIn ? parseInt(expiresIn) : 0
}

/**
 * 检查token是否即将过期（1小时内）
 */
export function isTokenExpiringSoon(): boolean {
  const expiresIn = getTokenExpiresIn()
  return expiresIn > 0 && expiresIn < 3600 // 1小时 = 3600秒
}

// 兼容旧版本的导出（保持向后兼容）
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
        roleId: result.data.user.roleId.toString()
      }
    }
  }
  
  return {
    success: false,
    message: result.message
  }
}

// ==================== 用户资料管理 ====================

export interface UpdateUserProfile {
  username?: string
  personalProfile?: string
  avatar?: string
  gender?: string
}

// 地址相关接口类型定义
export interface Address {
  id: number
  userId: number
  recipientName: string
  phoneNumber: string
  province: string
  city: string
  area: string
  detailedAddress: string
  isDefault?: boolean
  createdTime: string
  updatedTime: string
}

export interface AddressRequest {
  recipientName: string
  phoneNumber: string
  province: string
  city: string
  area: string
  detailedAddress: string
}

/**
 * 更新当前用户资料
 * PUT /api/v1/users/me
 */
export async function updateCurrentUserProfile(profileData: UpdateUserProfile): Promise<ApiResponse<User>> {
  try {
      const response = await api.put('/v1/users/me', profileData)
    return {
      success: true,
      data: response.data,
      message: '用户资料更新成功'
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.response?.data || '用户资料更新失败'
    }
  }
}

/**
 * 上传用户头像
 * POST /api/v1/avatars/upload (专门的头像上传接口)
 */
export async function uploadUserAvatar(file: File): Promise<ApiResponse<string>> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    
      const response = await api.post('/v1/avatars/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    return {
      success: true,
      data: response.data, // 后端直接返回URL字符串
      message: '头像上传成功'
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data || '头像上传失败'
    }
  }
}

// ==================== 地址管理 ====================

/**
 * 获取当前用户所有收货地址
 * GET /api/addresses
 */
export async function getUserAddresses(): Promise<ApiResponse<Address[]>> {
  try {
      const response = await api.get('/addresses')
    
    return {
      success: true,
      data: response.data,
      message: '获取地址列表成功'
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '获取地址列表失败'
    }
  }
}

/**
 * 删除收货地址
 * DELETE /api/addresses/{addressId}
 */
export async function deleteAddress(addressId: number): Promise<ApiResponse<void>> {
  try {
      await api.delete(`/addresses/${addressId}`)
    
    return {
      success: true,
      message: '删除地址成功'
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '删除地址失败'
    }
  }
}

/**
 * 添加新的收货地址
 * POST /api/addresses
 */
export async function addAddress(addressData: AddressRequest): Promise<ApiResponse<Address>> {
  try {
      const response = await api.post('/addresses', addressData)
    
    return {
      success: true,
      data: response.data,
      message: '添加地址成功'
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '添加地址失败'
    }
  }
}

/**
 * 更新收货地址
 * PUT /api/addresses/{addressId}
 */
export async function updateAddress(addressId: number, addressData: AddressRequest): Promise<ApiResponse<Address>> {
  try {
      const response = await api.put(`/addresses/${addressId}`, addressData)
    
    return {
      success: true,
      data: response.data,
      message: '更新地址成功'
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '更新地址失败'
    }
  }
}

// ==================== 定制页面相关API ====================

// 尺码相关接口类型定义
export interface Size {
  id: number
  name: string
  orderIndex: number
  categoryId: number
  categoryName: string
  styleId?: number  // 款式ID，可选字段
  styleName?: string  // 款式名称，可选字段
  createdTime: string
}

// 颜色相关接口类型定义
export interface Color {
  id: number
  name: string
  categoryId: number
  categoryName: string
  createdTime: string
}

// 模型相关接口类型定义
export interface Model {
  id: number
  categoryId: number
  categoryName: string
  frontUrl: string
  backUrl: string
  priceR: number
  onShelves: boolean
  color: string
  name: string
  description: string
  styleId: number
  styleName: string
  createdTime: string
  updatedTime: string
}

// 服装款式相关接口类型定义
export interface ClothingStyle {
  id: number
  name: string
  description: string
  category: string
  basePrice: number
  isActive: boolean
  sortOrder: number
  colorVariants: Model[]
  createdAt: string
  updatedAt: string
}

// 产品类别相关接口类型定义
export interface Category {
  id: number
  name: string
  createdTime: string
}

/**
 * 获取所有尺码列表
 * GET /api/v1/sizes
 */
export async function getAllSizes(categoryId?: number, styleId?: number): Promise<ApiResponse<Size[]>> {
  try {
    const params: any = {}
    if (categoryId) params.categoryId = categoryId
    if (styleId) params.styleId = styleId
      const response = await api.get('/v1/sizes', { params })
    
    return {
      success: true,
      data: response.data,
      message: '获取尺码列表成功'
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '获取尺码列表失败'
    }
  }
}

/**
 * 获取所有颜色列表
 * GET /api/v1/colors
 */
export async function getAllColors(categoryId?: number, styleId?: number): Promise<ApiResponse<Color[]>> {
  try {
    const params: any = {}
    if (categoryId) params.categoryId = categoryId
    if (styleId) params.styleId = styleId
      const response = await api.get('/v1/colors', { params })
    
    return {
      success: true,
      data: response.data,
      message: '获取颜色列表成功'
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '获取颜色列表失败'
    }
  }
}

/**
 * 获取所有模型列表（不分页）
 * GET /api/v1/models/all
 */
export async function getAllModels(): Promise<ApiResponse<Model[]>> {
  try {
      const response = await api.get('/v1/models/all')
    
    return {
      success: true,
      data: response.data,
      message: '获取模型列表成功'
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '获取模型列表失败'
    }
  }
}

/**
 * 根据款式ID获取模型列表
 * GET /api/v1/models?categoryId={styleId}
 */
export async function getModelsByStyle(styleId: number): Promise<ApiResponse<Model[]>> {
  try {
      const response = await api.get('/v1/models', {
      params: { categoryId: styleId }
    })
    
    return {
      success: true,
      data: response.data.content || response.data, // 处理分页和非分页响应
      message: '获取模型列表成功'
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '获取模型列表失败'
    }
  }
}

/**
 * 获取所有启用的服装款式
 * GET /api/v1/clothing-styles/active
 */
export async function getAllActiveClothingStyles(): Promise<ApiResponse<ClothingStyle[]>> {
  try {
      const response = await api.get('/v1/clothing-styles/active')
    
    return {
      success: true,
      data: response.data,
      message: '获取服装款式列表成功'
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '获取服装款式列表失败'
    }
  }
}

/**
 * 获取所有启用的服装款式及其颜色变体
 * GET /api/v1/clothing-styles/active/with-colors
 */
export async function getAllActiveClothingStylesWithColors(): Promise<ApiResponse<ClothingStyle[]>> {
  try {
      const response = await api.get('/v1/clothing-styles/active/with-colors')
    
    return {
      success: true,
      data: response.data,
      message: '获取服装款式及颜色变体成功'
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '获取服装款式及颜色变体失败'
    }
  }
}

/**
 * 获取所有产品类别
 * GET /api/v1/categories
 */
export async function getAllCategories(): Promise<ApiResponse<Category[]>> {
  try {
      const response = await api.get('/categories')
    
    return {
      success: true,
      data: response.data,
      message: '获取产品类别成功'
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '获取产品类别失败'
    }
  }
}