import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import { ref, computed } from 'vue'
import { mockNews } from '@/data/MockNews'
import { mockComments } from '@/data/MockComments'

export type NewsStatus = 'fake' | 'not-fake'

export interface NewsItem {
  id: number
  title: string
  shortDetail: string
  fullDetail: string
  status: NewsStatus
  reporter: string
  reportedAt: string 
  imageURL: string
}

export interface CommentItem {
  id: number
  newsId: number
  text: string
  imageURL?: string
  vote: NewsStatus
  author: string
  createdAt: string 
}

export const useNewsStore = defineStore('news', () => {
  const news: Ref<NewsItem[]> = ref([...mockNews])
  const comments: Ref<CommentItem[]> = ref([...mockComments])

  const perPageOptions = [5, 10, 15]
  const filter: Ref<'all' | NewsStatus> = ref('all')
  const perPage: Ref<number> = ref(perPageOptions[0])
  const currentPage: Ref<number> = ref(1)

  function setFilter(f: 'all' | NewsStatus) { filter.value = f; currentPage.value = 1 }
  function setPerPage(n: number) { perPage.value = n; currentPage.value = 1 }
  function setPage(p: number) { currentPage.value = p }

  const filteredNews = computed(() => {
    if (filter.value === 'all') return news.value
    return news.value.filter(n => n.status === filter.value)
  })

  const paginatedNews = computed(() => {
    const start = (currentPage.value - 1) * perPage.value
    return filteredNews.value.slice(start, start + perPage.value)
  })

  const totalPages = computed(() => Math.max(1, Math.ceil(filteredNews.value.length / perPage.value)))

  function getNewsById(id: number) {
    return news.value.find(n => n.id === id)
  }

  const commentsByNews = (newsId: number) => comments.value.filter(c => c.newsId === newsId)

  function addVoteAndComment(newsId: number, vote: NewsStatus, text: string, imageURL: string | undefined, author: string) {
    const id = comments.value.length ? Math.max(...comments.value.map(c => c.id)) + 1 : 1
    comments.value.unshift({ id, newsId, text, imageURL, vote, author, createdAt: new Date().toISOString() })
  }

  const voteCountsByNews = (newsId: number) => {
    const related = commentsByNews(newsId)
    return {
      fake: related.filter(c => c.vote === 'fake').length,
      notFake: related.filter(c => c.vote === 'not-fake').length,
    }
  }

  return {
    news, comments,
    perPageOptions, filter, perPage, currentPage,
    setFilter, setPerPage, setPage,
    filteredNews, paginatedNews, totalPages,
    getNewsById, commentsByNews, addVoteAndComment, voteCountsByNews,
  }
})