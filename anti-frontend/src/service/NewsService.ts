import apiClient from './AxiosClient'
import type { CreateNewsPayload, NewsItem } from '@/types'

type NewsQuery = {
  _limit?: number
  _page?: number
  status?: NewsItem['status']
  title?: string
}

const RESOURCE = '/news'

export default {
  getNews(params?: NewsQuery) {
    return apiClient.get<NewsItem[]>(RESOURCE, { params })
  },
  getNewsById(id: number) {
    return apiClient.get<NewsItem>(`${RESOURCE}/${id}`)
  },
  saveNews(payload: CreateNewsPayload) {
    return apiClient.post<NewsItem>(RESOURCE, payload)
  },
  getNewsByKeyword(keyword: string) {
    return apiClient.get<NewsItem[]>(RESOURCE, { params: { title: keyword } })
  },
  removeNews(id: number) {
    return apiClient.delete(`${RESOURCE}/${id}`)
  },
  getRemovedNews(params?: { _limit?: number; _page?: number }) {
    return apiClient.get<NewsItem[]>('/admin/news/removed', { params })
  }
}
