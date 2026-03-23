import { getStoredUser, type ApiResponse } from './authApiLite'

export interface OrderItem {
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

export interface UpdateOrderStatusRequest {
  status: string
  transactionId?: string
  trackingNumber?: string
  shippingCarrier?: string
  reason?: string
}

const KEY_ORDERS = 'lite_orders'
const nowIso = () => new Date().toISOString()

function readOrders(): OrderDto[] {
  const raw = localStorage.getItem(KEY_ORDERS)
  if (!raw) return []
  try {
    return JSON.parse(raw) as OrderDto[]
  } catch {
    return []
  }
}

function writeOrders(list: OrderDto[]) {
  localStorage.setItem(KEY_ORDERS, JSON.stringify(list))
}

export async function createOrder(orderData: CreateOrderRequest): Promise<ApiResponse<CreateOrderResponse>> {
  const user = getStoredUser()
  if (!user) return { success: false, message: '请先登录' }

  const all = readOrders()
  const id = all.length ? Math.max(...all.map((o) => o.id)) + 1 : 1
  const orderNumber = `MOCK${Date.now()}${Math.floor(Math.random() * 1000)}`
  const subtotal = orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const order: OrderDto = {
    id,
    orderNumber,
    status: 'PROCESSING',
    totalAmount: subtotal,
    itemsSubtotal: subtotal,
    paymentMethod: orderData.paymentMethod,
    customerNotes: orderData.customerNotes,
    orderedTime: nowIso(),
    createdTime: nowIso(),
    updatedTime: nowIso(),
    userId: user.id,
    userEmail: `${user.phone}@mock.local`,
    shippingRecipientName: '演示收货人',
    shippingPhoneNumber: '13800000000',
    shippingProvince: '北京市',
    shippingCity: '北京市',
    shippingArea: '朝阳区',
    shippingDetailedAddress: '演示地址 1 号',
    orderItems: orderData.items
  }

  all.unshift(order)
  writeOrders(all)

  return {
    success: true,
    data: { order, codeUrl: '' },
    message: '订单创建成功（静态模式）'
  }
}

export async function getOrderStatus(orderNumber: string): Promise<ApiResponse<OrderStatusResponse>> {
  const order = readOrders().find((o) => o.orderNumber === orderNumber)
  if (!order) return { success: false, message: '订单不存在' }
  return { success: true, data: { status: order.status }, message: '获取订单状态成功' }
}

export async function getOrderByNumber(orderNumber: string): Promise<ApiResponse<OrderDto>> {
  const order = readOrders().find((o) => o.orderNumber === orderNumber)
  if (!order) return { success: false, message: '订单不存在' }
  return { success: true, data: order, message: '获取订单详情成功' }
}

export async function getUserOrders(userId: number): Promise<ApiResponse<OrderDto[]>> {
  const orders = readOrders().filter((o) => o.userId === userId)
  return { success: true, data: orders, message: '获取订单列表成功' }
}

export async function confirmOrderReceipt(orderId: number): Promise<ApiResponse<OrderDto>> {
  const list = readOrders()
  const idx = list.findIndex((o) => o.id === orderId)
  if (idx < 0) return { success: false, message: '订单不存在' }
  const next = { ...list[idx], status: 'DELIVERED', deliveredTime: nowIso(), updatedTime: nowIso() }
  list[idx] = next
  writeOrders(list)
  return { success: true, data: next, message: '确认收货成功' }
}
