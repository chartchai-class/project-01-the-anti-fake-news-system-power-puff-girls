import type { RouteLocationNamedRaw } from 'vue-router'

export const ROUTE = {
  HOME: 'home',
  NEWS_DETAIL: 'news-detail',
  VOTE: 'vote',
  SUBMIT: 'submit',
  LOGIN: 'login',
  REGISTER: 'register'
} as const

export type RouteName = typeof ROUTE[keyof typeof ROUTE]

export const toNewsDetail = (id: number): RouteLocationNamedRaw => ({
  name: ROUTE.NEWS_DETAIL,
  params: { id },
})

export const toVote = (id: number): RouteLocationNamedRaw => ({
  name: ROUTE.VOTE,
  params: { id },
})

