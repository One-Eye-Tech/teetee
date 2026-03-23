// 用户 Mock 数据

export interface UserMockData {
  id: number
  username: string
  phone: string
  email?: string
  avatar?: string
  createdTime: string
}

// 默认用户数据
export const mockUsers: UserMockData[] = [
  {
    id: 1,
    username: '设计师小王',
    phone: '13800138000',
    email: 'wang@example.com',
    avatar: '/icons/profile.png',
    createdTime: '2024-01-01T00:00:00'
  },
  {
    id: 2,
    username: '创意达人',
    phone: '13800138001',
    email: 'creative@example.com',
    avatar: '/icons/profile.png',
    createdTime: '2024-01-02T00:00:00'
  },
  {
    id: 3,
    username: '艺术家李',
    phone: '13800138002',
    email: 'li@example.com',
    avatar: '/icons/profile.png',
    createdTime: '2024-01-03T00:00:00'
  },
  {
    id: 4,
    username: '简约派',
    phone: '13800138003',
    email: 'simple@example.com',
    avatar: '/icons/profile.png',
    createdTime: '2024-01-04T00:00:00'
  }
]

// 当前登录用户（存储在 localStorage）
const CURRENT_USER_KEY = 'mock_current_user'
const AUTH_TOKEN_KEY = 'authToken'

// 获取当前用户
export const getCurrentUser = (): UserMockData | null => {
  const userStr = localStorage.getItem(CURRENT_USER_KEY)
  if (userStr) {
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }
  return null
}

// 设置当前用户
export const setCurrentUser = (user: UserMockData | null): void => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
    // 同时设置一个 mock token
    localStorage.setItem(AUTH_TOKEN_KEY, `mock_token_${user.id}_${Date.now()}`)
  } else {
    localStorage.removeItem(CURRENT_USER_KEY)
    localStorage.removeItem(AUTH_TOKEN_KEY)
  }
}

// 模拟登录
export const mockLogin = (phone: string, _password: string): UserMockData | null => {
  const user = mockUsers.find(u => u.phone === phone)
  if (user) {
    setCurrentUser(user)
    return user
  }
  // 如果用户不存在，创建新用户
  const newUser: UserMockData = {
    id: Math.max(...mockUsers.map(u => u.id), 0) + 1,
    username: `用户${phone.slice(-4)}`,
    phone,
    avatar: '/icons/profile.png',
    createdTime: new Date().toISOString()
  }
  mockUsers.push(newUser)
  setCurrentUser(newUser)
  return newUser
}

// 模拟注册
export const mockRegister = (phone: string, username?: string): UserMockData => {
  const newUser: UserMockData = {
    id: Math.max(...mockUsers.map(u => u.id), 0) + 1,
    username: username || `用户${phone.slice(-4)}`,
    phone,
    avatar: '/icons/profile.png',
    createdTime: new Date().toISOString()
  }
  mockUsers.push(newUser)
  setCurrentUser(newUser)
  return newUser
}

// 模拟登出
export const mockLogout = (): void => {
  setCurrentUser(null)
}

// 更新用户信息
export const updateUser = (userId: number, updates: Partial<UserMockData>): UserMockData | null => {
  const userIndex = mockUsers.findIndex(u => u.id === userId)
  if (userIndex !== -1) {
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates }
    const currentUser = getCurrentUser()
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(mockUsers[userIndex])
    }
    return mockUsers[userIndex]
  }
  return null
}

// 根据ID获取用户
export const getUserById = (id: number): UserMockData | undefined => {
  return mockUsers.find(u => u.id === id)
}
