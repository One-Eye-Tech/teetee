<template>
  <div>
  <!-- 中心弹窗：我的 -->
  <teleport to="body">
    <div v-if="isProfileModalOpen" class="figma-modal" @keydown.esc.prevent.stop="closeProfileModal" tabindex="-1">
      <div class="figma-modal__overlay" @click="closeProfileModal"></div>
      <div class="modal-content" role="dialog" aria-modal="true" aria-label="我的">
        <div class="discord-card" role="document">
          <div class="dc-banner" aria-hidden="true" :style="bannerStyle"></div>
          <button v-if="isEditing" class="banner-back" aria-label="返回" @click="isEditing = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="dc-main">
            <img class="dc-avatar" :src="avatarUrl" alt="avatar" />
            <button class="avatar-edit" aria-label="编辑头像" @click="onAvatarEditClick"></button>
            <input ref="avatarFileInput" type="file" accept="image/*" style="display:none" @change="handleAvatarFileChange" />
            <h2 class="dc-name">{{ displayName }}</h2>
            <div class="dc-sections" v-if="!isEditing">
              <div class="dc-tabs" role="tablist" aria-label="profile sections">
                <button class="dc-tab" :class="{ active: activeTab === 'works' }" role="tab" :aria-selected="activeTab === 'works'" @click="activeTab = 'works'">我的作品</button>
                <button class="dc-tab" :class="{ active: activeTab === 'likes' }" role="tab" :aria-selected="activeTab === 'likes'" @click="activeTab = 'likes'">我的点赞</button>
              </div>
              <div class="dc-scroll" v-if="activeTab === 'works'">
                <template v-if="worksLoading">
                  <div class="work-empty full">加载中...</div>
                </template>
                <template v-else-if="works.length">
                  <ul class="work-list">
                    <li class="work-item" v-for="item in works" :key="item.id">
                      <img class="work-thumb" :src="item.originalImage || item.workImage" :alt="item.name" />
                      <div class="work-body">
                        <div class="work-title">{{ item.name }}</div>
                        <div class="work-meta"><span class="meta">{{ formatOrderDate(item.createdTime) }}</span></div>
                      </div>
                      <div class="addr-actions">
                        <button class="addr-action addr-action--delete" aria-label="删除作品" @click.stop="handleDeleteWork(item)"></button>
                      </div>
                    </li>
                  </ul>
                </template>
                <template v-else>
                  <div class="work-empty full">暂无作品</div>
                </template>
            </div>
              <div class="dc-scroll" v-else>
                <template v-if="likesLoading">
                  <div class="work-empty full">加载中...</div>
                </template>
                <template v-else-if="displayedLikes.length">
                  <ul class="like-grid">
                    <li class="like-card" v-for="work in displayedLikes" :key="work.id" @click="openImagePreview(work)">
                      <div class="like-card-layout">
                        <!-- 左侧：T恤贴图 -->
                        <div class="like-card-left">
                          <div class="like-card-tshirt-wrapper">
                            <img 
                              class="like-card-tshirt-img" 
                              :src="work.workImage || '/images/tietu.png'" 
                              :alt="work.name + ' - 贴图'"
                            />
                          </div>
                        </div>
                        <!-- 右侧：原图（手机样式） -->
                        <div class="like-card-right">
                          <div class="like-card-phone">
                            <div class="like-card-phone-img-wrapper">
                              <img 
                                class="like-card-phone-img" 
                                :src="work.originalImage || '/images/default.png'" 
                                :alt="work.name + ' - 原图'"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <button class="like-btn" :class="{ on: work.isLiked }" @click.stop="toggleLike(work)" aria-label="点赞"></button>
                    </li>
                  </ul>
                </template>
                <template v-else>
                  <div class="work-empty full">暂无点赞</div>
                </template>
          </div>
        </div>
        
            <div class="dc-sections" v-else>
              <div class="dc-scroll">
                <form class="edit-form" @submit.prevent>
                  <div class="ef-card">
                    <div class="ef-group">
                      <div class="ef-label">昵称</div>
                      <input class="ef-control" v-model="formNickname" type="text" @input="handleNameInput" />
          </div>
                    <div class="ef-group">
                      <div class="ef-label">性别</div>
                      <div class="ef-select-wrap cs-wrap" :class="{ open: genderOpen }" ref="genderWrapRef">
                        <button type="button" class="ef-control cs-trigger" @click="genderOpen = !genderOpen">{{ genderLabel }}</button>
                        <span class="ef-caret" aria-hidden="true"></span>
                        <ul v-if="genderOpen" class="cs-panel" role="listbox">
                          <li v-for="opt in genderOptions" :key="opt.value" class="cs-option" :class="{ active: opt.value === formGender }" @click="selectGender(opt.value)" role="option">{{ opt.label }}</li>
                </ul>
                </div>
              </div>
                  </div>
                  <button type="submit" class="ef-submit" :disabled="!canSave" @click="saveProfile">保存</button>
                </form>
                  </div>
                    </div>
                  </div>
                  </div>
                  </div>
                </div>
  </teleport>
  <teleport to="body">
    <div v-if="isImagePreviewOpen" class="img-viewer" @click="closeImagePreview">
      <div class="img-viewer__layout" @click.stop>
        <!-- 上方：贴图展示区域 -->
        <div class="img-viewer__left">
          <div class="img-wrapper">
            <img 
              class="img-viewer__img" 
              :src="selectedLikedWork?.workImage || '/images/tietu.png'" 
              :alt="selectedLikedWork?.name || '贴图预览'" 
            />
          </div>
        </div>
        
        <!-- 交界处图标按钮 -->
        <div class="img-viewer__divider">
          <button class="divider-btn" @click="switchImages" aria-label="切换图片">
            <img src="/icons/upload_photo.png" alt="切换图片" />
          </button>
        </div>
        
        <!-- 下方：原图展示区域 -->
        <div class="img-viewer__right">
          <div class="product-preview">
            <div class="product-preview__img-wrapper">
              <img 
                class="product-preview__img" 
                :src="selectedLikedWork?.originalImage || '/images/default.png'" 
                :alt="selectedLikedWork?.name || '原图'" 
              />
            </div>
            <button 
              class="img-viewer__like" 
              @click="togglePreviewLike" 
              :class="{ liked: isLiked, loading: isLiking }" 
              :disabled="isLiking || !currentUser"
              :aria-label="isLiked ? '取消点赞' : '点赞'"
            >
              <svg v-if="!isLiking" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <div v-else class="loading-spinner"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
  <!-- 地址弹窗：尺寸与"我的"一致，内容占位 -->
  <teleport to="body">
    <div v-if="isAddressModalOpen" class="figma-modal" @keydown.esc.prevent.stop="isAddressModalOpen = false" tabindex="-1">
      <div class="figma-modal__overlay" @click="isAddressModalOpen = false"></div>
      <div class="modal-content" role="dialog" aria-modal="true" aria-label="我的地址">
        <div class="discord-card" role="document">
          <div class="dc-sections">
            <div class="dc-scroll">
              <div class="work-empty full">地址内容</div>
                      </div>
                      </div>
                    </div>
                  </div>
              </div>
  </teleport>
  <!-- 订单弹窗：尺寸与"我的"一致，内容占位 -->
  <teleport to="body">
    <div v-if="isOrderModalOpen" class="figma-modal" @keydown.esc.prevent.stop="isOrderModalOpen = false" tabindex="-1">
      <div class="figma-modal__overlay" @click="isOrderModalOpen = false"></div>
      <div class="modal-content" role="dialog" aria-modal="true" aria-label="我的订单">
        <div class="discord-card" role="document">
          <div class="order-sections">
            <div class="dc-tabs" role="tablist" aria-label="order sections" v-if="orderView === 'list'">
              <button class="dc-tab" :class="{ active: orderTab === 'done' }" role="tab" :aria-selected="orderTab === 'done'" @click="orderTab = 'done'">已完成</button>
              <button class="dc-tab" :class="{ active: orderTab === 'toShip' }" role="tab" :aria-selected="orderTab === 'toShip'" @click="orderTab = 'toShip'">待发货</button>
              <button class="dc-tab" :class="{ active: orderTab === 'toReceive' }" role="tab" :aria-selected="orderTab === 'toReceive'" @click="orderTab = 'toReceive'">待收货</button>
              <!-- <button class="dc-tab" :class="{ active: orderTab === 'afterSale' }" role="tab" :aria-selected="orderTab === 'afterSale'" @click="orderTab = 'afterSale'">售后</button> -->
              <button class="dc-tab" :class="{ active: orderTab === 'address' }" role="tab" :aria-selected="orderTab === 'address'" @click="orderTab = 'address'">地址</button>
                    </div>
            <div class="dc-scroll">
              <template v-if="orderView === 'list'">
                <template v-if="orderTab !== 'address' && !ordersLoading && ordersByTab[orderTab].length">
                  <ul class="work-list">
                    <li class="work-item" v-for="order in ordersByTab[orderTab]" :key="order.id" @click="openOrderDetail(order)">
                      <img class="work-thumb" :src="getOrderImage(order)" :alt="getOrderTitle(order)" />
                      <div class="work-body">
                        <div class="work-title">{{ getOrderTitle(order) }}</div>
                        <div class="work-meta">
                          <span class="meta">{{ formatOrderDate(order.createdTime) }}</span>
                        </div>
                    </div>
                  </li>
                </ul>
            </template>
                <div v-else-if="orderTab !== 'address' && ordersLoading" class="work-empty full">加载中...</div>
                <div v-else-if="orderTab !== 'address'" class="work-empty full">暂无订单</div>
                <template v-else>
                  <div class="address-container">
                    <div class="address-content">
                      <template v-if="addressList.length">
                        <ul class="work-list">
                          <li class="work-item no-thumb" v-for="ad in addressList" :key="ad.id">
                            <div class="work-body">
                              <div class="work-title">{{ ad.recipientName }} {{ ad.phoneNumber }}</div>
                              <div class="work-meta"><span class="meta">{{ getFullAddress(ad) }}</span></div>
                            </div>
                            <div class="addr-actions">
                              <button class="addr-action addr-action--edit" aria-label="编辑地址" @click.stop="editAddress(ad)"></button>
                              <button class="addr-action addr-action--delete" aria-label="删除地址" @click.stop="handleDeleteAddress(ad)"></button>
                        </div>
                      </li>
                    </ul>
                  </template>
                      <div v-else class="work-empty full">暂无地址</div>
                    </div>
                    <!-- 使用绝对定位，不影响内容区域的布局 -->
                    <button class="btn-primary add-address add-address--fixed" @click="newAddress">新建地址</button>
                  </div>
                </template>
              </template>
              <template v-else>
                <!-- 订单详情二级页面 -->
                <OrderDetail 
                  v-if="orderView === 'detail'" 
                  :order="currentOrder" 
                  @back="backToOrderList" 
                  @orderUpdated="handleOrderUpdated"
                />

                <!-- 新建/编辑地址二级页面（不显示分类栏） -->
                <AddressForm 
                  v-else-if="orderView === 'addrNew'" 
                  :model-value="addrForm"
                  @back="backToOrderList"
                  @save="saveAddress"
                />
            </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import AddressForm from './AddressForm.vue'
import OrderDetail from './OrderDetail.vue'
import { getUserOrders, type OrderDto } from '../api/orderApiLite'
import { getCurrentUser } from '../api/authApiLite'
import { useAuth } from '../composables/useAuth'
import { updateCurrentUserProfile, uploadUserAvatar, getUserAddresses, deleteAddress as deleteAddressAPI, addAddress, updateAddress } from '../api/authApiLite'
import { getUserWorks, deleteWork, type WorksDto } from '../api/worksApi'
import { getUserLikedWorks } from '../api/likesApi'
import { useLikes } from '../composables/useLikes'
import type { Address, AddressRequest } from '../api/authApiLite'

// 用户状态管理
const { avatarUrl: userAvatarUrl, displayName, currentUser, setUser } = useAuth()
// 全局点赞状态管理
const { toggleWorkLike } = useLikes()
// 本地头像URL（用于头像编辑功能）
const avatarUrl = ref(userAvatarUrl.value || '/icons/profile.png')

// 监听用户头像变化
watch(userAvatarUrl, (newAvatar) => {
  if (newAvatar && !avatarUrl.value.startsWith('blob:')) {
    avatarUrl.value = newAvatar
  }
})

// 表单相关的ref变量定义 - 必须在watch之前定义
const formNickname = ref('')
const savedNickname = ref('')
const formGender = ref<'male' | 'female' | 'other' | ''>('')
const savedGender = ref<'male' | 'female' | 'other' | ''>('')

// 监听用户数据变化，更新表单
watch(currentUser, (newUser) => {
  if (newUser) {
    formNickname.value = newUser.username || ''
    savedNickname.value = newUser.username || ''
    formGender.value = (newUser.gender as '' | 'male' | 'female' | 'other') || ''
    savedGender.value = (newUser.gender as '' | 'male' | 'female' | 'other') || ''
  }
}, { immediate: true })
let prevAvatarBlobUrl: string | null = null
const selectedAvatarFile = ref<File | null>(null)
const isProfileModalOpen = ref(false)
const isAddressModalOpen = ref(false)
const isOrderModalOpen = ref(false)
type OrderTab = 'done' | 'toShip' | 'toReceive' | 'afterSale' | 'address'
const orderTab = ref<OrderTab>('done')

// 真实订单数据
const allOrders = ref<OrderDto[]>([])
const ordersLoading = ref(false)

// 将订单按状态分组
const ordersByTab = computed(() => {
  const grouped: Record<Exclude<OrderTab, 'address'>, OrderDto[]> = {
    done: [],
    toShip: [],
    toReceive: [],
    afterSale: []
  }
  
  allOrders.value.forEach(order => {
    switch (order.status) {
      case 'DELIVERED':
        grouped.done.push(order)
        break
      case 'PROCESSING':
        grouped.toShip.push(order)
        break
      case 'SHIPPED':
        grouped.toReceive.push(order)
        break
      case 'REFUNDED':
      case 'CANCELED':
        grouped.afterSale.push(order)
        break
    }
  })
  
  return grouped
})

// 地址列表数据
const addressList = ref<Address[]>([])
const addressLoading = ref(false)

// 获取完整地址显示（确保都是中文名称）
const getFullAddress = (address: Address) => {
  let provinceName = address.province
  let cityName = address.city  
  let areaName = address.area
  
  // 如果省份是代码，转换为中文名称
  if (provinces.value.length > 0) {
    const province = provinces.value.find(p => p.code === address.province || p.name === address.province)
    if (province) provinceName = province.name
  }
  
  // 如果城市是代码，从映射中查找中文名称
  if (Object.keys(citiesMap.value).length > 0) {
    for (const provinceCode in citiesMap.value) {
      const foundCity = citiesMap.value[provinceCode].find(c => c.code === address.city || c.name === address.city)
      if (foundCity) {
        cityName = foundCity.name
        break
      }
    }
  }
  
  // 如果区域是代码，从映射中查找中文名称
  if (Object.keys(areasMap.value).length > 0) {
    for (const cityCode in areasMap.value) {
      const foundArea = areasMap.value[cityCode].find(a => a.code === address.area || a.name === address.area)
      if (foundArea) {
        areaName = foundArea.name
        break
      }
    }
  }
  
  return `${provinceName} ${cityName} ${areaName} ${address.detailedAddress}`
}

// 获取地址列表
const loadAddresses = async () => {
  addressLoading.value = true
  try {
    const result = await getUserAddresses()
    if (result.success && result.data) {
      // 按更新时间降序排序，最新的在前面
      addressList.value = result.data.sort((a, b) => {
        const timeA = new Date(a.updatedTime || a.createdTime).getTime()
        const timeB = new Date(b.updatedTime || b.createdTime).getTime()
        return timeB - timeA // 降序排序，最新的在前
      })
    } else {
      console.error('获取地址列表失败:', result.message)
    }
  } catch (error) {
    console.error('获取地址列表出错:', error)
  } finally {
    addressLoading.value = false
  }
}

// 编辑地址：进入地址二级表单并预填
const editAddress = (ad: Address) => {
  orderView.value = 'addrNew'
  editingAddrId.value = String(ad.id)
  
  // 转换中文名称为代码（如果需要）
  let provinceCode = ad.province
  let cityCode = ad.city
  let areaCode = ad.area
  
  // 如果省份是中文名称，查找对应代码
  if (provinces.value.length > 0) {
    const province = provinces.value.find(p => p.name === ad.province)
    if (province) provinceCode = province.code
  }
  
  // 如果城市是中文名称，查找对应代码
  if (Object.keys(citiesMap.value).length > 0) {
    for (const provinceKey in citiesMap.value) {
      const foundCity = citiesMap.value[provinceKey].find(c => c.name === ad.city)
      if (foundCity) {
        cityCode = foundCity.code
        break
      }
    }
  }
  
  // 如果区域是中文名称，查找对应代码
  if (Object.keys(areasMap.value).length > 0) {
    for (const cityKey in areasMap.value) {
      const foundArea = areasMap.value[cityKey].find(a => a.name === ad.area)
      if (foundArea) {
        areaCode = foundArea.code
        break
      }
    }
  }
  
  addrForm.value = { 
    name: ad.recipientName, 
    phone: ad.phoneNumber, 
    address: ad.detailedAddress, 
    province: provinceCode, 
    city: cityCode, 
    area: areaCode 
  }
}

// 删除地址
const handleDeleteAddress = async (ad: Address) => {
  if (confirm('确定要删除这个地址吗？')) {
    try {
      const result = await deleteAddressAPI(ad.id)
      if (result.success) {
        // 从列表中移除已删除的地址
        const idx = addressList.value.findIndex(a => a.id === ad.id)
        if (idx >= 0) {
          addressList.value.splice(idx, 1)
        }
      } else {
        alert(result.message || '删除地址失败')
      }
    } catch (error) {
      console.error('删除地址出错:', error)
      alert('删除地址失败')
    }
  }
}

// 新建地址：进入地址二级表单
const activeTab = ref<'works' | 'likes'>('works')
const isEditing = ref(false)
// formNickname 和 savedNickname 已在前面定义
// displayName 现在从 useAuth 获取，这里移除重复定义


// 检查表单是否可以保存
const canSave = computed(() => {
  // 检查是否有修改
  const hasNicknameChanged = formNickname.value !== savedNickname.value
  const hasGenderChanged = formGender.value !== savedGender.value
  const hasAvatarChanged = selectedAvatarFile.value !== null
  
  // 如果有任何修改，检查昵称是否有效（不为空）
  if (hasNicknameChanged || hasGenderChanged || hasAvatarChanged) {
    // 如果昵称有修改，确保不为空
    if (hasNicknameChanged && (!formNickname.value || formNickname.value.trim() === '')) {
      return false
    }
    return true
  }
  
  return false
})

const handleNameInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  let value = target.value
  // 统计中文与英文数量
  let enCount = 0
  let zhCount = 0
  let result = ''
  for (const ch of value) {
    const isZh = /^[\u4e00-\u9fa5]$/.test(ch)
    if (isZh) {
      if (zhCount + 1 > 10) break
      zhCount += 1
      result += ch
      } else {
      if (enCount + 1 > 20) break
      enCount += 1
      result += ch
    }
  }
  formNickname.value = result
}

// formGender 和 savedGender 已在前面定义
const genderOptions = [
  { value: 'male' as const, label: '男' },
  { value: 'female' as const, label: '女' },
]
const genderLabel = computed(() => {
  if (!formGender.value) return '请选择性别'
  return genderOptions.find(o => o.value === formGender.value)?.label || '请选择性别'
})
const genderOpen = ref(false)
const genderWrapRef = ref<HTMLElement | null>(null)
const onDocClick = (e: MouseEvent) => {
  if (!genderOpen.value) return
  const el = genderWrapRef.value
  if (el && !el.contains(e.target as Node)) genderOpen.value = false
}
onMounted(() => { if (typeof window !== 'undefined') window.addEventListener('click', onDocClick) })
onBeforeUnmount(() => { if (typeof window !== 'undefined') window.removeEventListener('click', onDocClick) })
const selectGender = (val: 'male' | 'female' | 'other' | '') => {
  formGender.value = val
  genderOpen.value = false
}
// 使用后端的WorksDto类型
const works = ref<WorksDto[]>([])
const worksLoading = ref(false)

// 使用WorksDto作为点赞作品的数据类型
const likes = ref<WorksDto[]>([])
const likesLoading = ref(false)
const displayedLikes = ref<WorksDto[]>([])

const toggleLike = async (work: WorksDto) => {
  if (!currentUser.value) {
    console.warn('用户未登录，无法点赞')
    return
  }

  try {
    const userId = currentUser.value.id
    const worksId = work.id
    
    // 使用全局点赞状态管理
    const result = await toggleWorkLike(userId, worksId, work.isLiked || false, work.likesCount || 0)
    
    // 更新本地状态
    work.isLiked = result.isLiked
    work.likesCount = result.likesCount
    
    // 如果是取消点赞，需要重新加载点赞列表来移除该项
    if (!result.isLiked) {
      await loadUserLikedWorks()
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    // 操作失败时可以显示错误提示
  }
}

// 加载用户作品列表
const loadUserWorks = async () => {
  if (!currentUser.value) {
    return
  }
  
  try {
    worksLoading.value = true
    const userWorks = await getUserWorks(currentUser.value.id, currentUser.value.id)
    works.value = userWorks
    console.log('用户作品加载成功:', userWorks)
  } catch (error) {
    console.error('加载用户作品失败:', error)
    works.value = []
  } finally {
    worksLoading.value = false
  }
}

// 删除作品
const handleDeleteWork = async (work: WorksDto) => {
  if (!currentUser.value) {
    alert('请先登录后再删除作品')
    return
  }

  const confirmMessage = work.likesCount && work.likesCount > 0 
    ? `确定要删除这个作品吗？这个作品有 ${work.likesCount} 个点赞，删除后将无法恢复。` 
    : '确定要删除这个作品吗？删除后将无法恢复。'

  if (confirm(confirmMessage)) {
    try {
      await deleteWork(work.id, currentUser.value.id)
      // 从列表中移除已删除的作品
      const idx = works.value.findIndex(w => w.id === work.id)
      if (idx >= 0) {
        works.value.splice(idx, 1)
      }
      console.log('删除作品成功:', work.id)
    } catch (error: any) {
      console.error('删除作品出错:', error)
      
      // 检查是否是外键约束错误
      if (error.response?.status === 409 || 
          error.message?.includes('constraint') || 
          error.message?.includes('foreign key')) {
        alert('删除失败：该作品还有相关的点赞记录，请联系管理员处理')
      } else {
        alert('删除作品失败，请稍后重试')
      }
    }
  }
}

// 直接显示所有点赞作品，不分批加载
const showLikesInBatches = async (works: WorksDto[]) => {
  // 直接显示所有图片，与首页保持一致
  displayedLikes.value = works
}

// 加载用户点赞的作品列表
const loadUserLikedWorks = async () => {
  if (!currentUser.value) {
    return
  }
  
  try {
    likesLoading.value = true
    const likedWorks = await getUserLikedWorks(currentUser.value.id)
    likes.value = likedWorks
    
    // 分批显示
    await showLikesInBatches(likedWorks)
    
    console.log('用户点赞作品加载成功:', likedWorks)
  } catch (error) {
    console.error('加载用户点赞作品失败:', error)
    likes.value = []
    displayedLikes.value = []
  } finally {
    likesLoading.value = false
  }
}

const openProfileModal = async () => {
  isProfileModalOpen.value = true
  // 打开弹窗时加载用户作品和点赞作品
  await Promise.all([
    loadUserWorks(),
    loadUserLikedWorks()
  ])
}
const closeProfileModal = () => { isProfileModalOpen.value = false }
const openAddressModal = () => { isAddressModalOpen.value = true }
const saveProfile = async () => { 
  try {
    let avatarUrl = currentUser.value?.avatar || ''
    
    // 如果有新头像，先上传头像
    if (selectedAvatarFile.value) {
      console.log('上传新头像...')
      const uploadResult = await uploadUserAvatar(selectedAvatarFile.value)
      
      if (uploadResult.success && uploadResult.data) {
        avatarUrl = uploadResult.data
        console.log('头像上传成功:', avatarUrl)
      } else {
        console.error('头像上传失败:', uploadResult.message)
        alert(uploadResult.message || '头像上传失败')
        return
      }
    }
    
    const profileData = {
      username: formNickname.value,
      gender: formGender.value,
      avatar: avatarUrl
    }
    
    const result = await updateCurrentUserProfile(profileData)
    
    if (result.success) {
      savedNickname.value = formNickname.value
      savedGender.value = formGender.value
      isEditing.value = false
      selectedAvatarFile.value = null // 清除已选择的文件
      
      // 更新全局用户状态
      if (result.data) {
        setUser(result.data)
      }
      
      console.log('用户资料更新成功')
    } else {
      console.error('用户资料更新失败:', result.message)
      alert(result.message || '更新失败，请稍后重试')
    }
  } catch (error) {
    console.error('更新用户资料时出错:', error)
    alert('网络错误，请稍后重试')
  }
}

// 图片预览
// 图片预览相关
const isImagePreviewOpen = ref(false)
const selectedLikedWork = ref<WorksDto | null>(null)
const isLiked = ref(false)
const isLiking = ref(false)

// 打开图片预览
const openImagePreview = (work: WorksDto) => {
  selectedLikedWork.value = work
  isLiked.value = work.isLiked || false
  isImagePreviewOpen.value = true
}

// 关闭图片预览
const closeImagePreview = () => {
  isImagePreviewOpen.value = false
  selectedLikedWork.value = null
}

// 切换上下两张图片
const switchImages = () => {
  if (!selectedLikedWork.value) return
  
  const work = selectedLikedWork.value
  const tempImage = work.workImage
  work.workImage = work.originalImage
  work.originalImage = tempImage
}

// 预览中的点赞切换
const togglePreviewLike = async () => {
  if (!selectedLikedWork.value || !currentUser.value || isLiking.value) return
  
  isLiking.value = true
  try {
    const userId = currentUser.value.id
    const worksId = selectedLikedWork.value.id
    const currentIsLiked = isLiked.value
    const currentLikesCount = selectedLikedWork.value.likesCount || 0
    
    const result = await toggleWorkLike(userId, worksId, currentIsLiked, currentLikesCount)
    
    if (result) {
      isLiked.value = result.isLiked
      selectedLikedWork.value.isLiked = result.isLiked
      selectedLikedWork.value.likesCount = result.likesCount
      
      // 更新likes列表中对应的作品状态
      const likedWork = likes.value.find(work => work.id === selectedLikedWork.value!.id)
      if (likedWork) {
        likedWork.isLiked = result.isLiked
        likedWork.likesCount = result.likesCount
      }
      
      // 如果是取消点赞，需要重新加载点赞列表来移除该项
      if (!result.isLiked) {
        await loadUserLikedWorks()
      }
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
  } finally {
    isLiking.value = false
  }
}

// 编辑头像：编辑页点击弹出选择文件；非编辑页则进入编辑页
const avatarFileInput = ref<HTMLInputElement | null>(null)
const onAvatarEditClick = () => {
  if (isEditing.value) {
    avatarFileInput.value?.click()
      } else {
    isEditing.value = true
  }
}

// 编辑背景
const bannerUrl = ref('')
const bannerStyle = computed(() => ({ backgroundImage: bannerUrl.value ? `url(${bannerUrl.value})` : 'none' }))
const handleAvatarFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  
  // 存储文件用于上传
  selectedAvatarFile.value = file
  
  // 使用原文件的 Object URL，避免任何 base64 编码造成的体积/精度变化
  const objectUrl = URL.createObjectURL(file)
  // 释放旧的 blob URL
  if (prevAvatarBlobUrl) {
    try { URL.revokeObjectURL(prevAvatarBlobUrl) } catch {}
  }
  prevAvatarBlobUrl = objectUrl
  avatarUrl.value = objectUrl
  // 可在关闭或重新选择时释放 URL：此处简单重置 input 即可
  input.value = ''
}

// 订单数据处理函数
const getOrderImage = (order: OrderDto) => {
  // 优先使用订单项中的定制图片
  if (order.orderItems && order.orderItems.length > 0) {
    const firstItem = order.orderItems[0]
    if (firstItem.customizationPhotoUrl) {
      return firstItem.customizationPhotoUrl
    }
  }
  // 默认图片
  return '/images/1.png'
}

const getOrderTitle = (order: OrderDto) => {
  if (order.orderItems && order.orderItems.length > 0) {
    const firstItem = order.orderItems[0]
    return firstItem.productName || 'Custom Clothing'
  }
  return 'Custom Clothing'
}

const formatOrderDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 加载用户信息
const loadCurrentUser = async () => {
  try {
    const result = await getCurrentUser()
    if (result.success && result.data) {
      currentUser.value = result.data
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 加载订单数据
const loadOrders = async () => {
  if (!currentUser.value) {
    return
  }

  try {
    ordersLoading.value = true
    const result = await getUserOrders(currentUser.value.id)
    
    if (result.success && result.data) {
      allOrders.value = result.data
    } else {
      console.error('获取订单列表失败:', result.message)
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
  } finally {
    ordersLoading.value = false
  }
}

// 修改openOrderModal函数，在打开时加载订单数据
const openOrderModal = async () => {
  isOrderModalOpen.value = true
  
  // 如果还没有加载用户信息，先加载
  if (!currentUser.value) {
    await loadCurrentUser()
  }
  
  // 加载订单数据
  await loadOrders()
}

defineExpose({ openProfileModal, openAddressModal, openOrderModal })

const orderView = ref<'list' | 'detail' | 'addrNew'>('list')
const currentOrder = ref<OrderDto | null>(null)
const openOrderDetail = (order: OrderDto) => { currentOrder.value = order; orderView.value = 'detail' }
const backToOrderList = () => { orderView.value = 'list' }

// 处理订单更新事件
const handleOrderUpdated = async (updatedOrder: OrderDto) => {
  // 更新当前订单数据
  currentOrder.value = updatedOrder
  
  // 更新订单列表中的对应订单
  const orderIndex = allOrders.value.findIndex(order => order.id === updatedOrder.id)
  if (orderIndex >= 0) {
    allOrders.value[orderIndex] = updatedOrder
  }
  
  // 可选：重新加载订单列表以确保数据同步
  // await loadOrders()
}
const newAddress = () => { editingAddrId.value = null; addrForm.value = { name: '', phone: '', address: '', province: '', city: '', area: '' }; orderView.value = 'addrNew' }

// 新建地址进入二级页面
const addrForm = ref<{ name: string; phone: string; address: string; province: string; city: string; area: string }>({ name: '', phone: '', address: '', province: '', city: '', area: '' })
const editingAddrId = ref<string | null>(null)
// duplicate removed above
const saveAddress = async (addressData: { name: string; phone: string; address: string; province: string; city: string; area: string }) => {
  const { name, phone, address, province, city, area } = addressData
  if (!name || !phone || !address || !province || !city || !area) return
  
  // Get region names for display
  const provinceName = provinces.value.find(p => p.code === province)?.name || province
  
  // 从完整的城市映射中查找城市名称
  let cityName = city
  for (const provinceCode in citiesMap.value) {
    const foundCity = citiesMap.value[provinceCode].find(c => c.code === city)
    if (foundCity) {
      cityName = foundCity.name
      break
    }
  }
  
  // 从完整的区域映射中查找区域名称
  let areaName = area
  for (const cityCode in areasMap.value) {
    const foundArea = areasMap.value[cityCode].find(a => a.code === area)
    if (foundArea) {
      areaName = foundArea.name
      break
    }
  }
  
  try {
    const requestData: AddressRequest = {
      recipientName: name,
      phoneNumber: phone,
      province: provinceName,
      city: cityName,
      area: areaName,
      detailedAddress: address
    }
    
    let result
    if (editingAddrId.value) {
      // 更新地址
      result = await updateAddress(Number(editingAddrId.value), requestData)
    } else {
      // 新建地址
      result = await addAddress(requestData)
    }
    
    if (result.success) {
      // 重新加载地址列表
      await loadAddresses()
      orderView.value = 'list'
    } else {
      alert(result.message || '保存地址失败')
    }
  } catch (error) {
    console.error('保存地址出错:', error)
    alert('保存地址失败')
  }
}

// 省市区数据与联动
// 省市区数据与联动：运行时加载 public 下静态 JSON
const provinces = ref<Array<{ code: string; name: string }>>([])
const citiesMap = ref<Record<string, Array<{ code: string; name: string }>>>({})
const areasMap = ref<Record<string, Array<{ code: string; name: string }>>>({})
// 监听地址标签切换，加载地址列表
watch(orderTab, (newTab) => {
  if (newTab === 'address') {
    loadAddresses()
  }
})

onMounted(async () => {
  try {
    const [pRes, cRes, aRes] = await Promise.all([
      fetch('/address/provinces.json'),
      fetch('/address/cities.json'),
      fetch('/address/areas.json')
    ])
    provinces.value = await pRes.json()
    const citiesArr: Array<{ code: string; name: string; provinceCode: string }> = await cRes.json()
    const areasArr: Array<{ code: string; name: string; cityCode: string; provinceCode: string }> = await aRes.json()
    // 将数组转为 map：省code -> 城市[]，城市code -> 区县[]
    const cMap: Record<string, Array<{ code: string; name: string }>> = {}
    for (const c of citiesArr) {
      if (!cMap[c.provinceCode]) cMap[c.provinceCode] = []
      cMap[c.provinceCode].push({ code: c.code, name: c.name })
    }
    const aMap: Record<string, Array<{ code: string; name: string }>> = {}
    for (const a of areasArr) {
      if (!aMap[a.cityCode]) aMap[a.cityCode] = []
      aMap[a.cityCode].push({ code: a.code, name: a.name })
    }
    citiesMap.value = cMap
    areasMap.value = aMap
  } catch (e) {
    // ignore
  }
})
</script>

<script lang="ts">
export default { name: 'NavBar' }
</script>

<style scoped>
/* 模态框遮罩层 */
.figma-modal { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; padding: clamp(.5rem, 1vh, 1.5rem); }

.figma-modal__overlay { position: absolute; inset: 0; background: rgba(0,0,0,.8); backdrop-filter: saturate(140%) blur(.2rem); }

/* 主容器 */
.modal-content { position: relative; width: clamp(48rem, 68vw, 60rem); max-width: 100%; background: transparent; border-radius: var(--radius-lg); display: block; margin: 0 auto; }

/* Discord 卡片容器 */
.discord-card { 
  position: relative;
  background: var(--color-bg);
  border: none; 
  border-radius: var(--radius-md);
  box-shadow: 0 1.2rem 3rem rgba(0,0,0,.45); 
  --card-pad: clamp(1.25rem, 2.4vw, 1.75rem); 
  padding: var(--card-pad); 
  display: grid; 
  place-items: center; 
  gap: .75rem; 
  block-size: clamp(50rem, 84vh, 78rem); 
  overflow: hidden;
  --banner-h: clamp(18rem, 36vh, 21rem); 
  --avatar-size: clamp(10rem, 18vw, 14rem); 
}
.dc-banner { 
  position: absolute; 
  inset-inline: clamp(3rem, 5vw, 4rem); 
  top: clamp(3rem, 5vh, 4rem); 
  inline-size: calc(100% - (clamp(3rem, 5vw, 4rem) * 2)); 
  block-size: calc(var(--banner-h) - clamp(3rem, 5vh, 4rem)); 
  background: var(--color-primary) center/cover no-repeat; 
  border-radius: var(--radius-md); 
}
.banner-back { 
  position: absolute; 
  top: calc(clamp(3rem, 5vh, 4rem) + (var(--card-pad) * .6)); 
  left: calc(clamp(3rem, 5vw, 4rem) + (var(--card-pad) * .6)); 
  z-index: 2; 
  width: 4.4rem; 
  height: 4.4rem; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  padding: 0; 
  background: var(--color-surface); 
  border: 1px solid color-mix(in srgb, var(--color-border), transparent 30%); 
  border-radius: var(--radius-md); 
  color: var(--color-text); 
  cursor: pointer; 
  transition: all 0.2s ease; 
  box-shadow: none; 
  margin: 0; 
}
.banner-back:hover { 
  background: color-mix(in srgb, var(--color-primary), transparent 92%);
  border-color: var(--color-primary);
  color: var(--color-text);
  transform: translateY(-2px); 
}
.banner-back svg { 
  width: clamp(1.8rem, 2.5vw, 2.2rem);
  height: clamp(1.8rem, 2.5vw, 2.2rem);
  color: inherit; 
}

.discord-card::before { 
  content: ""; 
  display: block; 
  inline-size: 100%; 
  block-size: var(--banner-h); 
}
.dc-main { display: grid; place-items: center; gap: .5rem; }
.discord-card.no-banner::before { content: none; }
.order-sections { position: absolute; left: 0; right: 0; top: calc(var(--card-pad) + 1rem); bottom: 0; display: grid; grid-template-rows: auto 1fr; --od-pad-x: clamp(3rem, 5vw, 4rem); }
.order-sections .dc-tabs { inline-size: 100%; justify-content: flex-start; margin: 0; gap: clamp(3.8rem, 6.5vw, 5rem); margin-top: 2.2rem; padding-left: var(--od-pad-x); }
.order-sections .dc-scroll { 
  padding: var(--od-pad-x) var(--od-pad-x) var(--card-pad); 
  overflow-y: auto;
  max-height: calc(100vh - 8rem);
}
.address-container { 
  position: relative;
  height: 100%; 
}

.address-content { 
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  /* 完全占满容器，不为按钮留空间 */
}

/* 确保地址页面的空状态占满可用空间 */
.address-content .work-empty.full {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  place-items: center;
  text-align: center;
}

.add-address { 
  position: absolute;
  bottom: calc(var(--card-pad) * 1.2);
  left: 0;
  right: 0;
  margin: 0;
  z-index: 2;
  /* 添加背景和阴影，确保按钮可见 */
  background: var(--color-primary);
  border-radius: var(--radius-md);
}

/* 特殊类：绝对定位的新建地址按钮（继承上面的绝对定位样式） */
.order-sections .dc-tab::before { height: .14rem; border-radius: var(--radius-md); }
.order-sections .dc-tab.active::before { height: .14rem; }
.order-sections .dc-tab { font-size: var(--fs-sm); font-weight: 500; }
.dc-avatar { 
  position: absolute; 
  top: calc(var(--banner-h) - (var(--avatar-size) * .5)); 
  left: 50%; 
  transform: translateX(-50%); 
  inline-size: var(--avatar-size); 
  block-size: var(--avatar-size); 
  border-radius: 50%; 
  border: .8rem solid var(--color-bg); 
  background: var(--color-card); 
  object-fit: cover; 
}

/* 默认头像图标样式 - 只对profile.png图标生效 */
.dc-avatar[src*="profile.png"] {
  object-fit: contain !important;
  background: var(--color-card) !important;
  padding: 2rem !important;
}
.avatar-edit { position: absolute; top: calc(var(--banner-h) - (var(--avatar-size) * .5)); left: 50%; transform: translate(calc(-50% + (var(--avatar-size)/2) - 2.2rem), 1rem); inline-size: 3.4rem; block-size: 3.4rem; border-radius: 50%; border: none; background: var(--color-bg); cursor: pointer; display: grid; place-items: center; box-shadow: 0 .2rem .6rem rgba(0,0,0,.2); transition: transform .15s ease, box-shadow .15s ease; }
.avatar-edit::before { content: ""; inline-size: 1.8rem; block-size: 1.8rem; background: var(--color-icon); -webkit-mask: url('/icons/edit.png') center/contain no-repeat; mask: url('/icons/edit.png') center/contain no-repeat; transition: transform .15s ease; }
.avatar-edit:hover { transform: translate(calc(-50% + (var(--avatar-size)/2) - 2.2rem), 1rem) scale(1.08); box-shadow: 0 .3rem .8rem rgba(0,0,0,.28); }
.avatar-edit:hover::before { transform: scale(1.08); }
.dc-name { 
  position: absolute; 
  top: calc(var(--banner-h) + (var(--avatar-size) * .58)); 
  left: 50%; 
  transform: translateX(-50%); 
  margin: 0; 
  font-size: clamp(1.5rem, 3.4vw, 2rem); 
  font-weight: 600; 
  color: var(--color-text); 
  text-align: center; 
}

/* 编辑资料视图 */
.edit-head { position: relative; display: grid; grid-template-columns: auto 1fr; align-items: center; padding: 0 1.2rem; }
.back-btn { inline-size: 2.4rem; block-size: 2.4rem; border-radius: 50%; border: none; background: color-mix(in srgb, var(--color-bg), transparent 18%); cursor: pointer; position: relative; }
.back-btn::before { content: ""; position: absolute; inset: 0; margin: auto; inline-size: 1.2rem; block-size: 1.2rem; background: var(--color-icon); -webkit-mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M15 6l-6 6 6 6' stroke='black' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>") center/contain no-repeat; mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M15 6l-6 6 6 6' stroke='black' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>") center/contain no-repeat; }
.edit-title { color: var(--color-text); font-weight: 600; font-size: clamp(1.2rem, 2.6vw, 1.4rem); padding-left: .8rem; }

.edit-form { display: grid; gap: clamp(2.5rem, 5vw, 3.5rem); padding: 0; margin: 0; }
.ef-card { background: var(--color-card); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding-inline: clamp(1.4rem, 3vw, 2rem); padding-top: clamp(2.2rem, 4.5vw, 3.3rem); padding-bottom: clamp(2.5rem, 5vw, 3.5rem); margin-inline: 0; display: grid; gap: 2.5rem; --ef-font-size: var(--fs-sm); }
.ef-group { display: grid; gap: 1.6rem; }
.ef-label { color: var(--color-text); font-size: var(--fs-sm); font-weight: 500; margin-top: 0.3rem; line-height: 1; }
.ef-error { color: color-mix(in srgb, tomato, white 10%); font-size: var(--fs-xs); }
.ef-control { inline-size: 100%; padding: clamp(1.2rem, 2vw, 1.5rem); border-radius: var(--radius-md); border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text); font-size: var(--ef-font-size); line-height: 1.2; box-sizing: border-box; display: block; transition: border-color 0.2s ease; min-height: calc(clamp(0.8rem, 1.5vw, 1rem) * 2 + 1.2em); }
.ef-control::placeholder { font-size: inherit; opacity: .7; }
.ef-control:focus, .ef-control:focus-visible { outline: none; box-shadow: none; border: 1px solid var(--color-primary); }
.ef-select-wrap { position: relative; }
.ef-select { appearance: none; -webkit-appearance: none; }
.ef-caret { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); inline-size: 1.5rem; block-size: 1.5rem; background: var(--color-icon); -webkit-mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M15 9L9 15L3 9' stroke='black' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>") center/contain no-repeat; mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M15 9L9 15L3 9' stroke='black' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>") center/contain no-repeat; pointer-events: none; transition: transform 0.2s ease; }
/* 自定义选择器样式 */
.cs-wrap { position: relative; }
.cs-trigger { text-align: left; display: grid; grid-auto-flow: column; justify-content: start; align-items: center; gap: .6rem; cursor: pointer; padding: clamp(1.2rem, 2vw, 1.5rem); border-radius: var(--radius-md); border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text); font-size: var(--ef-font-size); line-height: 1.2; box-sizing: border-box; transition: border-color 0.2s ease; min-height: calc(clamp(0.8rem, 1.5vw, 1rem) * 2 + 1.2em); }
.cs-trigger:focus, .cs-trigger:focus-visible { outline: none; border: 1px solid var(--color-primary); }
.cs-wrap.open .cs-trigger { border: 1px solid var(--color-primary); }
.cs-wrap.open .ef-caret { transform: translateY(-50%) rotate(180deg); }
.cs-panel { position: absolute; left: 0; right: 0; top: calc(100% + .4rem); background: var(--color-surface); border: none; border-radius: var(--radius-md); box-shadow: 0 .6rem 1.6rem rgba(0,0,0,.18); padding: .6rem; margin: 0; list-style: none; z-index: 5; max-block-size: none; overflow: visible; scrollbar-width: none; }
.cs-panel::-webkit-scrollbar{ display:none; }
.cs-option { padding: clamp(1.2rem, 2vw, 1.5rem) 1rem; border-radius: var(--radius-sm); color: var(--color-text); cursor: pointer; font-size: var(--ef-font-size); line-height: 1.2; min-height: calc(clamp(0.8rem, 1.5vw, 1rem) * 2 + 1.2em); display: flex; align-items: center; }
.cs-option + .cs-option { margin-top: 0.6rem; }
.cs-option:hover { background: var(--color-card); }
.cs-option.active { background: var(--color-card); color: var(--color-text); }
.ef-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: clamp(0.8rem, 1.5vw, 1rem) 1.6rem;
  border-radius: var(--radius-md);
  font-size: var(--fs-md);
  font-weight: 500;
  background: var(--color-primary);
  color: white;
  border: none;
  cursor: pointer;
  margin-block: clamp(.12rem, 0.4vh, 0.6rem);
}
.ef-submit:disabled { opacity: .6; cursor: not-allowed; }

/* 分类栏 */
.dc-tabs { position: relative; z-index: 1; display: flex; inline-size: 100%; justify-content: flex-start; gap: clamp(4.2rem, 7vw, 5.2rem); padding-right: 1.2rem; padding-left: clamp(3rem, 5vw, 4rem); }
.dc-tabs::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; block-size: .0625rem; background: var(--color-border); opacity: .7; }
.dc-tab { position: relative; padding: 0 0 .8rem 0; background: transparent; color: var(--color-text-muted); border: none; border-bottom: none; font-weight: 500; font-size: var(--fs-sm); letter-spacing: 0.08em; cursor: pointer; z-index: 1; }
.dc-tab:hover { color: var(--color-text); }
.dc-tab.active { color: var(--color-text); }
.dc-tab::before { content: ""; position: absolute; left: 0; right: 0; bottom: -.06rem; height: .14rem; background: var(--color-text); border-radius: var(--radius-lg); opacity: 0; transform: scaleX(.6); transition: opacity .15s ease, transform .15s ease; }
.dc-tab:not(.active):hover::before { opacity: .9; transform: scaleX(1); }
.dc-tab.active::before { content: ""; position: absolute; left: 0; right: 0; bottom: -.06rem; height: .14rem; background: var(--color-text); border-radius: var(--radius-lg); opacity: 1; transform: scaleX(1); }

/* 作品列表 */
.dc-sections { position: absolute; left: 0; right: 0; top: calc(var(--banner-h) + (var(--avatar-size) * .90) + 1.2rem); bottom: 0; display: grid; grid-template-rows: auto 1fr; }
.dc-scroll { position: relative; overflow-y: auto; overflow-x: hidden; padding: clamp(3rem, 5vh, 4rem) clamp(3rem, 5vw, 4rem) var(--card-pad); scrollbar-width: none; height: 100%; }
.dc-scroll::-webkit-scrollbar { display: none; }
.work-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.8rem; }
.work-item { display: grid; grid-template-columns: auto 1fr auto; align-items: center; background: var(--color-card); border-radius: var(--radius-md); border: none; --item-pad: 1.2rem; padding: var(--item-pad); min-block-size: 8rem; column-gap: 0; }
.work-item.no-thumb { grid-template-columns: 1fr auto; min-block-size: 8.4rem; }
.work-thumb { inline-size: 6rem; block-size: 6rem; border-radius: var(--radius-sm); object-fit: cover; }
.work-body { display: grid; gap: .25rem; padding-inline: var(--item-pad) 0; }
.work-title { color: var(--color-text); font-weight: 400 !important; font-size: var(--fs-sm) !important; }
.work-meta { display: inline-flex; align-items: center; gap: .6rem; color: var(--color-text-muted); font-weight: 400 !important; font-size: var(--fs-xs); }
.work-meta .dot { inline-size: .25rem; block-size: .25rem; background: var(--color-text-muted); border-radius: 50%; display: inline-block; }
.work-more { inline-size: 2rem; block-size: 2rem; border-radius: var(--radius-md); border: 1px solid var(--color-border); background: var(--color-card); cursor: pointer; position: relative; }
.work-more::before { content: ""; position: absolute; inset: 0; margin: auto; inline-size: 1rem; block-size: 1rem; background: var(--color-icon); -webkit-mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M12 6a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 4.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 4.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z' fill='black'/></svg>") center/contain no-repeat; mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M12 6a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 4.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 4.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z' fill='black'/></svg>") center/contain no-repeat; }
.work-empty { color: var(--color-text-muted); text-align: center; padding: 2rem 0; }
.work-empty.full { display: grid; place-items: center; min-block-size: 100%; padding: 0; }

/* 点赞瀑布流：使用与首页完全相同的columns布局 */
/* 点赞列表网格布局 - web端4列 */
.like-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

/* 点赞卡片样式 - 与Gallery一致 */
.like-card { 
  position: relative;  
  width: 100%;
  background: var(--color-card); 
  border: 2px solid var(--color-card);
  border-radius: var(--radius-sm); 
  overflow: hidden; 
  transition: transform .25s ease, box-shadow .25s ease; 
  will-change: transform;
  cursor: pointer;
  aspect-ratio: 1; /* 正方形卡片 */
}

.like-card:hover { 
  transform: translateY(-.4rem) scale(1.02); 
}

.like-card:active { 
  transform: translateY(-.2rem) scale(1.01); 
}

/* 卡片内部布局 */
.like-card-layout {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0.5rem 1rem 0.5rem 0.5rem;
  height: 100%;
}

/* 左侧T恤贴图区域 */
.like-card-left {
  position: absolute;
  top: 52%;
  left: -0.5rem;
  transform: translateY(-50%);
  z-index: 10;
  width: 85px; /* 稍微增大T恤图片尺寸 */
  height: 85px;
}

.like-card-tshirt-wrapper {
  width: 100%;
  height: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.like-card-tshirt-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: var(--radius-sm);
}

/* 右侧手机区域 */
.like-card-right {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.like-card-phone {
  position: relative;
  width: 65px; /* 稍微缩小手机宽度 */
  height: 92px; /* 稍微缩小手机高度，保持比例 */
  border-radius: calc(var(--radius-sm) * 0.5);
  overflow: hidden;
  background: var(--color-card);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-left: auto;
  margin-right: -0.1rem; /* 增加右边距，与边框保持间距 */
}

.like-card-phone::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px; /* 按比例调整状态栏高度 */
  background: var(--color-topbar);
  z-index: 2;
}

.like-card-phone-img-wrapper {
  position: relative;
  width: 100%;
  height: 86px; /* 按比例调整图片区域高度 (92-6=86) */
  background: var(--color-bottombar);
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.like-card-phone-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}
.like-btn { 
  position: absolute; 
  top: .4rem; 
  right: .4rem; 
  inline-size: 2.6rem; 
  block-size: 2.6rem; 
  border-radius: 50%; 
  border: none; 
  background: rgba(0, 0, 0, 0.1); 
  color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(4px); 
  cursor: pointer; 
  display: grid; 
  place-items: center; 
  transition: all 0.3s ease; 
  box-sizing: border-box;
  z-index: 10;
}
.like-btn::before { 
  content: ""; 
  display: block; 
  inline-size: 2.2rem; 
  block-size: 2.2rem; 
  background: rgba(255, 255, 255, 0.7); 
  -webkit-mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M12 21s-7-4.35-7-9a4 4 0 018-1 4 4 0 018 1c0 4.65-7 9-7 9z' fill='black'/></svg>") center/contain no-repeat; 
  mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M12 21s-7-4.35-7-9a4 4 0 018-1 4 4 0 018 1c0 4.65-7 9-7 9z' fill='black'/></svg>") center/contain no-repeat; 
  transition: all 0.3s ease; 
  transform: translateX(-4.8px) translateY(-1px);
}
.like-btn:hover { 
  transform: scale(1.1); 
  border-color: rgba(255, 255, 255, 0.5);
}

.like-btn.on { 
  inline-size: 2.6rem; 
  block-size: 2.6rem; 
  background: rgba(0, 0, 0, 0.1); 
  border: none;
  backdrop-filter: blur(4px);
}
.like-btn.on::before { 
  background: var(--color-primary); 
  inline-size: 2.2rem; 
  block-size: 2.2rem; 
}
.like-btn.on:hover { 
  transform: scale(1.1); 
  border-color: var(--color-primary);
}

/* 图片预览样式 */
.img-viewer { position: fixed; inset: 0; z-index: 2000; display: grid; place-items: center; background: rgba(0,0,0,.8); backdrop-filter: blur(.2rem); }
.img-viewer__img { max-inline-size: 92vw; max-block-size: 92vh; object-fit: contain; border-radius: var(--radius-lg); box-shadow: 0 .8rem 2rem rgba(0,0,0,.5); }
.img-viewer__close { position: absolute; top: 1rem; right: 1rem; inline-size: 2.4rem; block-size: 2.4rem; border: none; border-radius: 50%; background: color-mix(in srgb, var(--color-bg), transparent 15%); cursor: pointer; }
.img-viewer__close::before { content: ""; position: absolute; inset: 0; margin: auto; inline-size: 1.2rem; block-size: 1.2rem; background: var(--color-icon); -webkit-mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M6 6l12 12M18 6L6 18' stroke='black' stroke-width='2' fill='none' stroke-linecap='round'/></svg>") center/contain no-repeat; mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M6 6l12 12M18 6L6 18' stroke='black' stroke-width='2' fill='none' stroke-linecap='round'/></svg>") center/contain no-repeat; }


/* 左侧面板 */
.left-panel {
  flex: 1.0;
  background: var(--color-card);
  border: none;
  border-radius: var(--radius-lg) 0 0 0;
  /* 顶部间距统一由父容器控制 */
  margin: 0;
  overflow: hidden;
  position: relative;
}

/* 个人信息区域 */
.profile-info {
  padding: 0 clamp(1rem, 3vw, 1.5rem) clamp(1rem, 3vw, 1.5rem) clamp(1rem, 3vw, 1.5rem);
  position: relative;
  /* 统一头像-名称与名称-简介的垂直间距 */
  --name-vertical-gap: clamp(0.8rem, 2vw, 1.2rem);
}

/* 头像区域 */
.avatar-section {
  position: relative;
  margin-top: clamp(-6rem, -10vw, -5rem);
  margin-bottom: var(--name-vertical-gap);
  width: clamp(10rem, 14vw, 12rem);
  height: clamp(10rem, 14vw, 12rem);
  justify-self: center;
}

.avatar {
  width: clamp(10rem, 14vw, 12rem);
  height: clamp(10rem, 14vw, 12rem);
  border-radius: 50%;
  border: clamp(0.5rem, 1vw, 0.6rem) solid var(--color-card);
  object-fit: cover;
}

/* 默认头像图标样式 - 只对profile.png图标生效 */
.avatar[src*="profile.png"] {
  width: clamp(6rem, 8vw, 7rem) !important;
  height: clamp(6rem, 8vw, 7rem) !important;
  object-fit: contain !important;
  background: var(--color-surface);
  padding: clamp(1.5rem, 2vw, 2rem);
}

/* 用户详情 */
.user-details {
  margin-bottom: clamp(1rem, 2vw, 1.4rem);
  /* 与上方容器 .profile-info 一致的左右内边距，确保与按钮对齐 */
  padding: 0 clamp(1rem, 3vw, 1.5rem);
}

.username {
  color: var(--color-text);
  font-size: clamp(1.6rem, 3.8vw, 2.2rem);
  font-weight: 600;
  margin: 0 0 var(--name-vertical-gap) 0;
  text-align: center;
}

.user-id {
  color: var(--color-text-muted);
  font-size: clamp(0.8rem, 1.8vw, 1rem);
  margin: 0 0 clamp(0.4rem, 1vw, 0.6rem) 0;
}

.user-description {
  color: var(--color-text-muted);
  font-size: clamp(1.0rem, 2.2vw, 1.3rem);
  font-weight: 400;
  line-height: 1.4;
  margin: clamp(0.1rem, 0.2vw, 0.2rem) 0 0 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

/* 订单与地址入口 */
.order-links {
  list-style: none;
  /* 与 .user-details 一致，保证左右对齐 */
  padding: 0 clamp(1rem, 3vw, 1.5rem);
  margin: clamp(0.1rem, 0.2vw, 0.2rem) 0 0 0;
  display: grid;
  grid-template-columns: 1fr; /* 让每一项占满整行 */
  justify-items: stretch;
  gap: clamp(0.9rem, 2vw, 1.2rem);
}
.order-links { width: 100%; justify-self: stretch; }
.order-links li { margin: 0; width: 100%; }
.qa-btn {
  position: relative;
  inline-size: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  gap: .8rem;
  padding: clamp(1.4rem, 3.4vw, 2.1rem) clamp(1.2rem, 2.5vw, 1.6rem);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: none;
  color: var(--color-text-muted);
  text-align: left;
  cursor: pointer;
}
.qa-btn span { flex: 1; font-weight: 600; font-size: clamp(.95rem, 2.1vw, 1.1rem); line-height: 1; transition: transform .15s ease; transform-origin: left center; }
.qa-btn:hover { color: var(--color-text); filter: brightness(1.03); }
.qa-btn:hover span { transform: scale(1.02); }
.qa-btn .item-icon { inline-size: 2.2rem; block-size: 2.2rem; display: block; align-self: center; }

/* 个人描述 */
.profile-description {
  margin-bottom: clamp(0.8rem, 2vw, 1.2rem);
  padding: clamp(0.6rem, 1.5vw, 0.8rem);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.profile-description p {
  color: var(--color-text);
  font-size: clamp(0.8rem, 1.8vw, 1rem);
  line-height: 1.4;
  margin: 0;
}

/* 个人信息列表 */
.profile-details {
  display: flex;
  flex-direction: column;
  gap: clamp(0.6rem, 1.5vw, 0.8rem);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: clamp(0.2rem, 0.5vw, 0.3rem);
}

.detail-item strong {
  color: var(--color-text-muted);
  font-size: clamp(0.7rem, 1.5vw, 0.85rem);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item span {
  color: var(--color-text);
  font-size: clamp(0.8rem, 1.8vw, 1rem);
}

.add-role-btn {
  background: transparent;
  border: 1px dashed var(--color-border);
  color: var(--color-text-muted);
  padding: clamp(0.3rem, 0.8vw, 0.4rem) clamp(0.6rem, 1.5vw, 0.8rem);
  border-radius: var(--radius-md);
  font-size: clamp(0.7rem, 1.5vw, 0.85rem);
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;
}

.add-role-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* 右侧面板 */
.right-panel {
  flex: 1;
  background: var(--color-bg);
  /* 顶部与左侧一致，由父容器控制，这里为 0 */
  padding: 0;
  display: flex;
  flex-direction: column;
}

.panel-header {
  margin-bottom: clamp(1rem, 2.5vw, 1.5rem);
  display: flex;
  align-items: center; /* 与标题同一行垂直居中 */
  justify-content: flex-start;
  padding-left: 0; /* 左侧贴齐 */
  margin-left: 0; /* 左侧贴齐 */
  padding-top: 0; /* 顶部间距由父容器统一控制 */
  gap: .12rem; /* 用 gap 控制箭头与文字的间距 */
}

.panel-header h4 {
  color: var(--color-text);
  font-size: clamp(1rem, 2vw, 1.4rem);
  font-weight: 600;
  margin: 0;
}
.panel-header h4.clickable { cursor: pointer; }
.back-btn { 
  background: transparent; border: none; cursor: pointer; margin-right: 0;
  display: inline-flex; align-items: center; justify-content: center;
  inline-size: 1.6rem; block-size: 1.6rem; position: relative; padding: 0; line-height: 0;
}
/* 使用与左侧按钮箭头一致的 mask 画箭头，但方向向左 */
.back-btn::before {
  content: "";
  position: absolute; inset: 0; margin: auto;
  inline-size: 1.4rem; block-size: 1.4rem;
  background-color: var(--color-icon);
  -webkit-mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M15 5l-7 7 7 7' stroke='black' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>") center / contain no-repeat;
  mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M15 5l-7 7 7 7' stroke='black' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>") center / contain no-repeat;
}

.panel-body {
  flex: 1;
  display: block; /* 让列表按容器宽度布局 */
  padding: 0; /* 由 .modal-content 的统一左右间距控制 */
  overflow: hidden;
}
.placeholder { color: var(--color-text-muted); }

/* 作品滚动区域：隐藏滚动条 */
.works-scroll {
  inline-size: 100%; block-size: 100%;
  overflow: auto;
  scrollbar-width: none; /* Firefox */
  padding-inline: 0; /* 由 panel-body 控制左右内边距 */
  cursor: grab;
  -webkit-user-select: none;
  user-select: none;
}
.works-scroll::-webkit-scrollbar { display: none; }

.works-list {
  list-style: none; 
  margin: 0; 
  padding: 0 0 clamp(.6rem, 2vh, .8rem) 0; 
  display: grid; 
  gap: .8rem;
  inline-size: 100%;
}
.work-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1.2rem; /* 增大图片与信息的水平间距 */
  padding: 1.2rem 1.2rem; /* 缩小上下间距，保持整体高度不变 */
  min-block-size: 8.8rem; /* 与"我的作品"卡片高度保持一致 */
  border-radius: var(--radius-lg);
  background: var(--color-card);
  border: none;
}
/* 列表图片 */
.work-icon { 
  inline-size: 6.4rem; 
  block-size: 6.4rem; 
  border-radius: var(--radius-md); 
  object-fit: cover; 
}
.addr-icon-spacer { display: none; }
.work-card.no-icon { grid-template-columns: 1fr auto; align-items: center; }
.addr-actions { display: grid; grid-auto-flow: column; gap: 1.2rem; justify-self: end; align-items: center; }
.addr-action { 
  inline-size: 3rem; block-size: 3rem; 
  display: grid; place-items: center;
  background: var(--color-surface);
  border-radius: var(--radius-sm); /* 方形圆角 */
  border: none; /* 不要描边 */
  padding: 0;
  cursor: pointer;
  transition: transform .15s ease, filter .15s ease, background-color .15s ease;
  border: 1px solid color-mix(in srgb, var(--color-border), transparent 30%);
}
.addr-action:hover { 
  background: color-mix(in srgb, var(--color-primary), transparent 92%);
  border-color: var(--color-primary);
  color: var(--color-text);
  transform: scale(1.06);
}
.addr-action:active { transform: scale(0.98); }
.addr-action::before {
  content: "";
  inline-size: 1.8rem; 
  block-size: 1.8rem;
  background: var(--color-icon);
}
.addr-action--edit::before {
  -webkit-mask: url("/icons/edit.png") center/contain no-repeat;
  mask: url("/icons/edit.png") center/contain no-repeat;
}
.addr-action--delete::before {
  -webkit-mask: url("/icons/delete.png") center/contain no-repeat;
  mask: url("/icons/delete.png") center/contain no-repeat;
}

.work-main { 
  display: grid; 
  gap: .25rem; 
}
.work-card.no-icon .work-main { padding-block: clamp(.6rem, 1.5vw, .8rem); }
.work-title { 
  color: var(--color-text); 
  font-weight: 500; 
  font-size: var(--fs-md);
}
.work-meta { 
  color: var(--color-text-muted); 
  font-weight: 500;
  font-size: var(--fs-xs); 
}


/* 活动区域 */
.activity-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.activity-message {
  margin-bottom: clamp(1.2rem, 3vw, 1.8rem);
}

.activity-message p {
  color: var(--color-text-muted);
  font-size: clamp(0.8rem, 1.8vw, 1rem);
  line-height: 1.5;
  margin: clamp(0.4rem, 1vw, 0.6rem) 0;
}

/* 地址空态：上下左右居中、字体放大 */
.address-empty { display: grid; place-items: center; min-block-size: 100%; }
.address-empty .activity-message { margin: 0; }
.address-empty .activity-message p { font-size: clamp(1.1rem, 2.2vw, 1.4rem); margin: 0; }

/* 游戏图标网格 */
.game-icons {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: clamp(0.6rem, 1.5vw, 0.8rem);
  margin: clamp(1.2rem, 3vw, 1.8rem) 0;
  max-width: clamp(12rem, 25vw, 18rem);
}

.game-icon {
  width: clamp(1.8rem, 3.5vw, 2.4rem);
  height: clamp(1.8rem, 3.5vw, 2.4rem);
  border-radius: clamp(0.3rem, 0.8vw, 0.4rem);
  background-size: cover;
  background-position: center;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  cursor: pointer;
}

.game-icon:hover {
  opacity: 1;
}

.activity-footer {
  margin-top: clamp(1.2rem, 3vw, 1.8rem);
}

.activity-footer p {
  color: var(--color-primary);
  font-size: clamp(0.7rem, 1.5vw, 0.85rem);
  margin: clamp(0.2rem, 0.5vw, 0.3rem) 0;
  cursor: pointer;
  transition: color 0.2s ease;
}

.activity-footer p:hover {
  color: var(--color-text);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .figma-modal {
    padding: clamp(0.25rem, 0.5vh, 0.5rem);
  }
  
  .modal-content {
    width: 99vw;
    height: 98vh;
    flex-direction: column;
    max-width: none;
    max-height: none;
  }
  
  .left-panel {
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    margin: clamp(0.8rem, 2vw, 1.2rem) clamp(0.8rem, 2vw, 1.2rem) 0 clamp(0.8rem, 2vw, 1.2rem);
  }
  
  .right-panel {
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
    margin: 0 clamp(0.8rem, 2vw, 1.2rem) clamp(0.8rem, 2vw, 1.2rem) clamp(0.8rem, 2vw, 1.2rem);
  }
  
  .game-icons {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 覆盖通用 .has-icon span 字号，确保快捷操作文字可放大 */
.quick-actions .qa-btn.has-icon span {
  font-size: clamp(1.2rem, 2vw, 1.5rem) !important;
}
.qa-btn::after {
  content: "";
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  inline-size: 1.4rem;
  block-size: 1.4rem;
  background-color: var(--color-icon);
  -webkit-mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M9 5l7 7-7 7' stroke='black' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>") center / contain no-repeat;
  mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M9 5l7 7-7 7' stroke='black' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>") center / contain no-repeat;
}
/* hover 时箭头变色并放大 */
.qa-btn:hover::after,
.qa-btn:focus-visible::after {
  background-color: var(--color-icon);
  transform: translateY(-50%) scale(1.16);
}
/* 强制覆盖通用 .has-icon 图标尺寸，确保快捷操作区图标可放大 */
.quick-actions .qa-btn.has-icon .item-icon {
  inline-size: clamp(1.5rem, 3vw, 2rem) !important;
  block-size: clamp(1.5rem, 3vw, 2rem) !important;
}
/* 选中态/按下态炫光（与定制详情一致的更强外环） */
/* 去除炫光选中态 */
.figma-actions {
  margin-top: 1.6rem;
  display: flex;
  gap: .75rem;
}
.figma-btn {
  padding: .5rem .875rem;
  border-radius: var(--radius-md);
  border: .0625rem solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
}
.figma-btn.primary {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}
.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.2rem;
  border-bottom: 1px solid var(--color-border);
}
.modal__title {
  font-weight: 600;
}
.modal__close {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
}
.modal__close:hover {
  color: var(--color-text);
}
.modal__body {
  padding: 1.2rem;
  display: grid;
  gap: 1rem;
}
.modal__grid {
  display: grid;
  grid-template-columns: clamp(18rem, 26vw, 24rem) 1fr;
  gap: 1.2rem;
}
.modal__left {
  display: grid;
  align-content: start;
  gap: 1rem;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1rem;
}
.modal__right {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 0;
}
.modal__right-inner { 
  padding: 1rem; 
  display: grid; 
  gap: 1rem; 
  place-items: center; 
  min-block-size: 22rem; 
}
.modal__section-title { 
  font-weight: 600; 
}
.modal__empty { 
  color: var(--color-text-muted); 
}
.modal__cta { 
  padding: .8rem 1rem; 
  border-radius: var(--radius-md); 
  background: var(--color-surface); 
  border: 1px solid var(--color-border); 
  color: var(--color-text); 
}

.modal__profile {
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 1rem;
}
.modal__avatar {
  inline-size: 64px;
  block-size: 64px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
}
.modal__name {
  font-weight: 600;
}
.modal__list {
  list-style: none;
  margin: .2rem 0 0;
  padding: 0;
  display: grid;
  gap: .6rem;
}
.modal__item {
  width: 100%;
  text-align: left;
  padding: .8rem 1rem;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
}
.modal__item:hover {
  color: var(--color-text);
  filter: brightness(1.05);
}
.modal__footer {
  padding: 1rem 1.2rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
}
.modal__action {
  padding: .6rem 1rem;
  border-radius: var(--radius-md);
  background: var(--color-card);
  border: 1px solid var(--color-border);
  color: var(--color-text);
}


.menu { position: relative; display: grid; justify-items: center; }
/* Hover 桥接：扩展按钮下方的可悬停区域，避免穿越空隙时关闭 */
.menu::after {
  content: "";
  position: absolute;
  left: -.6rem;
  right: -.6rem;
  top: 100%;
  block-size: 1.6rem; /* 与 dropdown 的间隔相匹配 */
}
.dropdown {
  position: absolute; top: calc(100% + 1.4rem); left: 50%;
  background: var(--color-card); color: var(--color-text);
  border: 1px solid var(--color-border); border-radius: var(--radius-lg);
  box-shadow: 0 .6rem 2rem rgba(0,0,0,.2);
  opacity: 0; transform: translate(-50%, -.4rem); pointer-events: none;
  transition: opacity .2s ease, transform .2s ease;
  inline-size: clamp(10rem, 18vw, 14rem);
  --pad-x: clamp(1rem, 3vw, 1.2rem);
  --item-pad-x: var(--pad-x);
  --item-pad-y: clamp(.7rem, 1.6vw, 1rem);
  overflow: hidden; /* 防止内部高亮、内容溢出圆角边框 */
  box-sizing: border-box;
  z-index: 20;
}
.menu:hover .dropdown, .dropdown:hover { opacity: 1; transform: translate(-50%, 0); pointer-events: auto; }
.dropdown ul { list-style: none; margin: 0; padding: calc(var(--item-pad-y) * .2) var(--pad-x); }
.menu:not(.profile) .dropdown {
  --pad-x: clamp(1.2rem, 3.2vw, 1.6rem);
  --item-pad-x: var(--pad-x);
  inline-size: clamp(18rem, 24vw, 22rem);
  /* 高度自适应，不使用固定位宽高比，避免内容被裁切 */
  left: calc(50% - 1.4rem); /* 再向左偏移一些 */
  aspect-ratio: 850 / 750; /* 新比例 */
  min-height: max-content; /* 内容多时不裁切 */
  /* 为"设置"下拉单独微调垂直密度，保证首末与分隔线间距一致 */
  --item-pad-y: clamp(.9rem, 1.9vw, 1.15rem);
}
.dropdown ul > li + li { border-top: 1px solid var(--color-border); }
.dropdown-item {
  position: relative;
  display: block; inline-size: 100%; text-align: left;
  padding: var(--item-pad-y) var(--item-pad-x);
  background: transparent; 
  border: 0; 
  color: var(--color-text-muted); 
  font-size: calc(var(--fs-sm) * 1.06);
  font-weight: 600;
  transition: transform .15s ease, color .15s ease;
  transform-origin: left center;
}

/* 让第一项与顶部的距离、最后一项与底部的距离与每项内部 padding 一致 */
.dropdown ul > li:first-child .dropdown-item { padding-top: var(--item-pad-y); }
.dropdown ul > li:last-child .dropdown-item { padding-bottom: var(--item-pad-y); }
/* 设置下拉：移除文字左边距，使文字与分隔线左边对齐 */
.menu:not(.profile) .dropdown-item { padding-left: 0; }
/* 右侧箭头指示 */
.dropdown-item::after {
  content: "";
  position: absolute; right: var(--item-pad-x); top: 50%; transform: translateY(-50%);
  inline-size: clamp(1rem, 1.6vw, 1.2rem); block-size: clamp(1rem, 1.6vw, 1.2rem);
  background-color: var(--color-icon);
  -webkit-mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M9 5l7 7-7 7' stroke='black' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>") center / contain no-repeat;
  mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M9 5l7 7-7 7' stroke='black' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>") center / contain no-repeat;
}
/* 设置下拉：移除箭头右边距 */
.menu:not(.profile) .dropdown-item::after {
  right: var(--item-pad-x);
  inline-size: clamp(1.2rem, 2vw, 1.4rem);
  block-size: clamp(1.2rem, 2vw, 1.4rem);
}
/* 仅缩小选中高亮块的左右边距，文本与分割线不变 */
.dropdown-item:hover { background: transparent; transform: scale(1.02); color: var(--color-text); }
.dropdown-item:hover::after { background-color: var(--color-icon); transform: translateY(-50%) scale(1.12); }
.dropdown-item:hover::before {
  content: "";
  position: absolute; inset-block: .2rem .2rem;
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-surface), transparent 30%);
}
/* hover bridge to keep menu open across the gap */
.dropdown::before { content: ""; position: absolute; inset-inline: 0; top: -1.4rem; block-size: 1.4rem; }
.nav { --nav-btn-size: clamp(3.2rem, 4vw, 3.6rem); }
.icon-btn {
  display: inline-grid; place-items: center;
  inline-size: var(--nav-btn-size); block-size: var(--nav-btn-size);
  background: var(--color-card); color: var(--color-text);
  border: 1px solid var(--color-border); 
  border-radius: var(--radius-md);
  outline: none; transition: filter .2s ease;
}

.login-btn {
  padding: 0 1rem; border-radius: var(--radius-md); font-size: var(--fs-sm);
  block-size: var(--nav-btn-size);
  font-size: var(--fs-sm);
  font-weight: 500;
  background: var(--color-card); color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  outline: none; transition: filter .2s ease;
}
.icon-btn:hover, .icon-btn:focus-visible, .icon-btn:active,
.login-btn:hover, .login-btn:focus-visible, .login-btn:active {
  filter: brightness(1.06);
}
.avatar-btn { padding: 0; background: transparent; border: none; }
.avatar-btn img { inline-size: var(--nav-btn-size); block-size: var(--nav-btn-size); aspect-ratio: 1/1; border-radius: var(--radius-md); border: 1px solid var(--color-border); }
@media (min-width: 768px) { .links { display: inline-flex; } }

/* 头像下拉 —— 参照设置下拉的桥接与定位 */
.profile .dropdown { 
  top: calc(100% + 1.4rem); 
  left: auto; 
  right: -3rem; transform: 
  translateY(-.4rem); 
}

.profile-dropdown {
  inline-size: clamp(25rem, 35vw, 29rem);
  padding: 0;
  /* 明确高度与底部内边距，保证下拉看起来更高且底部有留白 */
  min-height: auto;
  --actions-gap: 1.2rem;
  padding-bottom: var(--actions-gap);
  background: var(--color-bg);
  border: none;
}
.profile-dropdown ul > li + li { border-top: none; }

.profile-dropdown .profile-card {
  display: grid;
  gap: .8rem;
  padding-bottom: 0;
}

.profile-main {
  display: grid;
  justify-items: center; /* 横向居中 */
  align-items: center;
  gap: .6rem;
  padding: 0 var(--pad-x);
  margin-top: -5rem; /* 调整位置使头像在背景图底部线中间 */
  margin-bottom: 0.5rem; /* 明确拉开名称与下方按钮区的距离 */
}

.profile-avatar {
  inline-size: 10rem; /* 增大头像尺寸 */
  block-size: 10rem;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  border: 6px solid var(--color-bg);
}

.profile-info {
  display: grid;
  line-height: 1.2;
  /* 让子项宽度按容器填充，从而按钮与个人信息左右一致 */
  justify-items: stretch;
}

.profile-name { 
  font-weight: 600; 
  color: var(--color-text); 
  font-size: var(--fs-md);
}

.profile-id { 
  font-size: var(--fs-xs); 
  color: var(--color-text-muted); 
}


.profile-actions {
  list-style: none;
  margin: 1rem 0 0;
  padding: 0 var(--pad-x) var(--actions-gap);
  display: grid;
  gap: 0; /* 统一改用相邻项外边距来保证兼容的可见间距 */
}
/* 使用相邻选择器，确保两个按钮之间始终有可见间距 */
.profile-actions .profile-block + .profile-block { margin-top: var(--actions-gap); }

/* 带块状分隔的动作项 */
.profile-block { 
  padding: 0; 
}
.profile-actions .dropdown-item {
  background: var(--color-card);
  border: none;
  border-radius: var(--radius-md);
  width: 90%;
  margin-inline: auto;
}
.has-icon { 
  display: grid; 
  grid-template-columns: auto 1fr; 
  align-items: center; 
  gap: .8rem; 
}
.has-icon .item-icon { 
  inline-size: 1.4rem; 
  block-size: 1.4rem; 
  object-fit: contain; 
  filter: grayscale(0) opacity(.9); 
}
.has-icon span { 
  color: var(--color-text-muted); 
  font-size: var(--fs-sm);
  font-weight: 600;
}
.has-icon:hover span { color: var(--color-text); }

/* 覆盖通用 .has-icon 图标尺寸：个人资料下的按钮需要更大的图标 */
.order-links .qa-btn.has-icon .item-icon { 
  inline-size: 1.6rem; 
  block-size: 1.6rem; 
}

/* 让最后一个按钮底部再多一些留白，确保视觉上与底边不贴紧 */
.profile-actions li:last-child { margin-bottom: calc(var(--actions-gap) * 1.2); }

/* 覆盖通用 hover 显示规则，使头像下拉沿右侧对齐并上移入场 */
.profile.menu:hover .dropdown, .profile .dropdown:hover {
  opacity: 1; transform: translateY(0); pointer-events: auto;
}

/* 桌面端图片预览样式 - 完全复制首页样式 */
.img-viewer { 
  position: fixed; 
  inset: 0; 
  z-index: 2000; 
  display: flex; 
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,.8); 
  backdrop-filter: blur(.2rem); 
  padding: 2rem;
}

.img-viewer__layout {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  max-width: 95vw;
  max-height: 95vh;
  width: 100%;
  max-width: 1200px;
  align-items: center;
  justify-content: center;
}

.img-viewer__main {
  position: relative;
  background: transparent;
  padding: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 500px;
  height: 500px;
  flex-shrink: 0;
}

/* 左侧贴图区域 */
.img-viewer__left {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 右侧原图区域 */
.img-viewer__right {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

/* 图片包装器 - 根据图片比例调整，现在显示贴图并添加双重边框 */
.img-wrapper {
  display: inline-block;
  position: relative;
  border: 3px solid var(--color-border);
  border-radius: calc(var(--radius-sm) * 0.5);
  overflow: hidden;
  margin: 0;
  padding: 0;
  width: 500px;
  height: 500px;
  flex-shrink: 0;
  background: var(--color-card);
  box-sizing: border-box;
  /* 添加双重边框效果，和之前右侧一样 */
  box-shadow: 0 0 0 20px var(--color-card), 
              0 0 0 24px var(--color-border);
}

.img-viewer__img { 
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important; 
  object-position: center;
  display: block;
  min-width: 100%;
  min-height: 100%;
  border-radius: calc(var(--radius-sm) * 0.5 - 3px); /* 图片圆角 = 容器圆角 - 边框宽度 */
}

.img-viewer__like {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 3.5rem;
  height: 3.5rem;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
  z-index: 20;
}

.img-viewer__like:hover {
  transform: scale(1.2);
}

.img-viewer__like.liked {
  color: var(--color-primary);
}

.img-viewer__like.liked:hover {
  transform: scale(1.2);
}

.img-viewer__like svg {
  width: 20px;
  height: 20px;
  display: block;
  transition: transform 0.2s ease;
}

.img-viewer__like.liked svg {
  transform: scale(1.2);
}

/* 交界处按钮容器 - 桌面端 */
.img-viewer__divider {
  position: relative;
  width: 0;
  height: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  /* 定位在左边容器的左边界线上 */
  left: 0rem; /* 左边容器的左边界 */
  top: -3rem; /* 向上移动按钮 */
  transform: translateY(-50%);
}

/* 交界处图标按钮 */
.divider-btn {
  position: absolute;
  /* 按钮中心在左边界线上，所以需要向左偏移按钮宽度的一半 */
  left: -32.5px; /* -(按钮宽度65px的一半) */
  top: 0;
  width: 65px;
  height: 65px;
  background: var(--color-bg);
  border: none;
  border-radius: var(--radius-md); /* 改为正方形 */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.divider-btn img {
  width: 25px;
  height: 25px;
  object-fit: contain;
}

/* 右侧产品预览区域 */
.img-viewer__product {
  background: var(--color-bg);
  border-radius: var(--radius-md);
  padding: 8rem;
  border: 4px solid var(--color-border);
  position: relative;
  width: auto;
  height: auto;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-preview {
  position: relative;
  background: transparent;
  border-radius: var(--radius-md);
  overflow: visible;
  width: auto;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.product-preview__img-wrapper {
  display: inline-block;
  border: 4px solid var(--color-border);
  border-radius: calc(var(--radius-md) * 1.5); /* 增大圆角 */
  overflow: hidden;
  /* 移除双重边框效果，只保留单边框 */
}

.product-preview__img {
  width: auto;
  height: auto;
  max-width: 720px;
  max-height: 720px;
  object-fit: contain;
  /* 移除drop-shadow效果，保持简洁 */
  display: block;
  border-radius: calc(var(--radius-md) * 1.5 - 4px); /* 增大圆角，配合外层容器 */
}

/* 加载动画 */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 移动端个人资料弹窗3倍缩放 */
@media (max-aspect-ratio: 1/1) {
  /* 定义放大倍数 */
  .figma-modal {
    --scale-factor: 2;
  }
  
  /* 放大主容器 */
  .modal-content {
    width: calc(clamp(48rem, 68vw, 60rem) * var(--scale-factor));
    max-width: 90vw;
  }
  
  /* 放大Discord卡片容器 */
  .discord-card {
    border-radius: calc(var(--radius-md) * var(--scale-factor));
    --card-pad: calc(clamp(1.25rem, 2.4vw, 1.75rem) * var(--scale-factor));
    gap: calc(.75rem * var(--scale-factor));
    block-size: calc(clamp(50rem, 84vh, 78rem) * var(--scale-factor));
    --banner-h: calc(clamp(18rem, 36vh, 21rem) * var(--scale-factor));
    --avatar-size: calc(clamp(10rem, 18vw, 14rem) * var(--scale-factor));
  }
  
  /* 放大banner */
  .dc-banner {
    inset-inline: calc(clamp(3rem, 5vw, 4rem) * var(--scale-factor));
    top: calc(clamp(3rem, 5vh, 4rem) * var(--scale-factor));
    inline-size: calc(100% - (clamp(3rem, 5vw, 4rem) * var(--scale-factor) * 2));
    block-size: calc(var(--banner-h) - clamp(3rem, 5vh, 4rem) * var(--scale-factor));
    border-radius: calc(var(--radius-md) * var(--scale-factor));
  }
  
  /* 放大返回按钮 */
  .banner-back {
    top: calc(clamp(3rem, 5vh, 4rem) * var(--scale-factor) + (var(--card-pad) * .6) + 1rem);
    left: calc(clamp(3rem, 5vw, 4rem) * var(--scale-factor) + (var(--card-pad) * .6) + 1.5rem);
    width: calc(4.5rem * var(--scale-factor));
    height: calc(4.5rem * var(--scale-factor));
    border-radius: calc(var(--radius-md) * var(--scale-factor));
  }
  
  .banner-back svg {
    width: calc(clamp(1.8rem, 2.5vw, 2.2rem) * var(--scale-factor) * 1.1);
    height: calc(clamp(1.8rem, 2.5vw, 2.2rem) * var(--scale-factor) * 1.1);
  }
  
  /* 放大头像 */
  .dc-avatar {
    border: calc(.8rem * var(--scale-factor)) solid var(--color-bg);
  }
  
  /* 响应式下的默认头像图标样式 */
  .dc-avatar[src*="profile.png"] {
    padding: calc(clamp(2rem, 3vw, 3rem) * var(--scale-factor)) !important;
  }
  
  /* 放大头像编辑按钮 */
  .avatar-edit {
    inline-size: calc(3.5rem * var(--scale-factor));
    block-size: calc(3.5rem * var(--scale-factor));
    transform: translate(calc(-50% + (var(--avatar-size)/2) - 2.2rem * var(--scale-factor)), calc(1rem * var(--scale-factor)));
  }
  
  .avatar-edit:hover {
    transform: translate(calc(-50% + (var(--avatar-size)/2) - 2.2rem * var(--scale-factor)), calc(1rem * var(--scale-factor)));
  }
  
  .avatar-edit::before {
    inline-size: calc(2rem * var(--scale-factor));
    block-size: calc(2rem * var(--scale-factor));
  }
  
  /* 放大用户名 */
  .dc-name {
    font-size: calc(clamp(1.5rem, 3.4vw, 2rem) * var(--scale-factor));
  }
  
  /* 放大标签页 */
  .dc-tabs {
    gap: calc(clamp(4.2rem, 7vw, 5.2rem) * var(--scale-factor));
    padding-left: calc(clamp(3rem, 5vw, 4rem) * var(--scale-factor));
    padding-right: calc(1.2rem * var(--scale-factor));
  }
  
  .dc-tab {
    font-size: calc(var(--fs-sm) * var(--scale-factor));
    padding: 0 0 calc(.8rem * var(--scale-factor)) 0;
  }
  
  .dc-tab::before {
    height: calc(.14rem * var(--scale-factor));
    border-radius: calc(var(--radius-lg) * var(--scale-factor));
  }
  
  .dc-tab.active::before {
    height: calc(.14rem * var(--scale-factor));
  }

  /* 订单页面标签页优化 */
  .order-sections {
    --od-pad-x: clamp(3rem, 5vw, 4rem);
  }
  
  .order-sections .dc-tabs {
    gap: calc(clamp(3.8rem, 6.5vw, 5rem) * var(--scale-factor));
    margin-top: calc(2.2rem * var(--scale-factor));
    padding-left: calc(var(--od-pad-x) * var(--scale-factor));
  }

  .order-sections .dc-tab {
    font-size: calc(var(--fs-sm) * var(--scale-factor));
    padding: 0 0 calc(.8rem * var(--scale-factor)) 0;
  }

  .order-sections .dc-tab::before {
    height: calc(.14rem * var(--scale-factor));
    border-radius: calc(var(--radius-md) * var(--scale-factor));
  }

  .order-sections .dc-tab.active::before {
    height: calc(.14rem * var(--scale-factor));
  }
  
  /* 订单页面滚动区域优化 */
  .order-sections .dc-scroll {
    padding: calc(var(--od-pad-x) * var(--scale-factor)) calc(var(--od-pad-x) * var(--scale-factor)) calc(var(--card-pad) * var(--scale-factor));
  }
  
  /* 调整卡片内容区域位置 */
  .dc-sections {
    top: calc(var(--banner-h) + (var(--avatar-size) * .65) + 3rem * var(--scale-factor));
  }
  
  /* 放大滚动区域 */
  .dc-scroll {
    padding: calc(clamp(3rem, 5vh, 4rem) * var(--scale-factor)) calc(clamp(3rem, 5vw, 4rem) * var(--scale-factor)) calc(var(--card-pad) * var(--scale-factor));
  }
  
  /* 放大作品列表 */
  .work-list {
    gap: calc(0.8rem * var(--scale-factor));
  }
  
  .work-item {
    border-radius: calc(var(--radius-md) * var(--scale-factor));
    --item-pad: calc(1.2rem * var(--scale-factor));
    min-block-size: calc(8rem * var(--scale-factor));
  }
  
  .work-item.no-thumb {
    min-block-size: calc(8.4rem * var(--scale-factor));
  }
  
  .work-thumb {
    inline-size: calc(6rem * var(--scale-factor));
    block-size: calc(6rem * var(--scale-factor));
    border-radius: calc(var(--radius-sm) * var(--scale-factor));
  }
  
  .work-body {
    gap: calc(.25rem * var(--scale-factor));
  }
  
  .work-title {
    font-size: calc(var(--fs-sm) * var(--scale-factor)) !important;
  }
  
  .work-meta {
    gap: calc(.6rem * var(--scale-factor));
    font-size: calc(var(--fs-xs) * var(--scale-factor));
  }
  
  .work-meta .dot {
    inline-size: calc(.25rem * var(--scale-factor));
    block-size: calc(.25rem * var(--scale-factor));
  }
  
  .work-more {
    inline-size: calc(2rem * var(--scale-factor));
    block-size: calc(2rem * var(--scale-factor));
    border-radius: calc(var(--radius-md) * var(--scale-factor));
  }
  
  .work-more::before {
    inline-size: calc(1rem * var(--scale-factor));
    block-size: calc(1rem * var(--scale-factor));
  }
  
  .work-empty {
    padding: calc(2rem * var(--scale-factor)) 0;
    font-size: calc(var(--fs-sm) * var(--scale-factor));
  }
  
  .work-empty.full {
    padding: 0;
    font-size: calc(var(--fs-sm) * var(--scale-factor));
    display: grid;
    place-items: center;
    min-block-size: 100%;
    text-align: center;
    /* 确保在移动端也能正确居中 */
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
  }
  
  /* 移动端点赞网格 - 与Gallery一致 */
  .like-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .like-card {
    border-radius: calc(var(--radius-lg) * 1.5);
  }
  
  .like-card-layout {
    padding: 0.5rem !important;
    min-height: 350px !important; /* 再次增加移动端卡片最小高度以容纳更大图片 */
    display: flex !important;
    align-items: center !important; /* 垂直居中 */
    justify-content: flex-end !important; /* 保持右对齐，与桌面端一致 */
  }
  
  .like-card-left {
    width: 255px !important; /* 稍微增大移动端T恤图片尺寸 */
    height: 255px !important;
    left: -2.7rem !important; /* 相应调整位置 */
    top: 50% !important; /* 确保T恤也垂直居中 */
    transform: translateY(-50%) !important; /* 垂直居中变换 */
  }
  
  .like-card-right {
    display: flex !important;
    align-items: center !important; /* 手机容器也垂直居中 */
    justify-content: center !important;
    margin-bottom: 15px !important;
  }
  
  .like-card-phone {
    width: 195px !important; /* 稍微缩小移动端手机宽度 */
    height: 280px !important; /* 稍微缩小移动端手机高度，保持比例 */
    margin-right: 1.5rem !important; /* 调整右边距 */
  }
  
  .like-card-phone::before {
    height: 14px !important; /* 按比例增大状态栏 */
  }
  
  .like-card-phone-img-wrapper {
    height: 256px !important; /* 按比例调整移动端图片区域高度 (265-12=253) */
    margin-top: 19px !important;
  }
  
  .like-btn {
    top: calc(.4rem * var(--scale-factor));
    right: calc(.4rem * var(--scale-factor));
    inline-size: calc(2.6rem * var(--scale-factor));
    block-size: calc(2.6rem * var(--scale-factor));
    border: none;
    background: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(4px);
  }
  
  .like-btn::before {
    inline-size: calc(2rem * var(--scale-factor));
    block-size: calc(2rem * var(--scale-factor));
    background: rgba(255, 255, 255, 0.7);
  }
  
  .like-btn.on {
    inline-size: calc(2.6rem * var(--scale-factor));
    block-size: calc(2.6rem * var(--scale-factor));
    background: rgba(0, 0, 0, 0.1);
    border: none;
    backdrop-filter: blur(4px);
  }
  
  .like-btn.on::before {
    inline-size: calc(2rem * var(--scale-factor));
    block-size: calc(2rem * var(--scale-factor));
    background: var(--color-primary);
    transform: translateX(-1.5px) translateY(-1.5px);
  }
  
  /* 放大编辑表单元素 */
  .edit-form {
    gap: calc(clamp(2.5rem, 5vw, 3.5rem) * var(--scale-factor));
  }
  
  .ef-card {
    border-radius: calc(var(--radius-md) * var(--scale-factor));
    padding-inline: calc(clamp(1.4rem, 3vw, 2rem) * var(--scale-factor));
    padding-top: calc(2.5rem * var(--scale-factor));
    padding-bottom: calc(2.5rem * var(--scale-factor));
    gap: calc(3.2rem * var(--scale-factor));
  }
  
  .ef-group {
    gap: calc(2rem * var(--scale-factor));
  }
  
  .ef-label {
    font-size: calc(var(--fs-sm) * var(--scale-factor));
  }
  
  .ef-control {
    padding: calc(clamp(1.2rem, 2vw, 1.5rem) * var(--scale-factor));
    border-radius: calc(var(--radius-md) * var(--scale-factor));
    font-size: calc(var(--fs-sm) * var(--scale-factor));
  }
  
  .ef-submit {
    padding: calc(clamp(0.8rem, 1.5vw, 1rem) * var(--scale-factor)) calc(1.6rem * var(--scale-factor));
    border-radius: calc(var(--radius-md) * var(--scale-factor));
    font-size: calc(var(--fs-md) * var(--scale-factor));
    margin-top: calc(4rem * var(--scale-factor));
  }
  
  .cs-trigger {
    padding: calc(clamp(1.2rem, 2vw, 1.5rem) * var(--scale-factor));
    border-radius: calc(var(--radius-md) * var(--scale-factor));
    gap: calc(.6rem * var(--scale-factor));
    font-size: calc(var(--fs-sm) * var(--scale-factor));
  }
  
  .ef-caret {
    right: calc(1rem * var(--scale-factor));
    inline-size: calc(1.5rem * var(--scale-factor));
    block-size: calc(1.5rem * var(--scale-factor));
  }
  
  .cs-panel {
    top: calc(100% + (.4rem * var(--scale-factor)));
    border-radius: calc(var(--radius-md) * var(--scale-factor));
    padding: calc(.6rem * var(--scale-factor));
  }
  
  .cs-option {
    padding: calc(clamp(1.2rem, 2vw, 1.5rem) * var(--scale-factor)) calc(1rem * var(--scale-factor));
    border-radius: calc(var(--radius-sm) * var(--scale-factor));
    font-size: calc(var(--fs-sm) * var(--scale-factor));
  }
  
  .cs-option + .cs-option {
    margin-top: calc(0.6rem * var(--scale-factor));
  }

  /* 地址管理弹出框优化 */
  .address-container {
    position: relative;
    height: 100%;
  }

  .address-content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    /* 完全占满容器，不为按钮留空间 */
  }
  
  /* 确保地址页面的空状态占满可用空间 */
  .address-content .work-empty.full {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: grid;
    place-items: center;
    text-align: center;
    font-size: calc(var(--fs-sm) * var(--scale-factor));
  }

  .add-address {
    position: absolute;
    bottom: calc(var(--card-pad) * 0.35);
    font-size: calc(var(--fs-md) * var(--scale-factor));
    min-block-size: calc((clamp(4.4rem, 6vh, 5rem) - .3rem) * var(--scale-factor));
    border-radius: calc(var(--radius-md) * var(--scale-factor));
    z-index: 2;
    /* 添加背景和阴影，确保按钮可见 */
    background: var(--color-primary);
    box-shadow: 0 calc(-2px * var(--scale-factor)) calc(8px * var(--scale-factor)) rgba(0, 0, 0, 0.1);
  }

  /* 地址操作按钮 */
  .addr-actions {
    gap: calc(1.2rem * var(--scale-factor));
  }

  .addr-action {
    inline-size: calc(3rem * var(--scale-factor));
    block-size: calc(3rem * var(--scale-factor));
    border-radius: calc(var(--radius-sm) * var(--scale-factor));
  }

  .addr-action::before {
    inline-size: calc(1.8rem * var(--scale-factor));
    block-size: calc(1.8rem * var(--scale-factor));
  }

  /* 竖屏设备上图片预览模态框样式 - 重叠布局 */
  .img-viewer__layout {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0;
    /* 适度放大 */
    transform: scale(1.8);
    /* 限制缩放前的尺寸，确保缩放后不超出屏幕 */
    max-width: calc(95vw / 1.8);
    max-height: calc(95vh / 1.8);
    /* 缩放优化：解决缩放时的黑线问题 */
    transform-origin: center center;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-perspective: 1000px;
    perspective: 1000px;
  }
  
  /* 左侧T恤贴图容器 - 覆盖在右侧上层 */
  .img-viewer__left {
    position: absolute;
    top: 50%;
    transform: translateX(8.5%) translateY(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 10; /* 确保在上层 */
  }
  
  .img-wrapper {
    /* T恤贴图容器 - 正方形，移除所有边框 */
    width: 600px !important; /* 固定较小尺寸，适合覆盖显示 */
    height: 600px !important;
    aspect-ratio: 1 !important;
    border: none !important; /* 强制移除边框 */
    border-radius: 0 !important; /* 强制移除圆角 */
    box-shadow: none !important; /* 强制移除所有阴影 */
    overflow: visible; /* 允许图片完全显示 */
    display: block;
    /* 缩放优化 */
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    transform: translateZ(0);
    position: relative;
    background: transparent;
    transform: translateX(-220px) translateY(20px);
  }
  
  .img-viewer__img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important; /* T恤贴图使用cover填充正方形 */
    object-position: center;
    border-radius: 0 !important; /* 移除图片圆角 */
    box-shadow: none !important; /* 强制移除所有阴影 */
    border: none !important; /* 强制移除所有边框 */
    /* 缩放优化 */
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    transform: translateZ(0);
    /* 图片渲染优化 */
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
    /* 防止缩放时的渲染问题 */
    contain: layout style paint;
    display: block;
    max-width: 100%;
  }

  /* 右侧原图容器 - 固定3:4比例 */
  .img-viewer__right {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    position: relative;
    margin-top: 0;
  }
  
  
  .product-preview {
    position: relative;
    /* 设备外框容器 - 整体高度 = 顶部条带 + 3:4图片区域 */
    width: 450px !important; /* 放大1.5倍：300px × 1.5 */
    height: 645px !important; /* 放大1.5倍：430px × 1.5 (45px顶部条带 + 600px图片区域) */
    border-radius: var(--radius-sm);
    overflow: hidden;
    /* 添加反锯齿优化 */
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    transform: translateX(100px);
    display: inline-block;
  }
  
  .product-preview::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 45px; /* 顶部条带高度，放大1.5倍：30px × 1.5 */
    background: var(--color-topbar); /* 深色顶部条带 */
    border:none;
    z-index: 2;
  }
  
  .product-preview__img-wrapper {
    position: relative;
    width: 100%;
    height: 597px !important; /* 图片区域放大1.5倍：400px × 1.5，保证3:4比例 (450px宽 : 600px高) */
    /* 下层屏幕区域 - 浅色背景 */
    background: var(--color-bottombar); /* 浅灰色屏幕背景 */
    margin-top: 45px; /* 为顶部深色条带留出空间，放大1.5倍：30px × 1.5 */
    /* 让图片完全填充这个区域 */
    border-radius: 0 0 var(--radius-sm) var(--radius-sm); /* 只有底部圆角 */
    border: none;
    overflow: hidden;
    /* 添加反锯齿优化 */
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    box-sizing: border-box;
    display: flex; /* 改为flex布局以便图片居中 */
    align-items: center; /* 垂直居中 */
    justify-content: center; /* 水平居中 */
  }
  
  .product-preview__img {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    display: block;
    object-fit: contain; /* 保持原图比例 */
    object-position: center; /* 确保图片在容器中居中 */
    border: none; /* 移除图片的白色描边 */
    border-radius: 0; /* 移除图片原本的圆角 */
    box-shadow: none !important;
    background-color: transparent;
    filter: none !important;
    /* 添加反锯齿优化 */
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    transform: translateZ(0);
    transform: scale(1.005);
  }

  /* 移动端隐藏中间分隔按钮 */
  .img-viewer__divider {
    display: none !important;
  }
  
  .divider-btn {
    position: absolute;
    width: 55px;
    height: 55px;
    background: var(--color-bg);
    border-radius: var(--radius-md);
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: all 0.3s ease;
  }
  
  .divider-btn:hover {
    transform: scale(1.1);
  }
  
  .divider-btn img {
    width: 22px;
    height: 22px;
    opacity: 0.8;
  }

  .img-viewer__like {
    /* 点赞按钮位于下方正方形贴图的右上角 */
    position: absolute;
    top: 0.8rem; /* 紧贴正方形容器顶部 */
    right: 1rem; /* 紧贴正方形容器右侧 */
    width: 3rem;
    height: 3rem;
    background: rgba(0, 0, 0, 0.1);
    border: none;
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: all 0.3s ease;
    backdrop-filter: blur(4px);
    z-index: 25;
    /* 移除额外缩放，只跟随容器缩放，避免模糊 */
    transform: none;
    /* 添加清晰度优化 */
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }

  .img-viewer__like.liked {
    color: var(--color-primary);
    /* 移除额外缩放 */
    transform: none;
  }

  .img-viewer__like:hover {
    /* 只在悬浮时轻微放大，避免过度缩放 */
    transform: scale(1.1);
  }
  
  .img-viewer__like.liked:hover {
    transform: scale(1.1);
  }
}

</style>