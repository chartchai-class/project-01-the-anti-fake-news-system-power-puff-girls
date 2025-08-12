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

const API_BASE = ''

export const useNewsStore = defineStore('news', () => {
  const news: Ref<NewsItem[]> = ref([...mockNews])
  const comments: Ref<CommentItem[]> = ref([...mockComments])
 
  const isLoading: Ref<boolean> = ref(false)
  const hasLoaded: Ref<boolean> = ref(false)
  const loadError: Ref<string | null> = ref(null)

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

  async function loadData() {
    if (hasLoaded.value) return
    isLoading.value = true
    loadError.value = null
    try {
      if (API_BASE) {
        const [newsRes, commentsRes] = await Promise.all([
          fetch(`${API_BASE}/news`),
          fetch(`${API_BASE}/comments`),
        ])
        if (!newsRes.ok || !commentsRes.ok) throw new Error('Mock API fetch failed')
        news.value = await newsRes.json()
        comments.value = await commentsRes.json()
      } else {
        const url = `${import.meta.env.BASE_URL}db.json`
        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json() as { news: NewsItem[]; comments: CommentItem[] }
        if (!Array.isArray(json.news) || !Array.isArray(json.comments)) throw new Error('Invalid db.json shape')
        news.value = json.news
        comments.value = json.comments
      }
    } catch (err: unknown) {
      news.value = [...mockNews]
      comments.value = [...mockComments]
      loadError.value = err instanceof Error ? err.message : String(err)
      console.warn('[newsStore] Load failed → using mock data. Reason:', loadError.value)
    } finally {
      hasLoaded.value = true
      isLoading.value = false
    }
  }


    return { 
    news, comments,
    isLoading, hasLoaded, loadError,
    perPageOptions, filter, perPage, currentPage,
    setFilter, setPerPage, setPage,
    addVoteAndComment,
    loadData, 
    filteredNews, paginatedNews, totalPages,
    getNewsById, commentsByNews, voteCountsByNews,
  }
})