export type NewsStatus = 'fake' | 'not-fake' | 'equal'
// export type DerivedStatus = NewsStatus | 'equal'
// Minimal shape for a comment reference within a news item
export interface CommentRefInNews {
  id: number
  vote: NewsStatus
}

export interface NewsState {
  news: NewsItem | null
}

export interface NewsItem {
  id: number
  title: string
  shortDetail: string
  fullDetail: string
  status: NewsStatus
  reporter: string
  reportedAt: string // ISO string
  imageURL: string
  deleted?: boolean
  deletedAt?: string
  // Optional array to support multiple uploaded images if needed by UI
  images?: string[]
  // Optional compact comments returned by backend (if present)
  ownComments?: CommentRefInNews[]
}

// Payload for creating a news item (id/comments/images handled client-side)
export type CreateNewsPayload = Omit<NewsItem, 'id' | 'ownComments' | 'images' | 'deleted' | 'deletedAt'>

export interface CommentItem {
  id: number
  newsId: number
  text: string
  imageURL?: string | null
  vote: NewsStatus
  author: string
  createdAt: string // ISO string
  deleted?: boolean
  deletedAt?: string
}

export interface MessageState {
  message: string
}
