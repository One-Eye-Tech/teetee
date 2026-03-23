// @ts-nocheck
// Order API Mock 实现
import type { OrderItem, CreateOrderRequest, OrderDto } from '../orderApi'
import { 
  createOrder as createMockOrder,
  getUserOrders as getMockUserOrders,
  getOrderById as getMockOrderById,
  getOrderByNumber as getMockOrderByNumber,
  updateOrderStatus,
  confirmDelivery as confirmMockDelivery,
  mockPayOrder
} from '../../mocks/orders'
import { getCurrentUser } from '../../mocks/users'

// 延迟函数，模拟网络请求
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms))

// 创建订单
export const createOrder = async (orderData: CreateOrderRequest): Promise<OrderDto> => {
  await delay()
  
  const currentUser = getCurrentUser()
  if (!currentUser) {
    throw new Error('请先登录')
  }
  
  const order = createMockOrder(
    orderData.userId,
    orderData.items,
    orderData.paymentMethod,
    {
      recipientName: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detailAddress: ''
    },
    orderData.customerNotes
  )
  
  return order as OrderDto
}

// 获取用户订单列表
export const getUserOrders = async (userId: number): Promise<OrderDto[]> => {
  await delay()
  const orders = getMockUserOrders(userId)
  return orders as OrderDto[]
}

// 根据ID获取订单详情
export const getOrderById = async (orderId: number): Promise<OrderDto> => {
  await delay()
  const order = getMockOrderById(orderId)
  if (!order) {
    throw new Error('订单不存在')
  }
  return order as OrderDto
}

// 根据订单号查询订单状态
export const getOrderStatus = async (orderNumber: string): Promise<{ status: string; order: OrderDto }> => {
  await delay()
  const order = getMockOrderByNumber(orderNumber)
  if (!order) {
    throw new Error('订单不存在')
  }
  return {
    status: order.status,
    order: order as OrderDto
  }
}

// 模拟支付订单
export const payOrder = async (orderNumber: string): Promise<boolean> => {
  await delay(1000) // 支付需要更长时间
  return mockPayOrder(orderNumber)
}

// 确认收货
export const confirmDelivery = async (orderId: number): Promise<OrderDto> => {
  await delay()
  const order = confirmMockDelivery(orderId)
  if (!order) {
    throw new Error('确认收货失败')
  }
  return order as OrderDto
}

// 更新订单状态
export const updateOrder = async (orderId: number, status: string): Promise<OrderDto> => {
  await delay()
  const order = updateOrderStatus(orderId, status)
  if (!order) {
    throw new Error('更新订单状态失败')
  }
  return order as OrderDto
}
