import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import NewsDetail from '@/pages/NewsDetail.vue'
import VotePage from '@/pages/VotePage.vue'
import SubmitNews from '@/pages/SubmitNews.vue'
import { ROUTE } from './routes'
import { NP } from '@/plugins/nprogress'

const routes: RouteRecordRaw[] = [
  { path: '/', name: ROUTE.HOME, component: HomePage },
  { path: '/news/:id', name: ROUTE.NEWS_DETAIL, component: NewsDetail, props: true },
  { path: '/news/:id/vote', name: ROUTE.VOTE, component: VotePage, props: true },
  { path: '/submit', name: ROUTE.SUBMIT, component: SubmitNews}
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

