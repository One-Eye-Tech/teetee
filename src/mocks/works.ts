// 作品 Mock 数据
export interface WorksMockData {
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

// 生成示例作品数据
// 首页列表图：/images/img/1.png ~ /images/img/26.png
// 详情原图：/images/img/a.png ~ /images/img/z.png（1->a, 2->b ... 26->z）
const letterList = 'abcdefghijklmnopqrstuvwxyz'.split('')
const userPool = [
  { userId: 1, userName: '设计师小王' },
  { userId: 2, userName: '创意达人' },
  { userId: 3, userName: '艺术家李' },
  { userId: 4, userName: '简约派' }
]

export const mockWorks: WorksMockData[] = letterList.map((letter, idx) => {
  const id = idx + 1
  const author = userPool[idx % userPool.length]
  return {
    id,
    userId: author.userId,
    name: `作品 ${id}`,
    originalImage: `/images/img/${letter}.png`,
    workImage: `/images/img/${letter}.png`,
    createdTime: new Date(Date.now() - idx * 3600 * 1000).toISOString(),
    styles: 1,
    userName: author.userName,
    userAvatar: '/icons/profile.png',
    likesCount: 80 + id * 7,
    isLiked: false
  }
})

// 获取所有作品
export const getAllWorks = (): WorksMockData[] => {
  return [...mockWorks]
}

// 根据用户ID获取作品
export const getWorksByUserId = (userId: number): WorksMockData[] => {
  return mockWorks.filter(work => work.userId === userId)
}

// 根据ID获取单个作品
export const getWorkById = (id: number): WorksMockData | undefined => {
  return mockWorks.find(work => work.id === id)
}

// 添加新作品
export const addWork = (work: Omit<WorksMockData, 'id' | 'createdTime'>): WorksMockData => {
  const newWork: WorksMockData = {
    ...work,
    id: Math.max(...mockWorks.map(w => w.id), 0) + 1,
    createdTime: new Date().toISOString(),
    likesCount: 0,
    isLiked: false
  }
  mockWorks.push(newWork)
  return newWork
}
