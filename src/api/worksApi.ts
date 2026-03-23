import { api } from './authApi'
import { config } from '../config'

// Works相关的类型定义
export interface WorksDto {
  id: number
  userId: number
  name: string
  originalImage: string
  workImage: string
  createdTime: string
  styles?: number
  userName?: string
  userAvatar?: string
  likesCount?: number
  isLiked?: boolean
}

// 获取指定用户的作品列表
export const getUserWorks = async (userId: number, currentUserId?: number): Promise<WorksDto[]> => {
  // 如果使用 Mock 模式，动态导入 Mock 实现
  if (config.USE_MOCK) {
    const mockApi = await import('./mock/worksApiMock')
    return mockApi.getUserWorks(userId, currentUserId)
  }
  
  try {
    const params = currentUserId ? { currentUserId } : {}
    const response = await api.get(`/v1/works/user/${userId}`, { params })
    return response.data
  } catch (error) {
    console.error('获取用户作品列表失败:', error)
    throw error
  }
}

// 获取最新作品列表
export const getLatestWorks = async (currentUserId?: number, categoryId?: number | null): Promise<WorksDto[]> => {
  // 如果使用 Mock 模式，动态导入 Mock 实现
  if (config.USE_MOCK) {
    console.log('[worksApi] 使用 Mock 数据获取作品列表')
    const mockApi = await import('./mock/worksApiMock')
    return mockApi.getLatestWorks(currentUserId, categoryId)
  }
  
  console.log('[worksApi] 使用真实 API 获取作品列表')
  try {
    const params: any = {}
    if (currentUserId) params.currentUserId = currentUserId
    if (categoryId !== undefined && categoryId !== null) params.categoryId = categoryId
    
    const response = await api.get('/v1/works/latest', { params })
    return response.data
  } catch (error) {
    console.error('获取最新作品列表失败:', error)
    throw error
  }
}

// 获取作品详情
export const getWorksById = async (id: number, currentUserId?: number): Promise<WorksDto> => {
  // 如果使用 Mock 模式，动态导入 Mock 实现
  if (config.USE_MOCK) {
    const mockApi = await import('./mock/worksApiMock')
    return mockApi.getWorksById(id, currentUserId)
  }
  
  try {
    const params = currentUserId ? { currentUserId } : {}
    const response = await api.get(`/v1/works/${id}`, { params })
    return response.data
  } catch (error) {
    console.error('获取作品详情失败:', error)
    throw error
  }
}

// 搜索作品
export const searchWorks = async (name: string, currentUserId?: number): Promise<WorksDto[]> => {
  // 如果使用 Mock 模式，动态导入 Mock 实现
  if (config.USE_MOCK) {
    const mockApi = await import('./mock/worksApiMock')
    return mockApi.searchWorks(name, currentUserId)
  }
  
  try {
    const params = { name, ...(currentUserId ? { currentUserId } : {}) }
    const response = await api.get('/v1/works/search', { params })
    return response.data
  } catch (error) {
    console.error('搜索作品失败:', error)
    throw error
  }
}

// 发布作品接口请求参数
export interface PublishWorkRequest {
  userId: number
  name: string
  originalImage: string
  workImage: string
  styles?: number  // 款式ID（可选）
}

// 发布作品
export const publishWork = async (workData: PublishWorkRequest): Promise<WorksDto> => {
  // 如果使用 Mock 模式，动态导入 Mock 实现
  if (config.USE_MOCK) {
    const mockApi = await import('./mock/worksApiMock')
    return mockApi.publishWork(workData)
  }
  
  try {
    const response = await api.post('/v1/works', workData)
    return response.data
  } catch (error) {
    console.error('发布作品失败:', error)
    throw error
  }
}

// 删除作品（包括相关点赞记录）
export const deleteWork = async (workId: number, userId: number): Promise<void> => {
  // 如果使用 Mock 模式，动态导入 Mock 实现
  if (config.USE_MOCK) {
    const mockApi = await import('./mock/worksApiMock')
    return mockApi.deleteWork(workId, userId)
  }
  
  try {
    await api.delete(`/v1/works/${workId}`, {
      params: { 
        userId,
        cascade: true  // 添加级联删除参数，提示后端同时删除相关记录
      }
    })
    console.log('删除作品成功:', workId)
  } catch (error) {
    console.error('删除作品失败:', error)
    throw error
  }
}