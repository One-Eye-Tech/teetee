<template>
  <div v-if="show" class="figma-modal" @keydown.esc.prevent.stop="$emit('close')" tabindex="-1">
    <div class="figma-modal__overlay" @click="$emit('close')"></div>
    <div class="modal-content" role="dialog" aria-modal="true" aria-label="产品信息">
      <div class="discord-card" role="document">
        <div class="modal-body">
          <div class="product-info-container">
            <!-- 产品标题 -->
            <div class="product-header">
              <h2 class="product-title">{{ currentProductInfo.title }}</h2>
              <p class="product-subtitle">{{ currentProductInfo.subtitle }}</p>
            </div>

            <!-- 产品亮点 -->
            <section class="info-section">
              <h3 class="section-title">产品亮点</h3>
              <ul class="highlight-list">
                <li v-for="(item, index) in currentProductInfo.highlights" :key="index">
                  <strong>{{ item.title }}</strong>{{ item.content }}
                </li>
              </ul>
            </section>

            <!-- 面料参数（示例） -->
            <section v-if="currentProductInfo.fabricParams" class="info-section">
              <h3 class="section-title">面料参数</h3>
              <ul class="feature-list">
                <li v-for="(item, index) in currentProductInfo.fabricParams" :key="index">
                  <strong>{{ item.label }}：</strong>{{ item.value }}
                </li>
              </ul>
            </section>

            <!-- 版型说明 -->
            <section v-if="currentProductInfo.fitDescription" class="info-section">
              <h3 class="section-title">版型说明</h3>
              <ul class="feature-list">
                <li v-for="(item, index) in currentProductInfo.fitDescription" :key="index">
                  <strong>{{ item.label }}：</strong>{{ item.value }}
                </li>
              </ul>
            </section>

            <!-- 工艺说明 -->
            <section v-if="currentProductInfo.crafts && currentProductInfo.crafts.length > 0" class="info-section">
              <h3 class="section-title">工艺说明</h3>
              <div v-for="(craft, index) in currentProductInfo.crafts" :key="index" class="craft-item">
                <p class="craft-desc">{{ craft.description }}</p>
              </div>
            </section>

            <!-- 定制流程 -->
            <section class="info-section">
              <h3 class="section-title">定制流程</h3>
              <ol class="process-list">
                <li v-for="(step, index) in currentProductInfo.process" :key="index">
                  {{ step }}
                </li>
              </ol>
            </section>

            <!-- 洗护指南 -->
            <section class="info-section">
              <h3 class="section-title">洗护指南</h3>
              <ul class="care-list">
                <li v-for="(item, index) in currentProductInfo.care" :key="index">
                  {{ item }}
                </li>
              </ul>
            </section>
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

// 定义产品信息数据结构
interface ProductInfo {
  title: string
  subtitle: string
  oneLiner?: string // 一句亮点话（可选）
  highlights: Array<{ title: string; content: string }>
  fabricParams?: Array<{ label: string; value: string }> // 面料参数（可选）
  fitDescription?: Array<{ label: string; value: string }> // 版型说明（可选）
  crafts: Array<{description: string }>
  process: string[]
  care: string[]
}

// T恤产品信息 (id=3)
const tshirtInfo: ProductInfo = {
  title: '简约定制 · 纯棉短袖 T-shirt',
  subtitle: '轻盈舒感 · 颜色持久 · 个性定制',
  highlights: [
    { 
      title: '100% 优质纯棉面料：', 
      content: '亲肤柔软，吸汗透气，穿着舒适，适合夏暑常备。' 
    },
    { 
      title: '数码直喷：', 
      content: '透气性好，适合颜色丰富或有渐变色的图案。' 
    },
    { 
      title: '版型经典百搭：', 
      content: '常规直筒剪裁，肩宽合体，适合男女通穿（可按需求定制修身或宽松版型）。' 
    },
    { 
      title: '经久耐用：', 
      content: '印花牢度高，日常机洗不易开裂、不易脱色。' 
    }
  ],
  crafts: [
    {
      description: '数码直喷：适合色彩丰富、渐变或细腻的照片级图案。墨滴渗透纤维，图案与面料融为一体，透气性好，手感贴合，成品自然有质感。'
    }
  ],
  process: [
    '上传印花图片；',
    '调整印花图片大小和位置 / 选择颜色 / 尺码 / 件数；',
    '确认下单生产（生产周期通常 3–7 个工作日，视订单量而定）。'
  ],
  care: [
    '建议反面冷水机洗或手洗，避免长时间浸泡；',
    '低温熨烫（反面对印花部位熨烫）；',
    '禁用含氯漂白剂；',
    '自然晾干或低温烘干，能更好延长印花寿命。'
  ]
}

// 圆领卫衣产品信息 (id=4)
const crewneckSweatshirtInfo: ProductInfo = {
  title: '定制数码直喷 · 棉毛布宽松圆领长袖 T 恤',
  subtitle: '舒适保暖 · 画质细腻 · 个性无限',
  highlights: [
    { 
      title: '面料舒适：', 
      content: '优质棉毛布，柔软亲肤，蓬松保暖却不臃肿。' 
    },
    { 
      title: '宽松版型：', 
      content: '落肩设计+直筒下摆，日常慵懒感与活动自由兼备，男女通穿亦可。' 
    },
    { 
      title: '圆领细节：', 
      content: '罗纹双针罗纹，回弹好、不易变形；领口贴合但不紧绷。' 
    },
    { 
      title: '数码直喷工艺：', 
      content: '清晰度次于毛笔，渐变平滑，图案与面料融合，触感轻薄自然日不影响透气性。' 
    },
    { 
      title: '耐穿耐洗：', 
      content: '印花渗透纤维，色牢度高，正常机洗不易刻裂脱落。' 
    }
  ],
  fabricParams: [
    { label: '面料', value: '棉毛布（优选长绒棉 + 环保染整）' },
    { label: '克重', value: '约 290 g（适中蓬松、温暖）' },
    { label: '工艺', value: '数码直喷（Direct Injection）' }
  ],
  fitDescription: [
    { label: '风格', value: '宽松落肩长袖，衣长中等偏长，适合叠穿或单穿。' },
    { label: '建议', value: '喜欢慵懒宽松感建议选平常尺码；若偏修身可选小一号。' }
  ],

  crafts: [
    {
      description: '数码直喷：适合色彩丰富、渐变或细腻的照片级图案。墨滴渗透纤维，图案与面料融为一体，透气性好，手感贴合，成品自然有质感。'
    }
  ],
  process: [
    '上传印花图片；',
    '调整印花图片大小和位置 / 选择颜色 / 尺码 / 件数；',
    '确认下单生产（生产周期通常 3–7 个工作日，视订单量而定）。'
  ],
  care: [
    '建议反面冷水机洗或手洗（≤30℃）；',
    '避免长时间浸泡及使用用含氯漂白剂；',
    '熨烫时请反面低温熨烫，勿直接熨压印花面；',
    '自然晾干或低温烘干，避免高温暴晒。'
  ]
}

// 连帽卫衣产品信息 (id=5)
const hoodieInfo: ProductInfo = {
  title: '定制数码直喷 · 纯棉宽松连帽卫衣',
  subtitle: '温暖有型 · 个性时尚 · 厚实耐穿',
  highlights: [
    { 
      title: '面料舒适：', 
      content: '优质纯棉，蓬松保暖，内层柔软贴肤。' 
    },
    { 
      title: '经典连帽：', 
      content: '双层帽身 + 袋鼠兜袋，保暖防风。' 
    },
    { 
      title: '宽松版型：', 
      content: '落肩袖+宽松下摆，舒适休闲，男女皆宜。' 
    },
    { 
      title: '数码直喷工艺：', 
      content: '色彩细腻，渐变平滑，图案与面料融合，触感轻薄自然。' 
    },
    { 
      title: '耐穿耐洗：', 
      content: '印花渗透纤维，色牢度高，正常机洗不易开裂脱落。' 
    }
  ],
  fabricParams: [
    { label: '面料', value: '纯棉 100%' },
    { label: '克重', value: '约 450 g（厚实温暖）' },
    { label: '工艺', value: '数码直喷（Direct Injection）' }
  ],
  fitDescription: [
    { label: '风格', value: '宽松落肩连帽长袖，衣长适中，适合日常休闲或运动穿着。' },
    { label: '建议', value: '喜欢宽松舒适感建议选平常尺码；若想偏修身可选小一号。' }
  ],
  crafts: [
    {
      description: '数码直喷：适合色彩丰富、渐变或细腻的照片级图案。墨滴渗透纤维，图案与面料融为一体，透气性好，手感贴合，成品自然有质感。'
    }
  ],
  process: [
    '上传印花图片；',
    '调整印花图片大小和位置 / 选择颜色 / 尺码 / 件数；',
    '确认下单生产（生产周期通常 3–7 个工作日，视订单量而定）。'
  ],
  care: [
    '建议反面冷水机洗或手洗（≤30℃）；',
    '避免长时间浸泡及使用含氯漂白剂；',
    '熨烫时请反面低温熨烫，勿直接熨压印花面；',
    '自然晾干或低温烘干，避免高温暴晒。'
  ]
}

// 根据款式ID返回对应的产品信息
const currentProductInfo = computed(() => {
  switch (props.styleId) {
    case 3:
      return tshirtInfo
    case 4:
      return crewneckSweatshirtInfo
    case 5:
      return hoodieInfo
    default:
      return tshirtInfo
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
  width: 60rem; 
  max-width: 90vw; 
  max-height: 80vh;
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
  max-height: 80vh;
}

.modal-body {
  padding: 0;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 80vh;
  /* 隐藏滚动条但保持滚动功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.modal-body::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.product-info-container {
  padding: 2.5rem 3rem;
  color: var(--color-text);
}

/* 产品标题区域 */
.product-header {
  margin-bottom: 2rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 1.5rem;
}

.product-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.8rem 0;
  color: var(--color-text);
  letter-spacing: 0.3px;
}

.product-subtitle {
  font-size: 1.3rem;
  color: var(--color-text-muted);
  margin: 0;
  font-weight: 400;
}

/* 信息区块 */
.info-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: var(--color-text);
  letter-spacing: 0.2px;
}

/* 列表样式 */
.highlight-list,
.feature-list,
.care-list {
  list-style: disc;
  padding-left: 1.8rem;
  margin: 0;
}

.highlight-list li,
.feature-list li,
.care-list li {
  padding: 0.4rem 0;
  font-size: 1.3rem;
  line-height: 1.7;
  color: var(--color-text);
}

.highlight-list li strong,
.feature-list li strong {
  font-weight: 700;
  color: var(--color-text);
}

/* 一句亮点话 */
.one-liner-text {
  font-size: 1.3rem;
  line-height: 1.7;
  margin: 0;
  color: var(--color-text);
}

/* 工艺优势列表 */
.craft-advantages-list {
  padding-left: 1.8rem;
  margin: 0;
}

.craft-advantages-list li {
  padding: 0.4rem 0;
  font-size: 1.3rem;
  line-height: 1.7;
  color: var(--color-text);
}

.craft-advantages-list li strong {
  font-weight: 700;
  color: var(--color-text);
}

/* 工艺说明 */
.craft-item {
  margin-bottom: 1.2rem;
}

.craft-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--color-text);
}

.craft-desc {
  font-size: 1.3rem;
  line-height: 1.7;
  margin: 0 0 0 0;
  color: var(--color-text);
}

/* 有序列表 */
.custom-options-list,
.process-list {
  padding-left: 1.8rem;
  margin: 0;
}

.custom-options-list li,
.process-list li {
  padding: 0.4rem 0;
  font-size: 1.3rem;
  line-height: 1.7;
  color: var(--color-text);
}

.custom-options-list li strong {
  font-weight: 700;
  color: var(--color-text);
}

/* 移动端适配 */
@media (max-aspect-ratio: 1/1) {
  .modal-content {
    transform: scale(2);
    max-height: calc(80vh / 2);
  }
  
  .discord-card {
    max-height: calc(80vh / 2);
  }
  
  .modal-body {
    max-height: calc(80vh / 2);
  }
  
  .product-info-container {
    padding: 2rem 2.5rem;
  }
  
  .product-title {
    font-size: 1.8rem;
  }
  
  .product-subtitle {
    font-size: 1.2rem;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .highlight-list li,
  .feature-list li,
  .care-list li,
  .custom-options-list li,
  .process-list li {
    font-size: 1.2rem;
  }
  
  .craft-title {
    font-size: 1.3rem;
  }
  
  .craft-desc {
    font-size: 1.2rem;
  }
}
</style>

