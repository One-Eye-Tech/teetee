// 服装款式、颜色、尺码、模型 Mock 数据

// 服装款式
export interface ClothingStyleMockData {
  id: number
  name: string
  description?: string
  imageUrl?: string
}

export const mockClothingStyles: ClothingStyleMockData[] = [
  { id: 1, name: 'T恤', description: '经典圆领T恤', imageUrl: '/images/cpxx.png' },
  { id: 2, name: '卫衣', description: '舒适连帽卫衣', imageUrl: '/images/cpxx.png' },
  { id: 3, name: 'Polo衫', description: '商务休闲Polo', imageUrl: '/images/cpxx.png' }
]

// 颜色
export interface ColorMockData {
  id: number
  name: string
  hexCode: string
}

export const mockColors: ColorMockData[] = [
  { id: 1, name: '白色', hexCode: '#FFFFFF' },
  { id: 2, name: '黑色', hexCode: '#000000' },
  { id: 3, name: '灰色', hexCode: '#808080' },
  { id: 4, name: '红色', hexCode: '#FF0000' },
  { id: 5, name: '蓝色', hexCode: '#0000FF' },
  { id: 6, name: '绿色', hexCode: '#00FF00' },
  { id: 7, name: '黄色', hexCode: '#FFFF00' }
]

// 尺码
export interface SizeMockData {
  id: number
  name: string
  description?: string
}

export const mockSizes: SizeMockData[] = [
  { id: 1, name: 'XS', description: '加小码' },
  { id: 2, name: 'S', description: '小码' },
  { id: 3, name: 'M', description: '中码' },
  { id: 4, name: 'L', description: '大码' },
  { id: 5, name: 'XL', description: '加大码' },
  { id: 6, name: 'XXL', description: '特大码' }
]

// 模型
export interface ModelMockData {
  id: number
  name: string
  description?: string
  imageUrl: string
  clothingStyleId: number
  colorId: number
  price: number
}

export const mockModels: ModelMockData[] = [
  {
    id: 1,
    name: '经典白T',
    description: '纯棉舒适',
    imageUrl: '/images/cpxx.png',
    clothingStyleId: 1,
    colorId: 1,
    price: 99.00
  },
  {
    id: 2,
    name: '黑色T恤',
    description: '百搭款式',
    imageUrl: '/images/cpxx.png',
    clothingStyleId: 1,
    colorId: 2,
    price: 99.00
  },
  {
    id: 3,
    name: '灰色卫衣',
    description: '保暖舒适',
    imageUrl: '/images/cpxx.png',
    clothingStyleId: 2,
    colorId: 3,
    price: 159.00
  },
  {
    id: 4,
    name: '白色Polo',
    description: '商务休闲',
    imageUrl: '/images/cpxx.png',
    clothingStyleId: 3,
    colorId: 1,
    price: 129.00
  }
]

// 获取所有款式
export const getAllClothingStyles = (): ClothingStyleMockData[] => {
  return [...mockClothingStyles]
}

// 获取所有颜色
export const getAllColors = (): ColorMockData[] => {
  return [...mockColors]
}

// 获取所有尺码
export const getAllSizes = (): SizeMockData[] => {
  return [...mockSizes]
}

// 获取所有模型
export const getAllModels = (): ModelMockData[] => {
  return [...mockModels]
}

// 根据款式和颜色获取模型
export const getModelsByStyleAndColor = (styleId: number, colorId: number): ModelMockData[] => {
  return mockModels.filter(m => m.clothingStyleId === styleId && m.colorId === colorId)
}
