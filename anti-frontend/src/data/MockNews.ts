import type { NewsItem } from '@/types'
export const mockNews: NewsItem[] = Array.from({ length: 18 }).map((_, i) => ({
  id: i + 1,
  title: `News #${i + 1}: Sample Headline About An Event`,
  shortDetail: 'Short summary lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vitae.',
  fullDetail: 'Full details lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor.',
  status: i % 3 === 0 ? 'fake' : 'not-fake',
  reporter: ['Alice', 'Bob', 'Carol'][i % 3],
  reportedAt: new Date(Date.now() - i * 86400000).toISOString(),
  imageURL: 'https://picsum.photos/seed/' + (i + 1) + '/800/450',
}))