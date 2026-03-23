<template>
  <div class="modal-box"> 
    <h1 class="title">忘记密码</h1>
    <p class="tip">请输入您的手机号，我们将发送验证码到该手机号</p>
    <form @submit.prevent="handleSubmit" class="form-main">
      <div class="form-group">
        <input 
          ref="phoneInput"
          id="phone" 
          v-model="phone" 
          type="tel" 
          class="input" 
          placeholder="请输入手机号" 
          maxlength="11"
          required 
          @input="handlePhoneInput"
          @blur="validatePhoneOnBlur"
        />
      </div>
      <button type="submit" class="btn-primary full" :disabled="loading">
        {{ loading ? '发送中...' : '获取验证码' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { sendResetPasswordCode } from '../../api/authApiLite'
import { validatePhone, cleanPhone } from '../../utils/validation'

// 事件定义
const emit = defineEmits<{
  close: []
  'switch-to': [type: string, options?: any]
}>()

const phone = ref('')
const loading = ref(false)

// 表单元素引用
const phoneInput = ref()

const handleSubmit = async () => {
  if (loading.value) return
  
  // 校验手机号格式
  const phoneValidation = validatePhone(phone.value)
  if (!phoneValidation.isValid) {
    phoneInput.value?.setCustomValidity(phoneValidation.message)
    phoneInput.value?.reportValidity()
    return
  }
  
  loading.value = true
  try {
    const cleanedPhone = cleanPhone(phone.value)
    const result = await sendResetPasswordCode(cleanedPhone)
    
    if (result.success) {
      emit('switch-to', 'verify', { 
        phone: cleanedPhone, 
        flow: 'forgot-password' 
      })
    } else {
      phoneInput.value?.setCustomValidity(result.message || '发送验证码失败，请重试')
      phoneInput.value?.reportValidity()
    }
  } catch (error: any) {
    console.error('发送验证码出错:', error)
    phoneInput.value?.setCustomValidity('发送验证码失败，请重试')
    phoneInput.value?.reportValidity()
  } finally {
    loading.value = false
  }
}

// 处理手机号输入
const handlePhoneInput = () => {
  // 只允许输入数字
  phone.value = phone.value.replace(/\D/g, '')
  // 清除错误状态
  phoneInput.value?.setCustomValidity('')
}

// 手机号失焦时校验
const validatePhoneOnBlur = () => {
  if (phone.value) {
    const phoneValidation = validatePhone(phone.value)
    if (!phoneValidation.isValid) {
      phoneInput.value?.setCustomValidity(phoneValidation.message)
      phoneInput.value?.reportValidity()
    }
  }
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
  font-weight: 400;
  margin: 0;
}

.form-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: .9rem;
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
  margin-block: 0;
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
    gap: calc(2rem * var(--scale-factor));
    
    /* 放大圆角 */
    border-radius: calc(var(--radius-md) * var(--scale-factor));
    
    /* 放大字段高度 */
    --field-h: calc(clamp(4rem, 5.5vh, 4.6rem) * var(--scale-factor));
  }
  
  /* 放大所有字体大小 */
  .title {
    font-size: calc(var(--fs-lg) * var(--scale-factor));
    margin-top: calc(1rem * var(--scale-factor));
    margin-bottom: calc(-1rem * var(--scale-factor)); /* 缩小与副标题的间距 */
  }

  .tip {
    font-size: calc(var(--fs-sm) * var(--scale-factor));
  }

  .input {
    font-size: calc(var(--fs-sm) * var(--scale-factor));
    padding: 0 calc(1.2rem * var(--scale-factor));
  }
  
  .btn-primary {
    font-size: calc(var(--fs-md) * var(--scale-factor));
    padding: 0 calc(1.6rem * var(--scale-factor));
  }
  
  /* 放大布局间距 */
  .form-main {
    gap: calc(2rem * var(--scale-factor));
  }

  .form-group {
    gap: calc(.9rem * var(--scale-factor));
  }
  
  /* 放大其他元素 */
  .input {
    border-radius: calc(var(--radius-md) * var(--scale-factor));
  }
  
  .btn-primary {
    border-radius: calc(var(--radius-md) * var(--scale-factor));
  }
}
</style>