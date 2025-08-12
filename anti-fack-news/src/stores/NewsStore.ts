import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import { ref, computed } from 'vue'
import { mockNews } from '@/data/MockNews'
import { mockComments } from '@/data/MockComments'

export type NewsStatus = 'fake' | 'not-fake' | 'equal'

export interface NewsItem {
  id: number
  title: string
  shortDetail: string
  fullDetail: string
  // Seed/status from data; UI now derives live status from votes
  status: NewsStatus
  reporter: string
  reportedAt: string // ISO string
  imageURL: string
}

export interface CommentItem {
  id: number
  newsId: number
  text: string
  imageURL?: string | null
  vote: NewsStatus
  author: string
  createdAt: string // ISO string
}

const API_BASE =  ''
const LS_KEY = 'antiFakeNewsNewComments'

export const useNewsStore = defineStore('news', () => {
  // Server/mock data + local (new) comments
  const news: Ref<NewsItem[]> = ref([])
  const comments: Ref<CommentItem[]> = ref([])
  const newComments: Ref<CommentItem[]> = ref([])

  // Loading flags
  const isLoading = ref(false)
  const hasLoaded = ref(false)
  const loadError = ref<string | null>(null)

  // List state
  const perPageOptions = [5, 10, 15]
  const filter = ref<'all' | NewsStatus>('all')
  const perPage = ref<number>(perPageOptions[0])
  const currentPage = ref(1)

  function setFilter(f: 'all' | NewsStatus) { filter.value = f; currentPage.value = 1 }
  function setPerPage(n: number) { perPage.value = n; currentPage.value = 1 }
  function setPage(p: number) { currentPage.value = p }

  // Load data from Typicode or /public/db.json → fallback to bundled mocks
  async function loadData() {
    if (hasLoaded.value) return
    isLoading.value = true
    loadError.value = null
    try {
      if (API_BASE) {
        const [nRes, cRes] = await Promise.all([
          fetch(`${API_BASE}/news`),
          fetch(`${API_BASE}/comments`),
        ])
        if (!nRes.ok || !cRes.ok) throw new Error('Mock API fetch failed')
        news.value = await nRes.json()
        comments.value = await cRes.json()
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

  // Local storage for new comments
  function hydrateLocal() {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) newComments.value = JSON.parse(raw)
    } catch (e) {
      console.warn('Failed to read localStorage new comments', e)
    }
  }
  function persistLocal() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(newComments.value)) } catch {}
  }
  function clearLocalComments(newsId?: number) {
    if (typeof newsId === 'number') {
      newComments.value = newComments.value.filter(c => c.newsId !== newsId)
    } else {
      newComments.value = []
    }
    persistLocal()
  }

  // Queries + derived state
  function getNewsById(id: number) { return news.value.find(n => n.id === id) }

  const allCommentsByNews = (newsId: number) => [
    ...comments.value.filter(c => c.newsId === newsId),
    ...newComments.value.filter(c => c.newsId === newsId),
  ].sort((a,b) => +new Date(b.createdAt) - +new Date(a.createdAt))

  const voteCountsByNews = (newsId: number) => {
    const related = allCommentsByNews(newsId)
    const fake = related.filter(c => c.vote === 'fake').length
    const notFake = related.filter(c => c.vote === 'not-fake').length
    return { fake, notFake }
  }

  // “considered fake or not by number of votes”
  // tie rule: default to 'not-fake' (adjust if your rubric says otherwise)
 const derivedStatusByNews = (newsId: number): NewsStatus => {
  const { fake, notFake } = voteCountsByNews(newsId)
  if (fake > notFake) return 'fake'
  if (notFake > fake) return 'not-fake'
  return 'equal' // tie
}
  const filteredNews = computed(() => {
  if (filter.value === 'all') return news.value
  if (filter.value === 'equal') {
    return news.value.filter(n => derivedStatusByNews(n.id) === 'equal')
  }
  return news.value.filter(n => derivedStatusByNews(n.id) === filter.value)
})

  const paginatedNews = computed(() => {
    const start = (currentPage.value - 1) * perPage.value
    return filteredNews.value.slice(start, start + perPage.value)
  })

  const totalPages = computed(() => Math.max(1, Math.ceil(filteredNews.value.length / perPage.value)))

  // Mutations
  function addVoteAndComment(newsId: number, vote: NewsStatus, text: string, imageURL: string | undefined, author: string) {
    const id = (comments.value.length + newComments.value.length)
      ? Math.max(0, ...comments.value.map(c => c.id), ...newComments.value.map(c => c.id)) + 1
      : 1
    const item: CommentItem = { id, newsId, text, imageURL: imageURL ?? null, vote, author, createdAt: new Date().toISOString() }
    newComments.value.unshift(item)
    persistLocal()
  }

  return {
    // data
    news, comments, newComments,
    // flags
    isLoading, hasLoaded, loadError,
    // list state
    perPageOptions, filter, perPage, currentPage,
    // actions
    setFilter, setPerPage, setPage,
    addVoteAndComment,
    loadData, hydrateLocal, clearLocalComments,
    // getters/helpers
    filteredNews, paginatedNews, totalPages,
    getNewsById, allCommentsByNews, voteCountsByNews, derivedStatusByNews,
  }
})
