import type { NewsItem } from '@/types'
import apiClient from './AxiosClient'

export default {
  getNews() {
    return apiClient.get('/news')
  },
  getNewsById(id: number) {
    return apiClient.get('/news/' + id)
  },
  saveNews(news: NewsItem) {
    return apiClient.post('/news', news)
  },
  getNewsByKeyword(keyword: string) {
    return apiClient.get('/news?title=' + keyword)
  }
}