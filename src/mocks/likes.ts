// 点赞 Mock 数据

export interface LikeMockData {
  id: number
  userId: number
  worksId: number
  createdTime: string
}

// 点赞存储
const LIKES_KEY = 'mock_likes'

// 获取所有点赞
export const getAllLikes = (): LikeMockData[] => {
  const likesStr = localStorage.getItem(LIKES_KEY)
  if (likesStr) {
    try {
      return JSON.parse(likesStr)
    } catch {
      return []
    }
  }
  return []
}

// 保存点赞
const saveLikes = (likes: LikeMockData[]): void => {
  localStorage.setItem(LIKES_KEY, JSON.stringify(likes))
}

// 检查是否已点赞
export const checkIsLiked = (userId: number, worksId: number): boolean => {
  const likes = getAllLikes()
  return likes.some(l => l.userId === userId && l.worksId === worksId)
}

// 切换点赞状态
export const toggleLike = (userId: number, worksId: number): boolean => {
  const likes = getAllLikes()
  const likeIndex = likes.findIndex(l => l.userId === userId && l.worksId === worksId)
  
  if (likeIndex !== -1) {
    // 已点赞，取消点赞
    likes.splice(likeIndex, 1)
    saveLikes(likes)
    return false
  } else {
    // 未点赞，添加点赞
    const newLike: LikeMockData = {
      id: Math.max(...likes.map(l => l.id), 0) + 1,
      userId,
      worksId,
      createdTime: new Date().toISOString()
    }
    likes.push(newLike)
    saveLikes(likes)
    return true
  }
}

// 获取作品的点赞数
export const getWorksLikesCount = (worksId: number): number => {
  const likes = getAllLikes()
  return likes.filter(l => l.worksId === worksId).length
}

// 获取用户点赞的作品列表
export const getUserLikedWorks = (userId: number): number[] => {
  const likes = getAllLikes()
  return likes.filter(l => l.userId === userId).map(l => l.worksId)
}

// 获取用户的所有点赞
export const getUserLikes = (userId: number): LikeMockData[] => {
  const likes = getAllLikes()
  return likes.filter(l => l.userId === userId)
}
