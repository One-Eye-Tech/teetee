<template>
  <div class="modal-box">
    <h1 class="title">{{ flow === 'register' ? '设置密码' : '重置密码' }}</h1>
    <form @submit.prevent="handleSubmit" class="form-main" novalidate>
      <div class="form-group">
        <label class="label" for="password">{{ flow === 'register' ? '设置密码' : '新密码' }}</label>
        <div class="password-wrap">
          <input 
            ref="passwordInput"
            :type="showPassword ? 'text' : 'password'" 
            id="password" 
            v-model="password" 
            class="input" 
            placeholder="请输入密码" 
            minlength="8"
            required 
            @input="clearPasswordError"
          />
          <button class="eye-btn" type="button" @click="showPassword = !showPassword" aria-label="toggle">
            <img :src="showPassword ? seeIcon : noseeIcon" alt="toggle" />
          </button>
        </div>
      </div>
      <div class="form-group">
        <label class="label" for="confirmPassword">确认密码</label>
        <div class="password-wrap">
          <input 
            ref="confirmPasswordInput"
            :type="showConfirmPassword ? 'text' : 'password'" 
            id="confirmPassword" 
            v-model="confirmPassword" 
            class="input" 
            placeholder="请再次输入密码" 
            minlength="8"
            required 
            @input="clearConfirmPasswordError"
          />
          <button class="eye-btn" type="button" @click="showConfirmPassword = !showConfirmPassword" aria-label="toggle">
            <img :src="showConfirmPassword ? seeIcon : noseeIcon" alt="toggle" />
          </button>
        </div>
      </div>
      <button type="submit" class="btn-primary full" :disabled="loading">
        {{ loading ? (flow === 'register' ? '注册中...' : '重置中...') : (flow === 'register' ? '完成注册' : '重置密码') }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { registerUser, resetPassword } from '../../api/authApiLite'
import { useAuth } from '../../composables/useAuth'

// Props
const props = defineProps<{
  phone: string
  code: string
  flow: 'register' | 'forgot-password'
}>()

// 事件定义
const emit = defineEmits<{
  close: []
  'switch-to': [type: string, options?: any]
}>()

const { setUser } = useAuth()

const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const seeIcon = '/icons/see.png'
const noseeIcon = '/icons/nosee.png'

// 表单元素引用
const passwordInput = ref()
const confirmPasswordInput = ref()

const handleSubmit = async () => {
  if (loading.value) return
  
  // 清除之前的错误状态
  clearPasswordError()
  clearConfirmPasswordError()
  
  // 验证密码长度
  if (password.value.length < 8) {
    passwordInput.value?.setCustomValidity('密码至少需要8位')
    passwordInput.value?.reportValidity()
    return
  }
  
  // 验证密码确认
  if (password.value !== confirmPassword.value) {
    confirmPasswordInput.value?.setCustomValidity('两次输入的密码不一致')
    confirmPasswordInput.value?.reportValidity()
    return
  }
  
  loading.value = true
  try {
    let result
    
    if (props.flow === 'register') {
      // 注册流程
      result = await registerUser(props.phone, password.value, props.code)
      
      if (result.success) {
        // 注册成功，设置用户状态
        if (result.data) {
          setUser(result.data)
          // 注册API只返回用户信息，没有token，所以用户需要重新登录
          // 这里暂时不设置token，让用户在成功页面点击"返回登录"
        }
        
        // 跳转到成功页面
        emit('switch-to', 'success', { flow: 'register' })
      } else {
        passwordInput.value?.setCustomValidity(result.message || '注册失败，请重试')
        passwordInput.value?.reportValidity()
      }
    } else {
      // 重置密码流程
      result = await resetPassword(props.phone, password.value)
      
      if (result.success) {
        // 重置成功，跳转到成功页面
        emit('switch-to', 'success', { flow: 'reset-password' })
      } else {
        passwordInput.value?.setCustomValidity(result.message || '重置密码失败，请重试')
        passwordInput.value?.reportValidity()
      }
    }
  } catch (error: any) {
    console.error(`${props.flow === 'register' ? '注册' : '重置密码'}出错:`, error)
    passwordInput.value?.setCustomValidity('操作失败，请重试')
    passwordInput.value?.reportValidity()
  } finally {
    loading.value = false
  }
}

// 清除密码错误状态
const clearPasswordError = () => {
  passwordInput.value?.setCustomValidity('')
}

// 清除确认密码错误状态
const clearConfirmPasswordError = () => {
  confirmPasswordInput.value?.setCustomValidity('')
}
</script>

<style scoped>
.modal-box {
  position: relative;
  width: 39rem;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: clamp(1.6rem, 3.5vw, 2.4rem);
  display: flex;
  flex-direction: column;
  gap: clamp(.8rem, 2vh, 1.2rem);
  box-shadow: 0 .2rem 1.2rem rgba(0, 0, 0, .12);
  --field-h: clamp(4rem, 5.5vh, 4.6rem);
}

.title {
  text-align: center;
  color: var(--color-text);
  font-size: var(--fs-lg);
  font-weight: 500;
  letter-spacing: .02em;
  margin: 0;
  margin-top: 1rem;
}

.tip {
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
  line-height: 1.5;
  margin: 0;
}

.form-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: .9rem;
}

.label { 
  color: var(--color-text); 
  font-size: var(--fs-sm); 
  line-height: 1.2; 
  margin: 0; 
}

.input {
  padding: 0 1.2rem;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: var(--fs-sm);
  min-block-size: var(--field-h);
  line-height: var(--field-h);
}

.input::placeholder {
  color: var(--color-text-muted);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.password-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrap .input {
  inline-size: 100%;
  flex: 1 1 auto;
  padding-right: 3.2rem;
}

.eye-btn {
  position: absolute;
  right: .6rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: .3rem;
  border-radius: var(--radius-md);
}

.eye-btn img {
  inline-size: 1.8rem;
  block-size: 1.8rem;
  filter: grayscale(.2) brightness(.95);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 1.6rem;
  border-radius: var(--radius-md);
  font-size: var(--fs-md);
  font-weight: 500;
  background: var(--color-primary);
  color: white;
  min-block-size: calc(var(--field-h) - .3rem);
  margin-block: clamp(.12rem, 0.4vh, 0.6rem);
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.full { 
  inline-size: 100%; 
}

@media (max-aspect-ratio: 1/1) {
  /* 通过 CSS 自定义属性实现整体等比例放大 */
  .modal-box {
    /* 定义放大倍数 */
    --scale-factor: 3;
    
    /* 直接放大容器尺寸 */
    width: calc(39rem * var(--scale-factor));
    max-width: 90vw;
    
    /* 放大内边距 */
    padding: calc(clamp(1.6rem, 3.5vw, 2.4rem) * var(--scale-factor));
    gap: calc(clamp(.8rem, 2vh, 1.2rem) * var(--scale-factor));
    
    /* 放大圆角 */
    border-radius: calc(var(--radius-md) * var(--scale-factor));
    
    /* 放大字段高度 */
    --field-h: calc(clamp(4rem, 5.5vh, 4.6rem) * var(--scale-factor));
  }
  
  /* 放大所有字体大小 */
  .title {
    font-size: calc(var(--fs-lg) * var(--scale-factor));
    margin-top: calc(1rem * var(--scale-factor));
  }

  .label, .input {
    font-size: calc(var(--fs-sm) * var(--scale-factor));
  }
  
  .btn-primary {
    font-size: calc(var(--fs-md) * var(--scale-factor));
    padding: 0 calc(1.6rem * var(--scale-factor));
  }
  
  /* 放大布局间距 */
  .form-main {
    gap: calc(1.5rem * var(--scale-factor));
  }

  .form-group {
    gap: calc(.9rem * var(--scale-factor));
  }
  
  /* 放大其他元素 */
  .input {
    padding: 0 calc(1.2rem * var(--scale-factor));
    border-radius: calc(var(--radius-md) * var(--scale-factor));
  }
  
  .password-wrap .input {
    padding-right: calc(3.2rem * var(--scale-factor));
  }
  
  .eye-btn {
    right: calc(.6rem * var(--scale-factor));
    padding: calc(.3rem * var(--scale-factor));
    border-radius: calc(var(--radius-md) * var(--scale-factor));
  }
  
  .eye-btn img {
    width: calc(1.8rem * var(--scale-factor));
    height: calc(1.8rem * var(--scale-factor));
  }
  
  /* 放大按钮圆角 */
  .btn-primary {
    border-radius: calc(var(--radius-md) * var(--scale-factor));
  }
}
</style>