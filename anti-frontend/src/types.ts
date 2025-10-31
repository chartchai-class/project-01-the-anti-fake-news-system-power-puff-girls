export type NewsStatus = 'fake' | 'not-fake' | 'equal'
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
  reportedAt: string 
  imageURL: string
  deleted?: boolean
  deletedAt?: string
  
  images?: string[]
  ownComments?: CommentRefInNews[]
}

export type CreateNewsPayload = Omit<NewsItem, 'id' | 'ownComments' | 'images' | 'deleted' | 'deletedAt'>

export interface CommentItem {
  id: number
  newsId: number
  text: string
  imageURL?: string | null
  vote: NewsStatus
  author: string
  createdAt: string 
  deleted?: boolean
  deletedAt?: string
}

export interface MessageState {
  message: string
}
