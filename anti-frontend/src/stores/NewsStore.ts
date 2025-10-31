import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import { ref, computed } from 'vue'
import { mockNews } from '@/data/MockNews'
import { mockComments } from '@/data/MockComments'
import { NP } from '@/plugins/nprogress'

export type NewsStatus = 'fake' | 'not-fake'
export type DerivedStatus = NewsStatus | 'equal'
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
  imageURL?: string | null
  vote: NewsStatus
  author: string
  createdAt: string 
}

const API_BASE: string = (import.meta as any).env?.VITE_API_BASE || ''

export const useNewsStore = defineStore('news', () => {
  const news: Ref<NewsItem[]> = ref([])
  const comments: Ref<CommentItem[]> = ref([])
  const newNews: Ref<NewsItem[]> = ref([])
  const newComments: Ref<CommentItem[]> = ref([])

  const isLoading = ref(false)
  const hasLoaded = ref(false)
  const loadError = ref<string | null>(null)

  const perPageOptions = [6, 9, 12, 15, 18]
  const filter = ref<'all' | NewsStatus | 'equal'>('all')
  const perPage = ref<number>(perPageOptions[0])
  const currentPage = ref(1)

  function setFilter(f: 'all' | NewsStatus | 'equal') { filter.value = f; currentPage.value = 1 }
  function setPerPage(n: number) { perPage.value = n; currentPage.value = 1 }
  function setPage(p: number) { currentPage.value = p }

  function fetchWithTimeout(input: RequestInfo | URL, ms: number, init?: RequestInit) {
  const ctrl = new AbortController()
  const id = setTimeout(() => ctrl.abort(), ms)
  return fetch(input, { ...init, signal: ctrl.signal }).finally(() => clearTimeout(id))
}

  function loadData() {
    if (hasLoaded.value) return Promise.resolve()
    return NP.track(() => {
      isLoading.value = true
      loadError.value = null

      // Helper to map backend Event -> News shape
      const mapEventToNews = (e: any): NewsItem => ({
        id: Number(e?.id ?? 0),
        title: String(e?.title ?? 'Untitled'),
        shortDetail: String(e?.description ?? '').slice(0, 160) || 'No summary available',
        fullDetail: String(e?.description ?? 'No description available'),
        status: 'equal',
        reporter: String(e?.organizer?.name ?? 'Unknown'),
        reportedAt: e?.date && e?.time ? `${e.date}T${e.time}` : new Date().toISOString(),
        imageURL: Array.isArray(e?.images) && e.images.length ? String(e.images[0]) : 'https://picsum.photos/seed/event/800/450',
      })

      const tryBackend = async () => {
        if (!API_BASE) return false
        // Preferred: try backend `/news` endpoint
        try {
          const nRes = await fetchWithTimeout(`${API_BASE}/news?_limit=50&_page=1`, 3000)
          const cRes = await fetchWithTimeout(`${API_BASE}/comments`, 3000)
          if (nRes.ok && cRes.ok) {
            const [nJson, cJson] = await Promise.all([nRes.json(), cRes.json()]) as [any[], any[]]
            news.value = (Array.isArray(nJson) ? nJson : []) as NewsItem[]
            comments.value = (Array.isArray(cJson) ? cJson : []) as CommentItem[]
            return true
          }
        } catch (_) { /* fall through to other strategies */ }

        // Fallback: legacy mock API shape `/news` + `/comments` on an external mock server
        try {
          const [nRes, cRes] = await Promise.all([
            fetchWithTimeout(`${API_BASE}/news`, 2000),
            fetchWithTimeout(`${API_BASE}/comments`, 2000),
          ])
          if (!nRes.ok || !cRes.ok) return false
          const [nJson, cJson] = await Promise.all([nRes.json(), cRes.json()])
          news.value = nJson as NewsItem[]
          comments.value = cJson as CommentItem[]
          return true
        } catch (_) {
          return false
        }
      }

      const tryStaticDb = async () => {
        const url = `${import.meta.env.BASE_URL}db.json`
        const res = await fetchWithTimeout(url, 1500, { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json() as { news: NewsItem[]; comments: CommentItem[] }
        if (!Array.isArray(json.news) || !Array.isArray(json.comments)) throw new Error('Invalid db.json shape')
        news.value = json.news
        comments.value = json.comments
      }

      return Promise.resolve()
        .then(async () => {
          if (await tryBackend()) return
          await tryStaticDb()
        })
        .catch((err: unknown) => {
          news.value = [...mockNews]
          comments.value = [...mockComments]
          if (err && typeof err === 'object' && 'name' in err && (err as { name?: string }).name === 'AbortError') {
            loadError.value = 'Request timed out'
          } else if (err && typeof err === 'object' && 'message' in err) {
            loadError.value = String((err as { message?: string }).message)
          } else {
            loadError.value = String(err)
          }
          console.warn('[newsStore] Load failed → using mocks. Reason:', loadError.value)
        })
        .finally(() => {
          hasLoaded.value = true
          isLoading.value = false
        })
    })
  }

  function nextNewsId() {
    const ids = [...news.value.map(n => n.id), ...newNews.value.map(n => n.id)]
    return ids.length ? Math.max(...ids) + 1 : 1
  }

  function addNews(payload: Omit<NewsItem, 'id' | 'reportedAt'> & { reportedAt?: string }) {
    NP.start()
    try {
      const clean = {
        title: payload.title.trim(),
        shortDetail: payload.shortDetail.trim(),
        fullDetail: payload.fullDetail.trim(),
        status: payload.status,
        reporter: payload.reporter.trim(),
        imageURL: (payload.imageURL || '').trim() || 'https://picsum.photos/seed/new/800/450',
      }
      if (API_BASE) {
        return fetchWithTimeout(`${API_BASE}/news`, 4000, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clean),
        })
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            return res.json() as Promise<NewsItem>
          })
          .then((created) => {
            newNews.value.unshift(created)
          })
          .catch(() => {
            const fallback: NewsItem = {
              id: nextNewsId(),
              reportedAt: payload.reportedAt ?? new Date().toISOString(),
              ...clean,
            }
            newNews.value.unshift(fallback)
          })
          .finally(() => NP.done())
      }

      const item: NewsItem = {
        id: nextNewsId(),
        title: clean.title,
        shortDetail: clean.shortDetail,
        fullDetail: clean.fullDetail,
        status: clean.status,
        reporter: clean.reporter,
        reportedAt: payload.reportedAt ?? new Date().toISOString(),
        imageURL: clean.imageURL,
      }
      newNews.value.unshift(item)
    } finally {
      NP.done()
    }
  }

  function nextCommentId() {
    const ids = [...comments.value.map(c => c.id), ...newComments.value.map(c => c.id)]
    return ids.length ? Math.max(...ids) + 1 : 1
  }

  function addVoteAndComment(newsId: number, vote: NewsStatus, text: string, imageURL: string | undefined, author: string) {
    NP.start()
    try {
      const clean = {
        newsId,
        text: text.trim(),
        imageURL: (imageURL || '').trim() || null,
        vote,
        author: author.trim(),
      }
      if (API_BASE) {
        return fetchWithTimeout(`${API_BASE}/comments`, 4000, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clean),
        })
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            return res.json() as Promise<CommentItem>
          })
          .then((created) => {
            newComments.value.unshift(created)
          })
          .catch(() => {
            const fallback: CommentItem = {
              id: nextCommentId(),
              createdAt: new Date().toISOString(),
              ...clean,
            } as CommentItem
            newComments.value.unshift(fallback)
          })
          .finally(() => NP.done())
      }

      const item: CommentItem = {
        id: nextCommentId(),
        newsId,
        text: clean.text,
        imageURL: clean.imageURL,
        vote: clean.vote,
        author: clean.author,
        createdAt: new Date().toISOString(),
      }
      newComments.value.unshift(item)
    } finally {
      NP.done()
    }
  }

  function getNewsById(id: number) {
    return newNews.value.find(n => n.id === id) ?? news.value.find(n => n.id === id)
  }

  const allNews = computed(() => [...newNews.value, ...news.value])

  const allCommentsByNews = (newsId: number) => (
    [...comments.value.filter(c => c.newsId === newsId),
     ...newComments.value.filter(c => c.newsId === newsId)]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  )

  const voteCountsByNews = (newsId: number) => {
    const related = allCommentsByNews(newsId)
    const fake = related.filter(c => c.vote === 'fake').length
    const notFake = related.filter(c => c.vote === 'not-fake').length
    return { fake, notFake }
  }

  const derivedStatusByNews = (newsId: number): DerivedStatus => {
    const { fake, notFake } = voteCountsByNews(newsId)
    if (fake > notFake) return 'fake'
    if (notFake > fake) return 'not-fake'
    return 'equal'
  }

  const filteredNews = computed(() => {
    if (filter.value === 'all') return allNews.value
    if (filter.value === 'equal') return allNews.value.filter(n => derivedStatusByNews(n.id) === 'equal')
    return allNews.value.filter(n => derivedStatusByNews(n.id) === filter.value)
  })

  const paginatedNews = computed(() => {
    const start = (currentPage.value - 1) * perPage.value
    return filteredNews.value.slice(start, start + perPage.value)
  })

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredNews.value.length / perPage.value))
  )

  return {
    news, comments, newNews, newComments,
    isLoading, hasLoaded, loadError,
    perPageOptions, filter, perPage, currentPage,
  
    setFilter, setPerPage, setPage,
    addNews, addVoteAndComment, loadData, 

    allNews, filteredNews, paginatedNews, totalPages,

    getNewsById, allCommentsByNews, voteCountsByNews, derivedStatusByNews,
  }
})
