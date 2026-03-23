<template>
  <div class="modal-box">
    <h1 class="title">登录</h1>
    <form @submit.prevent="handleSubmit" class="form-main">
      <div class="form-group">
        <label class="label" for="phone">手机号</label>
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
      <div class="form-group">
        <label class="label" for="password">密码</label>
        <div class="password-wrap">
          <input 
            ref="passwordInput"
            :type="show ? 'text' : 'password'" 
            id="password" 
            v-model="password" 
            class="input" 
            placeholder="••••••••" 
            required 
            @input="clearPasswordError"
          />
          <button class="eye-btn" type="button" @click="show = !show" aria-label="toggle">
            <img :src="show ? seeIcon : noseeIcon" alt="toggle" />
          </button>
        </div>
      </div>
      <div class="remember">
        <input id="rememberMe" type="checkbox" v-model="remember" class="check" />
        <label class="check-label" for="rememberMe">记住我</label>
        <a class="link forget" @click.prevent="goReset">忘记密码</a>
      </div>
      <button type="submit" class="btn-primary full" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
      <p class="agreement">
        登录即表示您同意
        <a class="link" href="https://www.duyankeji.cn/url/privacy.html" target="_blank" rel="noopener">《隐私政策》</a>
        与
        <a class="link" href="https://www.duyankeji.cn/url/terms.html" target="_blank" rel="noopener">《用户协议》</a>
      </p>
    </form>
    <hr class="divider" />
    <p class="center">没有账号？<a class="link" @click.prevent="goRegister">注册</a></p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { loginByPassword } from '../../api/authApiLite'
import { validatePhone, cleanPhone } from '../../utils/validation'
import { useAuth } from '../../composables/useAuth'

// 事件定义
const emit = defineEmits<{
  close: []
  'switch-to': [type: string, options?: any]
  'login-success': []
}>()

// 用户状态管理
const { setUser, setToken } = useAuth()

const phone = ref('')
const password = ref('')
const remember = ref(false)
const show = ref(false)
const loading = ref(false)
const seeIcon = '/icons/see.png'
const noseeIcon = '/icons/nosee.png'

// 表单元素引用
const phoneInput = ref()
const passwordInput = ref()

const handleSubmit = async () => {
  if (loading.value) return
  
  // 校验手机号格式
  const phoneValidation = validatePhone(phone.value)
  if (!phoneValidation.isValid) {
    phoneInput.value?.setCustomValidity(phoneValidation.message)
    phoneInput.value?.reportValidity()
    return
  }
  
  // 校验密码
  if (!password.value.trim()) {
    passwordInput.value?.setCustomValidity('请输入密码')
    passwordInput.value?.reportValidity()
    return
  }
  
  loading.value = true
  try {
    const cleanedPhone = cleanPhone(phone.value)
    const result = await loginByPassword(cleanedPhone, password.value, remember.value)
    
    if (result.success) {
      console.log('登录成功:', result.data?.user)
      
      // 设置用户状态
      if (result.data?.user) {
        setUser(result.data.user)
      }
      
      // 设置token状态
      if (result.data?.token) {
        setToken(result.data.token)
      }
      
      // 发送登录成功事件
      emit('login-success')
      emit('close')
    } else {
      // 根据错误消息显示不同的提示
      const errorMessage = result.message || '登录失败'
      
      if (errorMessage.includes('未注册') || errorMessage.includes('不存在')) {
        // 手机号错误提示
        phoneInput.value?.setCustomValidity('该手机号尚未注册')
        phoneInput.value?.reportValidity()
      } else if (errorMessage.includes('密码错误') || errorMessage.includes('密码不正确')) {
        // 密码错误提示
        passwordInput.value?.setCustomValidity('密码错误')
        passwordInput.value?.reportValidity()
      } else {
        // 其他错误
        console.error('登录失败:', errorMessage)
        phoneInput.value?.setCustomValidity(errorMessage)
        phoneInput.value?.reportValidity()
      }
    }
  } catch (error: any) {
    console.error('登录请求出错:', error)
    phoneInput.value?.setCustomValidity('网络错误，请稍后重试')
    phoneInput.value?.reportValidity()
  } finally {
    loading.value = false
  }
}

const goReset = () => {
  emit('switch-to', 'forgot')
}

const goRegister = () => {
  emit('switch-to', 'register')
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


// 清除密码错误状态
const clearPasswordError = () => {
  passwordInput.value?.setCustomValidity('')
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
  /* unified field height */
  --field-h: clamp(4rem, 5.5vh, 4.6rem);
}

.title {
  text-align: center;
  color: var(--color-text);
  font-size: var(--fs-lg);
  font-weight: 500;
  letter-spacing: .02em;
  margin-top: 1rem;
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

.remember {
  display: flex;
  align-items: center;
  gap: .6rem;
  justify-content: space-between;
}

.check {
  inline-size: 1.3rem;
  block-size: 1.3rem;
  border-radius: .4rem;
  -webkit-appearance: none;
  appearance: none;
  background: var(--color-surface);
  border: none;
  display: inline-grid;
  place-items: center;
  outline: none;
  transition: background-color .15s ease, border-color .15s ease, box-shadow .15s ease;
}

.check:focus-visible {
  box-shadow: 0 0 0 .16rem rgba(0,0,0,.08);
}

.check:checked {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.check:checked::after {
  content: "";
  display: block;
  inline-size: .36rem;
  block-size: .72rem;
  border: .19rem solid #fff; /* 增加边框宽度使对勾更粗 */
  border-top: 0;
  border-left: 0;
  transform: rotate(45deg) translateY(-0.09rem);
}

.check-label {
  color: var(--color-text-muted);
  font-size: var(--fs-xs);
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

.btn-primary:hover {
  opacity: 0.9;
}

.full { inline-size: 100%; }

.divider {
  block-size: 1px;
  background: var(--color-border);
  border: none;
  margin-block: clamp(.4rem, 1.2vh, .8rem);
}

.link { 
  color: var(--color-primary); 
  text-decoration: none; 
  cursor: pointer;
}

.link:hover {
  text-decoration: underline;
}

.center { 
  text-align: center;
  font-size: var(--fs-xs);
  color: var(--color-text-muted);
}

.forget {
  margin-inline-start: auto;
  font-size: var(--fs-xs);
}

.agreement {
  margin-block-start: .6rem;
  color: var(--color-text-muted);
  text-align: center;
  font-size: var(--fs-xs);
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
  
  .check-label, .forget, .center, .agreement {
    font-size: calc(var(--fs-xs) * var(--scale-factor));
  }
  
  .btn-primary {
    font-size: calc(var(--fs-md) * var(--scale-factor));
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
  
  .check {
    width: calc(1.3rem * var(--scale-factor));
    height: calc(1.3rem * var(--scale-factor));
    border-radius: calc(.4rem * var(--scale-factor));
  }
  
  /* 放大对勾图标 */
  .check:checked::after {
    inline-size: calc(.36rem * var(--scale-factor));
    block-size: calc(.72rem * var(--scale-factor));
    border-width: calc(.16rem * var(--scale-factor));
    transform: rotate(45deg) translateY(calc(-0.09rem * var(--scale-factor)));
  }
  
  .remember {
    gap: calc(.6rem * var(--scale-factor));
  }
  
  .btn-primary {
    padding: 0 calc(1.6rem * var(--scale-factor));
    border-radius: calc(var(--radius-md) * var(--scale-factor));
  }
  
  .divider {
    margin-block: calc(clamp(.4rem, 1.2vh, .8rem) * var(--scale-factor));
  }
  
  .agreement {
    margin-block-start: calc(.6rem * var(--scale-factor));
  }
}
</style>