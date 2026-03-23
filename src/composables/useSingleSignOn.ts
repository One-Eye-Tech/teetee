import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Web端单点登录实现
 * 使用LocalStorage + StorageEvent实现跨标签页单点登录
 */

const SSO_KEY = 'sso_token'
const SSO_EVENT_KEY = 'sso_event'

export function useSingleSignOn() {
  const isLoggedIn = ref(false)
  const currentToken = ref<string | null>(null)

  // 检查登录状态
  const checkLoginStatus = async () => {
    const localToken = localStorage.getItem('authToken')
    const sessionToken = sessionStorage.getItem('authToken')
    const ssoToken = localStorage.getItem(SSO_KEY)
    
    // 调试信息
    console.log('检查登录状态:', {
      localToken: localToken ? localToken.substring(0, 20) + '...' : null,
      sessionToken: sessionToken ? sessionToken.substring(0, 20) + '...' : null,
      ssoToken: ssoToken ? ssoToken.substring(0, 20) + '...' : null
    })
    
    // 优先使用localStorage中的token，然后是sessionStorage
    const token = localToken || sessionToken
    
    if (token) {
      // 更新SSO token以保持同步
      localStorage.setItem(SSO_KEY, token)
      
      // 先进行本地验证
      const isLocalValid = !isTokenExpired(token)
      
      if (isLocalValid) {
        isLoggedIn.value = true
        currentToken.value = token
        console.log('Token本地验证通过，用户已登录')
        
        // 异步进行服务器验证，但不阻塞登录状态
        validateTokenWithServer(token).then(isServerValid => {
          if (!isServerValid) {
            console.warn('服务器验证失败，但保持本地登录状态')
          } else {
            console.log('服务器验证也通过')
          }
        }).catch(error => {
          console.warn('服务器验证出错，保持本地登录状态:', error)
        })
      } else {
        console.log('Token本地验证失败（已过期），执行登出')
        logout()
      }
    } else {
      isLoggedIn.value = false
      currentToken.value = null
      console.log('未找到有效token，用户未登录')
    }
  }

  // 登录
  const login = (token: string) => {
    // 不再强制覆盖token存储位置，尊重authApi的存储策略
    // authApi已经根据rememberMe参数决定了存储位置
    
    // 设置SSO token用于跨标签页同步
    localStorage.setItem(SSO_KEY, token)
    
    // 广播登录事件到其他标签页
    localStorage.setItem(SSO_EVENT_KEY, JSON.stringify({
      type: 'login',
      token: token,
      timestamp: Date.now()
    }))
    
    isLoggedIn.value = true
    currentToken.value = token
    
    console.log('SSO登录状态已设置:', {
      token: token.substring(0, 20) + '...',
      ssoToken: token.substring(0, 20) + '...'
    })
  }

  // 登出
  const logout = () => {
    // 清除所有token和用户信息
    localStorage.removeItem('authToken')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('rememberMe')
    localStorage.removeItem('tokenExpiresIn')
    sessionStorage.removeItem('authToken')
    sessionStorage.removeItem('userInfo')
    sessionStorage.removeItem('tokenExpiresIn')
    localStorage.removeItem(SSO_KEY)
    
    // 广播登出事件到其他标签页
    localStorage.setItem(SSO_EVENT_KEY, JSON.stringify({
      type: 'logout',
      timestamp: Date.now()
    }))
    
    isLoggedIn.value = false
    currentToken.value = null
    
    console.log('SSO登出完成，已清除所有认证信息')
    
    // 移除重定向到 /login 页面的代码，以支持弹窗登录
    // window.location.href = '/login' 
  }

  // 处理storage事件（跨标签页通信）
  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === SSO_EVENT_KEY && event.newValue) {
      try {
        const data = JSON.parse(event.newValue)
        
        if (data.type === 'login') {
          // 其他标签页登录了，同步登录状态
          if (data.token !== currentToken.value) {
            // 不强制覆盖存储位置，只同步状态
            isLoggedIn.value = true
            currentToken.value = data.token
            console.log('检测到其他标签页登录，已同步登录状态')
          }
        } else if (data.type === 'logout') {
          // 其他标签页登出了，同步登出状态
          if (isLoggedIn.value) {
            // 完全清除认证信息
            localStorage.removeItem('authToken')
            localStorage.removeItem('userInfo')
            localStorage.removeItem('rememberMe')
            localStorage.removeItem('tokenExpiresIn')
            sessionStorage.removeItem('authToken')
            sessionStorage.removeItem('userInfo')
            sessionStorage.removeItem('tokenExpiresIn')
            isLoggedIn.value = false
            currentToken.value = null
            console.log('检测到其他标签页登出，已同步登出状态')
            // 也移除这里的重定向
            // window.location.href = '/login'
          }
        }
      } catch (error) {
        console.error('处理SSO事件失败:', error)
      }
    }
  }

  // 检查token是否过期
  const isTokenExpired = (token: string): boolean => {
    try {
      // 纯前端静态模式下的模拟 token 不做 JWT 过期校验
      if (token.startsWith('mock_token_')) {
        return false
      }
      if (!token || token.split('.').length !== 3) {
        return true
      }
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Date.now() / 1000
      // 修复：只在真正过期时判断过期，不提前判断
      return payload.exp < now
    } catch {
      return true
    }
  }

  // 验证token有效性（包括服务器端验证）
  const validateTokenWithServer = async (token: string): Promise<boolean> => {
    try {
      // 先检查本地过期时间
      if (isTokenExpired(token)) {
        console.log('Token本地验证：已过期')
        return false
      }
      
      console.log('开始服务器Token验证...')
      
      // 发送验证请求到服务器（修复：使用Authorization header）
      const response = await fetch('/api/auth/validate', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Device-Id': localStorage.getItem('deviceId') || ''
        }
      })
      
      console.log('服务器验证响应:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      })
      
      if (response.ok) {
        console.log('服务器Token验证：通过')
        return true
      } else {
        console.warn('服务器Token验证：失败', response.status, response.statusText)
        // 如果是网络问题或服务器错误，回退到本地验证
        if (response.status >= 500 || response.status === 0) {
          console.log('服务器错误，回退到本地验证')
          return !isTokenExpired(token)
        }
        return false
      }
    } catch (error) {
      console.warn('服务器Token验证失败，使用本地验证:', error)
      // 网络错误时，回退到本地验证
      return !isTokenExpired(token)
    }
  }

  // 定期检查token状态
  const startTokenCheck = () => {
    const interval = setInterval(() => {
      if (currentToken.value && isTokenExpired(currentToken.value)) {
        console.log('Token已过期，执行登出')
        logout()
      }
    }, 5 * 60000) // 修复：改为每5分钟检查一次，减少频率

    return () => clearInterval(interval)
  }

  onMounted(async () => {
    // 初始化时立即检查登录状态和Token有效性
    await checkLoginStatus()
    
    // 监听storage事件
    window.addEventListener('storage', handleStorageEvent)
    
    // 开始token检查
    const stopTokenCheck = startTokenCheck()
    
    // 清理函数
    onUnmounted(() => {
      window.removeEventListener('storage', handleStorageEvent)
      stopTokenCheck()
    })
  })

  return {
    isLoggedIn,
    currentToken,
    login,
    logout,
    checkLoginStatus
  }
}