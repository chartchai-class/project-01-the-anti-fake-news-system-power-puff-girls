import { createApp} from 'vue'
import { createPinia } from 'pinia'
import './assets/tailwind.css'
import App from './App.vue'
import router from './router'
import { useNewsStore } from '@/stores/NewsStore'
import { inject } from '@vercel/analytics'

async function bootstrap() {
  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  const store = useNewsStore()
  await store.loadData() 
  app.mount('#app')
  inject()
}
bootstrap()