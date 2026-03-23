<template>
  <div class="main-content">
    <div class="content-scroll">
      <div class="content-wrapper">
        <HeroBanner
          ref="heroBannerRef"
          title="你的故事 穿在身上 - Wear Your Story"
          subtitle="Carry the moments with you"
          ctaText="立即定制"
          backgroundUrl="/images/background2.png"
          @show-auth="handleShowAuth"
          @show-style-select="handleShowStyleSelect"
        />
        <GalleryGrid :category-id="categoryId" @category-change="handleCategoryChange" />
      </div>
      
      <!-- 底部导航栏 - 在wrapper外，让border可以延伸到边缘 -->
      <SiteFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import HeroBanner from './HeroBanner.vue'
import GalleryGrid from './GalleryGrid.vue'
import SiteFooter from './SiteFooter.vue'

// 接收分类ID属性
defineProps<{
  categoryId?: number | null
}>()

// 定义事件
const emit = defineEmits<{
  (e: 'show-auth', type: string): void
  (e: 'show-style-select'): void
  (e: 'category-change', categoryId: number | null): void
}>()

// HeroBanner组件引用
const heroBannerRef = ref()

// 处理认证弹出框显示
const handleShowAuth = (type: string) => {
  emit('show-auth', type)
}

// 处理显示款式选择弹出框
const handleShowStyleSelect = () => {
  emit('show-style-select')
}

// 处理分类变更（从移动端下拉框）
const handleCategoryChange = (categoryId: number | null) => {
  emit('category-change', categoryId)
}
</script>

<style scoped>
.main-content {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: var(--color-bg);
  padding-left: 0; /* 移除左侧边栏空间 */
  transition: padding-left 0.3s ease;
  box-sizing: border-box;
}

.content-scroll {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  /* 优化滚动性能 */
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--color-text), transparent 80%) transparent;
}

/* 内容包裹器 - 为HeroBanner和GalleryGrid添加左右内边距 */
.content-wrapper {
  padding-left: 3.4rem;
  padding-right: 3.4rem;
  padding-top: 0.8rem;
  box-sizing: border-box;
}

.content-scroll::-webkit-scrollbar {
  width: 8px;
}

.content-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.content-scroll::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--color-text), transparent 80%);
  border-radius: 4px;
}

.content-scroll::-webkit-scrollbar-thumb:hover {
  background: color-mix(in srgb, var(--color-text), transparent 70%);
}

/* 移动端样式 */
@media (max-aspect-ratio: 1/1) {
  .main-content {
    padding: 2.5rem;
    height: auto;
  }
  
  .content-scroll {
    height: auto;
    overflow-y: visible;
  }
  
  .content-wrapper {
    padding-left: 3rem;
    padding-right: 3rem;
    padding-top: 0.2rem;
  }
}
</style>

