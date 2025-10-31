import type { CommentItem } from '@/types'

function makeComment(id: number, newsId: number, vote: 'fake' | 'not-fake'): CommentItem {
  return {
    id,
    newsId,
    vote,
    text: vote === 'fake' ? 'Feels misleading based on source X.' : 'Looks legitimate; matched with source Y.',
    author: ['Dana', 'Evan', 'Fern'][id % 3],
    imageURL: undefined,
    createdAt: new Date(Date.now() - id * 3600_000).toISOString(),
  }
}

export const mockComments: CommentItem[] = Array.from({ length: 60 }).map((_, i) => {
  const newsId = (i % 10) + 1
  const vote = i % 2 === 0 ? 'fake' : 'not-fake'
  return makeComment(i + 1, newsId, vote)
  })