import { api } from './authApi'
import { type WorksDto } from './worksApi'
import { config } from '../config'

// 获取用户点赞的作品列表
export const getUserLikedWorks = async (userId: number): Promise<WorksDto[]> => {
  if (config.USE_MOCK) {
    const mockApi = await import('./mock/likesApiMock')
    return mockApi.getUserLikes(userId)
  }
  
  try {
    const response = await api.get(`/v1/likes/user/${userId}/works`)
    return response.data
  } catch (error) {
    console.error('获取用户点赞作品列表失败:', error)
    throw error
  }
}

// 点赞作品
export const likeWorks = async (userId: number, worksId: number): Promise<void> => {
  if (config.USE_MOCK) {
    const mockApi = await import('./mock/likesApiMock')
    await mockApi.toggleLike(userId, worksId)
    return
  }
  
  try {
    await api.post('/v1/likes', null, {
      params: { userId, worksId }
    })
  } catch (error) {
    console.error('点赞作品失败:', error)
    throw error
  }
}

// 取消点赞
export const unlikeWorks = async (userId: number, worksId: number): Promise<void> => {
  if (config.USE_MOCK) {
    const mockApi = await import('./mock/likesApiMock')
    await mockApi.toggleLike(userId, worksId)
    return
  }
  
  try {
    await api.delete('/v1/likes', {
      params: { userId, worksId }
    })
  } catch (error) {
    console.error('取消点赞失败:', error)
    throw error
  }
}

// 切换点赞状态
export const toggleLike = async (userId: number, worksId: number): Promise<boolean> => {
  if (config.USE_MOCK) {
    console.log('[likesApi] 使用 Mock 数据切换点赞状态')
    const mockApi = await import('./mock/likesApiMock')
    return mockApi.toggleLike(userId, worksId)
  }
  
  try {
    const response = await api.post(`/v1/likes/toggle`, null, {
      params: { userId, worksId }
    })
    return response.data.isLiked // 返回新的点赞状态，修复字段名
  } catch (error) {
    console.error('切换点赞状态失败:', error)
    throw error
  }
}

// 检查点赞状态
export const checkLikeStatus = async (userId: number, worksId: number): Promise<boolean> => {
  if (config.USE_MOCK) {
    const mockApi = await import('./mock/likesApiMock')
    return mockApi.checkLikeStatus(userId, worksId)
  }
  
  try {
    const response = await api.get(`/v1/likes/status`, {
      params: { userId, worksId }
    })
    return response.data.isLiked // 修复字段名保持一致
  } catch (error) {
    console.error('检查点赞状态失败:', error)
    throw error
  }
}

// 获取作品点赞数
export const getWorksLikesCount = async (worksId: number): Promise<number> => {
  if (config.USE_MOCK) {
    const { getWorksLikesCount: getMockCount } = await import('../mocks/likes')
    return getMockCount(worksId)
  }
  
  try {
    const response = await api.get(`/v1/likes/works/${worksId}/count`)
    return response.data
  } catch (error) {
    console.error('获取作品点赞数失败:', error)
    throw error
  }
}