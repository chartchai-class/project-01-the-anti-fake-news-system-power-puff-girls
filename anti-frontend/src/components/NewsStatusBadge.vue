<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { CommentRefInNews, NewsStatus } from '@/types'
import { normalizeStatus, statusLabel } from '@/utils/status'

const props = withDefaults(
  defineProps<{
    status?: string | null
    comments?: Array<Pick<CommentRefInNews, 'vote'> | { vote?: string | null }>
    variant?: 'default' | 'compact'
  }>(),
  {
    variant: 'default',
    status: null
  }
)

const normalizedStatus = computed<NewsStatus>(() => normalizeStatus(props.status ?? undefined))

const commentVotes = computed(() =>
  (props.comments ?? []).map((comment) => normalizeStatus(comment?.vote ?? undefined))
)

const derivedStatus = computed<NewsStatus>(() => {
  const fake = commentVotes.value.filter((vote) => vote === 'fake').length
  const notFake = commentVotes.value.filter((vote) => vote === 'not-fake').length
  if (fake > notFake) return 'fake'
  if (notFake > fake) return 'not-fake'
  return normalizedStatus.value
})

const label = computed(() => statusLabel(derivedStatus.value))

const classes = computed(() => {
  const base =
    props.variant === 'compact'
      ? 'px-2 py-0.5 text-xs'
      : 'px-2.5 py-0.5 text-sm'

  const palette =
    derivedStatus.value === 'fake'
      ? 'bg-red-50 text-red-700 border-red-200'
      : derivedStatus.value === 'not-fake'
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-yellow-50 text-yellow-800 border-yellow-200'

  return [
    'inline-flex items-center font-semibold rounded-full border shadow-sm whitespace-nowrap transition-colors',
    base,
    palette
  ].join(' ')
})

const attrs = useAttrs()
</script>

<template>
  <span :class="classes" v-bind="attrs">
    <slot>{{ label }}</slot>
  </span>
</template>
