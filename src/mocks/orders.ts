// 订单 Mock 数据

export interface OrderItemMockData {
  id: number
  productId?: number
  productVariantId?: number
  modelId?: number
  customizationPhotoUrl?: string
  customizationImage?: string
  orderCategory: string
  quantity: number
  price: number
  productName: string
  color: string
  size: string
}

export interface OrderMockData {
  id: number
  orderNumber: string
  userId: number
  status: string
  totalAmount: number
  itemsSubtotal: number
  paymentMethod: string
  customerNotes?: string
  orderedTime: string
  paidTime?: string
  shippedTime?: string
  deliveredTime?: string
  items: OrderItemMockData[]
  shippingAddress?: {
    recipientName: string
    phone: string
    province: string
    city: string
    district: string
    detailAddress: string
  }
}

// 订单存储
const ORDERS_KEY = 'mock_orders'

// 获取所有订单
export const getAllOrders = (): OrderMockData[] => {
  const ordersStr = localStorage.getItem(ORDERS_KEY)
  if (ordersStr) {
    try {
      return JSON.parse(ordersStr)
    } catch {
      return []
    }
  }
  return []
}

// 保存订单
const saveOrders = (orders: OrderMockData[]): void => {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}

// 生成订单号
const generateOrderNumber = (): string => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `ORD${timestamp}${random}`
}

// 创建订单
export const createOrder = (
  userId: number,
  items: Omit<OrderItemMockData, 'id'>[],
  paymentMethod: string,
  shippingAddress?: OrderMockData['shippingAddress'],
  customerNotes?: string
): OrderMockData => {
  const orders = getAllOrders()
  
  const itemsSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  
  const newOrder: OrderMockData = {
    id: Math.max(...orders.map(o => o.id), 0) + 1,
    orderNumber: generateOrderNumber(),
    userId,
    status: 'PENDING_PAYMENT',
    totalAmount: itemsSubtotal,
    itemsSubtotal,
    paymentMethod,
    customerNotes,
    orderedTime: new Date().toISOString(),
    items: items.map((item, index) => ({
      ...item,
      id: index + 1
    })),
    shippingAddress
  }
  
  orders.push(newOrder)
  saveOrders(orders)
  
  return newOrder
}

// 获取用户订单
export const getUserOrders = (userId: number): OrderMockData[] => {
  const orders = getAllOrders()
  return orders.filter(o => o.userId === userId)
}

// 根据ID获取订单
export const getOrderById = (orderId: number): OrderMockData | undefined => {
  const orders = getAllOrders()
  return orders.find(o => o.id === orderId)
}

// 根据订单号获取订单
export const getOrderByNumber = (orderNumber: string): OrderMockData | undefined => {
  const orders = getAllOrders()
  return orders.find(o => o.orderNumber === orderNumber)
}

// 更新订单状态
export const updateOrderStatus = (orderId: number, status: string): OrderMockData | null => {
  const orders = getAllOrders()
  const orderIndex = orders.findIndex(o => o.id === orderId)
  
  if (orderIndex !== -1) {
    orders[orderIndex].status = status
    
    // 根据状态更新时间
    if (status === 'PAID') {
      orders[orderIndex].paidTime = new Date().toISOString()
    } else if (status === 'SHIPPED') {
      orders[orderIndex].shippedTime = new Date().toISOString()
    } else if (status === 'DELIVERED') {
      orders[orderIndex].deliveredTime = new Date().toISOString()
    }
    
    saveOrders(orders)
    return orders[orderIndex]
  }
  
  return null
}

// 模拟支付
export const mockPayOrder = (orderNumber: string): boolean => {
  const orders = getAllOrders()
  const orderIndex = orders.findIndex(o => o.orderNumber === orderNumber)
  
  if (orderIndex !== -1) {
    orders[orderIndex].status = 'PAID'
    orders[orderIndex].paidTime = new Date().toISOString()
    saveOrders(orders)
    return true
  }
  
  return false
}

// 确认收货
export const confirmDelivery = (orderId: number): OrderMockData | null => {
  return updateOrderStatus(orderId, 'DELIVERED')
}
