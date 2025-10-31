import { createApp} from 'vue'
import { createPinia } from 'pinia'
import './assets/tailwind.css'
import App from './App.vue'
import 'nprogress/nprogress.css'
import router from './router'
import '@/service/AxiosInterceptorSetup.ts'
import { useAuthStore } from '@/stores/auth'
import type { AuthUser } from '@/stores/auth'


  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)
  app.use(router)

  const token = localStorage.getItem('access_token')
  const userStr = localStorage.getItem('user')
  if (token && userStr) {
    try {
      const authStore = useAuthStore(pinia)
      authStore.reload(token, JSON.parse(userStr) as AuthUser)
    } catch {}
  }

  app.mount('#app')
  
