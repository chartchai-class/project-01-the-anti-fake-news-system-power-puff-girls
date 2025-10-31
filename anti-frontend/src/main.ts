import { createApp} from 'vue'
import { createPinia } from 'pinia'
import './assets/tailwind.css'
import App from './App.vue'
import 'nprogress/nprogress.css'
import router from './router'
import '@/service/AxiosInterceptorSetup.ts'


  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.mount('#app')
  
