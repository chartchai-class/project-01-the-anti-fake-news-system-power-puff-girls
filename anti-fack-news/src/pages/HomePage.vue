<script setup lang="ts">
import { useNewsStore } from '@/stores/NewsStore'
import FilterBar from '@/components/FilterBar.vue'
import Pagination from '@/components/AppPagination.vue'
import NewsCard from '@/components/NewsCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import { useQuerySync } from '@/utills/query'
import { watch, onMounted } from 'vue'
import { nextTick } from 'vue'
import { NP } from '@/plugins/nprogress'

const store = useNewsStore()
const { route, setQuery } = useQuerySync()

onMounted(() => {
  const q = route.query
  if (q.filter === 'fake' || q.filter === 'not-fake' || q.filter === 'equal' || q.filter === 'all') {
    store.setFilter(q.filter as 'all' | 'fake' | 'not-fake' | 'equal')
  }
  const per = Number(q.perPage)
  if ([5,10,15].includes(per)) store.setPerPage(per)
  const page = Number(q.page)
  if (page > 0) store.setPage(page)
})

watch(() => store.filter, v => setQuery({ filter: v }))
watch(() => store.perPage, v => setQuery({ perPage: v, page: 1 }))
watch(() => store.currentPage, v => setQuery({ page: v }))

async function onPageChange(v: number) {
  await NP.track(async () => {
    store.setPage(v)
    await nextTick()        
  })
}
function onFilterChange(v: 'all' | 'fake' | 'not-fake' | 'equal') {
  
  store.setFilter(v)
  NP.pulse()
}
function onPerPageChange(v: number) {
  store.setPerPage(v)
  NP.pulse()
}
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
    

    <div v-if="store.isLoading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4" role="status" aria-live="polite">
      <SkeletonCard v-for="i in 5" :key="i" />
    </div>

    <div v-else-if="store.loadError" class="mt-6 p-4 border rounded-xl bg-red-50 text-red-700">
      Failed to load data ({{ store.loadError }}). Showing fallback data.
    </div>

    <div v-else-if="!store.filteredNews.length" class="mt-6 p-6 border rounded-2xl bg-white text-center text-gray-600">
      No news found for this filter.
    </div>

    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      <NewsCard v-for="n in store.paginatedNews" :key="n.id" :news="n" />
    </div>

    <Pagination class="mt-2" :page="store.currentPage" :total="store.totalPages" @update:page="onPageChange" />
    
  </section>
</template>