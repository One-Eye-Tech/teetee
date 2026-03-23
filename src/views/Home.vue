<template>
  <div class="home">
    <!-- 左侧分类导航 - Web端隐藏 -->
    <CategorySidebar v-if="false" @category-change="handleCategoryChange" />
    
    <!-- 右侧内容区域 -->
    <MainContent :category-id="selectedCategoryId" @show-auth="showAuthModal" @show-style-select="showStyleSelectModal" @category-change="handleCategoryChange" />
    
    <!-- 认证弹出框 -->
    <div v-if="authModal.show" class="auth-modal-mask" @click.self="closeAuthModal">
      <div class="auth-modal" role="dialog" aria-modal="true">
        <!-- 登录弹出框 -->
        <LoginModal 
          v-if="authModal.type === 'login'" 
          @close="closeAuthModal"
          @switch-to="switchAuthModal"
          @login-success="handleLoginSuccess"
        />
        
        <!-- 注册弹出框 -->
        <RegisterModal 
          v-if="authModal.type === 'register'" 
          @close="closeAuthModal"
          @switch-to="switchAuthModal"
        />
        
        <!-- 忘记密码弹出框 -->
        <ForgotPasswordModal 
          v-if="authModal.type === 'forgot'" 
          @close="closeAuthModal"
          @switch-to="switchAuthModal"
        />
        
        <!-- 手机号验证弹出框 -->
        <EmailVerificationModal 
          v-if="authModal.type === 'verify' && (authModal.flow === 'register' || authModal.flow === 'forgot-password')" 
          :phone="authModal.phone"
          :flow="authModal.flow"
          @close="closeAuthModal"
          @switch-to="switchAuthModal"
        />
        
        <!-- 重置密码弹出框 -->
        <ResetPasswordModal
          v-if="authModal.type === 'reset' && (authModal.flow === 'register' || authModal.flow === 'forgot-password')"
          :phone="authModal.phone"
          :code="authModal.code"
          :flow="authModal.flow"
          @close="closeAuthModal"
          @switch-to="switchAuthModal"
        />
        
        <!-- 成功页面弹出框 -->
        <SuccessModal 
          v-if="authModal.type === 'success' && (authModal.flow === 'register' || authModal.flow === 'forgot-password' || authModal.flow === 'reset-password')" 
          :flow="authModal.flow"
          @close="closeAuthModal"
          @switch-to="switchAuthModal"
        />
      </div>
    </div>
    
    <!-- 款式选择弹出框 -->
    <div v-if="styleSelectModal.show" class="style-modal-mask" @click.self="closeStyleSelectModal">
      <div class="style-modal" role="dialog" aria-modal="true">
        <div class="style-modal-header">
          <h2 class="style-modal-title">选择款式</h2>
        </div>
        <div class="style-modal-content">
          <div v-if="loading" class="style-modal-loading">加载中...</div>
          <div v-else-if="clothingStyles.length === 0" class="style-modal-empty">暂无可用款式</div>
          <div v-else class="style-grid">
            <button
              v-for="style in clothingStyles"
              :key="style.id"
              class="style-card"
              @click="selectStyle(style.id)"
            >
              <div class="style-card-name">{{ style.name }}</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import CategorySidebar from '../components/CategorySidebar.vue'
import MainContent from '../components/MainContent.vue'
import LoginModal from '../components/modals/LoginModal.vue'
import RegisterModal from '../components/modals/RegisterModal.vue'
import ForgotPasswordModal from '../components/modals/ForgotPasswordModal.vue'
import EmailVerificationModal from '../components/modals/EmailVerificationModal.vue'
import ResetPasswordModal from '../components/modals/ResetPasswordModal.vue'
import SuccessModal from '../components/modals/SuccessModal.vue'
import { getAllActiveClothingStylesWithColors, type ClothingStyle } from '../api/authApiLite'

const router = useRouter()

// 选中的分类ID
const selectedCategoryId = ref<number | null>(null)

// 处理分类变化
const handleCategoryChange = (categoryId: number | null) => {
  selectedCategoryId.value = categoryId
}

// 认证弹出框状态管理
const authModal = ref<{
  show: boolean
  type: string
  phone: string
  code: string
  flow: 'register' | 'forgot-password' | 'reset-password' | ''
}>({
  show: false,
  type: '', // 'login', 'register', 'forgot', 'verify', 'reset', 'success'
  phone: '',
  code: '',
  flow: '' // 'register', 'forgot-password', 'reset-password'
})

// 显示认证弹出框
const showAuthModal = (type: string) => {
  authModal.value.show = true
  authModal.value.type = type
}

// 关闭认证弹出框
const closeAuthModal = () => {
  authModal.value.show = false
  // 延迟重置状态，确保动画完成
  setTimeout(() => {
    authModal.value.type = ''
    authModal.value.phone = ''
    authModal.value.code = ''
    authModal.value.flow = ''
  }, 300)
}

// 切换认证弹出框类型
const switchAuthModal = (type: string, options?: any) => {
  authModal.value.type = type
  if (options) {
    if (options.phone) authModal.value.phone = options.phone
    if (options.code) authModal.value.code = options.code
    if (options.flow) authModal.value.flow = options.flow
  }
}

// 处理登录成功
const handleLoginSuccess = () => {
  // 登录成功后不需要手动更新状态，useAuth会自动处理
}

// 款式选择弹出框状态管理
const styleSelectModal = ref({
  show: false
})

const clothingStyles = ref<ClothingStyle[]>([])
const loading = ref(false)

// 显示款式选择弹出框
const showStyleSelectModal = async () => {
  styleSelectModal.value.show = true
  await loadClothingStyles()
}

// 关闭款式选择弹出框
const closeStyleSelectModal = () => {
  styleSelectModal.value.show = false
}

// 加载款式列表
const loadClothingStyles = async () => {
  loading.value = true
  try {
    const result = await getAllActiveClothingStylesWithColors()
    if (result.success && result.data && Array.isArray(result.data)) {
      clothingStyles.value = result.data
    } else {
      clothingStyles.value = []
    }
  } catch (error) {
    console.error('加载款式列表失败:', error)
    clothingStyles.value = []
  } finally {
    loading.value = false
  }
}

// 选择款式
const selectStyle = (styleId: number) => {
  closeStyleSelectModal()
  router.push(`/customize?styleId=${styleId}`)
}
</script>

<style scoped>
.home {
  position: relative;
  min-height: 100vh;
  background: var(--color-bg);
}

/* 认证弹出框样式 */
.auth-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.auth-modal {
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease-out;
  width: auto;
  max-width: 95vw;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 款式选择弹出框样式 */
.style-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.style-modal {
  background: var(--color-card);
  border-radius: var(--radius-md);
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

.style-modal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.style-modal-title {
  font-size: calc(var(--fs-lg) * 0.9);
  font-weight: 500;
  color: var(--color-text);
  margin: 0;
}

.style-modal-content {
  padding: 2rem;
  overflow-y: auto;
}

.style-modal-loading,
.style-modal-empty {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-muted);
  font-size: var(--fs-md);
}

.style-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.style-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1.2rem;
  padding: 1.1rem 1.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.style-card:hover {
  border-color: var(--color-primary);
  background: var(--color-hover);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.style-card-name {
  font-size: var(--fs-md);
  font-weight: 500;
  color: var(--color-text);
  text-align: left;
  flex: 1;
}

/* 移动端样式 */
@media (max-aspect-ratio: 1/1) {
  .home {
    display: flex;
    flex-direction: column;
    min-height: auto;
    width: 100%;
  }
  
  .style-modal {
    max-width: 70%;
    border-radius: 2rem;
    max-height: 90vh;
  }
  
  .style-modal-header {
    padding: 3rem 4rem 3rem 4rem;
    border-bottom: 1px solid var(--color-border);
  }

  .style-modal-title {
    font-size: 5.5rem;
    font-weight: 500;
  }
  
  .style-modal-content {
    padding: 4rem;
  }
  
  .style-grid {
    gap: 3.5rem;
  }
  
  .style-card {
    gap: 3rem;
    padding: 4rem 5rem;
    border-radius: 1.5rem;
  }
  
  .style-card-name {
    font-size: 4.5rem;
    font-weight: 500;
  }
}
</style>

