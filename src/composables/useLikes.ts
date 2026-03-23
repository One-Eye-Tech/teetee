import { ref, reactive } from 'vue'
import { toggleLike as toggleLikeAPI } from '../api/likesApi'

// 全局点赞状态管理
const likeUpdates = ref(0) // 用于触发响应式更新的计数器
const likesMap = reactive(new Map<number, { isLiked: boolean; likesCount: number }>())

export const useLikes = () => {
  // 更新作品的点赞状态
  const updateWorkLikeStatus = (worksId: number, isLiked: boolean, likesCount: number) => {
    likesMap.set(worksId, { isLiked, likesCount })
    likeUpdates.value++ // 触发依赖此状态的组件更新
  }

  // 获取作品的点赞状态
  const getWorkLikeStatus = (worksId: number) => {
    return likesMap.get(worksId)
  }

  // 切换点赞状态的统一方法
  const toggleWorkLike = async (userId: number, worksId: number, _currentLikedStatus: boolean, currentLikesCount: number = 0) => {
    try {
      // 调用后端API切换点赞状态
      const newLikedStatus = await toggleLikeAPI(userId, worksId)
      
      // 计算新的点赞数量
      let newLikesCount: number
      if (newLikedStatus) {
        newLikesCount = (currentLikesCount || 0) + 1
      } else {
        newLikesCount = Math.max((currentLikesCount || 1) - 1, 0)
      }
      
      // 更新全局状态
      updateWorkLikeStatus(worksId, newLikedStatus, newLikesCount)
      
      console.log('全局点赞状态更新成功:', { worksId, isLiked: newLikedStatus, likesCount: newLikesCount })
      
      return { isLiked: newLikedStatus, likesCount: newLikesCount }
    } catch (error) {
      console.error('点赞操作失败:', error)
      throw error
    }
  }

  // 初始化作品的点赞状态
  const initWorkLikeStatus = (worksId: number, isLiked: boolean, likesCount: number) => {
    if (!likesMap.has(worksId)) {
      likesMap.set(worksId, { isLiked, likesCount })
    }
  }

  return {
    likeUpdates, // 响应式更新触发器
    updateWorkLikeStatus,
    getWorkLikeStatus,
    toggleWorkLike,
    initWorkLikeStatus
  }
}