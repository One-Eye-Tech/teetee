<template>
  <div class="modal-overlay" @click="onCancel">
    <div class="modal-content" @click.stop>
      <!-- 关闭按钮 -->
      <button class="close-btn" type="button" aria-label="关闭" @click="onCancel">
        <span class="close-icon">×</span>
      </button>
      
      <!-- 左侧个人资料区域 -->
      <div class="left-panel">
        <!-- 背景图区域 -->
        <div class="profile-banner" @click="triggerBannerUpload">
          <img class="banner-image" :src="bannerPreview" alt="banner" />
          <button class="edit-btn banner-edit" type="button" aria-label="编辑背景" @click.stop="triggerBannerUpload">
            <span class="edit-icon"></span>
          </button>
          <input ref="bannerInput" type="file" accept="image/*" style="display:none" @change="handleBannerUpload" />
        </div>
        
        <!-- 头像和用户信息 -->
        <div class="profile-info">
          <div class="avatar-section" @click="triggerAvatarUpload">
            <img class="avatar" :src="avatarPreview" alt="avatar" />
            <div class="status-indicator"></div>
            <button class="edit-btn avatar-edit" type="button" aria-label="编辑头像" @click.stop="triggerAvatarUpload">
              <span class="edit-icon"></span>
            </button>
            <input ref="avatarInput" type="file" accept="image/*" style="display:none" @change="handleAvatarUpload" />
          </div>
          
          <div class="user-details">
            <h3 class="username">{{ form.nickname || '甜瓜' }}</h3>
            <p class="user-id">bmw7er</p>
          </div>
          
          <!-- 表单区域 -->
          <div class="form-section">
            <div class="row">
              <label>昵称</label>
              <input v-model="form.nickname" class="input" type="text" placeholder="请输入昵称" />
            </div>
            <div class="row">
              <label>性别</label>
              <select v-model="form.gender" class="input">
                <option value="">请选择性别</option>
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="other">其他</option>
              </select>
            </div>
            
            <div class="actions">
              <button class="btn secondary" type="button" @click="onCancel" :disabled="loading">取消</button>
              <button 
                class="btn primary" 
                type="button" 
                @click="onSubmit"
                :disabled="loading || uploading"
              >
                <span v-if="uploading">上传中...</span>
                <span v-else-if="loading">保存中...</span>
                <span v-else>保存</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { updateCurrentUserProfile, uploadUserAvatar } from '../api/authApiLite'
import { useAuth } from '../composables/useAuth'

// 事件定义
const emit = defineEmits<{
  cancel: []
  submit: [profileData: any]
}>()

// 用户状态管理
const { currentUser, setUser } = useAuth()

// 表单数据
const form = reactive({ 
  nickname: '', 
  gender: '', 
  email: '', 
  phone: '',
  personalProfile: ''
})

// 加载状态
const loading = ref(false)
const uploading = ref(false)

// 图片预览
const bannerPreview = ref('https://p6-semi-sign.byteimg.com/tos-cn-i-acvclvrq33/543d27bb3cf746f094d08b75b8505044.png?rk3s=521bdb00&x-expires=1756993697&x-signature=KPEpXEXUC6phRsy%2B%2FBjYZYGdTLo%3D')
const avatarPreview = ref('/icons/profile.png')

// 文件输入引用
const bannerInput = ref<HTMLInputElement | null>(null)
const avatarInput = ref<HTMLInputElement | null>(null)

// 当前头像文件（用于上传）
const avatarFile = ref<File | null>(null)

// 初始化表单数据
onMounted(() => {
  if (currentUser.value) {
    form.nickname = currentUser.value.username || ''
    form.gender = currentUser.value.gender || ''
    form.phone = currentUser.value.phone || ''
    form.personalProfile = currentUser.value.personalProfile || ''
    avatarPreview.value = currentUser.value.avatar || '/icons/profile.png'
  }
})

// 文件上传处理
const triggerBannerUpload = () => { bannerInput.value?.click() }
const triggerAvatarUpload = () => { avatarInput.value?.click() }

const handleBannerUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => { bannerPreview.value = e.target?.result as string }
    reader.readAsDataURL(target.files[0])
  }
}

const handleAvatarUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    avatarFile.value = file
    
    // 显示预览
    const reader = new FileReader()
    reader.onload = (e) => { avatarPreview.value = e.target?.result as string }
    reader.readAsDataURL(file)
  }
}

// 提交表单
const onSubmit = async () => {
  if (loading.value) return
  
  loading.value = true
  try {
    let avatarUrl = currentUser.value?.avatar || ''
    
    // 如果有新头像，先上传头像
    if (avatarFile.value) {
      uploading.value = true
      const uploadResult = await uploadUserAvatar(avatarFile.value)
      uploading.value = false
      
      if (uploadResult.success && uploadResult.data) {
        avatarUrl = uploadResult.data
      } else {
        console.error('头像上传失败:', uploadResult.message)
        // 可以选择继续更新其他信息，或者停止
      }
    }
    
    // 更新用户资料
    const profileData = {
      username: form.nickname,
      gender: form.gender,
      personalProfile: form.personalProfile,
      avatar: avatarUrl
    }
    
    const result = await updateCurrentUserProfile(profileData)
    
    if (result.success && result.data) {
      // 更新本地用户状态
      setUser(result.data)
      
      // 发送成功事件
      emit('submit', result.data)
      
      console.log('用户资料更新成功')
    } else {
      console.error('用户资料更新失败:', result.message)
      alert(result.message || '更新失败，请稍后重试')
    }
  } catch (error) {
    console.error('更新用户资料时出错:', error)
    alert('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

const onCancel = () => { emit('cancel') }
</script>

<style scoped>
/* 模态框遮罩层 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* 主容器 */
.modal-content {
  position: relative;
  width: 90vw;
  max-width: 1000px;
  height: 80vh;
  max-height: 700px;
  background: #2f3136;
  border-radius: 12px;
  display: flex;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

/* 关闭按钮 */
.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.close-icon {
  color: #b9bbbe;
  font-size: 20px;
  font-weight: bold;
}

/* 左侧面板 */
.left-panel {
  flex: 1;
  background: #36393f;
  border-radius: 12px 0 0 12px;
  overflow: hidden;
  position: relative;
}

/* 背景图区域 */
.profile-banner {
  position: relative;
  width: 100%;
  height: 120px;
  cursor: pointer;
  overflow: hidden;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-edit {
  position: absolute;
  top: 12px;
  right: 12px;
}

/* 个人信息区域 */
.profile-info {
  padding: 0 20px 20px 20px;
  position: relative;
}

/* 头像区域 */
.avatar-section {
  position: relative;
  margin-top: -40px;
  margin-bottom: 16px;
  width: 80px;
  height: 80px;
  cursor: pointer;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 6px solid #36393f;
  object-fit: cover;
}

.status-indicator {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 16px;
  height: 16px;
  background: #faa61a;
  border: 3px solid #36393f;
  border-radius: 50%;
}

.avatar-edit {
  position: absolute;
  bottom: 2px;
  right: 2px;
}

/* 用户详情 */
.user-details {
  margin-bottom: 20px;
}

.username {
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.user-id {
  color: #b9bbbe;
  font-size: 14px;
  margin: 0;
}

/* 编辑按钮 */
.edit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #2f3136;
  border: 2px solid #4f545c;
  cursor: pointer;
  z-index: 3;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background: #40444b;
  transform: scale(1.1);
}

.edit-btn .edit-icon {
  display: block;
  width: 16px;
  height: 16px;
  background-color: #b9bbbe;
  -webkit-mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M12 20h9'/><path d='M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z'/></svg>") center / contain no-repeat;
  mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M12 20h9'/><path d='M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z'/></svg>") center / contain no-repeat;
}

/* 表单区域 */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  color: #b9bbbe;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input {
  padding: 10px 12px;
  border-radius: 4px;
  border: 1px solid #202225;
  background: #40444b;
  color: #dcddde;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: #7289da;
}

.input::placeholder {
  color: #72767d;
}

.input.textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 按钮区域 */
.actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #4f545c;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn.secondary {
  background: transparent;
  color: #b9bbbe;
  border: 1px solid #4f545c;
}

.btn.secondary:hover {
  background: #4f545c;
}

.btn.primary {
  background: #5865f2;
  color: #ffffff;
}

.btn.primary:hover {
  background: #4752c4;
}

/* 右侧面板 */
.right-panel {
  flex: 1;
  background: #2f3136;
  border-radius: 0 12px 12px 0;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  margin-bottom: 20px;
}

.panel-header h4 {
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

/* 活动区域 */
.activity-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.activity-message {
  margin-bottom: 24px;
}

.activity-message p {
  color: #b9bbbe;
  font-size: 14px;
  line-height: 1.5;
  margin: 8px 0;
}

/* 游戏图标网格 */
.game-icons {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin: 24px 0;
  max-width: 240px;
}

.game-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background-size: cover;
  background-position: center;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  cursor: pointer;
}

.game-icon:hover {
  opacity: 1;
}

/* 游戏图标样式 */
.game-icon.steam { background: #1b2838; }
.game-icon.playstation { background: #003087; }
.game-icon.xbox { background: #107c10; }
.game-icon.twitch { background: #9146ff; }
.game-icon.battlenet { background: #148eff; }
.game-icon.origin { background: #f56c00; }
.game-icon.riot { background: #eb0029; }
.game-icon.epic { background: #313131; }
.game-icon.spotify { background: #1ed760; }
.game-icon.youtube { background: #ff0000; }
.game-icon.crunchyroll { background: #f47521; }
.game-icon.reddit { background: #ff4500; }

.activity-footer {
  margin-top: 24px;
}

.activity-footer p {
  color: #7289da;
  font-size: 12px;
  margin: 4px 0;
  cursor: pointer;
  transition: color 0.2s ease;
}

.activity-footer p:hover {
  color: #ffffff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-content {
    width: 95vw;
    height: 90vh;
    flex-direction: column;
  }
  
  .left-panel,
  .right-panel {
    border-radius: 0;
  }
  
  .game-icons {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>


