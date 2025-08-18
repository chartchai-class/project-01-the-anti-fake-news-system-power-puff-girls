<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useNewsStore } from '@/stores/NewsStore'
import Pagination from '@/components/AppPagination.vue'
import { toVote } from '@/router/routes.ts'
import type { DerivedStatus } from '@/stores/NewsStore'
import { NP } from '@/plugins/nprogress'

const route = useRoute()
const id = Number(route.params.id)

const store = useNewsStore()
const news = store.getNewsById(id)
const votes = computed(() => store.voteCountsByNews(id))

const derived = computed<DerivedStatus>(() => store.derivedStatusByNews(id))
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
  await NP.track(async () => {
    page.value = v
    await nextTick()
    commentsTop.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}
</script>
<template>
  <section v-if="news" aria-labelledby="news-detail-heading" class="bg-gradient-to-br from-blue-50 via-white to-green-50 min-h-screen px-4 py-8 rounded-2xl shadow-lg">
    <div class="mb-6 pb-4 border-b border-gray-200">
      <h2
        id="news-detail-heading"
        class="text-3xl font-bold text-gray-900 bg-gradient-to-r from-[#326771] to-[#326771] bg-clip-text text-transparent mb-2"
      >
        {{ news.title }}
      </h2>
    <div class="mt-2 text-sm text-gray-500">
      By <span class="font-medium text-gray-700">{{ news.reporter }}</span>
      <span class="mx-2">·</span>
      <time :datetime="news.reportedAt">{{ new Date(news.reportedAt).toLocaleString() }}</time>
    </div>
  </div>
    <img :src="news.imageURL" alt="news image" class="w-full max-h-80 object-cover rounded-xl border shadow-md transition-all duration-300 hover:scale-105" />
    <p class="text-gray-700 mt-4 mb-2">{{ news.fullDetail }}</p>

    <div class="mt-3 flex items-center gap-2 text-sm">
      <span
        class="px-2 py-0.5 rounded-full border font-semibold shadow"
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
      <span class="text-gray-500">
        Votes →
        <span class="font-bold text-red-500">Fake: {{ votes.fake }}</span>
        ·
        <span class="font-bold text-green-500">Not Fake: {{ votes.notFake }}</span>
      </span>
    </div>

    <div class="mt-8 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-800">Comments</h3>
      <RouterLink
        :to="toVote(id)"
class="inline-block px-4 py-2 rounded-xl border bg-gradient-to-r from-blue-500 to-green-400 text-white shadow-lg hover:scale-110 hover:from-blue-600 hover:to-green-500 transition-all text-sm"
>

        Vote / Add Comment →
      </RouterLink>
    </div>

    <ul ref="commentsTop" class="mt-4 space-y-4">
 <li
  v-for="c in pagedComments"
  :key="c.id"
  class="bg-white border rounded-xl p-4 shadow transition-all duration-200
         hover:shadow-2xl hover:scale-105 hover:border-[#326771] hover:bg--50"
>
  <div class="text-sm text-gray-500 flex items-center justify-between">
    <span>By {{ c.author }}</span>
    <time :datetime="c.createdAt">{{ new Date(c.createdAt).toLocaleString() }}</time>
  </div>
  <p class="mt-2 text-gray-700">{{ c.text }}</p>
  <div class="mt-2 text-xs">
    <span
      class="px-2 py-0.5 rounded-full border font-semibold"
      :class="c.vote==='fake' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'"
    >
      {{ c.vote==='fake' ? 'Voted: Fake' : 'Voted: Not Fake' }}
    </span>
  </div>
  <a
    v-if="c.imageURL"
    :href="c.imageURL"
    target="_blank"
    class="mt-2 inline-block text-xs text-blue-600 hover:underline hover:text-blue-800"
  >
    Evidence image
  </a>
</li>
    </ul>

    <Pagination class="mt-8" :page="page" :total="totalPages" @update:page="onCommentPage" />
  </section>
  <p v-else class="text-center py-12 text-gray-500">News not found.</p>
</template>
