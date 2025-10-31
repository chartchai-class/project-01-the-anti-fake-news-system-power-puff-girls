import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import NewsDetail from '@/views/NewsDetail.vue'
import VotePage from '@/views/VotePage.vue'
import SubmitNews from '@/views/SubmitNews.vue'
import RegisterPage from '@/views/RegisterPage.vue'
import LoginPage from '@/views/LoginPage.vue'
import { NP } from '@/plugins/nprogress'
import { useAuthStore } from '@/stores/auth'
import type { RouteLocationNamedRaw } from 'vue-router'


// 👇 1. "เรียก" หน้า AccountPage.vue ที่เราสร้างไว้
// (แพทริกเดาว่ามันอยู่ที่ '@/views/AccountPage.vue' เหมือนเพื่อนๆ มันนะ!)
import AccountPage from '@/views/AccountPage.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomePage },
  {
    path: '/news/:id',
    name: 'news-detail',
    component: NewsDetail, props: true
  },
  {
    path: '/news/:id/vote',
    name: 'vote',
    component: VotePage,
    props: true,
    meta: { requiresAuth: true, allowedRoles: ['ROLE_READER', 'ROLE_MEMBER', 'ROLE_ADMIN'] }
  },
  {
    path: '/submit',
    name: 'submit',
    component: SubmitNews,
    meta: { requiresAuth: true, allowedRoles: ['ROLE_MEMBER', 'ROLE_ADMIN'] }
  },
  { path: '/login', name: 'login', component: LoginPage },
  { path: '/register', name: 'register', component: RegisterPage },
  {
    path: '/account',
    name: 'account',
    component: AccountPage,
    meta: { requiresAuth: true }
  }
]

export const toNewsDetail = (id: number): RouteLocationNamedRaw => ({
  name: 'news-detail',
  params: { id },
})

export const toVote = (id: number): RouteLocationNamedRaw => ({
  name: 'vote',
  params: { id },
})


const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } },
})

router.beforeEach((to, from, next) => {
  NP.start()
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth
  const allowedRoles = to.meta.allowedRoles as string[] | undefined

  if (requiresAuth && !authStore.token) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  if (allowedRoles && !allowedRoles.some((role) => authStore.user?.roles.includes(role))) {
    next(from.fullPath ? from.fullPath : { name: 'home' })
    return
  }

  next()
})

router.afterEach(() => {
  NP.done()
})

router.onError(() => {
  NP.done()
})

export default router
