import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import NewsDetail from '@/pages/NewsDetail.vue'
import VotePage from '@/pages/VotePage.vue'
import { ROUTE } from './routes'

const routes: RouteRecordRaw[] = [
  { path: '/', name: ROUTE.HOME, component: HomePage },
  { path: '/news/:id', name: ROUTE.NEWS_DETAIL, component: NewsDetail, props: true },
  { path: '/news/:id/vote', name: ROUTE.VOTE, component: VotePage, props: true },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } },
})

export default router

