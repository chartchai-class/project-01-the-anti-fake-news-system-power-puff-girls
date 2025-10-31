<script setup lang="ts">
import type { NewsItem } from '@/stores/NewsStore'
import { useNewsStore } from '@/stores/NewsStore'
import type { DerivedStatus } from '@/stores/NewsStore';
import { computed } from 'vue'

const props = defineProps<{ news: NewsItem }>()
const store = useNewsStore()
const derivedStatus = computed<DerivedStatus>(() => store.derivedStatusByNews(props.news.id))
const badgeClass = computed(() => {
  if (derivedStatus.value === 'fake') return 'bg-red-50 text-red-700 border-red-200'
  if (derivedStatus.value === 'not-fake') return 'bg-green-50 text-green-700 border-green-200'
  if (derivedStatus.value === 'equal') return 'bg-yellow-50 text-yellow-800 border-yellow-200'
  return 'bg-yellow-50 text-yellow-800 border-yellow-200'
})
</script>

<template>
  <article
  class="group bg-white rounded-2xl border overflow-hidden shadow-sm
         transition-transform duration-200 ease-out transform-gpu will-change-transform
         hover:scale-[1.01] hover:-translate-y-0.5 hover:shadow-md
         focus-within:scale-[1.01] focus-within:-translate-y-0.5">
         
    <img :src="news.imageURL" alt="cover" class="w-full h-44 object-cover" />
    <div class="p-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold line-clamp-1">{{ news.title }}</h3>
        <span :class="badgeClass" class="text-xs px-2 py-0.5 rounded-full border whitespace-nowrap">
         {{ derivedStatus === 'fake' ? 'Fake' : derivedStatus === 'not-fake' ? 'Not Fake' : derivedStatus === 'equal' ? 'Equal' : '' }}
        </span>
      </div>
      <p class="text-sm text-gray-600 mt-1 line-clamp-2">{{ news.shortDetail }}</p>
      <div class="mt-2 text-xs text-gray-500 flex items-center justify-between">
        <span>By {{ news.reporter }}</span>
        <time :datetime="news.reportedAt">{{ new Date(news.reportedAt).toLocaleString() }}</time>
      </div>
      <RouterLink
  :to="{ name: 'news-detail', params: { id: news.id } }"
  class="group relative inline-flex items-center gap-1 mt-3 text-sm font-medium text-blue-600 -mx-1.5 px-1.5 py-1 rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
>
  <span class="underline decoration-transparent underline-offset-4 transition-[text-decoration-color] duration-200 group-hover:decoration-blue-600">
    View details
  </span>
  <span aria-hidden="true" class="transition-transform duration-200 group-hover:translate-x-1">→</span>
</RouterLink>
    </div>
  </article>
</template>