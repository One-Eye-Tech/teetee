// @ts-nocheck
// Likes API Mock 实现
import { 
  toggleLike as toggleMockLike,
  checkIsLiked,
  getUserLikedWorks
} from '../../mocks/likes'
import { getWorkById } from '../../mocks/works'

// 延迟函数，模拟网络请求
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms))

// 切换点赞状态
export const toggleLike = async (userId: number, worksId: number): Promise<boolean> => {
  await delay()
  return toggleMockLike(userId, worksId)
}

// 检查是否已点赞
export const checkLikeStatus = async (userId: number, worksId: number): Promise<boolean> => {
  await delay()
  return checkIsLiked(userId, worksId)
}

// 获取用户点赞的作品列表
export const getUserLikes = async (userId: number): Promise<any[]> => {
  await delay()
  const likedWorksIds = getUserLikedWorks(userId)
  
  // 获取完整的作品信息
  const works = likedWorksIds
    .map(id => getWorkById(id))
    .filter(work => work !== undefined)
  
  return works
}

// 获取用户点赞列表（包含点赞时间）
export const getUserLikesList = async (userId: number): Promise<any[]> => {
  await delay()
  const likes = await getUserLikes(userId)
  
  // 添加作品信息
  return likes.map(like => {
    return {
      ...like,
      work: like
    }
  })
}
