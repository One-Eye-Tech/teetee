// @ts-nocheck
// Works API Mock 实现
import type { WorksDto } from '../worksApi'
import { 
  getAllWorks, 
  getWorksByUserId, 
  getWorkById, 
  addWork,
  mockWorks 
} from '../../mocks/works'
import { getCurrentUser } from '../../mocks/users'
import { checkIsLiked, getWorksLikesCount } from '../../mocks/likes'

// 延迟函数，模拟网络请求
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms))

// 获取指定用户的作品列表
export const getUserWorks = async (userId: number, currentUserId?: number): Promise<WorksDto[]> => {
  await delay()
  const works = getWorksByUserId(userId)
  
  // 添加点赞信息
  return works.map(work => ({
    ...work,
    likesCount: getWorksLikesCount(work.id),
    isLiked: currentUserId ? checkIsLiked(currentUserId, work.id) : false
  }))
}

// 获取最新作品列表
export const getLatestWorks = async (currentUserId?: number, _categoryId?: number | null): Promise<WorksDto[]> => {
  await delay()
  const works = getAllWorks()
  
  // 按创建时间倒序排序
  works.sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime())
  
  // 添加点赞信息
  return works.map(work => ({
    ...work,
    likesCount: getWorksLikesCount(work.id),
    isLiked: currentUserId ? checkIsLiked(currentUserId, work.id) : false
  }))
}

// 获取作品详情
export const getWorksById = async (id: number, currentUserId?: number): Promise<WorksDto> => {
  await delay()
  const work = getWorkById(id)
  
  if (!work) {
    throw new Error('作品不存在')
  }
  
  return {
    ...work,
    likesCount: getWorksLikesCount(work.id),
    isLiked: currentUserId ? checkIsLiked(currentUserId, work.id) : false
  }
}

// 搜索作品
export const searchWorks = async (name: string, currentUserId?: number): Promise<WorksDto[]> => {
  await delay()
  const works = getAllWorks()
  
  // 简单的名称搜索
  const filtered = works.filter(work => 
    work.name.toLowerCase().includes(name.toLowerCase())
  )
  
  // 添加点赞信息
  return filtered.map(work => ({
    ...work,
    likesCount: getWorksLikesCount(work.id),
    isLiked: currentUserId ? checkIsLiked(currentUserId, work.id) : false
  }))
}

// 发布作品接口请求参数
export interface PublishWorkRequest {
  userId: number
  name: string
  originalImage: string
  workImage: string
  styles?: number
}

// 发布作品
export const publishWork = async (workData: PublishWorkRequest): Promise<WorksDto> => {
  await delay()
  
  const currentUser = getCurrentUser()
  if (!currentUser) {
    throw new Error('请先登录')
  }
  
  const newWork = addWork({
    userId: workData.userId,
    name: workData.name,
    originalImage: workData.originalImage,
    workImage: workData.workImage,
    styles: workData.styles,
    userName: currentUser.username,
    userAvatar: currentUser.avatar
  })
  
  return {
    ...newWork,
    likesCount: 0,
    isLiked: false
  }
}

// 删除作品
export const deleteWork = async (workId: number, userId: number): Promise<void> => {
  await delay()
  
  const work = getWorkById(workId)
  if (!work) {
    throw new Error('作品不存在')
  }
  
  if (work.userId !== userId) {
    throw new Error('无权删除此作品')
  }
  
  // 从数组中删除
  const index = mockWorks.findIndex(w => w.id === workId)
  if (index !== -1) {
    mockWorks.splice(index, 1)
  }
  
  console.log('删除作品成功:', workId)
}
