<template>
  <section class="hero" :style="bgStyle">
    <div class="hero__overlay"></div>
    
    <!-- 左上角的 Logo -->
    <div class="hero__logo">
      <img src="/teetee.png" alt="Logo" />
    </div>
    
    <!-- 右上角的设置和登录按钮 -->
    <div class="hero__actions">
      <div class="menu">
        <button class="icon-btn setting-btn" aria-label="设置" @click="toggleDropdown">
          <div class="setting-icon"></div>
        </button>
        <div class="dropdown" role="menu" aria-label="settings">
          <ul>
            <li>
              <button class="dropdown-item has-icon" type="button" @click="toggleTheme">
                <div class="item-icon theme-icon"></div>
                <span>主题</span>
              </button>
            </li>
<!--             
            <li>
              <button class="dropdown-item has-icon" type="button" @click="openCustomerService">
                <div class="item-icon customer-service-icon"></div>
                <span>客服</span>
              </button>
            </li> -->
            
            <li>
              <button class="dropdown-item has-icon" type="button" @click="goPrivacy">
                <div class="item-icon privacy-icon"></div>
                <span>隐私政策</span>
              </button>
            </li>
            <li>
              <button class="dropdown-item has-icon" type="button" @click="goTerms">
                <div class="item-icon terms-icon"></div>
                <span>用户协议</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
      <button v-if="!isLoggedIn" class="login-btn" @click="goLogin">登录</button>
      <div v-else class="menu profile">
        <button class="avatar-btn" aria-label="个人中心" @click="toggleDropdown">
          <img :src="avatarUrl" alt="头像" />
        </button>
        <div class="dropdown" role="menu" aria-label="profile">
          <ul>
            <li>
              <button class="dropdown-item has-icon" type="button" @click="openProfileModal">
                <div class="item-icon profile-icon"></div>
                <span>我的</span>
              </button>
            </li>
            <li>
              <button class="dropdown-item has-icon" type="button" @click="openOrderModal">
                <div class="item-icon order-icon"></div>
                <span>订单</span>
              </button>
            </li>
            <li>
              <button class="dropdown-item has-icon" type="button" @click="handleLogout">
                <div class="item-icon logout-icon"></div>
                <span>登出</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
    
    <div class="hero__content">
      <h1 class="hero__title">{{ title }}</h1>
      <p class="hero__subtitle">{{ subtitle }}</p>
      <button class="btn-primary" @click="onClick">{{ ctaText }}</button>
    </div>
    
    <!-- 引用NavBar组件中的新弹窗 -->
    <NavBar ref="navBarRef" />

    
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import NavBar from './NavBar.vue'
import { useAuth } from '../composables/useAuth'

const props = defineProps<{ title: string; subtitle: string; ctaText: string; backgroundUrl?: string }>()

// 事件定义
const emit = defineEmits<{
  'show-auth': [type: string]
  'show-style-select': []
}>()
const onClick = () => emit('show-style-select')
const bgStyle = computed(() => ({
  backgroundImage: `url('${props.backgroundUrl ?? '/images/background2.png'}')`
}))

// 用户认证状态管理
const { isLoggedIn, avatarUrl, fetchCurrentUser, logout: authLogout } = useAuth()
const currentTheme = ref('light')

// 移动端点击关闭下拉框功能
const isMobile = computed(() => {
  return window.innerWidth <= 768 || window.matchMedia('(max-aspect-ratio: 1/1)').matches
})

// 切换下拉框显示状态（仅移动端）
const toggleDropdown = (event: Event) => {
  if (!isMobile.value) return
  
  event.stopPropagation() // 阻止事件冒泡
  
  const button = event.target as HTMLElement
  const menu = button.closest('.menu')
  const dropdown = menu?.querySelector('.dropdown') as HTMLElement
  
  if (dropdown) {
    const isVisible = dropdown.style.opacity === '1' || 
                     window.getComputedStyle(dropdown).opacity === '1'
    
    // 先关闭所有其他下拉框
    const allDropdowns = document.querySelectorAll('.hero__actions .dropdown')
    allDropdowns.forEach(dd => {
      if (dd !== dropdown) {
        (dd as HTMLElement).style.opacity = '0'
        ;(dd as HTMLElement).style.transform = 'translate(-50%, -.4rem)'
        ;(dd as HTMLElement).style.pointerEvents = 'none'
      }
    })
    
    // 切换当前下拉框
    if (isVisible) {
      dropdown.style.opacity = '0'
      dropdown.style.transform = 'translate(-50%, -.4rem)'
      dropdown.style.pointerEvents = 'none'
    } else {
      dropdown.style.opacity = '1'
      dropdown.style.transform = 'translate(-50%, 0)'
      dropdown.style.pointerEvents = 'auto'
    }
  }
}

// 点击外部关闭下拉框
const handleOutsideClick = (event: Event) => {
  if (!isMobile.value) return
  
  const target = event.target as HTMLElement
  const dropdowns = document.querySelectorAll('.hero__actions .dropdown')
  const menus = document.querySelectorAll('.hero__actions .menu')
  
  // 检查是否点击在下拉框或按钮内
  let isInsideDropdown = false
  menus.forEach(menu => {
    if (menu.contains(target)) {
      isInsideDropdown = true
    }
  })
  
  if (!isInsideDropdown) {
    // 点击外部，强制关闭所有下拉框
    dropdowns.forEach(dropdown => {
      (dropdown as HTMLElement).style.opacity = '0'
      ;(dropdown as HTMLElement).style.transform = 'translate(-50%, -.4rem)'
      ;(dropdown as HTMLElement).style.pointerEvents = 'none'
    })
  }
}

// 登出确认处理函数
const handleLogout = () => {
  if (window.confirm('您确定要登出吗？')) {
    authLogout()
  }
}

// 监听登录状态变化（用于响应式更新）
watch(isLoggedIn, (_newValue) => {
  // 登录状态变化时的处理逻辑（如需要）
}, { immediate: true })

// 初始化用户信息和同步主题状态
onMounted(async () => {
  // 从localStorage同步当前主题状态到组件
  const savedTheme = localStorage.getItem('theme') || 'light'
  currentTheme.value = savedTheme
  
  // 获取当前用户信息
  await fetchCurrentUser()
  
  // 添加点击外部关闭下拉框的事件监听器
  document.addEventListener('click', handleOutsideClick)
})

// 清理事件监听器
onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
})

const toggleTheme = () => {
  const newTheme = currentTheme.value === 'light' ? 'dark' : 'light'
  currentTheme.value = newTheme
  document.documentElement.setAttribute('data-theme', newTheme)
  localStorage.setItem('theme', newTheme)
}

const goLogin = () => {
  emit('show-auth', 'login')
}

// NavBar 组件引用
const navBarRef = ref(null)
const openProfileModal = () => {
  if (navBarRef.value) {
    // @ts-ignore
    navBarRef.value.openProfileModal()
  }
}
// const openAddressModal = () => {
//   if (navBarRef.value) {
//     // @ts-ignore
//     navBarRef.value.openAddressModal()
//   }
// }
const openOrderModal = () => {
  if (navBarRef.value) {
    // @ts-ignore
    navBarRef.value.openOrderModal()
  }
}

// 退出登录函数已移除，因为未使用

const goPrivacy = () => { window.open('https://www.duyankeji.cn/url/privacy.html', '_blank') }
const goTerms = () => { window.open('https://www.duyankeji.cn/url/terms.html', '_blank') }

// 客服功能
// const openCustomerService = () => {
//   // 这里可以添加客服功能，比如打开客服聊天窗口或跳转到客服页面
//   console.log('打开客服')
//   // 示例：打开客服链接
//   // window.open('https://your-customer-service-url.com', '_blank')
// }

// 暴露方法给父组件
defineExpose({
  // 如果需要暴露方法给父组件，可以在这里添加
})
</script>

<style scoped>
.hero {
  position: relative;
  inline-size: 100%; /* 占满父容器宽度 */
  min-block-size: 60rem;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  border-radius: var(--radius-md);
  margin-inline: 0; /* 移除水平居中的margin，由父容器的padding控制 */
  margin-block-start: 3rem;
  overflow: hidden;
  /* 确保圆角正确应用 */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
}
.hero__overlay {
  position: absolute;
  inset: 0;
  background: transparent;
  pointer-events: none;
}
.hero__content {
  position: relative;
  inset: 0;
  display: grid;
  place-items: center;
  place-content: start center;
  block-size: 100%;
  text-align: center;
  gap: 0.7rem;
  padding-inline: 2rem;
  padding-block: 22rem 0;
}

.hero__content .btn-primary { 
  margin-block-start: 2rem; 
  border-radius: calc(var(--radius-lg) * 2); 
  font-size: calc(var(--fs-sm) * 1.1);
  font-weight: 500;
  line-height: 1;
  display: inline-flex; align-items: center; justify-content: center;
  padding: 1.5rem 8rem;
  background: var(--color-primary);
  box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.2);
}
.hero__title { font-size: calc(var(--fs-lg) * 1.4); font-weight: 600; letter-spacing: 3px; color: #FFFFFF;}
.hero__subtitle { font-size: calc(var(--fs-md) * 1.1); font-weight: 400; color: #dbdbdb; max-inline-size: 72ch; letter-spacing: 1px;}

/* 左上角 Logo */
.hero__logo {
  position: absolute;
  top: clamp(1.5rem, 3vh, 2.5rem);
  left: clamp(1.5rem, 3vw, 2.5rem);
  z-index: 10;
  --nav-btn-size: clamp(3.2rem, 4vw, 3.6rem);
}

.hero__logo img {
  width: var(--nav-btn-size);
  height: var(--nav-btn-size);
  object-fit: contain;
  display: block;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

/* 右上角按钮区域 */
.hero__actions {
  position: absolute;
  top: clamp(1.5rem, 3vh, 2.5rem);
  right: clamp(1.5rem, 3vw, 2.5rem);
  z-index: 10;
  display: inline-flex;
  gap: 1.2rem;
  align-items: center;
  justify-self: end;
  --nav-btn-size: clamp(3.2rem, 4vw, 3.6rem);
}

/* 使用NavBar原有的样式 */
.menu {
  position: relative;
  display: grid;
  justify-items: center;
}

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
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 50%;
  background: var(--color-card);
  color: var(--color-text);
  border: none;
  border-radius: var(--radius-lg);
  box-shadow: 0 .6rem 2rem rgba(0,0,0,.2);
  opacity: 0;
  transform: translate(-50%, -.4rem);
  pointer-events: none;
  transition: opacity .2s ease, transform .2s ease;
  inline-size: clamp(10rem, 18vw, 14rem);
  --pad-x: clamp(1rem, 3vw, 1.2rem);
  --item-pad-x: var(--pad-x);
  --item-pad-y: clamp(.7rem, 1.6vw, 1rem);
  overflow: hidden;
  box-sizing: border-box;
  z-index: 20;
}

.menu:hover .dropdown, .dropdown:hover {
  opacity: 1;
  transform: translate(-50%, 0);
  pointer-events: auto;
}

.dropdown ul {
  list-style: none;
  margin: 0;
  padding: calc(var(--item-pad-y) * .2) var(--pad-x);
}

/* 设置下拉：去掉右侧整体内边距，仅保留左侧边距 */
.menu:not(.profile) .dropdown ul {
  padding-top: calc(var(--item-pad-y) * .2);
  padding-bottom: calc(var(--item-pad-y) * .2);
  padding-left: var(--item-pad-x); /* 左侧与文字对齐 */
  padding-right: 0;                /* 右侧无额外边距 */
}

/* 仅设置下拉（非头像）分隔线：左侧留出与文字/图标等同的边距，右侧贴齐 */
/* 用按钮自身绘制分隔线：与文字起始对齐，右侧贴齐 */
.menu:not(.profile) .dropdown-item + .dropdown-item::before {
  content: "";
  position: absolute;
  left: var(--item-pad-x);
  right: 0;
  top: 0;
  height: 1px;
  background: var(--color-border);
}

.menu:not(.profile) .dropdown {
  --pad-x: clamp(1.2rem, 3.2vw, 1.6rem);
  --item-pad-x: var(--pad-x);
  /* 缩小横向宽度 */
  inline-size: clamp(12rem, 16vw, 14rem);
  /* 向左偏移，让右边缘与背景图右边对齐（再左移一些） */
  left: calc(50% - 5.2rem);
  min-height: max-content;
  --item-pad-y: clamp(.9rem, 1.9vw, 1.15rem);
}

.dropdown ul > li + li {
  border-top: 1px solid var(--color-border);
}

.dropdown-item {
  position: relative;
  display: block;
  inline-size: 100%;
  text-align: left;
  padding: var(--item-pad-y) var(--item-pad-x);
  background: transparent;
  border: 0;
  color: var(--color-text-muted);
  /* 文字稍微小一点 */
  font-size: var(--fs-sm);
  font-weight: 500;
  transition: transform .15s ease, color .15s ease;
  transform-origin: left center;
  cursor: pointer;
}

.dropdown ul > li:first-child .dropdown-item {
  padding-top: var(--item-pad-y);
}

.dropdown ul > li:last-child .dropdown-item {
  padding-bottom: var(--item-pad-y);
}

.menu:not(.profile) .dropdown-item {
  padding-left: 0;
}

.dropdown-item::after {
  content: "";
  position: absolute;
  right: 0; /* 去掉箭头右侧的空隙，贴齐分隔线的右端 */
  top: 50%;
  transform: translateY(-50%);
  /* 箭头稍微缩小 */
  inline-size: clamp(.9rem, 1.2vw, 1rem);
  block-size: clamp(.9rem, 1.2vw, 1rem);
  background-color: var(--color-icon);
  -webkit-mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M9 5l7 7-7 7' stroke='black' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>") center / contain no-repeat;
  mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M9 5l7 7-7 7' stroke='black' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>") center / contain no-repeat;
}

.menu:not(.profile) .dropdown-item::after { right: var(--item-pad-x); }

.dropdown-item:hover {
  background: transparent;
  transform: scale(1.02);
  color: var(--color-text);
}

.dropdown-item:hover::after {
  background-color: var(--color-icon);
  transform: translateY(-50%) scale(1.12);
}

.dropdown-item:hover::before {
  content: "";
  position: absolute;
  inset-block: .2rem .2rem;
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-surface), transparent 30%);
}

.dropdown::before {
  content: "";
  position: absolute;
  inset-inline: 0;
  top: -1.4rem;
  block-size: 1.4rem;
}

.icon-btn {
  display: inline-grid;
  place-items: center;
  inline-size: var(--nav-btn-size);
  block-size: var(--nav-btn-size);
  background: var(--color-bg);
  color: var(--color-text);
  border: none;
  border-radius: var(--radius-md);
  outline: none;
  transition: filter .2s ease;
  cursor: pointer;
}

.login-btn {
  padding: 0 1rem;
  block-size: var(--nav-btn-size);
  font-size: var(--fs-sm);
  font-weight: 500;
  background: var(--color-bg);
  color: var(--color-text);
  border-radius: var(--radius-md);
  outline: none;
  transition: filter .2s ease;
  cursor: pointer;
  border: none;
}

.icon-btn:hover, .icon-btn:focus-visible, .icon-btn:active,
.login-btn:hover, .login-btn:focus-visible, .login-btn:active,
.avatar-btn:hover, .avatar-btn:focus-visible, .avatar-btn:active {
  filter: brightness(1.06);
}

.avatar-btn {
  display: inline-grid;
  place-items: center;
  padding: 0;
  inline-size: var(--nav-btn-size);
  block-size: var(--nav-btn-size);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: filter .2s ease;
  outline: none;
}

/* 默认状态：真实头像 - 无边框，填满按钮 */
.avatar-btn img {
  inline-size: var(--nav-btn-size);
  block-size: var(--nav-btn-size);
  aspect-ratio: 1/1;
  border-radius: var(--radius-md);
  border: none;
  object-fit: cover;
  object-position: center;
}

/* 默认图标状态：添加边框背景 */
.avatar-btn:has(img[src*="profile.png"]) {
  background: var(--color-bg);
}

.avatar-btn img[src*="profile.png"] {
  inline-size: calc(var(--nav-btn-size) - 1.5rem);
  block-size: calc(var(--nav-btn-size) - 1.5rem);
  border-radius: 0;
  object-fit: contain !important;
  padding: 0;
  box-shadow: none !important;
  filter: none !important;
  text-shadow: none !important;
  background: var(--color-icon);
  -webkit-mask: url('/icons/profile.png') center/contain no-repeat;
  mask: url('/icons/profile.png') center/contain no-repeat;
}


/* 头像下拉样式 */
.profile .dropdown {
  top: calc(100% + 0.5rem);
  left: auto;
  right: 0rem; /* 向左移动（减小负值） */
  transform: translateY(-.4rem);
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
  background: var(--color-icon);
}

/* 设置按钮图标 */
.setting-icon {
  inline-size: clamp(1.6rem, 2.5vw, 2rem);
  block-size: clamp(1.6rem, 2.5vw, 2rem);
  background: var(--color-icon);
  -webkit-mask: url('/icons/setting.png') center/contain no-repeat;
  mask: url('/icons/setting.png') center/contain no-repeat;
}

/* 下拉菜单图标 */
.theme-icon {
  -webkit-mask: url('/icons/theme.png') center/contain no-repeat;
  mask: url('/icons/theme.png') center/contain no-repeat;
}

.customer-service-icon {
  -webkit-mask: url('/icons/message.png') center/contain no-repeat;
  mask: url('/icons/message.png') center/contain no-repeat;
}

.privacy-icon {
  -webkit-mask: url('/icons/message.png') center/contain no-repeat;
  mask: url('/icons/message.png') center/contain no-repeat;
}

.terms-icon {
  -webkit-mask: url('/icons/message1.png') center/contain no-repeat;
  mask: url('/icons/message1.png') center/contain no-repeat;
}

.profile-icon {
  -webkit-mask: url('/icons/my.png') center/contain no-repeat;
  mask: url('/icons/my.png') center/contain no-repeat;
}

.order-icon {
  -webkit-mask: url('/icons/order.png') center/contain no-repeat;
  mask: url('/icons/order.png') center/contain no-repeat;
}

.logout-icon {
  -webkit-mask: url('/icons/out.png') center/contain no-repeat;
  mask: url('/icons/out.png') center/contain no-repeat;
}

.has-icon span {
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
  font-weight: 500;
}

.has-icon:hover span {
  color: var(--color-text);
}

.profile.menu:hover .dropdown, .profile .dropdown:hover {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

/* 使头像下拉样式与设置下拉保持一致 */
.profile .dropdown {
  --pad-x: clamp(1.2rem, 3.2vw, 1.6rem);
  --item-pad-x: var(--pad-x);
  --item-pad-y: clamp(.9rem, 1.9vw, 1.15rem);
  inline-size: clamp(12rem, 16vw, 14rem);
  left: calc(50% - 12.2rem);
  right: auto;
  top: calc(100% + 0.5rem);
  transform: translate(-50%, -.4rem);
  min-height: max-content;
}

.profile .dropdown ul {
  padding-top: calc(var(--item-pad-y) * .2);
  padding-bottom: calc(var(--item-pad-y) * .2);
  padding-left: var(--item-pad-x);
  padding-right: 0;
}

.profile .dropdown-item { padding-left: 0; }
.profile .dropdown-item::after { right: var(--item-pad-x); }

/* 在竖屏设备上（如手机）减少左右边距 */
@media (max-aspect-ratio: 1/1) {
  .hero {
    inline-size: min(100%, 96vw);
    /* 移动端设置2:1比例 */
    aspect-ratio: 2/1;
    min-block-size: auto; /* 移除最小高度限制 */
    /* 移动端使用专门的背景图 */
    background-image: url('/images/background2.png') !important;
    /* 调整背景图显示方式 */
    background-size: cover; /* 改为cover填满容器 */
    background-position: center center; /* 居中显示 */
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
  /* 背景图标题和按钮放大 */
  .hero__content {
    /* 大幅减小顶部内边距，让文字更居中 */
    padding-block-start: 15rem;
    padding-top: 25rem;
    transform: scale(1.6);
  }

  .hero__title{
    font-size: calc(var(--fs-lg) * 1.2); 
    font-weight: 600;
    letter-spacing: 0;
  }

  .hero__subtitle{
    font-size: calc(var(--fs-md) * 1.1); 
    font-weight: 400;
    letter-spacing: 0.5px;
  }
  

  .hero__actions{
    top: 5.5rem;
    right: 8rem;
    transform: scale(1.8); /* 增大缩放倍数让按钮和下拉框更大 */
  }
  .hero__content .btn-primary{
    transform: scale(1.2);
    margin-block-start: 2rem;
    padding: 1.5rem 6rem;
  }

  
  /* 移动端按钮基础尺寸也要增大 */
  .hero__actions .icon-btn,
  .hero__actions .login-btn,
  .hero__actions .avatar-btn {
    --nav-btn-size: 5.5rem !important;
    width: 5.0rem !important;
    height: 5.0rem !important;
    min-width: 5.0rem !important;
    padding: 0 !important; /* 确保所有按钮都是正方形 */
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 1.5rem !important; /* 调整文字大小适应正方形按钮 */
    font-weight: 500 !important;
    border-radius: var(--radius-sm) !important;
    transition: none !important;
  }
  
  /* 头像按钮也要相应放大 */
  .hero__actions .avatar-btn {
    width: 5.0rem !important;
    height: 5.0rem !important;
    inline-size: 5.0rem !important;
    block-size: 5.0rem !important;
  }
  
  /* 默认状态：真实头像 - 填满按钮 */
  .hero__actions .avatar-btn img {
    width: 5.0rem !important;
    height: 5.0rem !important;
    inline-size: 5.0rem !important;
    block-size: 5.0rem !important;
    border-radius: var(--radius-sm) !important;
  }
  
  /* 移动端默认图标：缩小尺寸 */
  .hero__actions .avatar-btn img[src*="profile.png"] {
    width: calc(5.0rem - 2.4rem) !important;
    height: calc(5.0rem - 2.4rem) !important;
    inline-size: calc(5.0rem - 2.4rem) !important;
    block-size: calc(5.0rem - 2.4rem) !important;
    padding: 0 !important;
  }
  
  /* 增大设置图标尺寸 */
  .hero__actions .setting-icon {
    width: 3.0rem !important;
    height: 3.0rem !important;
    inline-size: 3.0rem !important;
    block-size: 3.0rem !important;
  }
  
  /* 优化整体容器间距 */
  .hero__actions {
    gap: 1.5rem !important; /* 增大按钮间距 */
  }
  
  /* 移动端设置下拉框 */
  .hero__actions .menu:not(.profile) .dropdown {
    transform: scale(1.2) translate(-46%, -.4rem) !important; /* 设置下拉框的位置 */
    top: 8rem;
    border-radius: var(--radius-sm);
  }
  
  /* 移动端头像下拉框（我的下拉框） */
  .hero__actions .profile .dropdown {
    transform: scale(1.2) translate(-4.5%, -.4rem) !important; /* 头像下拉框的位置 */
    top: 8rem;
    border-radius: var(--radius-sm);
  }

  /* 移动端左上角 Logo */
  .hero__logo {
    top: 5.5rem;
    left: 5.5rem;
    transform: scale(1.8); /* 与右上角按钮相同的缩放 */
  }

  .hero__logo img {
    width: 5.0rem !important;
    height: 5.0rem !important;
  }

}
 
</style>