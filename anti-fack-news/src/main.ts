import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './assets/tailwind.css'
import App from './App.vue'
import router from './router'
import { useNewsStore } from '@/stores/NewsStore'

async function bootstrap() {
  const app = createApp(App)
  app.use(createPinia())
  app.use(router)

  const store = useNewsStore()
  await store.loadData() // fallback to mocks if db.json missing

  app.mount('#app')
}

bootstrap()