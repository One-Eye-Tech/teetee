<template>
  <div class="order-detail order-detail--tight">
    <button class="od-back" aria-label="返回" @click="$emit('back')"></button>
    <div class="header-row">
      <h2 class="page-title">订单详情</h2>
    </div>
    <div class="od-card">
      <div class="od-item" v-for="(product, index) in displayProducts" :key="index">
        <img class="od-thumb" :src="product.icon" :alt="product.title" />
        <div class="od-main">
          <div class="od-title">{{ product.title }}</div>
          <div class="od-sub">{{ product.color }} / {{ product.size }}</div>
        </div>
        <div class="od-right">
          <div class="od-price">{{ product.price }}</div>
          <div class="od-qty">x{{ product.quantity }}</div>
        </div>
      </div>
      <div v-if="shouldShowProductToggle" class="od-toggle" @click="toggleProductExpand">
        <div class="od-toggle-icon" :class="{ 'od-toggle-icon--expanded': isProductExpanded }"></div>
      </div>
    </div>
    <div class="od-card od-info">
      <div v-for="item in displayOrderInfo" :key="item.key" class="od-row">
        <div class="od-k">{{ item.key }}</div>
        <div class="od-v">{{ item.value }}</div>
      </div>
      <div v-if="shouldShowOrderInfoToggle" class="od-toggle" @click="toggleOrderInfoExpand">
        <div class="od-toggle-icon" :class="{ 'od-toggle-icon--expanded': isOrderInfoExpanded }"></div>
      </div>
    </div>
    <div class="od-actions" v-if="getButtonText">
      <button 
        class="od-primary" 
        :disabled="!shouldShowConfirmButton || isConfirming"
        :class="{ 
          'od-disabled': !shouldShowConfirmButton,
          'od-loading': isConfirming 
        }"
        @click="confirmReceipt"
      >
        <span v-if="isConfirming">确认中...</span>
        <span v-else>{{ getButtonText }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 这些接口已不再需要，因为我们直接使用OrderDto类型

interface Props {
  order: any | null // 暂时使用any类型来避免类型错误
}

const props = defineProps<Props>()
const emit = defineEmits<{
  back: []
  orderUpdated: [order: any]
}>()

import { ref, computed } from 'vue'
import { confirmOrderReceipt } from '../api/orderApiLite'

// 产品展开状态
const isProductExpanded = ref(false)
// 订单信息展开状态
const isOrderInfoExpanded = ref(false)

// 从真实订单数据获取产品列表
const products = computed(() => {
  if (!props.order || !props.order.orderItems) {
    return []
  }
  
  return props.order.orderItems.map((item: any) => {
    return {
      title: item.productName || 'Custom Clothing',
      color: getProductColor(item),
      size: getProductSize(item),
      icon: item.customizationPhotoUrl || '/images/1.png',
      price: getProductPrice(item),
      quantity: item.quantity || 1
    }
  })
})

// 获取产品价格信息
const getProductPrice = (item: any) => {
  // 根据后端OrderItemDto结构，价格字段是priceAtPurchase
  let price = item.priceAtPurchase || item.price
  
  if (price !== undefined && price !== null) {
    const numPrice = Number(price)
    if (!isNaN(numPrice) && numPrice > 0) {
      return `${numPrice.toFixed(2)} RMB`
    }
  }
  
  return '价格待定'
}

// 获取产品颜色信息
const getProductColor = (item: any) => {
  // 根据后端OrderItemDto结构，颜色是直接的color字段
  if (item.color) {
    return item.color
  }
  
  return '默认色'
}

// 获取产品尺寸信息
const getProductSize = (item: any) => {
  // 根据后端OrderItemDto结构，尺寸是直接的size字段
  if (item.size) {
    return item.size
  }
  
  return '均码'
}

// 计算属性：显示的产品列表
const displayProducts = computed(() => {
  if (isProductExpanded.value || products.value.length <= 1) {
    return products.value
  }
  return products.value.slice(0, 1)
})

// 是否显示产品展开按钮
const shouldShowProductToggle = computed(() => products.value.length > 1)

// 切换产品展开状态
const toggleProductExpand = () => {
  isProductExpanded.value = !isProductExpanded.value
}

// 获取所有订单信息项
const getAllOrderInfoItems = () => {
  if (!props.order) return []
  
  const items = []
  const order = props.order
  
  
  if (order.orderNumber) items.push({ key: '订单编号', value: order.orderNumber })
  items.push({ key: '收货信息', value: getShippingInfo() })
  
  // 修复总金额显示 - BigDecimal类型直接显示
  if (order.totalAmount !== undefined && order.totalAmount !== null) {
    const totalAmount = Number(order.totalAmount)
    if (!isNaN(totalAmount)) {
      items.push({ key: '实际付款', value: `${totalAmount.toFixed(2)} RMB` })
    }
  }
  
  if (order.status) items.push({ key: '订单状态', value: getOrderStatusText(order.status) })
  if (order.shippingCarrier) items.push({ key: '物流公司', value: order.shippingCarrier })
  if (order.trackingNumber) items.push({ key: '物流单号', value: order.trackingNumber })
  if (order.paymentMethod) items.push({ key: '支付方式', value: getPaymentMethodText(order.paymentMethod) })
  if (order.createdTime) items.push({ key: '创建时间', value: formatDateTime(order.createdTime) })
  if (order.paidTime) items.push({ key: '付款时间', value: formatDateTime(order.paidTime) })
  if (order.shippedTime) items.push({ key: '发货时间', value: formatDateTime(order.shippedTime) })
  if (order.deliveredTime) items.push({ key: '完成时间', value: formatDateTime(order.deliveredTime) })
  
  return items
}

// 获取收货信息 - 只使用地址快照
const getShippingInfo = () => {
  const order = props.order
  
  // 使用订单中的地址快照
  if (order && order.shippingRecipientName && order.shippingPhoneNumber) {
    return `${order.shippingRecipientName} ${order.shippingPhoneNumber} ${order.shippingProvince} ${order.shippingCity} ${order.shippingArea} ${order.shippingDetailedAddress}`
  }
  
  return '暂无收货地址'
}

// 获取订单状态文本
const getOrderStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'PENDING_PAYMENT': '待付款',
    'PROCESSING': '待发货', 
    'SHIPPED': '待收货',
    'DELIVERED': '已完成',
    'CANCELED': '已取消',
    'REFUNDED': '已退款'
  }
  return statusMap[status] || status
}

// 获取支付方式文本
const getPaymentMethodText = (method: string) => {
  const methodMap: { [key: string]: string } = {
    'WECHAT_PAY': '微信支付',
    'ALIPAY': '支付宝',
    'BANK_CARD': '银行卡'
  }
  return methodMap[method] || method
}

// 格式化日期时间
const formatDateTime = (dateString: string | null) => {
  if (!dateString) return null
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 计算属性：显示的订单信息列表
const displayOrderInfo = computed(() => {
  const allItems = getAllOrderInfoItems()
  if (isOrderInfoExpanded.value || allItems.length <= 5) {
    return allItems
  }
  return allItems.slice(0, 5)
})

// 是否显示订单信息展开按钮
const shouldShowOrderInfoToggle = computed(() => getAllOrderInfoItems().length > 5)

// 切换订单信息展开状态
const toggleOrderInfoExpand = () => {
  isOrderInfoExpanded.value = !isOrderInfoExpanded.value
}

// 计算是否显示确认收货按钮
const shouldShowConfirmButton = computed(() => {
  return props.order && props.order.status === 'SHIPPED'
})

// 获取按钮文本
const getButtonText = computed(() => {
  if (!props.order) return ''
  
  switch (props.order.status) {
    case 'SHIPPED':
      return '确认收货'
    case 'DELIVERED':
      return '已完成'
    case 'CANCELED':
      return '已取消'
    case 'REFUNDED':
      return '已退款'
    default:
      return ''
  }
})

// 确认收货状态
const isConfirming = ref(false)

// 确认收货操作
const confirmReceipt = async () => {
  if (!props.order || props.order.status !== 'SHIPPED') {
    return
  }

  if (isConfirming.value) {
    return // 防止重复点击
  }

  // 添加确认对话框
  if (!window.confirm('您确认已收到商品了吗？')) {
    return
  }

  try {
    isConfirming.value = true
    
    const result = await confirmOrderReceipt(props.order.id)
    
    if (result.success) {
      // 确认收货成功，显示成功提示
      alert('确认收货成功！')
      
      // 通知父组件订单已更新
      if (result.data) {
        emit('orderUpdated', result.data)
      }
    } else {
      // 显示错误信息
      alert(result.message || '确认收货失败，请重试')
    }
  } catch (error) {
    console.error('确认收货出错:', error)
    alert('确认收货失败，请检查网络连接后重试')
  } finally {
    isConfirming.value = false
  }
}
</script>

<style scoped>
.order-detail { 
  position: relative; 
  display: grid; 
  --od-pad-top: clamp(1.6rem, 3vh, 2rem); 
  --od-pad-x: clamp(3rem, 5vw, 4rem);
  --od-back-size: 3.8rem; 
  --od-gap: clamp(1.2rem, 2.6vw, 1.6rem); 
  gap: var(--od-gap); 
  padding: calc(2.6 * var(--od-pad-top)) var(--od-pad-x) var(--od-pad-x) calc(var(--od-pad-x) * 0.94); 
  min-height: min-content;
}

.order-detail .od-back { 
  position: absolute; 
  top: calc(var(--od-pad-top) - 4.8rem); 
  left: calc(var(--od-pad-x) - 4rem); 
  width: 4.2rem; 
  height: 4.2rem; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  padding: 0; 
  background: var(--color-surface); 
  border: 1px solid var(--color-border); 
  border-radius: var(--radius-md); 
  color: var(--color-text); 
  cursor: pointer; 
  transition: all 0.2s ease; 
  box-shadow: none; 
  margin: 0; 
  z-index: 2;
}

.order-detail .od-back:hover { 
  background: color-mix(in srgb, var(--color-primary), transparent 92%);
  border-color: var(--color-primary);
  color: var(--color-text);
  transform: translateY(-2px); 
}

.order-detail .od-back::before { 
  content: ""; 
  position: absolute; 
  inset: 0; 
  margin: auto; 
  inline-size: clamp(1.8rem, 2.5vw, 2.2rem); 
  block-size: clamp(1.8rem, 2.5vw, 2.2rem); 
  background: var(--color-icon); 
  -webkit-mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M15 6l-6 6 6 6' stroke='black' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>") center/contain no-repeat; 
  mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M15 6l-6 6 6 6' stroke='black' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>") center/contain no-repeat; 
}

.header-row {
  position: absolute;
  top: calc(var(--od-pad-top) - 4.8rem);
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 4.2rem;
  pointer-events: none;
}

.page-title {
  font-size: calc(var(--fs-md) * 1.1);
  font-weight: 500;
  color: var(--color-text);
  margin: 0;
  text-align: center;
}

.od-card { 
  background: var(--color-card); 
  border-radius: var(--radius-md); 
  border: none; 
  margin-left: -3.7rem; 
  margin-right: -4rem; 
}

.od-toggle {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 4.8rem;
  padding: 0 1.2rem;
  background: var(--color-card);
  border-top: none;
  cursor: pointer;
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  position: relative;
}

.od-toggle::before {
  content: "";
  position: absolute;
  top: 0;
  left: 1.2rem;
  right: 0;
  height: 1px;
  background: var(--color-border);
}

.od-toggle-icon {
  width: 1.5rem;
  height: 1.5rem;
  background: var(--color-icon);
  mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M7 10l5 5 5-5' stroke='black' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>") center/contain no-repeat;
  -webkit-mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M7 10l5 5 5-5' stroke='black' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>") center/contain no-repeat;
  transition: transform 0.2s ease;
}

.od-toggle-icon--expanded {
  transform: rotate(180deg);
}

.od-item { 
  display: grid; 
  grid-template-columns: auto 1fr auto; 
  align-items: center; 
  border: none; 
  --item-pad: 1.2rem; 
  min-block-size: 8rem; 
  column-gap: 0; 
  padding: 1.2rem 1.2rem 1.2rem 1.2rem;
}

.od-item + .od-item::before {
  content: "";
  position: absolute;
  top: 0;
  left: 1.2rem;
  right: 0;
  height: 1px;
  background: var(--color-border);
}

.od-item + .od-item {
  position: relative;
}

.od-thumb { 
  inline-size: 6rem; 
  block-size: 6rem; 
  border-radius: var(--radius-sm); 
  object-fit: cover;
}

.od-main { 
  display: grid; 
  gap: .25rem; 
  padding-inline: var(--item-pad) 0; 
}

.od-right { 
  display: grid; 
  align-content: center; 
  justify-items: end; 
  gap: .25rem; 
  padding-inline: 0; 
}

.od-price { 
  align-self: start; 
  font-weight: 400;
  font-size: var(--fs-sm);
}

.od-qty { 
  align-self: end; 
  justify-self: end; 
  color: var(--color-text-muted); 
  font-size: var(--fs-xs); 
  font-weight: 400;
  text-align: right; 
}

.od-title { 
  color: var(--color-text); 
  font-weight: 400; 
  font-size: var(--fs-sm); 
}

.od-sub { 
  color: var(--color-text-muted); 
  font-size: var(--fs-xs); 
  font-weight: 400;
}

.od-info { 
  padding: 0; 
  margin-top: calc(var(--od-gap) * 1.5);
  margin-bottom: calc(var(--od-gap) * 1.2);
}

.od-row { 
  display: grid; 
  grid-template-columns: auto 1fr; 
  align-items: center; 
  padding: 0 1.2rem; 
  height: 4.8rem;
}

.od-row + .od-row { 
  border-top: none;
  position: relative;
}

.od-row + .od-row::before {
  content: "";
  position: absolute;
  top: 0;
  left: 1.2rem;
  right: 0;
  height: 1px;
  background: var(--color-border);
}

.od-k { 
  color: var(--color-text); 
  font-size: var(--fs-sm); 
  font-weight: 500;
}

.od-v { 
  color: var(--color-text-muted); 
  font-size: var(--fs-sm); 
  font-weight: 500;
  text-align: right; 
  padding-left: clamp(1.4rem, 2.4vw, 1.8rem); 
}

.od-actions { 
  margin-top: calc(var(--od-pad-x) * 0.1);
  padding: 0;
  margin-left: -3.7rem;
  margin-right: -3.7rem;
  width: calc(100% + 7.7rem);
}

.od-primary { 
  inline-size: 100%; 
  padding: 1.1rem; 
  border-radius: var(--radius-sm); 
  background: var(--color-primary); 
  height: calc(var(--field-h) - .2rem);
  border: none; 
  color: #fff; 
  font-weight: 500; 
  font-size: var(--fs-md); 
  cursor: pointer; 
  transition: all 0.2s ease; 
}


.od-primary:hover {
  background: color-mix(in srgb, var(--color-primary), black 10%);
  transform: translateY(-1px);
}

.od-primary.od-disabled {
  background: var(--color-border);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.od-primary.od-disabled:hover {
  background: var(--color-border);
  transform: none;
}

.od-primary.od-loading {
  background: color-mix(in srgb, var(--color-primary), transparent 20%);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.od-primary.od-loading:hover {
  background: color-mix(in srgb, var(--color-primary), transparent 20%);
  transform: none;
}

/* 移动端优化 */
@media (max-aspect-ratio: 1/1) {
  :root {
    --scale-factor: 2;
  }

  .order-detail {
    --od-pad-top: calc(clamp(1.6rem, 3vh, 2rem) * var(--scale-factor));
    --od-back-size: calc(3.8rem * var(--scale-factor));
    --od-gap: calc(clamp(1.2rem, 2.6vw, 1.6rem) * var(--scale-factor));
    gap: var(--od-gap);
    padding: calc(2.6 * var(--od-pad-top)) calc(var(--od-pad-x) * var(--scale-factor)) calc(var(--card-pad) * var(--scale-factor));
  }

  /* 返回按钮 - 确保变大 */
  .order-detail .od-back {
    top: calc(var(--od-pad-top) - 3.5rem * var(--scale-factor));
    left: calc(var(--od-pad-x) * var(--scale-factor) - 4rem * var(--scale-factor));
    width: calc(4.5rem * var(--scale-factor));
    height: calc(4.5rem * var(--scale-factor));
    border-radius: calc(var(--radius-md) * var(--scale-factor));
  }

  .order-detail .od-back::before {
    inline-size: calc(clamp(1.8rem, 2.5vw, 2.2rem) * var(--scale-factor));
    block-size: calc(clamp(1.8rem, 2.5vw, 2.2rem) * var(--scale-factor));
  }

  .header-row {
    top: calc(var(--od-pad-top) - 3.5rem * var(--scale-factor));
    height: calc(4.2rem * var(--scale-factor));
  }

  .page-title {
    font-size: calc(var(--fs-md) * 1.1 * var(--scale-factor));
  }

  /* 产品卡片 - 与确认收货按钮对齐 */
  .od-card {
    border-radius: calc(var(--radius-md) * var(--scale-factor));
    padding: 0;
    margin-left: calc(-4rem * var(--scale-factor));
    margin-right: calc(-4rem * var(--scale-factor));
    width: calc(100% + 7.7rem * var(--scale-factor));
    background: var(--color-card);
  }

  .od-item {
    gap: calc(1.2rem * var(--scale-factor));
    --item-pad: calc(1.2rem * var(--scale-factor));
    min-block-size: calc(4.8rem * var(--scale-factor));
    padding: calc(1.2rem * var(--scale-factor));
  }

  .od-thumb {
    inline-size: calc(6rem * var(--scale-factor));
    block-size: calc(6rem * var(--scale-factor));
    border-radius: calc(var(--radius-md) * var(--scale-factor));
  }

  .od-main {
    gap: calc(.25rem * var(--scale-factor));
  }

  .od-right {
    gap: calc(.25rem * var(--scale-factor));
  }

  .od-price {
    font-size: calc(var(--fs-sm) * var(--scale-factor));
  }

  .od-qty {
    font-size: calc(var(--fs-xs) * var(--scale-factor));
  }

  .od-title {
    font-size: calc(var(--fs-sm) * var(--scale-factor));
  }

  .od-sub {
    font-size: calc(var(--fs-xs) * var(--scale-factor));
  }

  /* 订单信息卡片 - 与确认收货按钮对齐 */
  .od-info {
    margin-top: calc(var(--od-gap) * 0.4 * var(--scale-factor));
    margin-bottom: calc(var(--od-gap) * 0.3 * var(--scale-factor));
    margin-left: calc(-4rem * var(--scale-factor));
    margin-right: calc(-4rem * var(--scale-factor));
    width: calc(100% + 7.7rem * var(--scale-factor));
    background: var(--color-card);
    border-radius: calc(var(--radius-md) * var(--scale-factor));
  }

  .od-row {
    padding: 0 calc(1.2rem * var(--scale-factor));
    height: calc(4.8rem * var(--scale-factor));
  }

  .od-row + .od-row::before {
    left: calc(1.2rem * var(--scale-factor));
  }

  .od-k {
    font-size: calc(var(--fs-sm) * var(--scale-factor));
  }

  .od-v {
    font-size: calc(var(--fs-sm) * var(--scale-factor));
    padding-left: calc(clamp(1.4rem, 2.4vw, 1.8rem) * var(--scale-factor));
  }

  .od-actions {
    margin-top: calc(15rem * var(--scale-factor));
    margin-left: calc(-4rem * var(--scale-factor));
    margin-right: calc(-4rem * var(--scale-factor));
    width: calc(100% + 7.7rem * var(--scale-factor));
  }

  .od-primary {
    padding: calc(1.1rem * var(--scale-factor));
    border-radius: calc(var(--radius-sm) * var(--scale-factor));
    height: calc((var(--field-h) - .2rem) * var(--scale-factor));
    font-size: calc(var(--fs-md) * var(--scale-factor));
  }

  .od-toggle {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: calc(4.8rem * var(--scale-factor));
    margin-top: 0;
    padding: 0 calc(1.2rem * var(--scale-factor));
    border-radius: 0 0 calc(var(--radius-md) * var(--scale-factor)) calc(var(--radius-md) * var(--scale-factor));
  }

  .od-toggle::before {
    left: calc(1.2rem * var(--scale-factor));
  }

  /* 确保卡片有相对定位以包含绝对定位的展开按钮 */
  .od-card {
    position: relative;
  }

  /* 只对有展开按钮的卡片添加底部间距 */
  .od-card:has(.od-toggle) {
    padding-bottom: calc(4.8rem * var(--scale-factor));
  }

  .od-toggle-icon {
    inline-size: calc(1.5rem * var(--scale-factor));
    block-size: calc(1.5rem * var(--scale-factor));
  }
}
</style>