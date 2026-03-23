import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index'
import App from './App.vue'

import './styles/theme.css'
import './styles/typography.css'
import './styles/base.css'

createApp(App).use(createPinia()).use(router).mount('#app')
