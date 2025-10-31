import type { NewsState, NewsItem } from '@/types'
import { defineStore } from 'pinia'
export const useNewsStore = defineStore('news', {
  state: (): NewsState => ({
    news: null
  }),
  actions: {
    setNews(news: NewsItem): void {
      this.news = news
    }
  }
})
