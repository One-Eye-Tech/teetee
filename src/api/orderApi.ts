import { api } from './authApi'

// 订单相关接口类型定义
export interface OrderItem {
  // For regular products
  productId?: number
  productVariantId?: number
  
  // For custom products  
  modelId?: number
  customizationPhotoUrl?: string
  customizationImage?: string
  
  // Common fields
  orderCategory: string // 'sale' or 'custom'
  quantity: number
  price: number // 单价
  productName: string
  color: string
  size: string
}

export interface CreateOrderRequest {
  userId: number
  shippingAddressId: number
  paymentMethod: string
  customerNotes?: string
  items: OrderItem[]
}

export interface OrderDto {
  id: number
  orderNumber: string
  status: string
  totalAmount: number
  itemsSubtotal: number
  paymentMethod: string
  customerNotes?: string
  orderedTime: string
  paidTime?: string
  shippedTime?: string
  deliveredTime?: string
  transactionId?: string
  trackingNumber?: string
  shippingCarrier?: string
  createdTime: string
  updatedTime: string
  expirationTime?: string
  userId: number
  userEmail: string
  
  // 地址快照字段 - 订单创建时保存的地址信息（不再关联地址表）
  shippingRecipientName: string
  shippingPhoneNumber: string
  shippingProvince: string
  shippingCity: string
  shippingArea: string
  shippingDetailedAddress: string
  
  orderItems: any[]
}

export interface CreateOrderResponse {
  order: OrderDto
  codeUrl?: string
}

export interface OrderStatusResponse {
  status: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message: string
}

/**
 * 创建订单
 * POST /api/v1/orders
 */
export async function createOrder(orderData: CreateOrderRequest): Promise<ApiResponse<CreateOrderResponse>> {
  try {
    const response = await api.post('/v1/orders', orderData)
    
    return {
      success: true,
      data: response.data,
      message: '订单创建成功'
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '创建订单失败'
    }
  }
}

/**
 * 查询订单状态
 * GET /api/v1/orders/order-status/{orderNumber}
 */
export async function getOrderStatus(orderNumber: string): Promise<ApiResponse<OrderStatusResponse>> {
  try {
    const response = await api.get(`/v1/orders/order-status/${orderNumber}`)
    
    return {
      success: true,
      data: response.data,
      message: '获取订单状态成功'
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '获取订单状态失败'
    }
  }
}

/**
 * 根据订单号获取订单详情
 * GET /api/v1/orders/number/{orderNumber}
 */
export async function getOrderByNumber(orderNumber: string): Promise<ApiResponse<OrderDto>> {
  try {
    const response = await api.get(`/v1/orders/number/${orderNumber}`)
    
    return {
      success: true,
      data: response.data,
      message: '获取订单详情成功'
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || '获取订单详情失败'
    }
  }
}

/**
 * 获取用户订单列表
 * GET /api/v1/orders/user/{userId}
 */
export async function getUserOrders(userId: number): Promise<ApiResponse<OrderDto[]>> {
  try {
    const response = await api.get(`/v1/orders/user/${userId}`)
    
    return {
      success: true,
      data: response.data,
      message: '获取订单列表成功'
    }
  } catch (error: any) {
    console.error('获取订单列表失败:', error)
    return {
      success: false,
      message: error.response?.data?.message || '获取订单列表失败'
    }
  }
}

// 更新订单状态请求接口
export interface UpdateOrderStatusRequest {
  status: string
  transactionId?: string
  trackingNumber?: string
  shippingCarrier?: string
  reason?: string
}

// 确认收货
export async function confirmOrderReceipt(orderId: number): Promise<ApiResponse<OrderDto>> {
  try {
    const requestData: UpdateOrderStatusRequest = {
      status: 'DELIVERED'
    }
    
    const response = await api.put(`/v1/orders/${orderId}/status`, requestData)
    
    return {
      success: true,
      data: response.data,
      message: '确认收货成功'
    }
  } catch (error: any) {
    console.error('确认收货失败:', error)
    return {
      success: false,
      message: error.response?.data?.message || '确认收货失败'
    }
  }
}