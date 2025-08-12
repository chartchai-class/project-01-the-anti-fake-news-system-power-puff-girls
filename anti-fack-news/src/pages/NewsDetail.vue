<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useNewsStore } from '@/stores/NewsStore'
import Pagination from '@/components/AppPagination.vue'
import { toVote } from '@/router/routes.ts'
import type { NewsStatus } from '@/stores/NewsStore'

const route = useRoute()
const id = Number(route.params.id)

const store = useNewsStore()
const news = store.getNewsById(id)
const votes = computed(() => store.voteCountsByNews(id))

const derived = computed<NewsStatus>(() => store.derivedStatusByNews(id))
const commentsTop = ref<HTMLElement | null>(null)
const page = ref(1)
const perPage = 6
const all = computed(() => store.allCommentsByNews(id))
const totalPages = computed(() => Math.max(1, Math.ceil(all.value.length / perPage)))
const pagedComments = computed(() => {
  const start = (page.value - 1) * perPage
  return all.value.slice(start, start + perPage)
})

async function onCommentPage(v: number) {
  page.value = v
  await nextTick()
  commentsTop.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function clearMine() {
  store.clearLocalComments(id)
}
</script>

<template>
  <section v-if="news" aria-labelledby="news-detail-heading">
    <h2 id="news-detail-heading" class="text-2xl font-semibold">{{ news.title }}</h2>
    <div class="text-sm text-gray-500 mt-1">By {{ news.reporter }} · <time :datetime="news.reportedAt">{{ new Date(news.reportedAt).toLocaleString() }}</time></div>
    <img :src="news.imageURL" alt="news image" class="w-full max-h-80 object-cover rounded-xl border mt-3" />
    <p class="text-gray-700 mt-3">{{ news.fullDetail }}</p>

    <div class="mt-3 flex items-center gap-2 text-sm">
      <span
  class="px-2 py-0.5 rounded-full border"
  :class="
    derived === 'fake'
      ? 'bg-red-50 text-red-700 border-red-200'
      : derived === 'not-fake'
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-yellow-50 text-yellow-800 border-yellow-200'
  "
>
  {{ derived === 'fake' ? 'Fake' : derived === 'not-fake' ? 'Not Fake' : 'Equal' }}
</span>
      <span class="text-gray-500">Votes → Fake: {{ votes.fake }} · Not Fake: {{ votes.notFake }}</span>
    </div>

    <div class="mt-6 flex items-center justify-between">
      <h3 class="text-lg font-semibold">Comments</h3>
      <RouterLink :to="toVote(id)" class="text-sm text-blue-600 hover:underline">Vote / Add Comment →</RouterLink>
      
    </div>
    <button @click="clearMine" class="text-xs text-gray-600 hover:underline">Clear my local comments</button>


    <ul ref="commentsTop" class="mt-2 space-y-3">
      <li v-for="c in pagedComments" :key="c.id" class="bg-white border rounded-xl p-3">
        <div class="text-sm text-gray-500 flex items-center justify-between">
          <span>By {{ c.author }}</span>
          <time :datetime="c.createdAt">{{ new Date(c.createdAt).toLocaleString() }}</time>
        </div>
        <p class="mt-1">{{ c.text }}</p>
        <div class="mt-1 text-xs">
          <span class="px-2 py-0.5 rounded-full border" :class="c.vote==='fake' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'">{{ c.vote==='fake' ? 'Voted: Fake' : 'Voted: Not Fake' }}</span>
        </div>
        <a v-if="c.imageURL" :href="c.imageURL" target="_blank" class="mt-1 inline-block text-xs text-blue-600 hover:underline">Evidence image</a>
      </li>
    </ul>

    <Pagination :page="page" :total="totalPages" @update:page="onCommentPage" />
  </section>
  <p v-else>News not found.</p>
</template>