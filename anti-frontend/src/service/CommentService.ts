import type { CommentItem } from '@/types'
import apiClient from './AxiosClient'

export default {
  getComment() {
    return apiClient.get('/comments')
  },
  getCommentById(id: number) {
    return apiClient.get('/comments/' + id)
  },
  saveComment(comment: CommentItem) {
    return apiClient.post('/comments', comment)
  },
  getCommentByKeyword(status: string) {
    return apiClient.get('/comments?status=' + status)
  },
  removeComment(id: number) {
    return apiClient.delete(`/comments/${id}`)
  },
  getRemovedComments() {
    return apiClient.get<CommentItem[]>('/admin/comments/removed')
  }
}
