<template>
  <div class="modal-box">
    <div class="success-icon">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="var(--color-primary)" opacity="0.1"/>
        <path d="M8 12L11 15L16 9" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <h1 class="title">{{ getTitle() }}</h1>
    <p class="tip">{{ getMessage() }}</p>
    <div class="form-main">
      <button type="button" class="btn-primary full" @click="handleContinue">返回登录</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Props
const props = defineProps<{
  flow: 'register' | 'reset-password' | 'forgot-password'
}>()

// 事件定义
const emit = defineEmits<{
  close: []
  'switch-to': [type: string, options?: any]
}>()

const getTitle = () => {
  switch (props.flow) {
    case 'register':
      return '注册成功'
    case 'reset-password':
    case 'forgot-password':
      return '密码重置成功'
    default:
      return '操作成功！'
  }
}

const getMessage = () => {
  switch (props.flow) {
    case 'register':
      return '欢迎加入我们！现在您可以使用您的手机号和密码登录'
    case 'reset-password':
    case 'forgot-password':
      return '您的密码已成功重置，现在您可以使用新密码登录'
    default:
      return '操作已完成'
  }
}

// const getButtonText = () => {
//   switch (props.flow) {
//     case 'register':
//       return '开始使用'
//     case 'reset-password':
//     case 'forgot-password':
//       return '立即登录'
//     default:
//       return '确定'
//   }
// }

const handleContinue = () => {
  if (props.flow === 'register') {
    // 注册成功后直接关闭弹窗
    emit('close')
  } else {
    // 重置密码成功后跳转到登录页面
    emit('switch-to', 'login')
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

.success-icon {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.title {
  text-align: center;
  color: var(--color-text);
  font-size: var(--fs-lg);
  font-weight: 500;
  letter-spacing: .02em;
}

.tip {
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--fs-sm);
  margin: 0;
  line-height: 1.5;
}

.form-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
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

.btn-primary:hover {
  opacity: 0.9;
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
    margin-bottom: calc(-1rem * var(--scale-factor)); /* 缩小与副标题的间距 */
  }

  .tip {
    font-size: calc(var(--fs-sm) * var(--scale-factor));
  }
  
  .btn-primary {
    font-size: calc(var(--fs-md) * var(--scale-factor));
    padding: 0 calc(1.6rem * var(--scale-factor));
  }
  
  /* 放大布局间距 */
  .form-main {
    gap: calc(2rem * var(--scale-factor));
  }

  /* 放大成功图标 */
  .success-icon {
    margin-top: calc(1rem * var(--scale-factor));
  }

  .success-icon svg {
    width: calc(64px * var(--scale-factor));
    height: calc(64px * var(--scale-factor));
  }
  
  /* 放大按钮圆角 */
  .btn-primary {
    border-radius: calc(var(--radius-md) * var(--scale-factor));
  }
}
</style>