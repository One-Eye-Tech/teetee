import { config } from '../config'

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

export interface UpdateUserProfile {
  username?: string
  personalProfile?: string
  avatar?: string
  gender?: string
}

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

export interface Size {
  id: number
  name: string
  orderIndex: number
  categoryId: number
  categoryName: string
  styleId?: number
  styleName?: string
  createdTime: string
}

export interface Color {
  id: number
  name: string
  categoryId: number
  categoryName: string
  createdTime: string
}

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

export interface Category {
  id: number
  name: string
  createdTime: string
}

const KEY_USERS = 'lite_users'
const KEY_USER = 'userInfo'
const KEY_TOKEN = 'authToken'
const KEY_REMEMBER = 'rememberMe'
const KEY_EXPIRES = 'tokenExpiresIn'
const KEY_ADDR = 'lite_addresses'

const nowIso = () => new Date().toISOString()

const defaultUsers: User[] = [
  { id: 29, username: '蓝几1', phone: '13800138000', avatar: '/icons/profile.png', roleId: 2, enabled: true, createdTime: nowIso(), updatedTime: nowIso() },
  { id: 37, username: '18729777', phone: '13800138001', avatar: '/icons/profile.png', roleId: 2, enabled: true, createdTime: nowIso(), updatedTime: nowIso() }
]

const categories: Category[] = [
  { id: 1, name: '其他', createdTime: nowIso() },
  { id: 2, name: '动漫', createdTime: nowIso() },
  { id: 3, name: '宠物', createdTime: nowIso() },
  { id: 4, name: '家人', createdTime: nowIso() },
  { id: 5, name: '自拍', createdTime: nowIso() },
  { id: 6, name: '风景', createdTime: nowIso() }
]

const styleList: ClothingStyle[] = [
  { id: 3, name: 'T恤', description: '上装', category: '上装', basePrice: 109, isActive: true, sortOrder: 0, colorVariants: [], createdAt: nowIso(), updatedAt: nowIso() },
  { id: 4, name: '圆领卫衣', description: '上装', category: '上装', basePrice: 199, isActive: true, sortOrder: 0, colorVariants: [], createdAt: nowIso(), updatedAt: nowIso() },
  { id: 5, name: '连帽卫衣', description: '上装', category: '上装', basePrice: 189, isActive: true, sortOrder: 0, colorVariants: [], createdAt: nowIso(), updatedAt: nowIso() }
]

const sizes: Size[] = [
  { id: 20, name: 'S', orderIndex: 0, categoryId: 6, categoryName: '风景', styleId: 3, styleName: 'T恤', createdTime: nowIso() },
  { id: 21, name: 'M', orderIndex: 0, categoryId: 6, categoryName: '风景', styleId: 3, styleName: 'T恤', createdTime: nowIso() },
  { id: 22, name: 'L', orderIndex: 0, categoryId: 6, categoryName: '风景', styleId: 3, styleName: 'T恤', createdTime: nowIso() },
  { id: 23, name: 'XL', orderIndex: 0, categoryId: 6, categoryName: '风景', styleId: 3, styleName: 'T恤', createdTime: nowIso() },
  { id: 25, name: '2XL', orderIndex: 0, categoryId: 6, categoryName: '风景', styleId: 3, styleName: 'T恤', createdTime: nowIso() },
  { id: 26, name: 'S', orderIndex: 0, categoryId: 6, categoryName: '风景', styleId: 5, styleName: '连帽卫衣', createdTime: nowIso() },
  { id: 27, name: 'M', orderIndex: 0, categoryId: 6, categoryName: '风景', styleId: 5, styleName: '连帽卫衣', createdTime: nowIso() },
  { id: 28, name: 'L', orderIndex: 0, categoryId: 6, categoryName: '风景', styleId: 5, styleName: '连帽卫衣', createdTime: nowIso() },
  { id: 29, name: 'XL', orderIndex: 0, categoryId: 6, categoryName: '风景', styleId: 5, styleName: '连帽卫衣', createdTime: nowIso() },
  { id: 30, name: '2XL', orderIndex: 0, categoryId: 6, categoryName: '风景', styleId: 5, styleName: '连帽卫衣', createdTime: nowIso() },
  { id: 31, name: 'S', orderIndex: 0, categoryId: 6, categoryName: '风景', styleId: 4, styleName: '圆领卫衣', createdTime: nowIso() },
  { id: 32, name: 'M', orderIndex: 0, categoryId: 6, categoryName: '风景', styleId: 4, styleName: '圆领卫衣', createdTime: nowIso() },
  { id: 33, name: 'L', orderIndex: 0, categoryId: 6, categoryName: '风景', styleId: 4, styleName: '圆领卫衣', createdTime: nowIso() },
  { id: 34, name: 'XL', orderIndex: 0, categoryId: 6, categoryName: '风景', styleId: 4, styleName: '圆领卫衣', createdTime: nowIso() },
  { id: 35, name: '2XL', orderIndex: 0, categoryId: 6, categoryName: '风景', styleId: 4, styleName: '圆领卫衣', createdTime: nowIso() }
]

type StyleColorRow = {
  id: number
  name: string
  styleId: number
}

// 与数据库 colors 表保持一致（按 style_id 维护）
const styleColorRows: StyleColorRow[] = [
  // style_id = 3, T恤
  { id: 9, name: '白色', styleId: 3 },
  { id: 10, name: '黑色', styleId: 3 },
  { id: 11, name: '浅灰色', styleId: 3 },
  { id: 12, name: '深灰色', styleId: 3 },
  { id: 15, name: '深棕色', styleId: 3 },
  { id: 16, name: '橄榄绿', styleId: 3 },
  { id: 17, name: '浅粉', styleId: 3 },

  // style_id = 5, 连帽卫衣
  { id: 18, name: '白色', styleId: 5 },
  { id: 19, name: '黑色', styleId: 5 },
  { id: 20, name: '浅灰色', styleId: 5 },
  { id: 21, name: '深灰色', styleId: 5 },
  { id: 22, name: '深棕色', styleId: 5 },
  { id: 24, name: '橄榄绿', styleId: 5 },
  { id: 26, name: '浅粉色', styleId: 5 },
  { id: 27, name: '深蓝色', styleId: 5 },

  // style_id = 4, 圆领卫衣
  { id: 28, name: '白色', styleId: 4 },
  { id: 29, name: '黑色', styleId: 4 },
  { id: 30, name: '浅灰色', styleId: 4 },
  { id: 31, name: '深灰色', styleId: 4 },
  { id: 33, name: '深棕色', styleId: 4 },
  { id: 34, name: '橄榄绿', styleId: 4 },
  { id: 35, name: '深蓝色', styleId: 4 }
]

const styleNameMap: Record<number, string> = {
  3: 'T恤',
  4: '圆领卫衣',
  5: '连帽卫衣'
}

const stylePriceMap: Record<number, number> = {
  3: 109,
  4: 199,
  5: 189
}

function getModelFrontImage(styleId: number, colorId: number): string {
  // 兼容你已存在的 T恤 4 张图片
  if (styleId === 3 && colorId === 9) return '/images/tshirt_white.png'
  if (styleId === 3 && colorId === 10) return '/images/tshirt_black.png'
  if (styleId === 3 && colorId === 11) return '/images/tshirt_grey1.png'
  if (styleId === 3 && colorId === 12) return '/images/tshirt_grey2.png'

  // 其余颜色图片按规则命名，你后续补图即可自动生效
  return `/images/style_${styleId}_color_${colorId}_front.png`
}

function getModelBackImage(styleId: number, colorId: number): string {
  return `/images/style_${styleId}_color_${colorId}_back.png`
}

const colors: Color[] = styleColorRows.map((row) => ({
  id: row.id,
  name: row.name,
  categoryId: 6,
  categoryName: '风景',
  createdTime: nowIso()
}))

const models: Model[] = styleColorRows.map((row) => ({
  id: row.id,
  categoryId: 6,
  categoryName: '风景',
  frontUrl: getModelFrontImage(row.styleId, row.id),
  backUrl: getModelBackImage(row.styleId, row.id),
  priceR: stylePriceMap[row.styleId] || 99,
  onShelves: true,
  color: row.name,
  name: `${row.name}${styleNameMap[row.styleId] || '服装'}`,
  description: `${styleNameMap[row.styleId] || '服装'} ${row.name}`,
  styleId: row.styleId,
  styleName: styleNameMap[row.styleId] || '服装',
  createdTime: nowIso(),
  updatedTime: nowIso()
}))

function loadUsers(): User[] {
  const raw = localStorage.getItem(KEY_USERS)
  if (!raw) {
    localStorage.setItem(KEY_USERS, JSON.stringify(defaultUsers))
    return [...defaultUsers]
  }
  try {
    return JSON.parse(raw) as User[]
  } catch {
    return [...defaultUsers]
  }
}

function saveUsers(users: User[]) {
  localStorage.setItem(KEY_USERS, JSON.stringify(users))
}

function loadAddresses(): Address[] {
  const raw = localStorage.getItem(KEY_ADDR)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Address[]
  } catch {
    return []
  }
}

function saveAddresses(list: Address[]) {
  localStorage.setItem(KEY_ADDR, JSON.stringify(list))
}

function setLoginStorage(loginData: LoginResponse, rememberMe: boolean) {
  const storage = rememberMe ? localStorage : sessionStorage
  const fallback = rememberMe ? sessionStorage : localStorage
  storage.setItem(KEY_TOKEN, loginData.token)
  storage.setItem(KEY_USER, JSON.stringify(loginData.user))
  storage.setItem(KEY_EXPIRES, String(loginData.expiresIn || 86400))
  if (rememberMe) {
    localStorage.setItem(KEY_REMEMBER, 'true')
  } else {
    localStorage.removeItem(KEY_REMEMBER)
  }
  fallback.removeItem(KEY_TOKEN)
  fallback.removeItem(KEY_USER)
  fallback.removeItem(KEY_EXPIRES)
}

export const api = {
  get: async (_url: string, _config?: any) => ({ data: {} }),
  post: async (_url: string, _data?: any, _config?: any) => ({ data: {} }),
  put: async (_url: string, _data?: any, _config?: any) => ({ data: {} }),
  delete: async (_url: string, _config?: any) => ({ data: {} })
}

export async function sendResetPasswordCode(_phone: string): Promise<ApiResponse> {
  return { success: true, message: '静态演示模式：验证码已发送（模拟）' }
}

export async function resetPassword(_phone: string, _password: string): Promise<ApiResponse> {
  return { success: true, message: '静态演示模式：密码已重置（模拟）' }
}

export async function loginOrRegisterByCode(phone: string, _code: string, rememberMe = false): Promise<ApiResponse<LoginResponse>> {
  return loginByPassword(phone, 'mock', rememberMe)
}

export async function loginByPassword(phone: string, _password: string, rememberMe = false): Promise<ApiResponse<LoginResponse>> {
  const users = loadUsers()
  let user = users.find((u) => u.phone === phone)
  if (!user) {
    user = {
      id: users.length ? Math.max(...users.map((u) => u.id)) + 1 : 100,
      username: `用户${phone.slice(-4)}`,
      phone,
      avatar: '/icons/profile.png',
      roleId: 2,
      enabled: true,
      createdTime: nowIso(),
      updatedTime: nowIso()
    }
    users.push(user)
    saveUsers(users)
  }
  const loginData: LoginResponse = {
    token: `mock_token_${user.id}_${Date.now()}`,
    tokenType: 'Bearer',
    expiresIn: rememberMe ? 7 * 24 * 3600 : 24 * 3600,
    user
  }
  setLoginStorage(loginData, rememberMe)
  return { success: true, data: loginData, message: '登录成功（静态模式）' }
}

export async function getCurrentUser(): Promise<ApiResponse<User>> {
  const user = getStoredUser()
  if (!user) return { success: false, message: '未登录' }
  return { success: true, data: user, message: '获取用户成功' }
}

export async function validateToken(token: string): Promise<ApiResponse<boolean>> {
  if (!token) return { success: false, data: false, message: '无 token' }
  if (token.startsWith('mock_token_')) return { success: true, data: true, message: 'mock token valid' }
  return { success: false, data: false, message: 'token invalid' }
}

export async function sendRegisterCode(_phone: string): Promise<ApiResponse> {
  return { success: true, message: '静态演示模式：注册验证码已发送（模拟）' }
}

export async function verifyRegisterCode(_phone: string, _code: string): Promise<ApiResponse<boolean>> {
  return { success: true, data: true, message: '验证码正确（模拟）' }
}

export async function registerUser(phone: string, _password: string, _code?: string): Promise<ApiResponse<User>> {
  const result = await loginByPassword(phone, 'mock', true)
  if (!result.success || !result.data) return { success: false, message: '注册失败' }
  return { success: true, data: result.data.user, message: '注册成功' }
}

export async function sendAdminCode(_phone: string): Promise<ApiResponse> {
  return { success: true, message: '静态演示模式：管理员验证码已发送（模拟）' }
}

export async function adminLogin(_phone: string, _code: string): Promise<ApiResponse<{ token: string }>> {
  const token = `mock_admin_token_${Date.now()}`
  localStorage.setItem('adminToken', token)
  return { success: true, data: { token }, message: '管理员登录成功（模拟）' }
}

export function logout(): void {
  localStorage.removeItem(KEY_TOKEN)
  localStorage.removeItem(KEY_USER)
  localStorage.removeItem(KEY_REMEMBER)
  localStorage.removeItem(KEY_EXPIRES)
  localStorage.removeItem('adminToken')
  sessionStorage.removeItem(KEY_TOKEN)
  sessionStorage.removeItem(KEY_USER)
  sessionStorage.removeItem(KEY_EXPIRES)
}

export function getStoredUser(): User | null {
  const text = localStorage.getItem(KEY_USER) || sessionStorage.getItem(KEY_USER)
  if (!text) return null
  try {
    return JSON.parse(text) as User
  } catch {
    return null
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(KEY_TOKEN) || sessionStorage.getItem(KEY_TOKEN)
}

export function isLoggedIn(): boolean {
  return !!getStoredToken()
}

export function isRememberMe(): boolean {
  return localStorage.getItem(KEY_REMEMBER) === 'true'
}

export function getTokenExpiresIn(): number {
  const raw = localStorage.getItem(KEY_EXPIRES) || sessionStorage.getItem(KEY_EXPIRES)
  return raw ? Number(raw) : 0
}

export function isTokenExpiringSoon(): boolean {
  const expiresIn = getTokenExpiresIn()
  return expiresIn > 0 && expiresIn < 3600
}

export interface LoginResult {
  success: boolean
  user?: { id: string; phone: string; userName?: string; roleId?: string }
  message?: string
}

export async function login(phone: string, password: string, rememberMe: boolean): Promise<LoginResult> {
  const result = await loginByPassword(phone, password, rememberMe)
  if (!result.success || !result.data) return { success: false, message: result.message }
  return {
    success: true,
    user: {
      id: String(result.data.user.id),
      phone: result.data.user.phone,
      userName: result.data.user.username,
      roleId: String(result.data.user.roleId)
    }
  }
}

export async function updateCurrentUserProfile(profileData: UpdateUserProfile): Promise<ApiResponse<User>> {
  const user = getStoredUser()
  if (!user) return { success: false, message: '未登录' }
  const nextUser: User = { ...user, ...profileData, updatedTime: nowIso() }
  const users = loadUsers().map((u) => (u.id === user.id ? nextUser : u))
  saveUsers(users)
  const remember = isRememberMe()
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(KEY_USER, JSON.stringify(nextUser))
  return { success: true, data: nextUser, message: '更新成功' }
}

export async function uploadUserAvatar(file: File): Promise<ApiResponse<string>> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      resolve({ success: true, data: String(reader.result || ''), message: '头像上传成功' })
    }
    reader.readAsDataURL(file)
  })
}

export async function getUserAddresses(): Promise<ApiResponse<Address[]>> {
  const user = getStoredUser()
  if (!user) return { success: false, message: '未登录' }
  const list = loadAddresses().filter((a) => a.userId === user.id)
  return { success: true, data: list, message: '获取成功' }
}

export async function deleteAddress(addressId: number): Promise<ApiResponse<void>> {
  const list = loadAddresses()
  saveAddresses(list.filter((a) => a.id !== addressId))
  return { success: true, message: '删除成功' }
}

export async function addAddress(addressData: AddressRequest): Promise<ApiResponse<Address>> {
  const user = getStoredUser()
  if (!user) return { success: false, message: '未登录' }
  const list = loadAddresses()
  const id = list.length ? Math.max(...list.map((a) => a.id)) + 1 : 1
  const next: Address = {
    id,
    userId: user.id,
    recipientName: addressData.recipientName,
    phoneNumber: addressData.phoneNumber,
    province: addressData.province,
    city: addressData.city,
    area: addressData.area,
    detailedAddress: addressData.detailedAddress,
    isDefault: false,
    createdTime: nowIso(),
    updatedTime: nowIso()
  }
  list.push(next)
  saveAddresses(list)
  return { success: true, data: next, message: '添加成功' }
}

export async function updateAddress(addressId: number, addressData: AddressRequest): Promise<ApiResponse<Address>> {
  const list = loadAddresses()
  const idx = list.findIndex((a) => a.id === addressId)
  if (idx < 0) return { success: false, message: '地址不存在' }
  const next: Address = {
    ...list[idx],
    recipientName: addressData.recipientName,
    phoneNumber: addressData.phoneNumber,
    province: addressData.province,
    city: addressData.city,
    area: addressData.area,
    detailedAddress: addressData.detailedAddress,
    updatedTime: nowIso()
  }
  list[idx] = next
  saveAddresses(list)
  return { success: true, data: next, message: '更新成功' }
}

export async function getAllSizes(categoryId?: number, styleId?: number): Promise<ApiResponse<Size[]>> {
  let data = [...sizes]
  if (categoryId) data = data.filter((s) => s.categoryId === categoryId)
  if (styleId) data = data.filter((s) => s.styleId === styleId)
  return { success: true, data, message: '获取尺码成功' }
}

export async function getAllColors(categoryId?: number, styleId?: number): Promise<ApiResponse<Color[]>> {
  let data = [...colors]
  if (categoryId) data = data.filter((c) => c.categoryId === categoryId)
  if (styleId) {
    const colorIds = new Set(styleColorRows.filter((row) => row.styleId === styleId).map((row) => row.id))
    data = data.filter((c) => colorIds.has(c.id))
  }
  return { success: true, data, message: '获取颜色成功' }
}

export async function getAllModels(): Promise<ApiResponse<Model[]>> {
  return { success: true, data: [...models], message: '获取模型成功' }
}

export async function getModelsByStyle(styleId: number): Promise<ApiResponse<Model[]>> {
  return { success: true, data: models.filter((m) => m.styleId === styleId), message: '获取模型成功' }
}

export async function getAllActiveClothingStyles(): Promise<ApiResponse<ClothingStyle[]>> {
  return { success: true, data: [...styleList], message: '获取款式成功' }
}

export async function getAllActiveClothingStylesWithColors(): Promise<ApiResponse<ClothingStyle[]>> {
  const merged = styleList.map((style) => ({
    ...style,
    colorVariants: models.filter((m) => m.styleId === style.id)
  }))
  return { success: true, data: merged, message: '获取款式成功' }
}

export async function getAllCategories(): Promise<ApiResponse<Category[]>> {
  return { success: true, data: [...categories], message: '获取分类成功' }
}

if (!config.USE_MOCK) {
  console.warn('[authApiLite] 当前仍为静态模式实现，未接入后端。')
}
