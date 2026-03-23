<template>
  <div class="app-root">
    <div class="customize-page">
    <div class="customize-container">

      <!-- 中间定制台 -->
      <div class="center-panel">
        <!-- 移动端返回按钮 -->
        <button class="back-btn mobile-back-btn" @click="goBack">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <!-- 移动端上传图片按钮 -->
        <button class="mobile-upload-btn" @click="triggerUpload" :disabled="!baseImageSrc">
          <span class="mobile-upload-icon"></span>
        </button>
        <!-- 颜色色卡（Web端隐藏，移动端显示） -->
        <div class="swatch-panel">
          <button
            v-for="c in availableColorSwatches"
            :key="c.value"
            type="button"
            class="swatch"
            :class="{ active: selectedColor === c.value }"
            :style="{ background: c.hex }"
            @click="selectedColor = c.value"
            :aria-label="`选择颜色: ${c.label}`"
          />
        </div>
        <!-- 返回按钮 - 中间面板左上角 -->
        <button class="back-btn center-back-btn" @click="goBack">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        
        <div class="canvas-container">
          <div class="canvas">
            <div class="clothing-preview" ref="clothingPreviewRef">
              <!-- 这里显示衣服预览 -->
              <div class="clothing-base" ref="clothingBaseRef" :data-style-id="selectedModel">
                <!-- 根据选中颜色展示衣服底图（优先后端模型图片） -->
                <img
                  v-if="baseImageSrc"
                  :src="baseImageSrc.startsWith('http') ? baseImageSrc : baseImageSrc + '?v=' + selectedColor"
                  :alt="selectedColor + '衣服'"
                  class="base-image"
                  :style="{ pointerEvents: 'none' }"
                  @error="onImageError"
                  @load="onImageLoad"
                />
                <!-- 敬请期待提示 -->
                <div v-if="!baseImageSrc" class="coming-soon-placeholder">
                  <span class="coming-soon-text">敬请期待</span>
                </div>
                <!-- 固定展示区域（按款式配置） -->
                <div
                  v-if="currentDesignArea && baseImageSrc"
                  class="design-area"
                  :class="{ dragging: isDragging }"
                  :style="designAreaStyle"
                  @mousedown="onDragStart"
                  @wheel.prevent="onWheelZoom"
                >
                  <div v-if="uploadedImage" class="uploaded-design" :style="designStyle">
                    <img :src="uploadedImage" alt="设计图案" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧控制区 -->
      <div class="right-panels-container">
        <!-- 第一个右侧面板：上传和变换控件 -->
      <div class="right-panel">
        <!-- Upload 模块（置顶，仅单图上传） -->
        <div class="module-card upload-standalone">
          <div class="module-content">
            <button class="upload-btn" @click="triggerUpload" :disabled="!baseImageSrc">
              <span class="upload-icon"></span>
              <span class="label">上传图片</span>
            </button>
            <input 
              ref="fileInput" 
              type="file" 
              accept="image/*" 
              @change="handleImageUpload" 
              style="display: none"
              :disabled="!baseImageSrc"
            />
          </div>
        </div>

        <!-- Transform 模块（缩放、移动） -->
        <div class="transform-controls">
          <div class="module-content">
            <div class="controls">
              <div class="control-group">
                <div class="control-head">
                  <label>缩放</label>
                  <span class="value">{{ 100 + scaleDelta }}%</span>
                </div>
                <div class="slider-row">
                    <button class="step-btn" @click="stepScale(-1)">
                      <div class="step-icon step-icon-jian"></div>
                    </button>
                  <input v-model.number="scaleDelta" type="range" min="-50" max="50" class="control-slider" />
                    <button class="step-btn" @click="stepScale(1)">
                      <div class="step-icon step-icon-add"></div>
                    </button>
                </div>
                  <button class="reset-btn" @click="resetScale">重置为默认</button>
              </div>

              <div class="control-group">
                <div class="control-head">
                  <label>移动</label>
                  <span class="value">{{ position.y }}px</span>
                </div>
                <div class="slider-row">
                    <button class="step-btn" @click="stepPosY(-1)">
                      <div class="step-icon step-icon-jian"></div>
                    </button>
                  <input v-model.number="position.y" type="range" min="-200" max="200" class="control-slider" />
                    <button class="step-btn" @click="stepPosY(1)">
                      <div class="step-icon step-icon-add"></div>
                    </button>
                </div>
                  <button class="reset-btn" @click="resetPosY">重置为默认</button>
                </div>
              </div>
            </div>
              </div>

        </div>

        <!-- 第二个右侧面板：尺码选择和CTA按钮 -->
        <div class="right-panel">
          <!-- 桌面端尺码选择和信息按钮包裹容器 -->
              <div class="size-info-wrapper">
                <!-- 尺码选择 -->
                <div v-if="availableSizes && availableSizes.length > 0" class="control-group">
                  <div class="control-head">
                    <label>尺码</label>
                    <span class="value">x{{ totalQuantity }}</span>
                  </div>
                  
                  <div class="size-selection-row">
                    <button 
                      class="step-btn decrease-btn" 
                      @click="decreaseCurrentSize" 
                      :disabled="!selectedSize || getCurrentSizeQuantity() <= 0"
                    >
                  <div class="step-icon step-icon-jian"></div>
              </button>
                    
                    <div class="size-options">
                      <button 
                        v-for="size in availableSizes" 
                        :key="size.id"
                        :class="['size-btn', { active: selectedSize === size.name }]"
                        @click="selectSize(size.name)"
                      >
                        {{ size.name }}
                        <span 
                          v-if="sizeQuantities[size.name] > 0" 
                          class="size-quantity-badge"
                        >
                          {{ sizeQuantities[size.name] }}
                        </span>
              </button>
                    </div>
                    
                    <button 
                      class="step-btn increase-btn" 
                      @click="increaseCurrentSize"
                      :disabled="!selectedSize"
                    >
                  <div class="step-icon step-icon-add"></div>
                    </button>
                  </div>
                </div>
                
                <!-- 信息按钮 -->
                <div class="info-buttons">
                  <button class="info-btn" @click="showSizeInfo">
                    尺码信息
                  </button>
                  <button class="info-btn" @click="showProductInfo">
                    产品信息
                  </button>
          </div>
        </div>
        
        <!-- 移动端尺码选择组件（仅在移动端显示） -->
        <div class="mobile-size-section" style="display: none;">
          <div class="size-selection-mobile">
            <div class="control-group">
              <div class="control-head">
                <label>尺码</label>
                <span class="value">x{{ totalQuantity }}</span>
              </div>
              <div class="slider-row">
                <button 
                  class="step-btn" 
                  @click="decreaseCurrentSize" 
                  :disabled="!selectedSize || getCurrentSizeQuantity() <= 0"
                >
                    <div class="step-icon step-icon-jian"></div>
                </button>
                
                <div class="size-options">
                  <button 
                    v-for="size in availableSizes" 
                    :key="size.id"
                    :class="['size-btn', { active: selectedSize === size.name }]"
                    @click="selectSize(size.name)"
                  >
                    {{ size.name }}
                    <span 
                      v-if="sizeQuantities[size.name] > 0" 
                      class="size-quantity-badge"
                    >
                      {{ sizeQuantities[size.name] }}
                    </span>
                  </button>
                </div>
                
                <button 
                  class="step-btn" 
                  @click="increaseCurrentSize"
                  :disabled="!selectedSize"
                >
                    <div class="step-icon step-icon-add"></div>
                </button>
              </div>
            </div>
            
            <div class="info-buttons">
              <button class="info-btn" @click="showSizeInfo">
                尺码信息
              </button>
              <button class="info-btn" @click="showProductInfo">
                产品信息
              </button>
            </div>
          </div>
        </div>
        
          <!-- CTA 按钮 -->
        <div class="cta-container">
          <button class="primary-cta" @click="onCustomizeNow" :disabled="isGeneratingImage || !baseImageSrc">
            {{ isGeneratingImage ? '生成中...' : (totalQuantity > 0 ? `${totalPrice} RMB` : '0 RMB') }}
          </button>
        </div>
        </div>
      </div>

    </div>
  </div>


  <!-- 创建订单弹出框 -->
  <div v-if="showCreateOrder" class="co-modal-mask" @click.self="closeCreateOrder">
    <div class="co-modal" role="dialog" aria-modal="true" aria-label="创建订单">
      <div class="co-card">
        <!-- 商品信息 -->
        <div class="od-card">
          <div v-for="(item, index) in productItems" :key="`product-${index}`" class="product-item-wrapper">
          <div class="od-item">
              <img class="od-thumb" :src="item.icon" :alt="item.title" />
            <div class="od-main">
                <div class="od-title">{{ item.title }}</div>
                <div class="od-sub">{{ item.color }} / {{ item.size }}</div>
            </div>
            <div class="od-right">
                <div class="od-price">{{ item.price }}</div>
                <div class="od-qty">x{{ item.quantity }}</div>
            </div>
            </div>
            <!-- 分隔线：除了最后一个产品外都添加分隔线 -->
            <div v-if="index < productItems.length - 1" class="co-divider"></div>
          </div>
        </div>

        <!-- 订单信息 -->
        <div class="od-card co-info-container">
        <!-- 总计 -->
          <div class="co-total-section">
          <span class="co-total-label">总计</span>
          <span class="co-total-price">{{ totalQuantity > 0 ? totalPrice : 0 }} RMB</span>
          </div>

          <!-- 分隔线 -->
          <div class="co-divider"></div>

        <!-- 地址信息 -->
          <div class="co-address-section" @click="toggleAddressDropdown">
          <div class="co-address-info">
              <div v-if="addressLoading" class="co-phone">加载中...</div>
              <div v-else-if="addresses.length > 0 && selectedAddress >= 0" class="co-phone">{{ addresses[selectedAddress].recipientName }} {{ addresses[selectedAddress].phoneNumber }}</div>
              <div v-else class="co-phone">请先添加收货地址</div>
              
              <div v-if="addressLoading" class="co-address-text">获取地址信息中...</div>
              <div v-else-if="addresses.length > 0 && selectedAddress >= 0" class="co-address-text">{{ addresses[selectedAddress].province }}{{ addresses[selectedAddress].city }}{{ addresses[selectedAddress].area }}{{ addresses[selectedAddress].detailedAddress }}</div>
              <div v-else class="co-address-text">暂无地址信息</div>
          </div>
          <div class="co-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
            
            <!-- 地址下拉框 -->
            <div v-if="showAddressDropdown" class="co-address-dropdown">
              <div 
                v-if="addressLoading"
                class="co-empty-address-tip"
              >
                加载地址中...
              </div>
              <div 
                v-else-if="addresses.length === 0"
                class="co-empty-address-tip"
              >
                您还未添加地址
              </div>
              <div 
                v-else
                v-for="(addr, index) in addresses" 
                :key="addr.id"
                class="co-address-option"
                :class="{ active: index === selectedAddress }"
                @click.stop="selectAddress(index)"
              >
                <div class="co-option-phone">{{ addr.recipientName }} {{ addr.phoneNumber }}</div>
                <div class="co-option-address">{{ addr.province }}{{ addr.city }}{{ addr.area }}{{ addr.detailedAddress }}</div>
              </div>
            </div>
        </div>

          <!-- 分隔线 -->
          <div class="co-divider"></div>

        <!-- 微信支付 -->
          <div class="co-payment-section">
          <div class="co-payment-info">
            <div class="co-wechat-icon">
              <img src="/icons/wx.png" alt="微信" />
            </div>
            <span class="co-payment-text">微信支付</span>
          </div>
          <div class="co-radio-btn" :class="{ active: selectedPayment === 'wechat' }" @click="selectPayment('wechat')"></div>
        </div>

        <!-- 分隔线 -->
        <div class="co-divider"></div>

        <!-- 支付宝支付 -->
          <div class="co-payment-section">
          <div class="co-payment-info">
            <div class="co-wechat-icon">
              <img src="/icons/zfb.png" alt="支付宝" />
            </div>
            <span class="co-payment-text">支付宝支付</span>
          </div>
          <div class="co-radio-btn" :class="{ active: selectedPayment === 'alipay' }" @click="selectPayment('alipay')"></div>
        </div>
        </div>

        <!-- 立即支付按钮 -->
        <div class="co-pay-btn-container">
          <button 
            class="co-pay-btn" 
            @click="openPaymentQR" 
            :disabled="isCreatingOrder"
          >
            {{ isCreatingOrder ? '创建订单中...' : '立即支付' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 支付二维码弹窗 -->
  <div v-if="showPaymentQR" class="qr-modal-mask" @click.self="closePaymentQR">
    <div class="qr-modal" role="dialog" aria-modal="true" aria-label="支付二维码">
      <div class="qr-container">
        <!-- 二维码 -->
          <div v-if="paymentQRUrl" id="qrcode-container" class="qr-image-container">
            <!-- 二维码将通过JavaScript生成 -->
          </div>
          <div v-else class="qr-loading">
            正在生成二维码...
          </div>

        <!-- 支付提示 -->
        <!-- <div class="payment-hint">
          <span v-if="selectedPayment === 'alipay'" class="payment-text">请使用支付宝APP扫描二维码完成支付</span>
          <span v-else class="payment-text">请使用微信APP扫描二维码完成支付</span>
        </div> -->
        
        <!-- 订单号信息 -->
        <div class="order-info">
          <span v-if="selectedPayment === 'alipay'" class="payment-text">请使用支付宝扫描二维码完成支付</span>
          <span v-else class="payment-text">请使用微信扫描二维码完成支付</span>
        </div>
        
      </div>
    </div>
    </div>

  <!-- 支付结果弹框 -->
  <div v-if="showPaymentResult" class="payment-result-mask">
    <div class="payment-result-modal" role="dialog" aria-modal="true" :aria-label="paymentResultType === 'success' ? '支付成功' : '支付失败'">
      <div class="payment-result-container">
        <!-- 图标区域 -->
        <div class="payment-result-icon">
          <div v-if="paymentResultType === 'success'" class="success-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#10B981"/>
              <path d="M9 12L11 14L15 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div v-else class="error-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#EF4444"/>
              <path d="M15 9L9 15M9 9L15 15" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        
        <!-- 标题 -->
        <div class="payment-result-title">
          {{ paymentResultType === 'success' ? '支付成功' : '支付失败' }}
        </div>
        
        <!-- 副标题 -->
        <div class="payment-result-message">
          {{ paymentResultMessage }}
        </div>
        
        <!-- 按钮区域 -->
        <div class="payment-result-actions">
          <button 
            v-if="paymentResultType === 'success'" 
            class="result-btn result-btn-secondary" 
            @click="handlePublishWork"
            :disabled="isPublishingWork"
          >
            {{ isPublishingWork ? '发布中...' : '发布作品' }}
          </button>
          <button class="result-btn result-btn-primary" @click="closePaymentResult">
            确认
          </button>
        </div>
      </div>
    </div>
    </div>
  
    <!-- 尺码信息弹出框 -->
    <SizeInfoModal :show="showSizeInfoModal" :style-id="Number(selectedModel)" @close="closeSizeInfoModal" />

    <!-- 产品信息弹出框 -->
    <ProductInfoModal :show="showProductInfoModal" :style-id="Number(selectedModel)" @close="closeProductInfoModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick, toRefs } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SizeInfoModal from '../components/SizeInfoModal.vue'
import ProductInfoModal from '../components/ProductInfoModal.vue'
import { 
  getAllActiveClothingStylesWithColors,
  getAllColors,
  getAllSizes,
  getAllModels,
  getUserAddresses,
  getCurrentUser,
  type ClothingStyle,
  type Color,
  type Size,
  type Model,
  type Address,
  type User
} from '../api/authApiLite'
import { 
  createOrder,
  getOrderStatus,
  type CreateOrderRequest,
  type CreateOrderResponse,
  type OrderItem
} from '../api/orderApiLite'
import { 
  uploadCustomizationImage, 
  uploadCanvasImage 
} from '../api/fileApi'
import { 
  publishWork, 
  type PublishWorkRequest 
} from '../api/worksApi'


// 路由
const router = useRouter()
const route = useRoute()

// 返回功能
const goBack = () => {
  router.back()
}

// 页面挂载时加载数据
onMounted(async () => {
  // 并行加载后端数据
  await Promise.all([
    loadClothingStyles(),
    loadCurrentUser(),
    loadUserAddresses()
  ])
  
  // 检查URL参数，如果有styleId，则选择对应的款式
  const styleIdParam = route.query.styleId
  if (styleIdParam) {
    const styleId = typeof styleIdParam === 'string' ? styleIdParam : styleIdParam[0]
    if (styleId && clothingStyles.value.some(s => s.id.toString() === styleId)) {
      await selectModel(styleId)
    }
  }
})
onBeforeUnmount(() => {
  // 清理轮询
  stopOrderStatusPolling()
})

// 响应式数据
const selectedModel = ref('tshirt')
const uploadedImage = ref('') // 本地预览用的Base64
const uploadedImageUrl = ref('') // MinIO存储的URL
const position = ref({ x: 0, y: -30 })
const DEFAULT_SCALE_DELTA = 10 // 初始缩放 110%
const DEFAULT_POSITION_Y = -30 // 默认Y位置
const scaleDelta = ref(DEFAULT_SCALE_DELTA)  // -50..50，对应百分比 50%..150%  // -180..180，显示 0° 在中间
const opacity = ref(100)
const fileInput = ref<HTMLInputElement>()
const clothingPreviewRef = ref<HTMLElement>()
const clothingBaseRef = ref<HTMLElement>()

// 弹出框状态
const showSizeInfoModal = ref(false)
const showProductInfoModal = ref(false)

// 根据颜色名称获取hex值的函数
const getColorHex = (colorName: string): string => {
  const colorHexMap: Record<string, string> = {
    '白色': '#ffffff',
    'white': '#ffffff',
    '白': '#ffffff',
    '黑色': '#000000',
    'black': '#000000',
    '黑': '#000000',
    '浅灰': '#b0b0b0',
    '浅灰色': '#b0b0b0',
    'light-gray': '#b0b0b0',
    '灰色': '#b0b0b0',
    '深灰': '#4a4a4a',
    '深灰色': '#4a4a4a',
    'dark-gray': '#4a4a4a',
    '炭灰': '#4a4a4a',
    '红色': '#ff0000',
    'red': '#ff0000',
    '红': '#ff0000',
    '蓝色': '#0000ff',
    'blue': '#0000ff',
    '蓝': '#0000ff',
    '深蓝色': '#545E74',
    '深蓝': '#545E74',
    'dark-blue': '#545E74',
    'navy-blue': '#545E74',
    '绿色': '#414B42',
    'green': '#414B42',
    '绿': '#414B42',
    '黄色': '#ffff00',
    'yellow': '#ffff00',
    '黄': '#ffff00',
    '粉色': '#ffc0cb',
    'pink': '#ffc0cb',
    '粉': '#ffc0cb',
    '浅粉': '#e9dfd5',
    '浅粉色': '#e9dfd5',
    'light-pink': '#e9dfd5',
    '橙色': '#ffa500',
    'orange': '#ffa500',
    '橙': '#ffa500',
    '紫色': '#800080',
    'purple': '#800080',
    '紫': '#800080',
    '米色': '#f5f5dc',
    'beige': '#f5f5dc',
    '卡其色': '#4E4A39',
    'khaki': '#4E4A39',
    '军绿': '#4b5320',
    '军绿色': '#4b5320',
    'navy': '#000080',
    '藏青': '#000080',
    '藏青色': '#000080',
    '深棕色': '#5a4334',
    '深棕': '#5a4334',
    'dark-brown': '#5a4334',
    '棕色': '#5a4334',
    'brown': '#5a4334',
    '浅棕色': '#7e7360',
    '浅棕': '#7e7360',
    'light-brown': '#7e7360',
    '淡棕': '#7e7360',
    '橄榄绿': '#54563C',
    '橄榄': '#54563C',
    'olive': '#54563C',
    'olive-green': '#54563C',
  }
  
  const lowerName = colorName.toLowerCase()
  return colorHexMap[lowerName] || colorHexMap[colorName] || '#cccccc' // 默认灰色
}

// 根据后端模型数据动态生成色卡
const availableColorSwatches = computed(() => {
  // 如果没有后端模型数据，返回空数组
  if (!availableModels.value || availableModels.value.length === 0) {
    return []
  }
  
  // 从后端模型中提取唯一的颜色
  const uniqueColors = new Map<string, { value: string; label: string; hex: string }>()
  
  availableModels.value.forEach(model => {
    if (model.color) {
      const colorName = model.color
      const colorValue = colorName.toLowerCase().replace(/色$/, '').replace(/\s+/g, '-')
      
      if (!uniqueColors.has(colorValue)) {
        uniqueColors.set(colorValue, {
          value: colorValue,
          label: colorName,
          hex: getColorHex(colorName)
        })
      }
    }
  })
  
  return Array.from(uniqueColors.values())
})

// 图片加载错误处理
const onImageError = () => {
  // 可以在这里设置一个默认图片或处理错误
}

// 图片加载成功处理
const onImageLoad = () => {
  // 图片加载成功
}

// 各款式上传区域配置（相对 clothing-base 的百分比定位/尺寸）
type DesignAreaConfig = {
  topPercent: number
  leftPercent: number
  widthPercent: number
  heightPercent: number
  radiusRem?: number
}

const designAreaConfigs: Record<string, DesignAreaConfig> = {
  // 后端款式ID的配置
  '3': { topPercent: 24, leftPercent: 50, widthPercent: 35, heightPercent: 52}, // T-shirt
  '4': { topPercent: 25, leftPercent: 50, widthPercent: 30, heightPercent: 50}, // 连帽卫衣
  '5': { topPercent: 27, leftPercent: 50, widthPercent: 34, heightPercent: 31}, // 图案卫衣
  // 预留其它款式：hoodie、tote、beanie、scarf，可后续补充
}

const currentDesignArea = computed(() => designAreaConfigs[selectedModel.value])
const designAreaStyle = computed(() => {
  const cfg = currentDesignArea.value
  if (!cfg) return {}
  return {
    top: cfg.topPercent + '%',
    left: cfg.leftPercent + '%',
    width: cfg.widthPercent + '%',
    height: cfg.heightPercent + '%',
    transform: 'translateX(-50%)',
    borderRadius: (cfg.radiusRem ?? 0) + 'rem'
  } as Record<string, string>
})

// 产品模型数据 - 保留原始硬编码数据作为fallback
const defaultModels = [
  { id: 'tshirt', name: 'T-shirt', icon: '👕', desc: '经典圆领T恤，适合日常穿着与印花展示，面料舒适，版型中性。' },
  { id: 'hoodie', name: 'Hoodie', icon: '🧥', desc: '连帽卫衣，内里加绒可选，适合秋冬季节，保暖与潮流兼顾。' },
  { id: 'tote', name: 'Tote Bag', icon: '👜', desc: '大容量帆布包，耐磨耐用，适合通勤和购物，图案展示面积大。' },
  { id: 'beanie', name: 'Beanie', icon: '🧢', desc: '经典棒球帽，适合日常佩戴，图案展示面积大。' },
  { id: 'scarf', name: 'Scarf', icon: '🧣', desc: '围巾，适合秋冬季节，保暖与潮流兼顾。' },
]

// 后端服装款式数据
const clothingStyles = ref<ClothingStyle[]>([])
const loading = ref(false)

// 加载服装款式数据
const loadClothingStyles = async () => {
  loading.value = true
  // 暂时移除页面缩放，避免 html2canvas 在 transform 下裁切
  document.documentElement.classList.add('for-capture')
  try {
    const result = await getAllActiveClothingStylesWithColors()
    if (result.success && result.data && Array.isArray(result.data)) {
      clothingStyles.value = result.data
      console.log('成功加载服装款式:', result.data.length, '个')
      
      // 如果有数据，默认选择第一个款式
      if (result.data.length > 0) {
        await selectModel(result.data[0].id.toString())
      }
    } else {
      console.warn('加载服装款式失败，使用默认数据:', result.message)
      await useDefaultData()
    }
  } catch (error) {
    console.error('加载服装款式出错，使用默认数据:', error)
    await useDefaultData()
  } finally {
    loading.value = false
  }
}

// 使用默认数据的统一处理函数
const useDefaultData = async () => {
  console.log('使用默认数据模式')
  clothingStyles.value = []
  if (defaultModels.length > 0) {
    selectedModel.value = defaultModels[0].id
    // 为默认款式加载通用的颜色和尺码（不依赖认证的接口）
    await loadColorsAndSizes()
    // 设置默认颜色为白色
    selectedColor.value = 'white'
  }
}

// 加载指定款式的颜色、尺码和模型数据
const loadColorsAndSizes = async (styleId?: number) => {
  try {
    console.log(`开始加载款式${styleId}的数据...`)
    
    // 并行加载颜色、尺码和模型
    const [colorsResult, sizesResult, modelsResult] = await Promise.all([
      getAllColors(undefined, styleId),
      getAllSizes(undefined, styleId),
      styleId ? getAllModels() : Promise.resolve({ success: false, data: [] })
    ])
    
    // 调试：打印原始数据
    if (sizesResult.success && sizesResult.data) {
      
    }
    
    // 处理颜色数据
    if (colorsResult.success && colorsResult.data && Array.isArray(colorsResult.data)) {
      availableColors.value = colorsResult.data
    } else {
      availableColors.value = []
    }
    
    // 处理尺码数据
    if (sizesResult.success && sizesResult.data && Array.isArray(sizesResult.data)) {
      let filteredSizes = sizesResult.data
      
      // 如果指定了styleId，优先显示该款式的尺码
      if (styleId) {
        const matchingSizes = sizesResult.data.filter((size: Size) => 
          size.styleId === styleId || size.styleId === Number(styleId)
        )
        
        // 如果找到匹配的尺码，使用匹配的；否则使用通用尺码（styleId为null或undefined的）
        if (matchingSizes.length > 0) {
          filteredSizes = matchingSizes
        } else {
          // 尝试使用通用尺码（没有特定款式限制的）
          const genericSizes = sizesResult.data.filter((size: Size) => 
            !size.styleId || size.styleId === null
          )
          if (genericSizes.length > 0) {
            filteredSizes = genericSizes
          } else {
            // 最后兜底：显示所有尺码
            filteredSizes = sizesResult.data
          }
        }
      }
      
      // 排序并去重（按尺码名称去重，优先保留有styleId的）
      const uniqueSizes = new Map<string, Size>()
      filteredSizes.forEach((size: Size) => {
        const key = size.name
        const existing = uniqueSizes.get(key)
        
        // 优先保留有明确styleId的尺码，其次保留当前遍历到的
        if (!existing || (size.styleId && !existing.styleId)) {
          uniqueSizes.set(key, size)
        }
      })
      
      const sortedSizes = Array.from(uniqueSizes.values()).sort((a: Size, b: Size) => {
        // 标准尺码排序：S, M, L, XL, 2XL, 3XL...
        const sizeOrder = ['S', 'M', 'L', 'XL', '2XL']
        const aIndex = sizeOrder.indexOf(a.name)
        const bIndex = sizeOrder.indexOf(b.name)
        
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex
        } else if (aIndex !== -1) {
          return -1
        } else if (bIndex !== -1) {
          return 1
        } else {
          return a.name.localeCompare(b.name)
        }
      })
      
      availableSizes.value = sortedSizes
      
      // 重置尺码数量
      const newSizeQuantities: Record<string, number> = {}
      sortedSizes.forEach((size: Size) => {
        newSizeQuantities[size.name] = 0
      })
      sizeQuantities.value = newSizeQuantities
    } else {
      availableSizes.value = []
      sizeQuantities.value = {}
    }
    
    // 处理模型数据
    if (modelsResult.success && modelsResult.data && Array.isArray(modelsResult.data)) {
      // 如果有styleId，过滤出当前款式的模型；如果模型的styleId为null但颜色匹配也包括
      let filteredModels = modelsResult.data
      
      if (styleId) {
        // 首先尝试精确匹配styleId
        let exactMatches = modelsResult.data.filter(model => model.styleId === styleId)
        
        // 对于T-shirt款式，也包括styleId为null的模型（兼容数据不完整的情况）
        if (styleId === 3) { // T-shirt的styleId是3
          const nullStyleModels = modelsResult.data.filter(model => model.styleId === null)
          filteredModels = [...exactMatches, ...nullStyleModels]
        } else {
          filteredModels = exactMatches
          // 如果其他款式没有找到匹配的，也尝试包括null的模型
          if (filteredModels.length === 0) {
            filteredModels = modelsResult.data.filter(model => 
              model.styleId === styleId || model.styleId === null
            )
          }
        }
      }
      
      availableModels.value = filteredModels
    } else {
      availableModels.value = []
    }
    
    // 重置选中状态，但自动选择第一个可用颜色
    // 使用nextTick确保计算属性已更新
    await new Promise(resolve => setTimeout(resolve, 0))
    if (availableColorSwatches.value.length > 0) {
      selectedColor.value = availableColorSwatches.value[0].value
    } else {
      selectedColor.value = ''
    }
    selectedSize.value = ''
    
  } catch (error) {
    console.error('加载颜色、尺码和模型出错:', error)
    availableColors.value = []
    availableSizes.value = []
    availableModels.value = []
    sizeQuantities.value = {}
    selectedColor.value = ''
    selectedSize.value = ''
  }
}

// 兼容现有代码的models数据，优先使用后端数据，fallback到默认数据
const models = computed(() => {
  if (clothingStyles.value && clothingStyles.value.length > 0) {
    // 将后端数据转换为前端需要的格式
    return clothingStyles.value.map(style => ({
      id: style.id.toString(),
      name: style.name || 'Unknown',
      icon: '👕', // 保持图标，后续可以根据类型映射
      desc: style.description || ''
    }))
  }
  return defaultModels
})



// const currentModelDesc = computed(() => {
//   const m = models.value.find(m => m.id === selectedModel.value)
//   return m?.desc || ''
// })

const designStyle = computed(() => ({
  transform: `translate(${position.value.x}px, ${position.value.y}px) scale(${(100 + scaleDelta.value) / 100 * 0.9})`,
  opacity: opacity.value / 100
}))

// 根据选中色卡和后端模型数据计算衣服图片
const baseImageSrc = computed(() => {
  // 如果有后端模型数据，优先使用
  if (availableModels.value && availableModels.value.length > 0 && selectedColor.value) {
    // 查找匹配当前选中颜色的模型
    const matchingModel = availableModels.value.find(model => {
      if (!model.color) return false
      
      // 将后端颜色名称转换为value格式进行匹配
      const modelColorValue = model.color.toLowerCase().replace(/色$/, '').replace(/\s+/g, '-')
      
      return modelColorValue === selectedColor.value
    })

      if (matchingModel && matchingModel.frontUrl) {
      // 直接使用后端返回的frontUrl
      return matchingModel.frontUrl
    }
  }
  
  // Fallback到原有的硬编码图片逻辑（用于开发测试）
  if (selectedModel.value === 'tshirt') {
  switch (selectedColor.value) {
    case 'white':
      case '白':
      return '/images/tshirt_white.png'
    case 'black':
      case '黑':
      return '/images/tshirt_black.png'
    case 'light-gray':
      case '浅灰':
      return '/images/tshirt_grey1.png'
    case 'dark-gray':
      case '深灰':
      return '/images/tshirt_grey2.png'
    default:
      return ''
  }
  }
  
  // 对于其他款式，如果没有后端图片，返回空字符串（不显示图片）
  return ''
})

// 颜色、尺码和模型数据（从后端获取）
const availableColors = ref<Color[]>([])
const availableSizes = ref<Size[]>([])
const availableModels = ref<Model[]>([])
const selectedColor = ref('')
const selectedSize = ref('')
const sizeQuantities = ref<Record<string, number>>({})

// 计算总数量
const totalQuantity = computed(() => {
  return Object.values(sizeQuantities.value).reduce((sum, qty) => sum + qty, 0)
})

// 单价（RMB）
const unitPrice = ref(99)

// 计算总价格
const totalPrice = computed(() => {
  return totalQuantity.value * unitPrice.value
})


// 生成按尺码分组的产品列表
const productItems = computed(() => {
  const items = []
  
  // 遍历所有尺码数量，为每个有数量的尺码创建产品条目
  for (const [sizeName, quantity] of Object.entries(sizeQuantities.value)) {
    if (quantity > 0) {
      items.push({
        title: '定制T恤',
        color: selectedColor.value,
        size: sizeName,
        icon: compositeImageData.value || baseImageSrc.value || '/images/1.png',
        price: `${unitPrice.value} RMB`,
        quantity: quantity,
        totalPrice: unitPrice.value * quantity
      })
    }
  }
  
  return items
})

// 方法
const selectModel = async (modelId: string) => {
  selectedModel.value = modelId
  
  // 根据款式设置默认缩放和位移
  if (modelId === '5') {
    // 连帽卫衣：100% 缩放，0px 位移
    scaleDelta.value = 0
    position.value = { x: 0, y: 0 }
  } else {
    // 其他款式：使用默认值
    scaleDelta.value = DEFAULT_SCALE_DELTA
    position.value = { x: 0, y: DEFAULT_POSITION_Y }
  }
  
  // 根据选中的款式加载对应的颜色和尺码
  const styleId = parseInt(modelId)
  if (!isNaN(styleId)) {
    // 如果是后端数据的款式ID（数字）
    await loadColorsAndSizes(styleId)
  } else {
    // 如果是默认数据的款式ID（字符串如'tshirt'）
    await loadColorsAndSizes()
  }
}

const selectSize = (size: string) => {
  selectedSize.value = size
}

const getCurrentSizeQuantity = () => {
  return selectedSize.value ? sizeQuantities.value[selectedSize.value as keyof typeof sizeQuantities.value] : 0
}

const increaseCurrentSize = () => {
  if (selectedSize.value) {
    sizeQuantities.value[selectedSize.value]++
  }
}

const decreaseCurrentSize = () => {
  if (selectedSize.value && sizeQuantities.value[selectedSize.value] > 0) {
    sizeQuantities.value[selectedSize.value]--
  }
}

const triggerUpload = () => {
  fileInput.value?.click()
}

const uploadedFile = ref<File | null>(null) // 存储原始文件，用于稍后上传

const handleImageUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  
  if (file) {
    // 存储文件引用，用于稍后上传到MinIO
    uploadedFile.value = file
    
    // 只做本地预览，不上传到MinIO
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedImage.value = e.target?.result as string
      // 根据当前款式设置默认缩放和位移
      if (selectedModel.value === '5') {
        // 连帽卫衣：100% 缩放，0px 位移
        scaleDelta.value = 0
        position.value = { x: 0, y: 0 }
      } else {
        // 其他款式：使用默认值
      scaleDelta.value = DEFAULT_SCALE_DELTA
      position.value = { x: 0, y: DEFAULT_POSITION_Y }
      }
    }
    reader.readAsDataURL(file)
  }
}

// 创建订单弹窗
const showCreateOrder = ref(false)
const compositeImageData = ref<string>('') // 本地预览用的Base64
const compositeImageUrl = ref<string>('') // MinIO存储的URL
const isGeneratingImage = ref(false)

// 验证函数
const validateOrder = (): string | null => {
  // 检查是否上传了图片
  if (!uploadedImage.value) {
    return '请先上传图片'
  }
  
  // 检查数量是否大于0（这个检查已经隐含了至少选择了一个尺码）
  if (totalQuantity.value <= 0) {
    return '请选择数量'
  }
  
  // 检查是否选择了颜色
  if (!selectedColor.value) {
    return '请选择颜色'
  }
  
  return null
}

// 显示浏览器原生提示框
const showAlert = (message: string) => {
  alert(message)
}

// 手工合成（Canvas）函数
const loadImage = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => resolve(img)
  img.onerror = reject
  img.src = src
})

// 已删除composeShirtAndUpload函数，使用新的generateCompositeCanvas方法

// 纯Canvas合成方法 - 基于透明背景T恤图片
const generateCompositeCanvas = async (): Promise<HTMLCanvasElement> => {
  
  if (!baseImageSrc.value) {
    throw new Error('T恤底图不存在')
  }
  
  if (!uploadedImage.value) {
    throw new Error('用户设计图不存在')
  }

  // 创建高分辨率输出Canvas
  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 960
  const ctx = canvas.getContext('2d')!

  // 并发加载图片
  const [baseImg, designImg] = await Promise.all([
    loadImage(baseImageSrc.value),
    loadImage(uploadedImage.value)
  ])

  console.log('[纯Canvas合成] 图片加载完成', {
    baseImg: `${baseImg.naturalWidth}x${baseImg.naturalHeight}`,
    designImg: `${designImg.naturalWidth}x${designImg.naturalHeight}`
  })

  // 清空Canvas（透明背景）
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 绘制T恤底图（保持透明背景）
  const containScale = Math.min(canvas.width / baseImg.naturalWidth, canvas.height / baseImg.naturalHeight)
  const finalScale = containScale * 1.1
  const baseDw = baseImg.naturalWidth * finalScale
  const baseDh = baseImg.naturalHeight * finalScale
  const baseDx = (canvas.width - baseDw) / 2
  const baseDy = (canvas.height - baseDh) / 2
  
  ctx.drawImage(baseImg, baseDx, baseDy, baseDw, baseDh)

  // 绘制用户设计图案
  const cfg = currentDesignArea.value
  if (cfg) {
    // 计算设计区域在Canvas上的实际位置和尺寸
    const areaW = Math.round(canvas.width * (cfg.widthPercent / 100))
    const areaH = Math.round(canvas.height * (cfg.heightPercent / 100))
    const areaX = Math.round(canvas.width * (cfg.leftPercent / 100) - areaW / 2)
    const areaY = Math.round(canvas.height * (cfg.topPercent / 100))


    // 保存Canvas状态并设置剪切区域
    ctx.save()
    ctx.beginPath()
    ctx.rect(areaX, areaY, areaW, areaH)
    ctx.clip()

    // 计算用户设计图案的位置和尺寸
    const baseScale = Math.min(areaW / designImg.naturalWidth, areaH / designImg.naturalHeight)
    const uiScale = ((100 + scaleDelta.value) / 100) * 0.9
    const scale = baseScale * uiScale
    const dw = designImg.naturalWidth * scale
    const dh = designImg.naturalHeight * scale
    const cx = areaX + areaW / 2 + position.value.x
    const cy = areaY + areaH / 2 + position.value.y

    
    // 绘制用户设计图案
    ctx.translate(cx, cy)
    ctx.globalAlpha = opacity.value / 100
    ctx.drawImage(designImg, -dw / 2, -dh / 2, dw, dh)
    
    ctx.restore()
  }

  return canvas
}

// 用于预览显示的Canvas生成（带白色背景）
const generateCompositeCanvasWithWhiteBg = async (): Promise<HTMLCanvasElement> => {

  
  const canvas = await generateCompositeCanvas()
  
  // 创建新的Canvas，添加白色背景
  const previewCanvas = document.createElement('canvas')
  previewCanvas.width = canvas.width
  previewCanvas.height = canvas.height
  const ctx = previewCanvas.getContext('2d')!
  
  // 绘制白色背景
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height)
  
  // 绘制透明背景的合成图
  ctx.drawImage(canvas, 0, 0)

  return previewCanvas
}

const generateCompositeImage = async (): Promise<string> => {

  
  try {
    // 使用带白色背景的Canvas方法
    const canvas = await generateCompositeCanvasWithWhiteBg()
    const imageData = canvas.toDataURL('image/png', 0.9)

    return imageData
  } catch (error) {
    console.error('[预览图] 生成失败:', error)
    throw error
  }
}

const onCustomizeNow = async () => { 
  // 首先检查用户是否已登录
  if (!currentUser.value) {
    alert('请您先登录后再进行定制下单')
    return
  }

  const errorMessage = validateOrder()
  if (errorMessage) {
    showAlert(errorMessage)
    return
  }

  if (isGeneratingImage.value) {
    return
  }

  try {
    isGeneratingImage.value = true
    
    // 等待一小段时间，确保所有图片都已渲染
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 生成合成图片（仅预览用，不上传）
    const generatedImage = await generateCompositeImage()
    compositeImageData.value = generatedImage
    
    // 打开创建订单弹窗
    showCreateOrder.value = true 
  } catch (error) {
    console.error('生成预览图片失败:', error)
    // 如果生成失败，就清空合成图片数据，这样会fallback到baseImageSrc
    compositeImageData.value = ''
    showAlert('图片合成失败，将显示基础图片')
    // 仍然打开弹窗
    showCreateOrder.value = true
  } finally {
    isGeneratingImage.value = false
  }
}
const closeCreateOrder = () => { 
  showCreateOrder.value = false 
  // 可选：清理生成的图片数据以释放内存
  // compositeImageData.value = ''
}

// 地址管理
const showAddressDropdown = ref(false)
// 用户相关状态
const currentUser = ref<User | null>(null)

const addresses = ref<Address[]>([])
const selectedAddress = ref(-1) // 当前选中的地址索引
const addressLoading = ref(false)

// 加载用户信息
const loadCurrentUser = async () => {
  try {
    const result = await getCurrentUser()
    if (result.success && result.data) {
      currentUser.value = result.data
    } else {
      console.error('获取用户信息失败:', result.message)
      // 可以重定向到登录页面或显示错误信息
    }
  } catch (error) {
    console.error('获取用户信息出错:', error)
  }
}

// 加载用户地址数据
const loadUserAddresses = async () => {
  addressLoading.value = true
  try {
    const result = await getUserAddresses()
    if (result.success && result.data && Array.isArray(result.data)) {
      addresses.value = result.data
      // 设置默认选中第一个地址（如果有的话）
      selectedAddress.value = result.data.length > 0 ? 0 : -1
    } else {
      console.warn('获取地址列表失败:', result.message)
      addresses.value = []
      selectedAddress.value = -1
    }
  } catch (error) {
    console.error('获取地址列表出错:', error)
    addresses.value = []
    selectedAddress.value = -1
  } finally {
    addressLoading.value = false
  }
}

const toggleAddressDropdown = () => {
  showAddressDropdown.value = !showAddressDropdown.value
}

const selectAddress = (index: number) => {
  selectedAddress.value = index
  showAddressDropdown.value = false
}


// 支付方式选择
const selectedPayment = ref('wechat') // 默认选择微信支付

const selectPayment = (type: string) => {
  selectedPayment.value = type
}

// 支付二维码弹窗
const showPaymentQR = ref(false)
const orderNumber = ref('')
const paymentQRUrl = ref('')
const createdOrderData = ref<CreateOrderResponse | null>(null)
const isCreatingOrder = ref(false)

const openPaymentQR = async () => {
  // 验证基本信息
  if (!uploadedImage.value || !uploadedFile.value) {
    alert('请先上传设计图片')
    return
  }

  // 检查用户是否是管理员
  const isAdmin = currentUser.value?.roleId === 2
  if (isAdmin) {
    // 管理员跳过支付流程，直接显示支付成功页面进行作品发布
    showPaymentSuccess('管理员免支付，请选择分类并发布作品')
    return
  }
  
  console.log('💳 普通用户，进入正常支付流程')

  // === 普通用户的支付流程 ===
  
  // 验证必要信息
  if (addresses.value.length === 0 || selectedAddress.value < 0) {
    alert('请先选择收货地址')
    return
  }

  if (totalQuantity.value <= 0) {
    alert('请先选择商品数量')
    return
  }

  if (!selectedColor.value) {
    alert('请先选择颜色')
    return
  }

  try {
    isCreatingOrder.value = true
    
    // 第一步：上传用户原始图片到MinIO
    const userImageUrl = await uploadCustomizationImage(uploadedFile.value)
    uploadedImageUrl.value = userImageUrl

    // 第二步：生成合成图片并上传到MinIO
    // 用于订单创建，使用透明背景Canvas
    const canvas = await generateCompositeCanvas()
    const compositeUrl = await uploadCanvasImage(canvas, `composite_${Date.now()}.png`)
    compositeImageUrl.value = compositeUrl

    // 检查选中的模型
    const selectedModelData = models.value.find(m => m.id === selectedModel.value)
    if (!selectedModelData) {
      alert('请先选择服装款式')
      return
    }

    // 构建订单项
    const orderItems: OrderItem[] = []
    for (const [sizeName, quantity] of Object.entries(sizeQuantities.value)) {
      if (quantity > 0) {
        orderItems.push({
          // 定制商品字段
          modelId: Number(selectedModelData.id),
          customizationPhotoUrl: compositeImageUrl.value, // MinIO合成图片URL
          customizationImage: uploadedImageUrl.value, // MinIO用户图片URL
          
          // 通用字段
          orderCategory: 'custom', // 定制商品
          quantity: quantity,
          price: unitPrice.value, // 使用单价
          productName: selectedModelData.name || '定制T恤',
          color: selectedColor.value,
          size: sizeName
        })
      }
    }

    // 检查用户信息
    if (!currentUser.value) {
      alert('用户信息未加载，请刷新页面重试')
      return
    }

    // 构建创建订单请求
    const createOrderRequest: CreateOrderRequest = {
      userId: currentUser.value.id,
      shippingAddressId: addresses.value[selectedAddress.value].id,
      paymentMethod: selectedPayment.value, // 'wechat' 或 'alipay'
      customerNotes: '',
      items: orderItems
    }

    // 调用创建订单API
    const result = await createOrder(createOrderRequest)

    if (result.success && result.data) {
      createdOrderData.value = result.data
      orderNumber.value = result.data.order.orderNumber
      
      // 如果有二维码URL（支持微信支付和支付宝支付）
      if (result.data.codeUrl) {
        paymentQRUrl.value = result.data.codeUrl
        showPaymentQR.value = true
        showCreateOrder.value = false // 关闭订单弹窗
        
        // 开始轮询订单状态
        startOrderStatusPolling(orderNumber.value)
      } else {
        alert('订单创建成功，但未获取到支付二维码')
      }
    } else {
      alert(result.message || '创建订单失败')
    }
    
  } catch (error) {
    console.error('创建订单出错:', error)
    alert('创建订单失败，请重试')
  } finally {
    isCreatingOrder.value = false
  }
}

const closePaymentQR = () => {
  showPaymentQR.value = false
  stopOrderStatusPolling()
}

// 订单状态轮询
let statusPollingTimer: number | null = null

const startOrderStatusPolling = (orderNo: string) => {
  
  // 清除之前的轮询
  stopOrderStatusPolling()
  
  // 每3秒查询一次订单状态
  statusPollingTimer = setInterval(async () => {
    try {
      const result = await getOrderStatus(orderNo)
      
      if (result.success && result.data) {
        const status = result.data.status
        
        if (status === 'PROCESSING') {
          // 支付成功
          stopOrderStatusPolling()
          showPaymentSuccess('支付成功！您的订单正在处理中')
        } else if (status === 'CANCELED' || status === 'EXPIRED') {
          // 订单取消或过期
          stopOrderStatusPolling()
          showPaymentFailure('订单已取消或过期，请重新下单')
        }
        // PENDING状态继续轮询
      }
    } catch (error) {
      console.error('查询订单状态失败:', error)
    }
  }, 3000)
  
  // 5分钟后停止轮询
  setTimeout(() => {
    stopOrderStatusPolling()

  }, 5 * 60 * 1000)
  

}

const stopOrderStatusPolling = () => {
  if (statusPollingTimer) {
    clearInterval(statusPollingTimer)
    statusPollingTimer = null
  }
}

// 生成二维码
const generateQRCode = (url: string) => {
  const container = document.getElementById('qrcode-container')
  if (!container) return
  
  // 清空容器
  container.innerHTML = ''
  
  try {
    // 检查是否是支付宝链接
    if (url.includes('qr.alipay.com') || url.includes('alipay.com')) {
      // 支付宝返回的是官方支付链接，直接转换为二维码图片
      const qrImg = document.createElement('img')
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=15&format=png&ecc=H&color=000000&bgcolor=ffffff&data=${encodeURIComponent(url)}`
      qrImg.alt = '支付宝支付二维码'
      qrImg.className = 'qr-image'
      qrImg.style.width = '100%'
      qrImg.style.height = '100%'
      qrImg.style.objectFit = 'contain'
      qrImg.style.display = 'block'
      qrImg.style.borderRadius = '0'
      qrImg.style.border = 'none'
      qrImg.style.outline = 'none'
      
      qrImg.onload = () => {
      }
      
      qrImg.onerror = () => {
        console.error('支付宝二维码生成失败')
        generateFallbackQR(container, url, '支付宝')
      }
      
      container.appendChild(qrImg)
      
    } else {
      // 微信支付返回的也是支付链接
      const qrImg = document.createElement('img')
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=15&format=png&ecc=H&color=000000&bgcolor=ffffff&data=${encodeURIComponent(url)}`
      qrImg.alt = '微信支付二维码'
      qrImg.className = 'qr-image'
      qrImg.style.width = '100%'
      qrImg.style.height = '100%'
      qrImg.style.objectFit = 'contain'
      qrImg.style.display = 'block'
      qrImg.style.borderRadius = '0'
      qrImg.style.border = 'none'
      qrImg.style.outline = 'none'
      
      qrImg.onload = () => {
      }
      
      qrImg.onerror = () => {
        console.error('微信二维码生成失败')
        generateFallbackQR(container, url, '微信')
      }
      
      container.appendChild(qrImg)
    }
  } catch (error) {
    const paymentType = selectedPayment.value === 'alipay' ? '支付宝' : '微信'
    generateFallbackQR(container, url, paymentType)
  }
}

// 降级二维码生成
const generateFallbackQR = (container: HTMLElement, url: string, paymentType = '支付宝') => {
  container.innerHTML = `
    <div class="qr-fallback">
      <div class="qr-fallback-text">二维码生成失败</div>
      <div class="qr-fallback-url" style="word-break: break-all; margin: 10px 0; font-size: 12px;">${url}</div>
      <div class="qr-fallback-hint">请复制上方链接到${paymentType}APP中打开</div>
    </div>
  `
}

// 监听二维码URL变化
const { paymentQRUrl: watchedQRUrl } = toRefs({ paymentQRUrl })
watch(watchedQRUrl, (newUrl) => {
  if (newUrl && showPaymentQR.value) {
    // 等待DOM更新后生成二维码
    nextTick(() => {
      generateQRCode(newUrl)
    })
  }
})

// 支付结果弹框
const showPaymentResult = ref(false)
const paymentResultType = ref<'success' | 'failure'>('success')
const paymentResultMessage = ref('')

// 发布作品状态
const isPublishingWork = ref(false)

const showPaymentSuccess = (message = '您的订单已支付成功，我们将尽快为您定制发货') => {
  paymentResultType.value = 'success'
  paymentResultMessage.value = message
  showPaymentResult.value = true
  showPaymentQR.value = false // 关闭支付二维码弹窗
}

const showPaymentFailure = (message = '您的订单支付失败，请稍后重新支付') => {
  paymentResultType.value = 'failure'
  paymentResultMessage.value = message
  showPaymentResult.value = true
  showPaymentQR.value = false // 关闭支付二维码弹窗
}

const closePaymentResult = () => {
  showPaymentResult.value = false
}

// 处理发布作品
const handlePublishWork = async () => {
  // 检查用户是否已登录（有真实token）
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
  if (!token) {
    alert('请先登录后再发布作品')
    return
  }

  if (!uploadedImage.value || !uploadedFile.value) {
    alert('请先上传设计图片')
    return
  }

  if (!currentUser.value || !currentUser.value.id) {
    alert('用户信息缺失，请刷新页面重试')
    return
  }

  try {
    isPublishingWork.value = true
    
    let userImageUrl = uploadedImageUrl.value
    let compositeUrl = compositeImageUrl.value
    
    // 如果图片URL为空，需要先上传图片
    if (!userImageUrl) {

      userImageUrl = await uploadCustomizationImage(uploadedFile.value)
      uploadedImageUrl.value = userImageUrl

    }
    
    if (!compositeUrl) {

      // 用于作品发布，使用透明背景Canvas
      const canvas = await generateCompositeCanvas()
      compositeUrl = await uploadCanvasImage(canvas, `composite_${Date.now()}.png`)
      compositeImageUrl.value = compositeUrl

    }
    
    // 构建发布作品的请求数据
    const publishData: PublishWorkRequest = {
      userId: currentUser.value.id,
      name: currentUser.value.username || '定制作品',
      originalImage: userImageUrl,
      workImage: compositeUrl,
      styles: Number(selectedModel.value) // 添加款式ID
    }

    
    // 调用发布作品API
    await publishWork(publishData)
    
    // 发布成功
    alert('作品发布成功！')

    
    // 可以考虑关闭弹窗或跳转到作品页面
    closePaymentResult()
    
  } catch (error: any) {
    console.error('发布作品失败:', error)
    if (error.response?.status === 403) {
      alert('用户认证失效，请重新登录后再试')
    } else {
      alert('发布作品失败，请稍后重试')
    }
  } finally {
    isPublishingWork.value = false
  }
}



// 尺码信息和产品信息方法
const showSizeInfo = () => {
  showSizeInfoModal.value = true
}

const showProductInfo = () => {
  showProductInfoModal.value = true
}

// 关闭弹出框的方法
const closeSizeInfoModal = () => {
  showSizeInfoModal.value = false
}

const closeProductInfoModal = () => {
  showProductInfoModal.value = false
}


// 简单的步进与重置逻辑
const stepScale = (delta: number) => {
  const current = Number.isFinite(scaleDelta.value) ? scaleDelta.value : 0
  const next = Math.min(50, Math.max(-50, current + delta))
  scaleDelta.value = next
}

const resetScale = () => {
  scaleDelta.value = DEFAULT_SCALE_DELTA
}


const stepPosY = (delta: number) => {
  const cur = Number.isFinite(position.value.y) ? position.value.y : 0
  const next = cur + delta
  position.value = { ...position.value, y: Math.min(200, Math.max(-200, next)) }
}

const resetPosY = () => {
  position.value = { ...position.value, y: DEFAULT_POSITION_Y }
}

// 鼠标拖动与滚轮缩放
const isDragging = ref(false)
let dragStart = { x: 0, y: 0 }
let posStart = { x: 0, y: 0 }

const onDragStart = (e: MouseEvent) => {
  isDragging.value = true
  dragStart = { x: e.clientX, y: e.clientY }
  posStart = { x: position.value.x, y: position.value.y }
  window.addEventListener('mousemove', onDragging)
  window.addEventListener('mouseup', onDragEnd)
}

const onDragging = (e: MouseEvent) => {
  if (!isDragging.value) return
  const dx = e.clientX - dragStart.x
  const dy = e.clientY - dragStart.y
  position.value = {
    x: Math.min(200, Math.max(-200, posStart.x + dx)),
    y: Math.min(200, Math.max(-200, posStart.y + dy))
  }
}

const onDragEnd = () => {
  isDragging.value = false
  window.removeEventListener('mousemove', onDragging)
  window.removeEventListener('mouseup', onDragEnd)
}

const onWheelZoom = (e: WheelEvent) => {
  const delta = e.deltaY > 0 ? -1 : 1
  stepScale(delta)
}
</script>

<script lang="ts">
export default { name: 'CustomizePage' }
</script>

<style scoped>
.app-root {
  position: relative;
  width: 100%;
  height: 100%;
}

.customize-page {
  position: relative;
  min-height: 100dvh; /* 占满一屏的动态可视高度 */
  background: var(--color-bg);
  padding-block-end: 3rem;
  overflow-x: auto; /* 允许水平滚动以确保居中效果 */
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.customize-container {
  display: grid;
  grid-template-columns: 93rem 37rem; /* 中间画布 右侧控制面板 */
  gap: 3rem !important;
  align-items: start;
  min-height: calc(100dvh - 11.5rem);
  width: max-content;
  margin-inline: auto;
  margin-block-start: 3rem;
  margin-block-end: 3rem;
  box-sizing: border-box;
  position: relative;
  overflow: visible; /* 允许CTA按钮显示在容器外 */
}

/* 右侧面板容器 - 包含两个独立的面板 */
.right-panels-container {
  display: flex;
  flex-direction: column;
  gap: 2.8rem; /* 两个面板之间的间距 */
}

/* 左侧面板 */
.left-panel {
  background: transparent; /* 外层无大边框与背景 */
  border: none;
  padding: 0 !important; /* 由内部卡片控制内边距 */
  overflow: visible;
  align-self: start;
}

/* 返回按钮和标题行 */
.header-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;
}

.section-title {
  flex: 1;
  text-align: center;
  font-size: calc(var(--fs-md) * 1.1);
  font-weight: 500;
  color: var(--color-text);
  margin: 0;
}

/* 内联版返回按钮：作为列表第一项，继承相同的间距与样式 */
.back-btn--inline {
  position: static;               /* 进入文档流 */
  display: inline-flex;           /* 内容居中 */
  align-items: center;
  justify-content: center;
  align-self: flex-start;         /* 靠左对齐 */
  width: 4.2rem;   /* 增大尺寸 */
  height: 4.2rem;
  padding: 0;                     /* 去掉内边距，保持正方形 */
  background: var(--color-surface);
  border: 1px solid color-mix(in srgb, var(--color-border), transparent 30%);
  border-radius: var(--radius-md);
  color: var(--color-text);
  box-shadow: none;
  margin: 0;                      /* 由父级 section 的 row-gap 控制与下方列表的距离 */
  margin-top: 1.15rem; 
  margin-bottom: 1rem; /* 缩小与下面边框的间距 */
}
.back-btn--inline:hover { 
  background: color-mix(in srgb, var(--color-primary), transparent 92%);
  border-color: transparent;
}
.back-btn--inline svg { width: 24px; height: 24px; }

.back-btn:hover {
  background: color-mix(in srgb, var(--color-primary), transparent 92%);
  border-color: var(--color-primary);
  color: var(--color-text);
  transform: scale(1.06);
}

.back-btn svg {
  width: clamp(1.8rem, 2.5vw, 2.2rem);
  height: clamp(1.8rem, 2.5vw, 2.2rem);
  color: inherit;
}

/* 左侧两个卡片容器（取代原外层卡片） */
.left-stack {
  display: flex;
  flex-direction: column;
  gap: 2.3rem; /* 与左右屏幕间距保持一致 */
}
.left-card {
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
  /* 使用对称的上下内边距，确保顶部/底部留白一致 */
  --lc-pad: clamp(1.4rem, 3.2vw, 2.2rem);
  padding-inline: clamp(1.2rem, 3vw, 2rem);
  padding-block: var(--lc-pad);
}

/* 两个卡片都使用flex布局，根据内容自动调整高度 */
.left-stack .left-card {
  display: flex;
  flex-direction: column;
  overflow: visible;
  padding-block: 1.6rem; /* 缩小上下内边距 */
}


/* 所有卡片内的section根据内容自动调整高度 */
.left-stack .left-card .sidebar-section {
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* 内容靠上对齐 */
  gap: clamp(1.5rem, 3vw, 2rem); /* 增大内部间距 */
}

/* 第二个卡片（尺码选择）的内容分布调整 */
.left-stack .left-card:nth-child(2) .sidebar-section {
  justify-content: flex-start; /* 内容也靠上对齐 */
}

/* 防止内部元素产生额外的上下外边距导致不对称 */
.left-card .sidebar-section {
  margin: 0;
  /* flex布局已在上面定义，这里只保留margin重置 */
}
.left-card .model-list { margin: 0; }

/* 尺码选择和信息按钮合并边框包裹 - 与上面按钮边框样式一致 */
.size-wrapper {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding-inline: clamp(1.2rem, 2.2vw, 2rem);
  padding-block: 2.3rem;
  padding-bottom: 2.5rem;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
  gap: clamp(2.2rem, 5vw, 2.4rem); /* 增大尺码选择和信息按钮之间的间距 */
  margin-bottom: 1.5rem;
  margin-top: 1.5rem;
}


.size-quantity-controls {
  display: grid;
  gap: clamp(1rem, 2vw, 1.4rem);
}

/* .control-group 样式已移动到下方 */

/* 标题行：尺码标签和总数量 */
.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.control-label {
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.total-quantity {
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--color-text-muted);
}

/* 尺码选择行：左右+-按钮 + 中间尺码 */
.size-selection-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.size-options {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem; /* 缩小按钮间距以减少横向宽度 */
}

.size-btn {
  position: relative;
  /* 设置固定宽度，让所有尺码按钮长度一致 */
  width: 100%;
  min-width: 1.5rem; /* 缩小最小宽度 */
  padding: 0.8rem 0; /* 缩小上下内边距 */
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: calc(var(--fs-xs) * 0.9); /* 缩小字体 */
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.size-btn:hover {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary), transparent 95%);
}

.size-btn.active {
  border-color: var(--color-primary);
  border-width: 1px;
  background: var(--color-surface);
  color: var(--color-text);
}

/* 尺码和信息按钮包裹容器 - 移除边框和内间距 */
.size-info-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 0rem; /* 缩小与顶部边框的间距 */
}

/* 信息按钮容器 */
.info-buttons {
  display: flex;
  flex-direction: column;
  gap: 1.9rem; /* 与上面按钮间距保持一致 */
  width: 100%;
  margin-top: 2.2rem; /* 增大与尺码按钮的间距 */
  margin-bottom: 0rem; /* 缩小与CTA按钮的间距 */
}

/* 信息按钮样式 - 与上面五个按钮保持一致 */
.info-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--btn-height);
  padding: 0 clamp(1.2rem, 2.5vw, 1.6rem);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: var(--fs-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  position: relative;
  isolation: isolate;
  box-sizing: border-box;
}

.info-btn:hover {
  background: color-mix(in srgb, var(--color-primary), transparent 92%);
  border-color: var(--color-primary);
}

/* 尺码数量标记 */
.size-quantity-badge {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  line-height: 1;
  /* Web端优化：确保数字完美居中 */
  text-align: center;
  vertical-align: middle;
  /* 针对Web端字体渲染优化 */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  padding-top: 1px;
}

/* 右侧面板 */
.right-panel {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: none;
  /* 统一的组件间距变量 */
  --rp-gap: clamp(2.4rem, 4vw, 3.2rem);
  /* 统一的按钮高度变量 */
  --btn-height: 5rem;
  padding-inline: clamp(1.2rem, 3vw, 3rem);
  padding-block: var(--rp-gap);
  overflow-y: auto;
  margin-block-start: 0;
  margin-block-end: 0;
  display: flex;
  flex-direction: column;
  gap: var(--rp-gap);
}

/* 第一个面板：变换控件 */
.right-panel:first-of-type {
  height: auto; /* 自适应高度 */
  justify-content: flex-start;
  min-height: unset; /* 取消最小高度限制 */
}

/* 第二个面板：尺码和CTA */
.right-panel:last-of-type {
  height: auto; /* 自适应高度 */
  justify-content: space-between; /* 组件之间均匀分布，CTA按钮固定在底部 */
  min-height: unset; /* 取消最小高度限制 */
}

/* CTA按钮容器（现在在面板内部） */
.cta-container {
  display: flex;
  flex-direction: column;
  margin-top: auto; /* 推到底部 */
}

.cta-container .primary-cta {
  width: 100%;
  height: calc(var(--btn-height) - 0.3rem);
  border-radius: var(--radius-md);
  background: var(--color-primary);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-sm);
  font-weight: 500;
  transition: filter .2s ease, transform .2s ease;
  position: relative;
  box-sizing: border-box; /* 确保边框不影响宽度计算 */
  margin-bottom: 0.8rem;
}

.cta-container .primary-cta:hover:not(:disabled) { 
  filter: brightness(1.08); 
  transform: translateY(-2px); 
}

.cta-container .primary-cta:active:not(:disabled) { 
  filter: brightness(0.96); 
  transform: translateY(0); 
}

.cta-container .primary-cta:disabled {
  background: rgba(0, 0, 0, 0.1);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
  filter: none;
  transform: none;
}

/* 上传图片为独立按钮，不要外边框 */
.upload-standalone {
  background: transparent;
  border: none;
  box-shadow: none;
  overflow: visible;
  margin-top: 0.3rem; /* 增大与顶部边框的间距 */
  margin-bottom: -0.3rem;
}
.upload-standalone .module-content {
  padding: 0; /* 上传按钮保持无内边距 */
  background: color-mix(in srgb, var(--color-card));
}

/* Transform控件样式（无边框） */
.transform-controls {
  background: transparent;
}

.transform-controls .module-content {
  padding: 0; /* 无边框时移除内边距 */
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.6rem 1.6rem 0;
  margin-bottom: clamp(1rem, 2vw, 1.2rem);
  
}

.module-title {
  font-size: var(--fs-md);
  font-weight: 500;
  color: var(--color-text);
  margin: 0;
}

.module-content {
  padding-inline: clamp(1.2rem, 2.5vw, 1.8rem);
  padding-block: clamp(1.2rem, 2.5vw, 1.8rem); /* 与面板间距保持一致 */
}

.add-btn {
  width: clamp(2rem, 4vw, 2.4rem);
  height: clamp(2rem, 4vw, 2.4rem);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1.2rem, 2.5vw, 1.6rem);
  transition: all 0.2s ease;
}

.add-btn:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.model-list-wrapper {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding-inline: clamp(1.2rem, 2.2vw, 1.8rem);
  padding-top: clamp(2rem, 3.5vw, 2.5rem); /* 增大顶部间距 */
  padding-bottom: clamp(2rem, 3.5vw, 2.5rem); /* 增大底部间距 */
  background: var(--color-bg);
  margin-bottom: 1.4rem;
}

.model-list {
  display: flex;
  flex-direction: column;
  gap: clamp(2rem, 3.5vw, 2.5rem); /* 进一步增大按钮之间的上下间距 */
}

.model-item {
  display: flex;
  align-items: center;
  justify-content: center; /* 水平居中 */
  gap: clamp(0.4rem, 1vw, 0.8rem);
  padding: clamp(0.8rem, 1.5vw, 1rem) clamp(1.2rem, 2.5vw, 1.6rem);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center; /* 文本居中 */
  position: relative;
  isolation: isolate;
}

.model-item:hover {
  background: color-mix(in srgb, var(--color-primary), transparent 92%);
  border-color: var(--color-primary);
}

.model-item.active {
  position: relative;
  background: color-mix(in srgb, var(--color-primary), transparent 92%);
  border-color: var(--color-primary);
  color: var(--color-text);
}



.model-icon {
  font-size: clamp(1.6rem, 2.6vw, 2rem);
  width: clamp(1.6rem, 2.6vw, 2rem);
  height: clamp(1.6rem, 2.6vw, 2rem);
  display: inline-flex;           /* 让图标自身成为可居中的盒子 */
  align-items: center;            /* 垂直居中 */
  justify-content: center;        /* 水平居中 */
  line-height: 1;                 /* 去掉基线导致的偏移 */
  flex-shrink: 0;                 /* 防止被压缩导致的位移 */
}

.model-name {
  font-size: var(--fs-sm);
  font-weight: 500;
}

/* 右上角色卡面板 */
.swatch-panel {
  position: absolute;
  top: 2.2rem;
  right: 2.5rem;
  display: flex; /* Web端显示色卡 */
  flex-direction: column;
  gap: 1.2rem;
  pointer-events: auto;
  z-index: 10; /* 置于画布之上，确保可点击 */
}

.swatch {
  inline-size: 3rem;
  block-size: 3rem;
  border-radius: 50%;
  border: 1px solid transparent;
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--color-border), transparent 30%);
  cursor: pointer;
  transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
}

.swatch.active {
  transform: scale(1.09);
  border-color: var(--color-primary);
  border-width: 2px; /* 更细的蓝色描边 */
  box-shadow: none;  /* 移除阴影 */
}

/* 已移动到上方的 .left-card .sidebar-section */

.model-desc {
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
  line-height: 1.6;
}

/* 中间面板 */
.center-panel {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-block-start: 0;
  margin-block-end: 0;
  margin-left: clamp(-0.1rem, 0.1vw, 0.1rem); /* 使用负边距向左移动，精确平衡左右间距 */
  box-shadow: none;  /* 与左侧相同的阴影 */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  align-self: start;
  /* 高度由覆盖规则统一计算 */
}

/* 中间面板左上角返回按钮 */
.center-back-btn {
  position: absolute;
  top: 2rem;
  left: 2.2rem;
  width: 5rem;
  height: 5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}

.center-back-btn:hover {
  background: var(--color-border);
  transform: scale(1.05);
}

.center-back-btn svg {
  width: 25px;
  height: 25px;
}

/* Web端默认隐藏移动端按钮和款式选择器 */
.mobile-back-btn {
  display: none;
}

.mobile-upload-btn {
  display: none;
}

/* 禁止在中间预览区域出现浏览器的选中高亮/拖拽效果 */
.center-panel .canvas-container,
.center-panel .canvas-container * {
  -webkit-user-select: none;
  user-select: none;
}
.base-image,
.design-area .uploaded-design img {
  -webkit-user-drag: none;
}

.canvas-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.canvas {
  width: 75rem !important;
  height: 80rem !important; /* 缩小高度 */
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clothing-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.clothing-base {
  width: 100%;
  height: 100%;
  position: relative;
  background: transparent;
  transition: background-color 0.3s ease;
}

.uploaded-design {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: center;
  transition: all 0.2s ease;
}

.uploaded-design img {
  max-width: 28rem !important;
  max-height: 28rem !important;
  object-fit: contain;
}

/* 服装底图尺寸与定位 - 基础样式 */
.base-image {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 65rem !important; /* T恤默认宽度 */
  height: 78rem !important; /* T恤默认高度 */
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  pointer-events: none;
  transform: scale(1.05) !important; /* T恤默认缩放 */
  transform-origin: center;
}

/* 圆领卫衣 (款式ID: 4) - 放大尺寸 */
[data-style-id="4"] .base-image {
  width: 70rem !important;
  height: 85rem !important;
  transform: scale(1.15) !important;
}

/* 连帽卫衣 (款式ID: 5) - 放大尺寸 */
[data-style-id="5"] .base-image {
  width: 70rem !important;
  height: 85rem !important;
  transform: scale(1.15) !important;
}

/* 敬请期待占位符 */
.coming-soon-placeholder {
  display: none; /* 隐藏占位符 */
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  margin: 20px;
}

.coming-soon-text {
  font-size: var(--fs-md);
  font-weight: 500;
  color: var(--color-text-muted);
  text-align: center;
  letter-spacing: 0.5px;
}

/* 固定的衣服正面展示区域 */
.design-area {
  position: absolute;
  /* 位置和尺寸由行内样式驱动（按款式配置） */
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden; /* 裁剪图片到区域内部 */
  pointer-events: auto; /* 允许鼠标交互 */
  cursor: grab;
}

.design-area.dragging { cursor: grabbing; }

.design-area .uploaded-design {
  position: relative;
  top: 0;
  left: 0;
  transform-origin: center; /* 仍可应用已有旋转/缩放/平移 */
}


.upload-btn {
  width: 100%;
  height: var(--btn-height);
  padding: 0 clamp(1.2rem, 2.5vw, 1.6rem);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  border: 1px solid color-mix(in srgb, var(--color-border), transparent 30%);
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.4rem, 1vw, 0.8rem); /* 缩小图标与文字间距 */
  font-size: var(--fs-sm);
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
  isolation: isolate;
  box-sizing: border-box;
}
.primary-cta {
  width: 100%;
  padding: clamp(0.9rem, 1.6vw, 1.1rem) clamp(1.2rem, 2.5vw, 1.6rem);
  border-radius: var(--radius-md);
  background: var(--color-primary);
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(0.4rem, 1vw, 0.8rem);
  font-size: var(--fs-sm);
  font-weight: 500;
  transition: filter .2s ease, transform .2s ease;
  position: relative;
  top: 4px;
  min-height: 3.5rem;
}

.primary-cta:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-2px); }
.primary-cta:active:not(:disabled) { filter: brightness(0.96); transform: translateY(0); }

.upload-btn:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-primary), transparent 92%);
  border-color: var(--color-primary);
  color: var(--color-text);
}

/* 禁用状态样式 */
.upload-btn:disabled {
  background: rgba(0, 0, 0, 0.03);
  border-color: rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.3);
  cursor: not-allowed;
  transform: none;
}

.primary-cta:disabled {
  background: rgba(0, 0, 0, 0.1);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
  filter: none;
  transform: none;
}

.upload-icon {
  width: clamp(1.6rem, 2.6vw, 2rem);   /* 放大图标 */
  height: clamp(1.6rem, 2.6vw, 2rem);
  background: var(--color-icon);
  -webkit-mask: url("/icons/upload_photo1.png") center/contain no-repeat;
  mask: url("/icons/upload_photo1.png") center/contain no-repeat;
}

.upload-btn .label { white-space: nowrap; }

.controls {
  display: flex;
  flex-direction: column;
  gap: 2.3rem;
}

.control-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: stretch;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.control-group label {
  font-size: var(--fs-xs);
  font-weight: 500;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.control-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.3rem; /* 缩小与下方尺码按钮的间距 */
}

.control-head label {
  text-transform: none;
  letter-spacing: 0;
  font-size: var(--fs-sm);
  color: var(--color-text);
  font-weight: 500;
}

.input-with-unit {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-unit .control-input {
  flex: 1;
  padding-right: 2.4rem;
}

.input-with-unit .unit {
  position: absolute;
  right: clamp(0.8rem, 1.5vw, 1rem);
  font-size: var(--fs-xs);
  color: var(--color-text-muted);
  pointer-events: none;
}

.slider-with-value {
  display: flex;
  align-items: center;
  gap: clamp(0.8rem, 1.5vw, 1rem);
}

.slider-with-value .control-slider {
  flex: 1;
}

.slider-with-value .value {
  font-size: var(--fs-xs);
  color: var(--color-text);
  font-weight: 500;
  min-width: 3rem;
  text-align: right;
}

/* 新的滑动条行样式（含 + / - 按钮 与重置） */
.slider-row {
  display: flex;
  align-items: center;
  gap: clamp(0.8rem, 1.5vw, 1rem);
}

.slider-row .value {
  margin-inline-start: auto;
  font-size: var(--fs-xs);
  color: var(--color-text);
  min-width: clamp(3.6rem, 4vw, 5rem);
  text-align: right;
}

.step-btn {
  width: clamp(2rem, 3.5vw, 2.6rem);
  height: clamp(2rem, 3.5vw, 2.6rem);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: var(--fs-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
  font-family: 'Arial', 'Helvetica', monospace, sans-serif;
  padding: 0;
  margin: 0;
  text-align: center;
  box-sizing: border-box;
}

.step-btn .step-icon {
  width: clamp(1rem, 2vw, 1.3rem);
  height: clamp(1rem, 2vw, 1.3rem);
  background: var(--color-icon);
  flex-shrink: 0;
}

.step-icon-add {
  -webkit-mask: url("/icons/add.png") center/contain no-repeat;
  mask: url("/icons/add.png") center/contain no-repeat;
}

.step-icon-jian {
  -webkit-mask: url("/icons/jian.png") center/contain no-repeat;
  mask: url("/icons/jian.png") center/contain no-repeat;
}

.step-btn:hover, .step-btn:active, .step-btn:focus {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary), transparent 95%);
  outline: none;
}

.step-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.step-btn:disabled .step-icon {
  background: color-mix(in srgb, var(--color-icon), transparent 50%);
}

.reset-btn {
  margin-top: clamp(0.8rem, 1.5vw, 0.8rem);
  margin-bottom: clamp(0.3rem, 1vw, 0.4rem); /* 缩小底部间距 */
  width: 100%;
  height: var(--btn-height);
  padding: 0 clamp(1.2rem, 2.5vw, 1.6rem);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: var(--fs-sm);
  font-weight: 500;
  transition: all .2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.reset-btn:hover {
  background: color-mix(in srgb, var(--color-primary), transparent 88%);
  border-color: var(--color-primary);
}

.control-input {
  padding: clamp(0.4rem, 1vw, 0.8rem) clamp(0.8rem, 1.5vw, 1.2rem);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: var(--fs-sm);
}

.control-slider {
  width: 100%;
  height: clamp(0.2rem, 0.5vw, 0.3rem);
  border-radius: clamp(0.1rem, 0.25vw, 0.15rem);
  background: var(--color-border);
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
}

.control-slider::-webkit-slider-thumb {
  appearance: none;
  width: clamp(1.8rem, 3vw, 2.2rem);
  height: clamp(1.8rem, 3vw, 2.2rem);
  border-radius: 50%;
  background: #ffffff;              /* 实心白色内圆，避免锯齿 */
  border: .50rem solid var(--color-primary); /* 加粗外圈，缩小白色内圆 */
  box-shadow: none;                 /* 去掉投影，避免黑线 */
  cursor: pointer;
}

.control-slider::-moz-range-thumb {
  width: clamp(1.8rem, 3vw, 2.2rem);
  height: clamp(1.8rem, 3vw, 2.2rem);
  border-radius: 50%;
  background: #ffffff;
  border: .50rem solid var(--color-primary);
  box-shadow: none;
  cursor: pointer;
}


/* 居中弹窗 */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}


/* 创建订单弹出框样式 */
.co-modal-mask { 
  position: fixed; 
  inset: 0; 
  z-index: 1000; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  background: rgba(0,0,0,.8); 
}
.co-modal { 
  position: relative; 
  width: clamp(43rem, 64vw, 57rem);
  max-width: 100%; 
}
.co-card {
  background: var(--color-bg);
  border: none;
  border-radius: var(--radius-md);
  box-shadow: 0 1.2rem 3rem rgba(0,0,0,.45);
  padding: clamp(1.25rem, 2.4vw, 1.75rem);
  padding-bottom: 8rem;
  block-size: clamp(46rem, 80vh, 74rem);
  display: flex;
  flex-direction: column;
  gap: clamp(1.2rem, 2.5vw, 1.6rem);
  position: relative;
  overflow-y: auto;
}

/* 商品信息行 */
.co-item {
  display: flex;
  align-items: center;
  background: var(--color-card);
  border-radius: var(--radius-lg);
  padding: clamp(1rem, 2vw, 1.4rem);
  border: 1px solid var(--color-border);
  gap: clamp(1rem, 2vw, 1.4rem);
}

.co-thumb {
  width: clamp(4rem, 8vw, 5rem);
  height: clamp(4rem, 8vw, 5rem);
  border-radius: var(--radius-md);
  object-fit: cover;
  flex-shrink: 0;
}

.co-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.co-title {
  font-size: var(--fs-md);
  font-weight: 500;
  color: var(--color-text);
  line-height: 1.2;
}

.co-subtitle {
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
  line-height: 1.2;
}

.co-price-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.2rem;
}

.co-price {
  font-size: var(--fs-md);
  font-weight: 500;
  color: var(--color-text);
}

.co-quantity {
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
}

/* 统一信息容器 */
.co-info-container {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  overflow: visible;
  position: relative;
}

/* 分隔线 */
.co-divider {
  height: 1px;
  background: var(--color-border);
  opacity: 0.5;
  margin-left: 1.2rem;
}

/* 地址部分 */
.co-address-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1.2rem 0.5rem 1.2rem;
  min-height: 3rem;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s ease;
}

.co-address-section:hover {
  background: color-mix(in srgb, var(--color-card), var(--color-border) 10%);
}

.co-address-info {
  display: flex;
  flex-direction: column;
  gap: 0rem;
}

.co-phone {
  font-size: calc(var(--fs-sm) * 1.1);
  font-weight: 500;
  color: var(--color-text);
}

.co-address-text {
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
  font-weight: 400;
}

.co-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-icon);
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.co-arrow svg {
  width: 20px;
  height: 20px;
  color: inherit;
}

.co-address-section:hover .co-arrow {
  opacity: 1;
}

/* 地址下拉框 */
.co-address-dropdown {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + .4rem);
  background: var(--color-surface);
  border: none;
  border-radius: var(--radius-md);
  box-shadow: 0 .6rem 1.6rem rgba(0,0,0,.18);
  padding: .6rem;
  margin: 0;
  list-style: none;
  z-index: 100;
  max-height: 30rem;
  overflow-y: auto;
  scrollbar-width: none;
}

.co-address-dropdown::-webkit-scrollbar {
  display: none;
}

.co-address-option {
  padding: 0.8rem 1.2rem 0.8rem 1.2rem;
  border-radius: var(--radius-sm);
  color: var(--color-text);
  cursor: pointer;
  font-size: var(--fs-sm);
  line-height: 1;
  min-height: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.co-address-option + .co-address-option {
  margin-top: 0.6rem;
}

.co-address-option:hover {
  background: var(--color-card);
}

.co-address-option.active {
  background: var(--color-card);
  color: var(--color-text);
}


.co-option-phone {
  font-size: calc(var(--fs-sm) * 1.1);
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 0.3rem;
}

.co-option-address {
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
  font-weight: 400;
}

/* 空地址提示 */
.co-empty-address-tip {
  padding: 0.8rem 1.2rem 0.8rem 1.2rem;
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
  min-height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
}

/* 支付方式部分 */
.co-payment-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.2rem 1.5rem 1.2rem;
  min-height: 6rem;
}

.co-payment-info {
  display: flex;
  align-items: center;
  gap: clamp(0.8rem, 1.5vw, 1rem);
}

.co-wechat-icon {
  width: clamp(2rem, 4vw, 2.4rem);
  height: clamp(2rem, 4vw, 2.4rem);
  display: flex;
  align-items: center;
  justify-content: center;
}

.co-wechat-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.co-payment-text {
  font-size: calc(var(--fs-sm) * 1.1);
  color: var(--color-text);
  font-weight: 500;
}

.co-radio-btn {
  width: clamp(1.8rem, 3.5vw, 2.2rem);
  height: clamp(1.8rem, 3.5vw, 2.2rem);
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-card);
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.co-radio-btn.active {
  border-color: var(--color-primary);
  background: var(--color-primary);
}

.co-radio-btn.active::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  height: 50%;
  border-radius: 50%;
  background: white;
}

/* 总计部分 */
.co-total-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.2rem 1.5rem 1.2rem;
  min-height: 6rem;
}

.co-total-label {
  font-size: calc(var(--fs-sm) * 1.1);
  color: var(--color-text);
  font-weight: 500;
}

.co-total-price {
  font-size: calc(var(--fs-sm) * 1.1);
  font-weight: 500;
  color: var(--color-primary);
}

/* 立即支付按钮 */
.co-pay-btn-container {
  position: absolute;
  bottom: 3.8rem;
  left: clamp(1.25rem, 2.4vw, 1.75rem);
  right: clamp(1.25rem, 2.4vw, 1.75rem);
  margin: 0;
  padding: 0;
}

.co-pay-btn {
  width: 92.5%;
  margin: 0 auto;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  padding: 0.8rem;
  font-size: var(--fs-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 4.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.co-pay-btn:hover {
  background: color-mix(in srgb, var(--color-primary), black 10%);
  transform: translateY(-1px);
}

/* 支付二维码弹窗样式 */
.qr-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
}

.qr-modal {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.qr-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem 2rem;
  background: var(--color-bg);
  border-radius: var(--radius-md);

  box-shadow: 0 .6rem 1.6rem rgba(0,0,0,.12);
  overflow: hidden;
  color: var(--color-text);
  font-family: inherit;
  font-size: var(--fs-md);
  line-height: 1.5;
}

.qr-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  border-radius: 0;
  border: none;
  outline: none;
}

/* 二维码占位符样式 */
.qr-placeholder {
  width: 100%;
  height: 100%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.qr-placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.qr-placeholder-squares {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  width: 120px;
  height: 120px;
}

.qr-square {
  background: #333333;
  border-radius: 4px;
  opacity: 0.8;
}

.qr-square:nth-child(1), 
.qr-square:nth-child(3),
.qr-square:nth-child(7),
.qr-square:nth-child(9) {
  background: #000000;
}

.qr-square:nth-child(5) {
  background: #666666;
  border-radius: 50%;
}

.qr-placeholder-text {
  color: #666666;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
}

/* 支付提示样式 */
.payment-hint {
  text-align: center;
  margin: 0.5rem 0;
}

.payment-text {
  color: var(--color-text-secondary);
  font-size: var(--fs-sm);
  font-weight: 500;
}

/* 二维码错误和降级样式 */
.qr-error, .qr-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 1rem;
  text-align: center;
}

.qr-error-text, .qr-fallback-text {
  color: var(--color-danger);
  font-size: var(--fs-md);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.qr-error-url, .qr-fallback-url {
  color: var(--color-primary);
  font-size: var(--fs-xs);
  word-break: break-all;
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.qr-error-hint, .qr-fallback-hint {
  color: var(--color-text-secondary);
  font-size: var(--fs-xs);
  margin-top: 0.5rem;
}

.order-info {
  padding: 1.3rem 1.5rem;
  background: var(--color-card);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  align-self: stretch;
  flex-shrink: 0;
  font-size: var(--fs-sm);
  line-height: 1.4;
  text-align: center;
  min-height: 3rem;
  margin-top: 0.5rem;
}

.order-label {
  color: var(--color-text);
  font-weight: 500;
}

.order-separator {
  color: var(--color-primary);
}

.order-number {
  color: var(--color-text);
  font-weight: 500;
}




.left-panel {
  height: fit-content;
  min-height: 84.5rem;
  max-height: 100%;
  box-sizing: border-box;
  overflow: visible; /* 保持阴影可见 */
}

.center-panel {
  height: fit-content;
  min-height: 84.5rem;
  max-height: 100%;
  box-sizing: border-box;
  overflow: visible; /* Web端允许可见，移动端会被覆盖 */
}

.right-panel {
  height: fit-content;
  min-height: 65rem; /* 缩小右侧面板高度 */
  max-height: 100%;
  box-sizing: border-box;
  overflow: visible; /* Web端允许可见，移动端会被覆盖 */
}


/* 可选：若需要在内部再加上下内边距，用 wrapper 包裹并使用这个类 */
.customize-inner-padding {
  padding-block: clamp(1rem, 2vh, 2.5rem);
  height: 100%;
  box-sizing: border-box;
}

/* 弹出框样式 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--color-bg);
  border-radius: var(--radius-md);
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.3);
  width: clamp(500px, 60vw, 650px); /* 适中的宽度 */
  height: clamp(700px, 80vh, 900px); /* 增加高度，纵向增高 */
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-body {
  flex: 1; /* 填充整个弹出框 */
  padding: clamp(0.25rem, 0.5vw, 0.4rem); /* 进一步缩小内边距，与边框间距保持一致 */
  overflow: visible; /* 去掉滚动条 */
  display: flex;
  align-items: center;
  justify-content: center;
}


/* 产品信息弹出框特定样式 */
.product-image {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.product-image img {
  width: 100%;
  max-width: 100%; /* 让图片填充整个容器宽度 */
  max-height: 80vh; /* 限制最大高度，确保图片能完整显示 */
  height: auto;
  object-fit: contain; /* 保持图片比例 */
  border-radius: var(--radius-sm);
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
}

/* 二维码相关样式 */
.qr-image-container {
  width: 300px;
  height: 300px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  padding: 0.3rem;
  border-radius: none;
  background: rgb(255, 255, 255);
}

.qr-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qr-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: var(--radius-sm);
}

.qr-content {
  text-align: center;
  padding: 1rem;
}

.qr-text {
  font-size: var(--fs-sm);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.qr-url {
  font-size: var(--fs-xs);
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
  word-break: break-all;
}

.qr-hint {
  font-size: var(--fs-xs);
  color: var(--color-primary);
}

.qr-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 200px;
  margin: 0 auto;
  background: #f8f9fa;
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
}


.qr-tips {
  text-align: center;
  margin-top: 1rem;
}

.qr-tips p {
  margin: 0.5rem 0;
  color: var(--color-text);
  font-size: var(--fs-sm);
}

.qr-tips-small {
  font-size: var(--fs-xs) !important;
  color: var(--color-text-muted) !important;
}

/* OrderDetail 样式的产品卡片 */
.od-card { 
  background: var(--color-card); 
  border-radius: var(--radius-md); 
  border: none; 
  margin-left: 2rem; 
  margin-right: 2rem;
  margin-top: 2rem;
  --od-gap: clamp(1.2rem, 2.6vw, 1.6rem);
}

/* 产品项目包装器 - 保持透明，不影响布局 */
.product-item-wrapper {
  display: contents; /* 使包装器在布局中透明 */
}

.od-item { 
  display: grid; 
  grid-template-columns: auto 1fr auto; 
  align-items: center; 
  border: none; 
  --item-pad: 1.2rem; 
  min-block-size: 5rem; 
  column-gap: 0; 
  padding: 1.2rem 1.2rem 1.2rem 1.2rem;
}

.od-thumb { 
  inline-size: 5.5rem; 
  block-size: 5.5rem; 
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

/* 支付结果弹框样式 */
.payment-result-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.payment-result-modal {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  animation: payment-result-fade-in 0.3s ease-out;
}

.payment-result-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  padding: 2rem 2.5rem 2.5rem 2.5rem;
  width: 400px;
  max-width: 100%;
  background: var(--color-bg);
  border-radius: var(--radius-md);
  color: var(--color-text);
  text-align: center;
}

.payment-result-icon {
  flex-shrink: 0;
  margin-bottom: 0;
}

.success-icon svg,
.error-icon svg {
  width: 64px;
  height: 64px;
  filter: drop-shadow(0 .2rem .4rem rgba(0,0,0,.1));
}

.payment-result-title {
  font-size: calc(var(--fs-md) * 1.2);
  font-weight: 500;
  color: var(--color-text);
  margin: 0;
}

.payment-result-message {
  font-size: var(--fs-sm);
  color: var(--color-text-muted);
  line-height: 1.5;
  margin: 0;
}

.payment-result-order {
  background: var(--color-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  padding: 1.5rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--fs-sm);
}

.result-order-label {
  color: var(--color-text);
  font-weight: 500;
}

.result-order-value {
  color: var(--color-text);
  font-weight: 500;
}

.payment-result-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.result-btn {
  width: 100%;
  padding: 0.875rem 1.5rem;
  border-radius: var(--radius-md);
  font-size: var(--fs-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
}

.result-btn-primary {
  background: var(--color-primary);
  color: white;
  border: 1px solid var(--color-primary);
}

.result-btn-primary:hover {
  transform: translateY(-1px);
}

.result-btn-secondary {
  background: var(--color-card);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.result-btn-secondary:hover {
  transform: translateY(-1px);
}

/* 支付结果弹框动画 */
@keyframes payment-result-fade-in {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 在竖屏设备上（如手机）减少定制页面的左右边距 */
@media (max-aspect-ratio: 1/1) {
  .left-stack .left-card {
  padding-block: 2.05rem; /* 确保上下内边距完全一致 */
}
  .left-card{
    box-shadow: none !important;
  }

  .customize-page {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 2rem 1rem;
    box-sizing: border-box;
    /* 优化触摸滚动 */
    -webkit-overflow-scrolling: touch !important;
    height: auto;
  }
  
  .customize-container {
    /* 改为单列纵向布局 */
    display: flex;
    flex-direction: column;
    gap: 1rem;
    /* 整体放大：增加容器的尺寸 */
    width: 100%;
    max-width: 670px;
    /* 可以通过transform进一步放大整体 */
    transform: scale(2.0);
    /* 确保变换后的元素不会影响布局流 */
    transform-origin: top center;
  }
  
  .center-panel {
    /* 第一个：衣服边框 */
    order: 1 !important;
    width: 100%;
    height: 46.5vw;
    min-height: auto !important;
    aspect-ratio: 1/1;
    justify-items: center;
    box-shadow: none !important;
    overflow: hidden !important;
  }
.clothing-base{
  transform: scale(0.9);
}

  /* T恤款式在移动端进一步缩小 */
  [data-style-id="3"] .base-image {
    transform: scale(0.95) !important;
  }

  [data-style-id="4"] .base-image {
    transform: scale(1.1) !important;
  }

  [data-style-id="5"] .base-image {
    transform: scale(1.05) !important;
  }

  /* 连帽卫衣在移动端的设计区域调整 - 缩小高度以匹配Web端 */
  [data-style-id="5"] .design-area {
    top: 29.5% !important;
    height: 27.5% !important;
  }
  /* 圆领卫衣在移动端的设计区域调整 - 缩小高度以匹配Web端 */
  [data-style-id="4"] .design-area {
      top: 27% !important;
      height: 46% !important;
  }
  /* T恤在移动端的设计区域调整 - 缩小高度以匹配Web端 */
  [data-style-id="3"] .design-area {
      top: 26% !important;
      height: 47% !important;
  }

  .left-panel {
    /* 第三个：尺码边框 */
    order: 3 !important;
    position: relative !important;
    width: 100% !important;
    height: auto !important; /* 高度自适应内容 */
    overflow: visible !important;
    margin-top: 0.5rem !important; /* 向上移动，缩小与缩放边框的间距 */
  }
  .size-info-wrapper{
    display: none;
  }

  .right-panels-container {
    /* 第二个：控制面板容器 */
    order: 2 !important;
    width: 100% !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 1rem !important;
  }

  .right-panel {
    /* 右侧面板样式 */
    position: relative !important;
    width: 100% !important;
    height: auto !important;
    min-height: auto !important;
    overflow: visible !important;
    margin-top: 4rem !important; /* 增大与上传按钮的间距 */
  }
  /* 尺码数量移动端保持不变，Web端优化 */
  .size-quantity-badge {
    font-family: inherit;
    padding-top: 0;
  }

  /* 移动端返回按钮样式 */
  .mobile-back-btn {
    display: block !important;
    position: absolute !important;
    top: 2rem !important;
    left: 2rem !important;
    z-index: 10 !important;
    width: 7.5rem !important;
    height: 7.5rem !important;
    background: var(--color-surface) !important;
    border: 1px solid color-mix(in srgb, var(--color-border), transparent 30%) !important;
    border-radius: var(--radius-md) !important;
    color: var(--color-text) !important;
    cursor: pointer !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .mobile-back-btn:hover {
    background: color-mix(in srgb, var(--color-primary), transparent 92%) !important;
    border-color: var(--color-primary) !important;
  }

  .mobile-back-btn svg {
    width: 45px !important;
    height: 45px !important;
  }

  /* 隐藏左侧面板中的返回按钮，避免重复 */
  .left-panel .header-row {
    display: none !important;
  }

  /* 调整左侧面板布局，去掉标题行的空间 */
  .left-stack {
    gap: 1.5rem !important;
  }

  /* 确保中间面板具有相对定位，以便按钮能够正确定位 */
  .center-panel {
    position: relative !important;
    overflow: visible !important; /* 允许按钮超出边界 */
  }

  /* 移动端上传按钮样式 - 位于底部边线上 */
  .mobile-upload-btn {
    display: flex !important;
    position: absolute !important;
    bottom: -5rem !important; /* 一半在边框内，一半在边框外 */
    left: 50% !important; /* 向左移动 */
    transform: translateX(-50%) !important;
    z-index: 10 !important;
    width: 10rem !important; /* 增大按钮尺寸 */
    height: 10rem !important; /* 增大按钮尺寸 */
    background: var(--color-surface) !important; /* 保持原按钮颜色 */
    border: 1px solid var(--color-border) !important;
    border-radius: 50% !important; /* 圆形按钮 */
    color: var(--color-text) !important;
    cursor: pointer !important;
    align-items: center !important;
    justify-content: center !important;
    transition: all 0.2s ease !important;
  }

  .mobile-upload-btn .mobile-upload-icon {
    width: 37px !important;
    height: 37px !important;
    background: var(--color-icon) !important;
    -webkit-mask: url("/icons/upload_photo1.png") center/contain no-repeat !important;
    mask: url("/icons/upload_photo1.png") center/contain no-repeat !important;
    transform: translateX(3px);
  }

  /* 只隐藏上传按钮，保留定制按钮 */
  .right-panel .upload-btn {
    display: none !important;
  }

  /* 只增大定制按钮本身与上面内容的间距 */
  .right-panel .primary-cta {
    margin-top: 2.4rem !important; /* 只增加定制按钮的上边距 */
  }

  /* 重置容器的上边距，保持原有的顶部间距 */
  .right-panel .upload-standalone {
    margin-top: -0.3rem !important;
  }

  /* 调整右侧面板在单列布局中的样式 */
  .right-panel {
    --rp-gap: 0.8rem !important; /* 缩小模块间距 */
    padding-block: 1.5rem !important; /* 恢复正常的面板内边距 */
    gap: 0.8rem !important; /* 缩小模块间距 */
    justify-content: flex-start !important;
    box-shadow: none !important;
    display: flex !important;
    flex-direction: column !important;
  }
  
  /* 隐藏第二个面板中的桌面端尺码选择和信息按钮 */
  .right-panel:last-child .size-info-wrapper {
    display: none !important;
  }
  
  /* 设置组件顺序 */
  .right-panel .upload-standalone {
    order: 1 !important;
  }
  
  .right-panel .transform-controls {
    order: 2 !important;
  }
  
  /* 在第二个面板中显示mobile-size-section */
  .right-panel:last-child .mobile-size-section {
    display: block !important;
    order: 1 !important; /* 放在CTA按钮前面 */
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
    margin: 1rem 0 !important;
  }
  
  /* 移动端尺码选择样式 - 与移动控件保持一致 */
  .mobile-size-section .size-selection-mobile {
    display: flex !important;
    flex-direction: column !important;
    gap: 1rem !important; /* 缩小内部组件间距 */
  }
  
  /* 尺码选择的slider-row布局 */
  .mobile-size-section .slider-row {
    display: flex !important;
    align-items: center !important;
    gap: 1rem !important;
  }
  
  /* 尺码选择区域占据中间空间 */
  .mobile-size-section .size-options {
    flex: 1 !important;
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 1.2rem !important;
    justify-content: center !important;
    align-items: center !important;
  }
  
  .mobile-size-section .size-btn {
    height: 6rem !important;
    font-size: 2.2rem !important;
    font-weight: 600 !important;
    width: 8rem !important;
    border: 1px solid var(--color-border) !important;
    border-radius: var(--radius-md) !important;
    background: var(--color-surface) !important;
    color: var(--color-text) !important;
    cursor: pointer !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    position: relative !important;
  }
  
  .mobile-size-section .size-btn.active {
    background: color-mix(in srgb, var(--color-primary), transparent 80%) !important;
    color: var(--color-text) !important;
    border-color: var(--color-primary) !important;
  }
  
  .mobile-size-section .size-quantity-badge {
    position: absolute !important;
    top: -0.8rem !important;
    right: -0.8rem !important;
    background: var(--color-primary) !important;
    color: white !important;
    border-radius: 50% !important;
    width: 2.5rem !important;
    height: 2.5rem !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 1.4rem !important;
    font-weight: 600 !important;
  }
  
  .mobile-size-section .info-buttons {
    display: flex !important;
    gap: 3.5rem !important; /* 缩小按钮之间的间距 */
    margin-top: 1rem !important; /* 缩小与上方尺码按钮的间距 */
  }
  
  .mobile-size-section .info-btn {
    flex: 1 !important;
    height: 8rem !important;
    font-size: 2.5rem !important;
    padding: 2rem 3rem !important;
    font-weight: 600 !important;
    border: 1px solid var(--color-border) !important;
    border-radius: var(--radius-md) !important;
    background: var(--color-surface) !important;
    color: var(--color-text) !important;
    cursor: pointer !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  
  /* 移动端CTA按钮调整 */
  .right-panel:last-child .cta-container {
    order: 2 !important; /* 放在mobile-size-section后面 */
    margin-top: 1.5rem !important; /* 增大与上面信息按钮的间距 */
    margin-bottom: 2rem !important; /* 缩小与底部的间距 */
  }

  /* 增大颜色色卡面板 - 移动端显示 */
  .swatch-panel{
    display: flex; /* 移动端显示色卡 */
    transform: scale(1.3);
    top: 6.5rem;
    right: 2.5rem;
  }

  /* 圆领卫衣款式的色卡位置调整 - 因为衣服图片更大，需要向上移动色卡 */
  .center-panel:has([data-style-id="4"]) .swatch-panel{
    top: 7.3rem !important;
  }
  /* 连帽卫衣款式的色卡位置调整 - 因为衣服图片更大，需要向上移动色卡 */
  .center-panel:has([data-style-id="5"]) .swatch-panel {
    top: 8.5rem !important;
  }

}

/* 移动端创建订单表单和二维码弹出框优化 */
@media (max-aspect-ratio: 1/1) {
  .co-modal-mask{
    transform: scale(2.0);
  }

  .qr-modal-mask{
    transform: scale(2.0);
  }

  .payment-result-mask{
    transform: scale(2.0);
  }
  /* 隐藏左侧的款式选择区域 */
  .left-card:nth-child(1) {
    display: none;
  }
  /* 隐藏中间的返回按钮 */
  .center-back-btn{
    display: none;
  }
  /* 隐藏左侧面板的尺码区域，移动到右侧面板 */
  .left-card:nth-child(2) {
    display: none !important;
  }
  
  .right-panel .module-content {
    padding: 0 !important;
  }
  
  /* 将右侧面板的所有组件大小调整得与尺码边框一样 */
  .right-panel {
    padding: 2rem 3rem !important; /* 与尺码边框相同的内边距 */
  }
  
  /* 增大右侧面板中的按钮 */
  .right-panel .step-btn,
  .right-panel .upload-btn,
  .right-panel .primary-cta {
    height: 6rem !important;
    font-size: 3.5rem !important;
    font-weight: 500 !important;
    min-width: 6rem !important;
  }
  
  /* 移动端图标样式 */
  .right-panel .step-btn .step-icon {
    width: 3rem !important;
    height: 3rem !important;
    background: var(--color-icon) !important;
  }
  
  /* 单独增大重置按钮 */
  .right-panel .reset-btn {
    height: 8rem !important;
    font-size: 2.5rem !important;
    font-weight: 600 !important;
    min-width: 8rem !important;
    padding: 1.5rem 3rem !important;
    background: var(--color-surface) !important;
  }
  
  /* 增大右侧面板中的标签文字 */
  .right-panel .control-head label {
    font-size: 2.5rem !important;
    font-weight: 600 !important;
  }
  
  .right-panel .control-head .value {
    font-size: 2.5rem !important;
    font-weight: 600 !important;
  }
  
  /* 调整右侧面板中的滑块控件 */
  .right-panel .control-slider {
    height: 1rem !important; /* 缩小滑动条高度 */
    border-radius: 1rem !important;
  }
  
  /* 增大滑块中的圆形滑块 - 与+/-按钮大小一致 */
  .right-panel .control-slider::-webkit-slider-thumb {
    width: 6rem !important;
    height: 6rem !important;
    border-radius: 50% !important;
    -webkit-appearance: none !important;
    appearance: none !important;
    background: #fff !important;
    cursor: pointer !important;
    border: 13px solid var(--color-primary) !important;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2) !important;
  }
  
  .right-panel .control-slider::-moz-range-thumb {
    width: 6rem !important;
    height: 6rem !important;
    border-radius: 50% !important;
    background: #fff !important;
    cursor: pointer !important;
    border: 7px solid var(--color-primary) !important;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2) !important;
  }
  
  /* 增大右侧面板中的间距 */
  .right-panel .slider-row {
    gap: 1rem !important;
    margin: 1rem 0 !important;
  }
  
  .right-panel .control-group {
    margin-bottom: 1rem !important;
  }
  
  .right-panel .upload-btn .label {
    font-size: 2.5rem !important;
  }
  
  /* CTA按钮容器移动端适配 */
  .cta-container {
    /* 第四个：CTA按钮（移出右边框外） */
    order: 4;
    position: relative !important;
    top: auto !important;
    right: auto !important;
    width: 100% !important;
    margin-top: -39.5rem !important;
    margin-bottom: 0 !important;
    padding: 0 !important;
  }
  
  .cta-container .primary-cta {
    height: 8rem !important;
    font-size: 2.5rem !important;
    font-weight: 600 !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  

}
</style>
