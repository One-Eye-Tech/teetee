<template>
  <div v-if="show" class="figma-modal" @keydown.esc.prevent.stop="$emit('close')" tabindex="-1">
    <div class="figma-modal__overlay" @click="$emit('close')"></div>
    <div class="modal-content" role="dialog" aria-modal="true" aria-label="尺码信息">
      <div class="discord-card" role="document">
        <div class="modal-body">
        <div class="size-tables-container">
          <!-- 服装尺码表 -->
          <div class="size-table-section">
            <div class="size-table">
              <!-- 表头 -->
              <div class="size-table-row header-row">
                <div class="size-cell">规格</div>
                <div class="size-cell">衣长</div>
                <div class="size-cell">胸围</div>
                <div class="size-cell">肩宽</div>
                <div class="size-cell">袖长</div>
              </div>
              
              <!-- 动态渲染尺码数据 -->
              <div 
                v-for="sizeItem in currentSizeData" 
                :key="sizeItem.size" 
                class="size-table-row"
              >
                <div class="size-cell size-label">{{ sizeItem.size }}</div>
                <div class="size-cell">{{ sizeItem.length }}</div>
                <div class="size-cell">{{ sizeItem.chest }}</div>
                <div class="size-cell">{{ sizeItem.shoulder }}</div>
                <div class="size-cell">{{ sizeItem.sleeve }}</div>
              </div>
            </div>
            
            <!-- 注释信息 -->
            <div class="size-note">
              注：产品尺寸均为手工测量，会存在1-3CM误差，属于正常现象
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  show: boolean
  styleId?: number | null // 款式ID：3=T恤, 4=圆领卫衣, 5=连帽卫衣
}>()

defineEmits<{
  close: []
}>()

// 定义不同款式的尺码数据
interface SizeData {
  size: string
  length: number  // 衣长
  chest: number   // 胸围
  shoulder: number // 肩宽
  sleeve: number  // 袖长
}

// T恤尺码表 (id=3)
const tshirtSizes: SizeData[] = [
  { size: 'S', length: 68, chest: 104, shoulder: 48, sleeve: 21 },
  { size: 'M', length: 71, chest: 110, shoulder: 51, sleeve: 22 },
  { size: 'L', length: 74, chest: 116, shoulder: 54, sleeve: 23 },
  { size: 'XL', length: 77, chest: 122, shoulder: 57, sleeve: 24 },
  { size: '2XL', length: 80, chest: 128, shoulder: 60, sleeve: 25 }
]

// 圆领卫衣尺码表 (id=4)
const crewneckSweatshirtSizes: SizeData[] = [
  { size: 'S', length: 70, chest: 108, shoulder: 50, sleeve: 60 },
  { size: 'M', length: 73, chest: 114, shoulder: 53, sleeve: 61 },
  { size: 'L', length: 76, chest: 120, shoulder: 56, sleeve: 62 },
  { size: 'XL', length: 79, chest: 126, shoulder: 59, sleeve: 63 },
  { size: '2XL', length: 82, chest: 132, shoulder: 62, sleeve: 64 }
]

// 连帽卫衣尺码表 (id=5)
const hoodieSizes: SizeData[] = [
  { size: 'S', length: 72, chest: 110, shoulder: 52, sleeve: 62 },
  { size: 'M', length: 75, chest: 116, shoulder: 55, sleeve: 63 },
  { size: 'L', length: 78, chest: 122, shoulder: 58, sleeve: 64 },
  { size: 'XL', length: 81, chest: 128, shoulder: 61, sleeve: 65 },
  { size: '2XL', length: 84, chest: 134, shoulder: 64, sleeve: 66 }
]

// 根据款式ID返回对应的尺码数据
const currentSizeData = computed(() => {
  switch (props.styleId) {
    case 3:
      return tshirtSizes
    case 4:
      return crewneckSweatshirtSizes
    case 5:
      return hoodieSizes
    default:
      // 默认返回T恤尺码
      return tshirtSizes
  }
})
</script>

<style scoped>
/* 使用与项目一致的弹出框样式 */
.figma-modal { 
  position: fixed; 
  inset: 0; 
  z-index: 1000; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  padding: clamp(.5rem, 1vh, 1.5rem); 
}

.figma-modal__overlay { 
  position: absolute; 
  inset: 0; 
  background: rgba(0,0,0,.8); 
  backdrop-filter: saturate(140%) blur(.2rem); 
}

.modal-content { 
  position: relative; 
  width: 55rem; 
  height: 55rem;
  max-width: 95vmin; 
  max-height: 95vmin;
  background: transparent; 
  border-radius: var(--radius-md); 
  display: block; 
  margin: 0 auto; 
}

.discord-card {
  background: var(--color-card);
  border-radius: var(--radius-md);
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.modal-body {
  padding: 0;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 隐藏滚动条但保持滚动功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.modal-body::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.size-tables-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  padding: 3rem;
}

.size-table-section {
  background: var(--color-card);
  color: var(--color-text);
  width: 100%;
  margin-top: 0.6rem;
}


.size-table {
  width: 100%;
  background: var(--color-card);
  color: var(--color-text);
}

.size-table-row {
  display: flex;
  align-items: center;
  padding: 2.15rem 0;
  position: relative;
}

.size-table-row:not(:last-child) {
  position: relative;
}

.size-table-row:not(:last-child)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 1rem;
  right: 1rem;
  height: 1px;
  background: var(--color-border);
}

.size-table-row.header-row {
  font-weight: 600;
  padding: 2.2rem 0;
  position: relative;
}

.size-table-row.header-row::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 1rem;
  right: 1rem;
  height: 1px;
  background: var(--color-border);
}

.size-cell {
  flex: 1;
  text-align: center;
  padding: 0 0.8rem;
  font-size: 1.5rem;
  font-weight: 500;
  letter-spacing: 0.1rem;
}

.size-cell.size-label {
  font-weight: 500;
  color: var(--color-text);
}

.size-note {
  padding: 1.2rem;
  font-size: 1.2rem;
  color: var(--color-text);
  text-align: center;
  margin-top: 1.8rem;
}

/* 移动端适配 - 与NavBar中的弹出框保持完全一致 */
@media (max-aspect-ratio: 1/1) {
  .modal-content{
    transform: scale(2.35);
  }
}
</style>