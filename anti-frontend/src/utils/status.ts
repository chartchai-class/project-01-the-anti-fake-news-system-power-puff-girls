import type { NewsStatus } from '@/types'

const STATUS_VALUES: NewsStatus[] = ['fake', 'not-fake', 'equal']

export const normalizeStatus = (value?: string | null): NewsStatus => {
  if (!value) return 'equal'
  const normalized = value.toLowerCase().replace(/_/g, '-')
  if ((STATUS_VALUES as string[]).includes(normalized)) {
    return normalized as NewsStatus
  }
  return 'equal'
}

export const statusLabel = (status: NewsStatus): string => {
  switch (status) {
    case 'fake':
      return 'Fake'
    case 'not-fake':
      return 'Not Fake'
    default:
      return 'Equal'
  }
}
