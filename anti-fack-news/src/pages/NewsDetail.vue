<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useNewsStore } from '@/stores/NewsStore'
import Pagination from '@/components/AppPagination.vue'
import { toVote } from '@/router/routes.ts'

type Params = { id: string }
const route = useRoute()
const { id: idStr } = route.params as Params
const id = Number(idStr)

const store = useNewsStore()
const news = store.getNewsById(id)
const votes = store.voteCountsByNews(id)

const page = ref(1)
const perPage = 6
const all = computed(() => store.commentsByNews(id))
const totalPages = computed(() => Math.max(1, Math.ceil(all.value.length / perPage)))
const pagedComments = computed(() => {
  const start = (page.value - 1) * perPage
  return all.value.slice(start, start + perPage)
})
</script>

<template>
  <section v-if="news">
    <div class="flex flex-col gap-3">
      <h2 class="text-2xl font-semibold">{{ news.title }}</h2>
      <div class="text-sm text-gray-500">By {{ news.reporter }} · <time :datetime="news.reportedAt">{{ new Date(news.reportedAt).toLocaleString() }}</time></div>
      <img :src="news.imageURL" alt="image" class="w-full max-h-80 object-cover rounded-xl border" />
      <p class="text-gray-700">{{ news.fullDetail }}</p>
      <div class="flex items-center gap-2 text-sm">
        <span class="px-2 py-0.5 rounded-full border" :class="news.status==='fake' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'">{{ news.status==='fake' ? 'Fake' : 'Not Fake' }}</span>
        <span class="text-gray-500">Votes → Fake: {{ votes.fake }} · Not Fake: {{ votes.notFake }}</span>
      </div>
    </div>

    <div class="mt-6 flex items-center justify-between">
      <h3 class="text-lg font-semibold">Comments</h3>
      <!-- Type-safe RouterLink to vote page -->
      <RouterLink :to="toVote(id)" class="text-sm text-blue-600 hover:underline">Vote / Add Comment →</RouterLink>
    </div>

    <ul class="mt-2 space-y-3">
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

    <Pagination :page="page" :total="totalPages" @update:page="page = $event" />
  </section>
  <p v-else>News not found.</p>
</template>