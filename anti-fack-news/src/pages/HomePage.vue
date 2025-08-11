<script setup lang="ts">
import { useNewsStore } from '@/stores/NewsStore'
import FilterBar from '@/components/FilterBar.vue'
import Pagination from '@/components/AppPagination.vue'
import NewsCard from '@/components/NewsCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import { useQuerySync } from '@/utills/query'
import { watch, onMounted } from 'vue'

const store = useNewsStore()
const { route, setQuery } = useQuerySync()

// Sync from URL on first mount
onMounted(() => {
  const q = route.query
  if (q.filter === 'fake' || q.filter === 'not-fake' || q.filter === 'all') {
    store.setFilter(q.filter as any)
  }
  const per = Number(q.perPage)
  if ([5,10,15].includes(per)) store.setPerPage(per)
  const page = Number(q.page)
  if (page > 0) store.setPage(page)
})

// Push to URL when state changes
watch(() => store.filter, v => setQuery({ filter: v }))
watch(() => store.perPage, v => setQuery({ perPage: v, page: 1 }))
watch(() => store.currentPage, v => setQuery({ page: v }))

function onFilterChange(v: 'all' | 'fake' | 'not-fake') { store.setFilter(v) }
function onPerPageChange(v: number) { store.setPerPage(v) }
function onPageChange(v: number) { store.setPage(v) }
</script>

<template>
  <section aria-labelledby="news-list-heading">
    <h2 id="news-list-heading" class="sr-only">News list</h2>

    <FilterBar
      :model-value="store.filter"
      :per-page="store.perPage"
      :per-page-options="store.perPageOptions"
      @update:filter="onFilterChange"
      @update:perPage="onPerPageChange"
    />

    <!-- Loading state -->
    <div v-if="store.isLoading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4" role="status" aria-live="polite">
      <SkeletonCard v-for="i in 6" :key="i" />
    </div>

    <!-- Error state -->
    <div v-else-if="store.loadError" class="mt-6 p-4 border rounded-xl bg-red-50 text-red-700">
      Failed to load data ({{ store.loadError }}). Showing fallback data.
    </div>

    <!-- Empty state -->
    <div v-else-if="!store.filteredNews.length" class="mt-6 p-6 border rounded-2xl bg-white text-center text-gray-600">
      No news found for this filter.
    </div>

    <!-- List -->
    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      <NewsCard v-for="n in store.paginatedNews" :key="n.id" :news="n" />
    </div>

    <Pagination class="mt-2" :page="store.currentPage" :total="store.totalPages" @update:page="onPageChange" />
  </section>
</template>