<template>
  <div class="modal-box">
    <h1 class="title">验证手机号</h1>
    <p class="tip">我们已向 <strong>{{ phone }}</strong> 发送了6位验证码</p>
    <form @submit.prevent="handleSubmit" class="form-main">
      <div class="form-group">
        <div class="otp" @paste.prevent="onPaste">
          <input
            v-for="(_, idx) in 6"
            :key="idx"
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="1"
            class="otp-box"
            :ref="(el) => setOtpRef(el, idx)"
            v-model="codeDigits[idx]"
            @input="(e) => onInput(e, idx)"
            @keydown.backspace.prevent="(e) => onBackspace(e, idx)"
          />
        </div>
      </div>
      <button 
        type="submit" 
        class="btn-primary full" 
        :disabled="loading || combinedCode().length !== 6"
        @click="clearValidationErrors"
      >
        {{ loading ? '验证中...' : '验证' }}
      </button>
    </form>
    <hr class="divider" />
    <p class="center resend-row">
      <button class="link link-btn" :disabled="countdown > 0 || resendLoading" @click="resendCode">
        {{ resendLoading ? '发送中...' : '重新发送' }}
      </button>
      <span v-if="countdown > 0" class="count">{{ countdown }}s</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { verifyRegisterCode, sendRegisterCode, sendResetPasswordCode } from '../../api/authApiLite'

// Props
const props = defineProps<{
  phone: string
  flow: 'register' | 'forgot-password'
}>()

// 事件定义
const emit = defineEmits<{
  close: []
  'switch-to': [type: string, options?: any]
}>()

const verificationCode = ref('')
const loading = ref(false)
const resendLoading = ref(false)
const countdown = ref(60)
let countdownTimer: number | null = null

// OTP输入框相关
const codeDigits = ref<string[]>(Array(6).fill(''))
const inputs = ref<(HTMLInputElement | null)[]>([])

const setOtpRef = (el: any, idx: number) => {
  if (el) inputs.value[idx] = el as HTMLInputElement
}

// 组合验证码
const combinedCode = () => codeDigits.value.join('')

// 表单元素引用
// const codeInput = ref()

const handleSubmit = async () => {
  const code = combinedCode()
  if (loading.value || code.length !== 6) return
  
  loading.value = true
  try {
    const result = await verifyRegisterCode(props.phone, code)
    
    if (result.success) {
      // 验证成功，跳转到设置密码页面
      emit('switch-to', 'reset', {
        phone: props.phone,
        code: code,
        flow: props.flow
      })
    } else {
      // 验证失败 - 使用浏览器原生提示
      if (inputs.value[0]) {
        inputs.value[0].setCustomValidity(result.message || '验证码错误，请重新输入')
        inputs.value[0].reportValidity()
      }
    }
  } catch (error: any) {
    console.error('验证码验证出错:', error)
    if (inputs.value[0]) {
      inputs.value[0].setCustomValidity('验证失败，请重试')
      inputs.value[0].reportValidity()
    }
  } finally {
    loading.value = false
  }
}

const resendCode = async () => {
  if (countdown.value > 0 || resendLoading.value) return
  
  resendLoading.value = true
  try {
    let result
    if (props.flow === 'register') {
      result = await sendRegisterCode(props.phone)
    } else {
      result = await sendResetPasswordCode(props.phone)
    }
    
    if (result.success) {
      // 重新开始倒计时
      startCountdown()
      // 清空验证码输入框
      codeDigits.value = Array(6).fill('')
      verificationCode.value = ''
    } else {
      // 重新发送失败 - 使用浏览器原生提示
      if (inputs.value[0]) {
        inputs.value[0].setCustomValidity(result.message || '重新发送失败，请稍后重试')
        inputs.value[0].reportValidity()
      }
    }
  } catch (error: any) {
    console.error('重新发送验证码出错:', error)
    if (inputs.value[0]) {
      inputs.value[0].setCustomValidity('重新发送失败，请稍后重试')
      inputs.value[0].reportValidity()
    }
  } finally {
    resendLoading.value = false
  }
}

const startCountdown = () => {
  countdown.value = 60
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer!)
      countdownTimer = null
    }
  }, 1000)
}

// OTP输入处理函数
const onInput = (e: Event, idx: number) => {
  const target = e.target as HTMLInputElement
  const value = target.value.replace(/\D/g, '')
  target.value = value
  codeDigits.value[idx] = value
  
  // 清除验证错误状态
  target.setCustomValidity('')
  
  // 更新组合的验证码
  verificationCode.value = combinedCode()
  
  if (value && idx < 5) inputs.value[idx + 1]?.focus()
}

const onBackspace = (_e: KeyboardEvent, idx: number) => {
  if (!codeDigits.value[idx] && idx > 0) {
    inputs.value[idx - 1]?.focus()
  }
  codeDigits.value[idx] = ''
  verificationCode.value = combinedCode()
}

const onPaste = (e: ClipboardEvent) => {
  const text = e.clipboardData?.getData('text') ?? ''
  const digits = text.replace(/\D/g, '').slice(0, 6).split('')
  digits.forEach((d, i) => {
    codeDigits.value[i] = d
    if (inputs.value[i]) (inputs.value[i] as HTMLInputElement).value = d
  })
  verificationCode.value = combinedCode()
  const next = Math.min(digits.length, 5)
  inputs.value[next]?.focus()
}

// 清除所有输入框的验证错误状态
const clearValidationErrors = () => {
  inputs.value.forEach(input => {
    if (input) {
      input.setCustomValidity('')
    }
  })
}

onMounted(async () => {
  await nextTick()
  // 添加小延时确保模态框动画完成
  setTimeout(() => {
    inputs.value[0]?.focus()
  }, 100)
  startCountdown()
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
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
  gap: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: .9rem;
}

/* OTP six-box style */
.otp { 
  display: grid; 
  grid-template-columns: repeat(6, 1fr); 
  gap: .8rem; 
}

.otp-box {
  inline-size: 100%;
  text-align: center;
  font-size: var(--fs-md);
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  min-block-size: var(--field-h);
}

.otp-box:focus { 
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

.link { 
  color: var(--color-primary); 
  text-decoration: none; 
  cursor: pointer;
}

.link:hover {
  text-decoration: underline;
}

.link-btn { 
  background: none; 
  border: none; 
  padding: 0; 
  cursor: pointer; 
  font-size: inherit;
}

.link-btn[disabled] { 
  opacity: .5; 
  cursor: not-allowed; 
}

.resend-row { 
  display: inline-flex; 
  align-items: center; 
  gap: .6rem; 
  justify-content: center; 
}

.count { 
  color: var(--color-text-muted); 
  font-size: var(--fs-xs); 
}

.center { 
  text-align: center; 
  font-size: var(--fs-xs); 
  color: var(--color-text-muted); 
}

.divider { 
  block-size: 1px; 
  background: var(--color-border); 
  border: none; 
  margin-block: clamp(.4rem, 1.2vh, .8rem); 
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

  .tip {
    font-size: calc(var(--fs-sm) * var(--scale-factor));
  }

  .btn-primary {
    font-size: calc(var(--fs-md) * var(--scale-factor));
    padding: 0 calc(1.6rem * var(--scale-factor));
  }

  .center, .count {
    font-size: calc(var(--fs-xs) * var(--scale-factor));
  }
  
  /* 放大布局间距 */
  .form-main {
    gap: calc(2rem * var(--scale-factor));
  }

  .form-group {
    gap: calc(.9rem * var(--scale-factor));
  }

  /* 放大 OTP 输入框 */
  .otp {
    gap: calc(.8rem * var(--scale-factor));
    pointer-events: auto; /* 确保容器可以接收事件 */
  }

  .otp-box {
    font-size: calc(var(--fs-md) * var(--scale-factor));
    border-radius: calc(var(--radius-md) * var(--scale-factor));
    text-align: center; /* 确保光标和文字居中 */
    border: none; /* 确保没有边框 */
    background: var(--color-surface); /* 确保背景色正确 */
    color: var(--color-text); /* 确保文字颜色正确 */
    outline: none; /* 移除默认轮廓 */
    pointer-events: auto; /* 确保可以点击 */
    touch-action: manipulation; /* 优化触摸交互 */
    padding: 0 !important; /* 强制移除内边距 */
    box-sizing: border-box; /* 确保盒模型正确 */
    margin: 0; /* 移除外边距 */
    text-align: center !important; /* 强制居中 */
    direction: ltr; /* 确保文本方向正确 */
  }

  /* 放大其他元素 */
  .resend-row {
    gap: calc(.6rem * var(--scale-factor));
  }

  .divider {
    margin-block: calc(clamp(.4rem, 1.2vh, .8rem) * var(--scale-factor));
  }
  
  /* 放大按钮圆角 */
  .btn-primary {
    border-radius: calc(var(--radius-md) * var(--scale-factor));
  }
  
  .link-btn {
    border-radius: calc(var(--radius-md) * var(--scale-factor));
  }
}
</style>