<template>
  <div class="category-sidebar">
    <div class="sidebar-header">
      <h2 class="sidebar-title">
        <img src="/teetee.png" alt="teetee" class="sidebar-logo" />
        <span>teetee</span>
      </h2>
    </div>
    
    <nav class="category-nav">
      <button
        v-for="category in categories"
        :key="category.id"
        :class="['category-item', { active: (category.name === '全部' && activeCategory === null) || (category.id === activeCategory) }]"
        @click="selectCategory(category)"
      >
        <span class="category-icon">{{ getCategoryIcon(category.name) }}</span>
        <span class="category-name">{{ category.name }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAllCategories, type Category } from '../api/authApiLite'

// 定义事件
const emit = defineEmits<{
  'category-change': [categoryId: number | null]
}>()

// 分类图标映射
const categoryIcons: Record<string, string> = {
  '全部': '🏠',
  '动漫': '🎮',
  '风景': '🎵',
  '家人': '📚',
  '宠物': '🔬',
  '自拍': '🎬',
  '其他': '🎓'
}

const categories = ref<Category[]>([])
const activeCategory = ref<number | null>(null)

// 加载分类列表
const loadCategories = async () => {
  try {
    const result = await getAllCategories()
    if (result.success && result.data) {
      // 按ID排序
      const sortedCategories = result.data.sort((a, b) => (a.id || 0) - (b.id || 0))
      
      // 手动添加"全部"分类到最前面
      categories.value = [
        { id: 0, name: '全部', createdTime: '' } as Category,
        ...sortedCategories
      ]
      
      // 默认选中"全部"分类
      activeCategory.value = null // null 表示"全部"
    }
  } catch (error) {
    console.error('加载分类列表失败:', error)
  }
}

const selectCategory = (category: Category) => {
  // 如果是"全部"分类，传null；否则传分类ID
  const categoryId = category.name === '全部' ? null : category.id
  activeCategory.value = categoryId
  emit('category-change', categoryId)
}

// 获取分类图标
const getCategoryIcon = (categoryName: string) => {
  return categoryIcons[categoryName] || '📁'
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.category-sidebar {
  width: 240px;
  height: 100vh;
  background: var(--color-card);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  overflow: hidden; /* 禁止滚动 */
}

.sidebar-header {
  padding: 2rem 1.6rem 0.5rem 1.6rem;
}

.sidebar-title {
  font-size: calc(var(--fs-lg) * 0.95);
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sidebar-logo {
  width: 3rem;
  height: 3rem;
  object-fit: contain;
}

.category-nav {
  padding: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 1.4rem;
  padding: 0.8rem 1.1rem;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--fs-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.category-item:hover {
  background: var(--color-primary);
  color: var(--color-text);
}

.category-item.active {
  background: var(--color-primary);
  color: var(--color-text); /* 选中后文字颜色改为普通文字颜色 */
  font-weight: 500;
}

.category-icon {
  font-size: 1.8rem;
  width: 2.4rem;
  height: 2.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.category-name {
  flex: 1;
  font-size: var(--fs-sm);
  font-weight: 500;
}

@media (max-aspect-ratio: 1/1) {
.category-sidebar {
  display: none; /* 移动端隐藏分类侧边栏 */
}

.sidebar-title {
  font-size: calc(var(--fs-lg) * 1.5);
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.sidebar-logo {
  width: 5rem;
  height: 5rem;
  object-fit: contain;
}

.category-nav {
  padding: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 3rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--fs-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.category-icon {
  font-size: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.category-name {
  flex: 1;
  font-size: calc(var(--fs-sm) * 1.8);
  font-weight: 500;
}


}
</style>

