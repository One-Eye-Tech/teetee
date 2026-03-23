/**
 * 应用配置文件
 * 统一管理所有环境配置
 */

// 获取API基础URL
const getApiBaseUrl = (): string => {
  // 1. 优先使用环境变量（如果设置了的话）
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  
  // 2. 根据构建模式自动判断
  if (import.meta.env.PROD) {
    // 生产环境 - 使用反向代理的相对路径
    // 这样前端和后端会使用同一个域名，通过 Nginx 反向代理到后端
    return '/api'  // 返回/api前缀，配合反向代理
  }
  
  // 3. 开发环境 - 直接使用后端完整URL（绕过代理问题）
  /* return 'http://localhost:8080/api' */
  return 'http://192.168.1.63:8080/api'
}

// 是否使用 Mock 数据
const useMockData = (): boolean => {
  return import.meta.env.VITE_USE_MOCK === 'true'
}

// 导出配置
export const config = {
  // API 基础地址
  API_BASE_URL: getApiBaseUrl(),
  
  // 是否使用 Mock 数据
  USE_MOCK: useMockData(),
  
  // 请求超时时间（毫秒）
  REQUEST_TIMEOUT: 10000,
  
  // 是否为开发环境
  IS_DEV: import.meta.env.DEV,
  
  // 是否为生产环境
  IS_PROD: import.meta.env.PROD,
  
  // 应用版本
  APP_VERSION: '1.0.0'
}

// 输出配置信息到控制台
console.log('=== 应用配置 ===')
console.log('USE_MOCK:', config.USE_MOCK)
console.log('API_BASE_URL:', config.API_BASE_URL)
console.log('IS_DEV:', config.IS_DEV)
console.log('IS_PROD:', config.IS_PROD)
console.log('VITE_USE_MOCK env:', import.meta.env.VITE_USE_MOCK)
console.log('================')

// 为了向后兼容，也导出单独的 API_BASE_URL
export const API_BASE_URL = config.API_BASE_URL

// 默认导出配置对象
export default config