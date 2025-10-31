import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import NewsDetail from '@/views/NewsDetail.vue'
import VotePage from '@/views/VotePage.vue'
import SubmitNews from '@/views/SubmitNews.vue'
import RegisterPage from '@/views/RegisterPage.vue'
import LoginPage from '@/views/LoginPage.vue'
import { ROUTE } from './routes'
import { NP } from '@/plugins/nprogress'

// 👇 1. "เรียก" หน้า AccountPage.vue ที่เราสร้างไว้
// (แพทริกเดาว่ามันอยู่ที่ '@/views/AccountPage.vue' เหมือนเพื่อนๆ มันนะ!)
import AccountPage from '@/views/AccountPage.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: ROUTE.HOME, component: HomePage },
  {
    path: '/news/:id',
    name: ROUTE.NEWS_DETAIL,
    component: NewsDetail, props: true
  },
  { path: '/news/:id/vote', name: ROUTE.VOTE, component: VotePage, props: true },
  { path: '/submit', name: ROUTE.SUBMIT, component: SubmitNews },
  { path: '/login', name: ROUTE.LOGIN, component: LoginPage },
  { path: '/register', name: ROUTE.REGISTER, component: RegisterPage },
  { path: '/account', name: 'account', component: AccountPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } },
})

router.beforeEach((_to, _from, next) => {
  NP.start()
  next()
})

router.afterEach(() => {
  NP.done()
})

router.onError(() => {
  NP.done()
})

export default router