import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import CustomizePage from '../views/CustomizePage.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/customize', name: 'customize', component: CustomizePage, meta: { layout: 'auth' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 全局前置守卫 - 每次路由切换时验证Token
router.beforeEach(async (_to, _from, next) => {
  // 动态导入以避免循环依赖
  const { useSingleSignOn } = await import('../composables/useSingleSignOn')
  const { checkLoginStatus } = useSingleSignOn()
  
  // 每次路由切换时都验证Token
  try {
    await checkLoginStatus()
    console.log('路由守卫：Token验证完成')
  } catch (error) {
    console.error('路由守卫：Token验证失败', error)
  }
  
  next()
})

export default router

