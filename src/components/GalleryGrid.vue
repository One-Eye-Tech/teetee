<template>
  <div>
    <section class="gallery">
      <div class="gallery__header">
        <h2 class="gallery__title">Featured communities</h2>
      </div>
      <div v-if="loading" class="loading">加载中...</div>
      <ul v-else-if="works.length" class="grid">
        <li v-for="work in works" :key="work.id" class="card" @click="openImagePreview(work)">
          <div class="card-single">
            <img
              class="card-single-img"
              :src="work.workImage || '/images/tietu.png'"
              :alt="work.name + ' - 列表图'"
              @load="handleImageLoad"
            />
          </div>
        </li>
      </ul>
      <div v-else class="no-works">暂无作品</div>
    </section>

    <!-- 作品预览模态框 -->
    <teleport to="body">
      <div v-if="isImagePreviewOpen" class="img-viewer" @click="closeImagePreview">
        <div class="img-viewer__layout" @click.stop="handleViewerLayoutClick">
          <!-- 左侧：在桌面端显示贴图，在移动端作为上部显示原图 -->
          <div v-if="!isMobileDetail" class="img-viewer__left">
            <div class="img-wrapper">
              <img 
                class="img-viewer__img" 
                :src="getPreviewLeftImage(selectedWork)" 
                :alt="selectedWork?.name || '贴图预览'" 
              />
            </div>
          </div>
          
          <!-- 右侧：在桌面端显示原图，在移动端作为下部显示贴图（正方形） -->
          <div class="img-viewer__right">
            <!-- 交界处图标按钮 - 移动到右侧容器内 -->
            <div class="img-viewer__divider">
              <button class="divider-btn" @click="switchImages" aria-label="切换图片">
                <img src="/icons/upload_photo.png" alt="切换图片" />
              </button>
            </div>
            <div class="product-preview">
              <div class="product-preview__img-wrapper">
                <img 
                  class="product-preview__img" 
                  :src="isMobileDetail ? getPreviewMobileImage(selectedWork) : getPreviewRightImage(selectedWork)" 
                  :alt="selectedWork?.name || '原图'" 
                />
              </div>
              <button 
                class="img-viewer__like" 
                @click="toggleLike" 
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
  </div>
</template>
  
  <script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
  import { getLatestWorks, type WorksDto } from '../api/worksApi'
  import { useAuth } from '../composables/useAuth'
  import { useLikes } from '../composables/useLikes'
  
  // 接收分类ID属性
  const props = defineProps<{
    categoryId?: number | null
  }>()
  
  // 用户认证状态
  const { currentUser } = useAuth()
  // 全局点赞状态管理
  const { likeUpdates, getWorkLikeStatus, toggleWorkLike, initWorkLikeStatus } = useLikes()
  
  // 作品数据
  const works = ref<WorksDto[]>([])
  const loading = ref(false)

  
  // 图片预览
  const isImagePreviewOpen = ref(false)
  const selectedWork = ref<WorksDto | null>(null)
  const isLiked = ref(false)
  const isLiking = ref(false) // 点赞操作中的状态
  const isPreviewSwapped = ref(false)
  const isMobileDetail = ref(false)
  
  // 加载最新作品
  const loadWorks = async () => {
    try {
      loading.value = true
      const currentUserId = currentUser.value?.id
      const latestWorks = await getLatestWorks(currentUserId, props.categoryId)
      works.value = latestWorks
      
      // 初始化每个作品的点赞状态到全局状态中
      latestWorks.forEach(work => {
        initWorkLikeStatus(work.id, work.isLiked || false, work.likesCount || 0)
      })
      
    } catch (error) {
      works.value = []
    } finally {
      loading.value = false
    }
  }
  
  // 监听分类变化
  watch(() => props.categoryId, () => {
    loadWorks()
  })
  
  const openImagePreview = (work: WorksDto) => { 
    selectedWork.value = work
    isImagePreviewOpen.value = true
    isPreviewSwapped.value = false
    isLiked.value = work.isLiked || false // 使用作品的点赞状态
  }
  
  const closeImagePreview = () => { 
    isImagePreviewOpen.value = false 
    selectedWork.value = null
    isPreviewSwapped.value = false
  }

  // 移动端：点击弹层内部空白区域也关闭详情
  const handleViewerLayoutClick = (event: MouseEvent) => {
    if (isMobileDetail.value && event.target === event.currentTarget) {
      closeImagePreview()
    }
  }
  
  // 切换点赞状态
  const toggleLike = async () => {
    if (!currentUser.value || !selectedWork.value || isLiking.value) {
      if (!currentUser.value) {
        console.warn('用户未登录，无法点赞')
        // TODO: 可以在这里显示登录提示
      }
      return
    }

    try {
      isLiking.value = true
      const userId = currentUser.value.id
      const worksId = selectedWork.value.id
      
      // 使用全局点赞状态管理
      const result = await toggleWorkLike(userId, worksId, selectedWork.value.isLiked || false, selectedWork.value.likesCount || 0)
      
      // 更新本地状态
      isLiked.value = result.isLiked
      selectedWork.value.isLiked = result.isLiked
      selectedWork.value.likesCount = result.likesCount
      
      // 同步更新works列表中的数据
      const workIndex = works.value.findIndex(w => w.id === worksId)
      if (workIndex !== -1) {
        works.value[workIndex].isLiked = result.isLiked
        works.value[workIndex].likesCount = result.likesCount
      }
      
      console.log('点赞状态更新成功:', result.isLiked)
    } catch (error) {
      console.error('点赞操作失败:', error)
      // 操作失败时可以显示错误提示
    } finally {
      isLiking.value = false
    }
  }

  // 切换图片显示（左右交换）
  const switchImages = () => {
    isPreviewSwapped.value = !isPreviewSwapped.value
  }

  const getLetterById = (id: number): string => {
    return String.fromCharCode(96 + Math.min(Math.max(id, 1), 26))
  }

  // 详情弹窗默认规则：左 1-26.png，右 a-z.png
  const getPreviewLeftImage = (work: WorksDto | null): string => {
    if (!work) return '/images/tietu.png'
    const leftSrc = `/images/img/${work.id}.png`
    const rightSrc = `/images/img/${getLetterById(work.id)}.png`
    return isPreviewSwapped.value ? rightSrc : leftSrc
  }

  const getPreviewRightImage = (work: WorksDto | null): string => {
    if (!work) return '/images/default.png'
    const leftSrc = `/images/img/${work.id}.png`
    const rightSrc = `/images/img/${getLetterById(work.id)}.png`
    return isPreviewSwapped.value ? leftSrc : rightSrc
  }

  const getPreviewMobileImage = (work: WorksDto | null): string => {
    if (!work) return '/images/default.png'
    return `/images/img/${getLetterById(work.id)}.png`
  }

  const updateIsMobileDetail = () => {
    isMobileDetail.value = window.matchMedia('(max-aspect-ratio: 1/1)').matches
  }

  // 处理图片加载完成，用于瀑布流重新布局
  const handleImageLoad = () => {
    // 图片加载完成后，可以在这里触发瀑布流重新计算
    // 由于使用CSS Columns，布局会自动调整
  }

  // 监听全局点赞状态变化，同步更新本地works数据
  watch(likeUpdates, () => {
    works.value.forEach(work => {
      const globalStatus = getWorkLikeStatus(work.id)
      if (globalStatus) {
        work.isLiked = globalStatus.isLiked
        work.likesCount = globalStatus.likesCount
        
        // 如果当前选中的作品状态也需要更新
        if (selectedWork.value && selectedWork.value.id === work.id) {
          selectedWork.value.isLiked = globalStatus.isLiked
          selectedWork.value.likesCount = globalStatus.likesCount
          isLiked.value = globalStatus.isLiked
        }
      }
    })
  })

  onMounted(() => {
    updateIsMobileDetail()
    window.addEventListener('resize', updateIsMobileDetail)
    loadWorks()
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateIsMobileDetail)
  })
</script>

<script lang="ts">
export default { name: 'GalleryGrid' }
</script>

<style scoped>
.gallery {
  inline-size: 100%; /* 占满父容器宽度 */
  margin-inline: 0; /* 移除水平居中的margin，由父容器的padding控制 */
  margin-block-start: 3rem;
  margin-block-end: 4rem;
  padding-inline: 0;
  padding-block: 0;
}

.gallery__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-block-end: 1.5rem;
}

.gallery__title { 
  text-align: left; 
  font-size: calc(var(--fs-md) * 1.1); 
  font-weight: 600; 
  color: var(--color-text); 
  margin: 0;
  letter-spacing: 0.5px;
}

/* 移动端分类下拉框已删除 */
.grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr); /* 每行显示6个 */
  gap: 1.2rem;
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
}

.card { 
  position: relative;  
  width: 100%;
  aspect-ratio: 1; /* 设置为正方形 */
  background: var(--color-card); 
  border: 2px solid var(--color-card); 
  border-radius: var(--radius-md); 
  overflow: hidden; 
  transition: transform .25s ease, box-shadow .25s ease; 
  will-change: transform;
  cursor: pointer;
}

.card-single {
  width: 100%;
  height: 100%;
  background: var(--color-card);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
}

.card-single-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  border-radius: calc(var(--radius-md) * 0.7);
}

.card-layout {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end; /* 将内容推向右侧，减少左侧空白 */
  padding: 0.5rem 1rem 0.5rem 0.5rem; /* 左边距小一些，右边距保持 */
  height: 100%; /* 占满整个正方形高度 */
}

/* 右侧手机样式区域 - 作为背景层 */
.card-right {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

/* 左侧T恤贴图区域 - 作为覆盖层 */
.card-left {
  position: absolute;
  top: 50%;
  left: -1.4rem; /* 紧贴左边，减少空白 */
  transform: translateY(-50%);
  z-index: 10;
  width: 185px; /* 稍微缩小T恤图片尺寸 */
  height: 185px;
}

/* 圆领卫衣类型 - 缩小左侧图片 */
.card-layout.is-crewneck-sweatshirt .card-left {
  width: 170px;
  height: 170px;
  left: -0.5rem;
}

/* 连帽卫衣类型 - 更小的左侧图片 */
.card-layout.is-hoodie .card-left {
  width: 160px;
  height: 160px;
  left: -0.3rem;
}

.card-tshirt-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border-radius: 0;
  overflow: visible;
}

.card-tshirt-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 0;
  display: block;
}

.card-phone {
  position: relative;
  width: 160px; /* 缩小手机宽度 */
  height: 220px; /* 缩小手机高度，保持合适比例 */
  border-radius: calc(var(--radius-sm) * 0.5);
  overflow: hidden;
  background: var(--color-card);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-left: auto;
  margin-right: 1rem; /* 增大右边距，与边框保持间距 */
}

.card-phone::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 11px; /* 按比例缩小顶部状态栏高度 */
  background: var(--color-topbar);
  z-index: 2;
}

.card-phone-img-wrapper {
  position: relative;
  width: 100%;
  height: 199px; /* 按比例缩小图片区域高度 */
  background: var(--color-bottombar);
  margin-top: 11px; /* 相应调整顶部间距 */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card-phone-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  display: block;
}
.card:hover { 
  transform: translateY(-.4rem) scale(1.02); 
}

/* 图片点击效果 */
.card:active { 
  transform: translateY(-.2rem) scale(1.01); 
}

/* 加载和空状态 */
.loading, .no-works {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-muted);
  font-size: var(--fs-md);
}

/* 图片预览模态框样式 */
.img-viewer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

/* 删除重复的grid布局规则，使用下面的flex布局 */

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

.product-preview {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}

.product-preview__img-wrapper {
  position: relative;
}

.product-preview__img {
  max-width: 400px;
  max-height: 400px;
  width: auto;
  height: auto;
  display: block;
  object-fit: contain;
  background: var(--color-card);
}

/* 图片标签 */
.image-label {
  margin-top: 1rem;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
}

/* 中间分隔按钮 */
.img-viewer__divider {
  display: flex;
  align-items: center;
  justify-content: center;
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

/* 图片预览样式 */
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
  gap: 2rem;
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

/* 图片包装器 - 根据图片比例调整，现在显示贴图并添加双重边框 */
.img-wrapper {
  display: inline-block;
  position: relative;
  border: 4px solid var(--color-border);
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
  position: absolute;
  width: 0;
  height: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  /* 定位在左边容器的左边界线上 */
  left: -1.2rem; /* 左边容器的左边界 */
  top: 46%;
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
  background: var(--color-card);
}

.product-preview__overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,.7), transparent);
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: end;
}

.product-preview__text {
  color: white;
  font-size: var(--fs-sm);
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0,0,0,.3);
  margin-right: 0.5rem;
}

.product-preview__icon {
  width: 16px;
  height: 16px;
  opacity: 0.8;
}

/* 在竖屏设备上（如手机）调整与Hero区域的间距 */
@media (max-aspect-ratio: 1/1) {
.gallery {
  /* 调整负边距以适应新的Hero高度 (4:2比例) */
  margin-block-start: 5rem;
  /* 确保有足够的间距，避免重叠 */
  position: relative;
  z-index: 1;
}
 
 .card {
  border-radius: calc(var(--radius-md) * 1.5); /* 增大移动端卡片圆角 */
 }

 .card-layout {
  padding: 0.5rem !important;
  min-height: 300px !important; /* 移动端大幅增加卡片高度 */
 }
 
 .card-left {
  width: 310px !important; /* 移动端放大T恤图片尺寸 */
  height: 310px !important;
  left: -2rem !important;
  top: 52%;
 }

 /* 圆领卫衣类型 - 缩小左侧图片 */
.card-layout.is-crewneck-sweatshirt .card-left {
  width: 280px !important;
  height: 280px !important;
  left: -0.5rem !important;
}

/* 连帽卫衣类型 - 更小的左侧图片 */
.card-layout.is-hoodie .card-left {
  width: 275px !important;
  height: 275px !important;
  left: -0.3rem !important;
}
 
 .card-phone {
  width: 240px !important; /* 移动端放大手机宽度 */
  height: 340px !important; /* 移动端放大手机高度，保持比例 */
  margin-right: 2.5rem !important;
 }
 
 .card-phone::before {
  height: 15px; /* 按比例放大状态栏高度 */
 }
 
 .card-phone-img-wrapper {
  height: 320px !important; /* 移动端按比例放大图片区域高度 */
  margin-top: 15px !important;
 }

.gallery__title {  
  font-size: calc(var(--fs-lg) * 1.6); 
  font-weight: 700; 
  letter-spacing: 0.5px;
  margin: 0;
}

.gallery__header {
  margin-block-end: 3rem;
}

/* 移动端分类下拉框样式已删除 */

  .gallery {
    inline-size: min(100%, 96vw);
    margin-block-end: 5rem;
  }
  .grid {
    grid-template-columns: repeat(3, 1fr); /* 在手机竖屏模式下，每行显示3个 */
    gap: 2rem; /* 增大移动端图片之间的间距 */
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
    max-width: 92vw;
    max-height: 92vh;
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
    transform: translateX(8%) translateY(-50%);
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
    border: none; /* 移除边框 */
    border-radius: 0; /* 移除圆角 */
    overflow: visible; /* 允许图片完全显示 */
    display: block;
    box-shadow: none;
    /* 缩放优化 */
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    transform: translateZ(0);
    position: relative;
    background: transparent;
    transform: translateX(-215px) translateY(20px);
  }
  
  .img-viewer__img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important; /* T恤贴图使用cover填充正方形 */
    object-position: center;
    border-radius: 0; /* 移除图片圆角 */
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
    /* 移动端详情改为正方形并居中 */
    width: min(80vw, 80vh) !important;
    height: min(80vw, 80vh) !important;
    border-radius: 0;
    overflow: hidden;
    /* 添加反锯齿优化 */
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    transform: none;
    display: block;
    margin: 0 auto;
    background: transparent;
    border: none;
  }
  
  .product-preview::before {
    display: none;
  }
  
  .product-preview__img-wrapper {
    position: relative;
    width: 100%;
    height: 100% !important;
    background: transparent;
    margin-top: 0;
    border-radius: 0;
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
    width: 100% !important;
    height: 100% !important;
    display: block;
    object-fit: contain; /* 保持原图比例 */
    object-position: center; /* 确保图片在容器中居中 */
    border: none; /* 移除图片的白色描边 */
    border-radius: 0;
    box-shadow: none !important;
    background-color: transparent;
    filter: none !important;
    /* 添加反锯齿优化 */
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    transform: translateZ(0);
    transform: scale(1.2);
    background: transparent;
  }

  /* 移动端隐藏中间分隔按钮 */
  .img-viewer__right .img-viewer__divider {
    display: none;
  }
  
  .divider-btn {
    position: absolute;
    width: 55px;
    height: 55px;
    background: var(--color-bg);
    border-radius: var(--radius-md); /* 方形边框 */
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

