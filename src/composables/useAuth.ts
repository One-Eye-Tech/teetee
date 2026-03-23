import { ref, computed } from 'vue'
import { getCurrentUser, getStoredUser, getStoredToken } from '../api/authApiLite'
import { useSingleSignOn } from './useSingleSignOn'

// 全局状态
const currentUser = ref(getStoredUser())
const token = ref(getStoredToken())

/**
 * 用户认证状态管理
 */
export function useAuth() {
  // 计算属性
  const isLoggedIn = computed(() => !!currentUser.value && !!token.value)
  
  const avatarUrl = computed(() => {
    return currentUser.value?.avatar || '/icons/profile.png'
  })
  
  const displayName = computed(() => {
    return currentUser.value?.username || currentUser.value?.phone || '用户'
  })

  // 获取当前用户信息
  const fetchCurrentUser = async () => {
    if (!token.value) return null
    
    try {
      const result = await getCurrentUser()
      if (result.success && result.data) {
        currentUser.value = result.data
        return result.data
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
    return null
  }

  // 设置用户信息
  const setUser = (user: any) => {
    currentUser.value = user
  }

  // 设置token
  const setToken = (newToken: string) => {
    token.value = newToken
    // 集成单点登录
    const { login } = useSingleSignOn()
    login(newToken)
  }

  // 清除用户信息
  const clearUser = () => {
    currentUser.value = null
    token.value = null
    console.log('useAuth: 已清除用户状态')
  }

  // 登出
  const logout = () => {
    // 使用单点登录的登出功能
    const { logout: ssoLogout } = useSingleSignOn()
    ssoLogout()
    
    // 清除状态
    clearUser()
  }

  return {
    currentUser,
    token,
    isLoggedIn,
    avatarUrl,
    displayName,
    fetchCurrentUser,
    setUser,
    setToken,
    clearUser,
    logout
  }
}