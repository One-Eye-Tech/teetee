<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useSingleSignOn } from './composables/useSingleSignOn'

// 初始化单点登录和Token检查
const { checkLoginStatus } = useSingleSignOn()

// 全局主题管理
const initializeTheme = () => {
  // 从localStorage获取保存的主题，如果没有则默认为light
  const savedTheme = localStorage.getItem('theme') || 'light'
  document.documentElement.setAttribute('data-theme', savedTheme)
}

// 全局等比例缩放（以设计宽度/高度为基准）
const DESIGN_WIDTH = 1440
const DESIGN_HEIGHT = 900
const scale = ref(1)

const updateScale = () => {
  // 仅在桌面端应用等比例缩放
  if (window.innerWidth > 768) {
    const w = window.innerWidth
    const h = window.innerHeight
    const scaleW = w / DESIGN_WIDTH
    const scaleH = h / DESIGN_HEIGHT
    scale.value = Math.min(scaleW, scaleH)
  } else {
    // 移动端不进行缩放
    scale.value = 1
  }
}

// 监听页面可见性变化，当用户回到页面时验证Token
const handleVisibilityChange = async () => {
  if (document.visibilityState === 'visible') {
    console.log('页面变为可见，验证Token状态')
    try {
      await checkLoginStatus()
    } catch (error) {
      console.error('页面可见性变化时Token验证失败:', error)
    }
  }
}

// 监听页面焦点变化
const handleFocus = async () => {
  console.log('页面获得焦点，验证Token状态')
  try {
    await checkLoginStatus()
  } catch (error) {
    console.error('页面焦点变化时Token验证失败:', error)
  }
}

onMounted(() => {
  // 初始化主题
  initializeTheme()
  
  updateScale()
  window.addEventListener('resize', updateScale)
  
  // 添加Token验证监听器
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('focus', handleFocus)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScale)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('focus', handleFocus)
})

// 使用 zoom 实现整体缩放（Chrome/Edge/Safari 支持），并提供 transform 兜底
const appScaleStyle = computed(() => {
  const s = scale.value
  const isFirefox = navigator.userAgent.toLowerCase().includes('firefox')
  if (!isFirefox) {
    return { zoom: String(s) }
  }
  // Firefox 兜底：使用 transform，并反向扩展宽度避免水平截断
  return {
    transform: `scale(${s})`,
    transformOrigin: 'top center',
    width: `${100 / s}%`
  }
})
</script>

<template>
  <div class="app-root" :style="appScaleStyle">
    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-root {
  min-height: 100vh;
  background: var(--color-bg);
  color: var(--color-text);
}
.main {
  inline-size: 100%;
  block-size: 100%;
}
</style>