<script setup lang="ts">
import type { NewsItem } from '@/stores/NewsStore'
import { computed } from 'vue'
const props = defineProps<{ news: NewsItem }>()
const badgeClass = computed(() => props.news.status === 'fake' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200')
</script>

<template>
  <article class="bg-white rounded-2xl shadow-sm border overflow-hidden">
    <img :src="news.imageURL" alt="cover" class="w-full h-44 object-cover" />
    <div class="p-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold line-clamp-1">{{ news.title }}</h3>
        <span :class="badgeClass" class="text-xs px-2 py-0.5 rounded-full border">
          {{ news.status === 'fake' ? 'Fake' : 'Not Fake' }}
        </span>
      </div>
      <p class="text-sm text-gray-600 mt-1 line-clamp-2">{{ news.shortDetail }}</p>
      <div class="mt-2 text-xs text-gray-500 flex items-center justify-between">
        <span>By {{ news.reporter }}</span>
        <time :datetime="news.reportedAt">{{ new Date(news.reportedAt).toLocaleString() }}</time>
      </div>
      <RouterLink :to="{ name: 'news-detail', params: { id: news.id } }" class="inline-block mt-3 text-blue-600 hover:underline text-sm">View details →</RouterLink>
    </div>
  </article>
</template>