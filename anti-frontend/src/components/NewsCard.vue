<script setup lang="ts">
import { computed, ref } from 'vue'
import type { NewsItem } from '@/types'
import NewsStatusBadge from '@/components/NewsStatusBadge.vue'

const props = defineProps<{ news: NewsItem }>()

const isFlipped = ref(false)

const voteTotals = computed(() => {
  const comments = props.news.ownComments ?? []
  const notFake = comments.filter((comment) => comment.vote === 'not-fake').length
  const fake = comments.filter((comment) => comment.vote === 'fake').length
  const equal = comments.filter((comment) => comment.vote === 'equal').length

  return {
    notFake,
    fake,
    equal,
    total: comments.length,
  }
})

const voteSummaryText = computed(() => {
  if (!voteTotals.value.total) return 'No votes yet'
  const { total, equal } = voteTotals.value
  return equal ? `${total} total votes · ${equal} neutral` : `${total} total votes`
})

const cardAriaLabel = computed(() =>
  isFlipped.value ? 'Show news content' : 'Show vote score'
)

const flipCard = () => {
  isFlipped.value = !isFlipped.value
}
</script>

<template>
  <article class="relative h-full">
    <div
      class="card-perspective group relative h-full min-h-[22rem] w-full cursor-pointer outline-none"
      role="button"
      tabindex="0"
      :aria-pressed="isFlipped"
      :aria-label="cardAriaLabel"
      @click="flipCard"
      @keydown.enter.prevent="flipCard"
      @keydown.space.prevent="flipCard"
    >
      <div class="flip-card-inner" :class="{ 'is-flipped': isFlipped }">
        <div
          class="card-face card-front flex flex-col bg-white rounded-2xl border overflow-hidden shadow-sm
                 transition-transform duration-200 ease-out transform-gpu will-change-transform
                 group-hover:scale-[1.01] group-hover:-translate-y-0.5 group-hover:shadow-md
                 group-focus-within:scale-[1.01] group-focus-within:-translate-y-0.5"
        >
          <img :src="props.news.imageURL" alt="cover" class="h-44 w-full flex-none object-cover" />
          <div class="flex flex-1 flex-col p-4">
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-lg font-semibold leading-tight line-clamp-1">{{ props.news.title }}</h3>
              <NewsStatusBadge :status="props.news.status" :comments="props.news.ownComments" variant="compact" />
            </div>
            <p class="mt-1 text-sm text-gray-600 line-clamp-2">{{ props.news.shortDetail }}</p>
            <div class="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>By {{ props.news.reporter }}</span>
              <time :datetime="props.news.reportedAt">{{ new Date(props.news.reportedAt).toLocaleString() }}</time>
            </div>
            <RouterLink
              :to="{ name: 'news-detail', params: { id: props.news.id } }"
              class="group relative mt-3 inline-flex items-center gap-1 self-start text-sm font-medium text-blue-600 -mx-1.5 px-1.5 py-1 rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
              @click.stop
            >
              <span class="underline decoration-transparent underline-offset-4 transition-[text-decoration-color] duration-200 group-hover:decoration-blue-600">
                View details
              </span>
              <span aria-hidden="true" class="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </RouterLink>
          </div>
        </div>
        <div
          class="card-face card-back flex flex-col justify-between rounded-2xl border border-slate-900 bg-gray-700 p-6 text-white shadow-lg"
        >
          <div>
           
            <h3 class="mt-2 text-2xl font-semibold text-white">Vote Score</h3>
          </div>
          <div class="mt-8 flex items-center justify-between gap-4">
            <div class="flex flex-1 flex-col text-right">
              <span class="text-xs font-semibold uppercase tracking-wider text-emerald-400">Not Fake</span>
              <span class="mt-2 text-6xl font-extrabold text-emerald-300">{{ voteTotals.notFake }}</span>
            </div>
            <span class="text-4xl font-semibold text-slate-500">:</span>
            <div class="flex flex-1 flex-col text-left">
              <span class="text-xs font-semibold uppercase tracking-wider text-rose-400">Fake</span>
              <span class="mt-2 text-6xl font-extrabold text-rose-500">{{ voteTotals.fake }}</span>
            </div>
          </div>
          <p class="mt-6 text-sm text-slate-400">
            {{ voteSummaryText }} 
          </p>
           <RouterLink
            :to="{ name: 'vote', params: { id: props.news.id } }"
            class="mt-4 inline-flex items-center justify-center rounded-full border border-emerald-400 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-emerald-300 transition hover:border-emerald-300 hover:text-emerald-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
            @click.stop
          >
            Click here to vote
          </RouterLink>
         
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.card-perspective {
  perspective: 1800px;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.flip-card-inner.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
}

.card-back {
  transform: rotateY(180deg);
}
</style>
