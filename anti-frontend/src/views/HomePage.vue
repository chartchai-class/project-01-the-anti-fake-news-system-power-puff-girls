<script setup lang="ts">
import FilterBar from '@/components/FilterBar.vue'
import Pagination from '@/components/AppPagination.vue'
import NewsCard from '@/components/NewsCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import BaseInput from '@/components/BaseInput.vue'
import { useQuerySync } from '@/utills/query'
import { onMounted, ref, nextTick, computed, watch } from 'vue'
import { NP } from '@/plugins/nprogress'
import NewsService from '@/service/NewsService'
import type { NewsItem } from '@/types'
import { normalizeStatus } from '@/utils/status'

const { route, setQuery } = useQuerySync()

// UI state
const srMsg = ref('')
const keyword = ref('')
const filter = ref<'all' | 'fake' | 'not-fake' | 'equal'>('all')
const perPage = ref<number>(6)
const perPageOptions = [3, 6, 9, 12]
const currentPage = ref(1)

// Data state
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const newsList = ref<NewsItem[]>([])

const searchModel = computed({
  get: () => keyword.value,
  set: (v: string) => {
    keyword.value = v
    currentPage.value = 1
  }
})

onMounted(() => {
  const q = route.query
  if (q.filter === 'fake' || q.filter === 'not-fake' || q.filter === 'equal' || q.filter === 'all') {
    filter.value = q.filter as any
  }
  const per = Number(q.perPage)
  if ([3, 6, 9, 12].includes(per)) perPage.value = per
  const page = Number(q.page)
  if (page > 0) currentPage.value = page

  isLoading.value = true
  NewsService.getNews()
    .then((res) => {
      newsList.value = res.data
    })
    .catch((e) => {
      loadError.value = String(e?.message || 'unknown error')
      newsList.value = []
    })
    .finally(() => {
      isLoading.value = false
    })
})

function onPageChange(v: number) {
  return NP.track(() => {
    currentPage.value = v
    setQuery({ page: v })
    return nextTick().then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  })
}

function onFilterChange(v: 'all' | 'fake' | 'not-fake' | 'equal') {
  filter.value = v
  currentPage.value = 1
  setQuery({ filter: v, page: 1 })
  NP.pulse()
}
function onPerPageChange(v: number) {
  perPage.value = v
  currentPage.value = 1
  setQuery({ perPage: v, page: 1 })
  NP.pulse()
}

// Derived data and a11y message
const filteredNews = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return newsList.value.filter((n) => {
    const matchText = !q || n.title.toLowerCase().includes(q) || n.shortDetail.toLowerCase().includes(q)
    const matchFilter = filter.value === 'all' ? true : normalizeStatus(n.status) === filter.value
    return matchText && matchFilter
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredNews.value.length / perPage.value)))
const paginatedNews = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredNews.value.slice(start, start + perPage.value)
})

watch([filteredNews, currentPage], () => {
  srMsg.value = `Showing ${paginatedNews.value.length} of ${filteredNews.value.length} results`
})

</script>

<template>
   <section aria-labelledby="news-list-heading">
    <div class="mb-4 flex flex-wrap items-start gap-3">
      <!-- Search box -->
      <div class="w-full order-1 sm:order-2 sm:w-auto sm:ml-auto">
        <BaseInput
          v-model="searchModel"
          type="text"
          label=" "
          class="w-full sm:w-64"
          placeholder="Search..."
        />
      </div>
      <!-- Filter bar -->
      <FilterBar
        :model-value="filter"
        :per-page="perPage"
        :per-page-options="perPageOptions"
        @update:filter="onFilterChange"
        @update:perPage="onPerPageChange"
        class="w-full order-2 sm:order-1 sm:w-auto sm:flex-1"
      />
    </div>
    <p class="sr-only" aria-live="polite">{{ srMsg }}</p>
    <div
      v-if="isLoading"
      class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4"
      role="status"
      aria-live="polite"
    >
      <SkeletonCard v-for="i in perPage" :key="`sk-${i}`" />
    </div>
     
    <div
      v-else-if="loadError"
      class="mt-6 p-4 border rounded-xl bg-red-50 text-red-700 flex items-center justify-between gap-3"
      role="alert"
    >
      <span>Failed to load data ({{ loadError }}). Showing fallback data.</span>
    </div>

    <div
      v-else-if="!filteredNews.length"
      class="mt-6 p-6 border rounded-2xl bg-white text-center text-gray-600"
      role="status"
    >
      No news found for this filter.
    </div>
    <TransitionGroup
      v-else
      name="list"
      tag="div"
      class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4"
      role="list"
      aria-label="Filtered news"
    >
      <div v-for="n in paginatedNews" :key="n.id" role="listitem">
        <NewsCard :news="n" />
      </div>
    </TransitionGroup>

    <Pagination
      class="mt-2"
      :page="currentPage"
      :total="totalPages"
      @update:page="onPageChange"
      aria-label="Pagination"
    />
  </section>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 220ms ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(6px) scale(0.98);
}
.list-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>
