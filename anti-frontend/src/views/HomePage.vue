<script setup lang="ts">
import { useNewsStore } from '@/stores/NewsStore'
import FilterBar from '@/components/FilterBar.vue'
import Pagination from '@/components/AppPagination.vue'
import NewsCard from '@/components/NewsCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import BaseInput from '@/components/BaseInput.vue'
import { useQuerySync } from '@/utills/query'
import { onMounted, ref, nextTick, computed } from 'vue'
import { NP } from '@/plugins/nprogress'

const store = useNewsStore()
const { route } = useQuerySync()
const searchModel = computed({
  get: () => store.keyword,
  set: (v: string) => store.setKeyword(v)
})

const srMsg = ref('')

onMounted(() => {
  const q = route.query
  if (q.filter === 'fake' || q.filter === 'not-fake' || q.filter === 'equal' || q.filter === 'all') {
    store.setFilter(q.filter as 'all' | 'fake' | 'not-fake' | 'equal')
  }
  const per = Number(q.perPage)
  if ([5, 10, 15].includes(per)) store.setPerPage(per)
  const page = Number(q.page)
  if (page > 0) store.setPage(page)

})

function onPageChange(v: number) {
  return NP.track(() => {
    store.setPage(v)
    return nextTick().then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
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
        :model-value="store.filter"
        :per-page="store.perPage"
        :per-page-options="store.perPageOptions"
        @update:filter="onFilterChange"
        @update:perPage="onPerPageChange"
        class="w-full order-2 sm:order-1 sm:w-auto sm:flex-1"
      />
    </div>
    <p class="sr-only" aria-live="polite">{{ srMsg }}</p>
    <div
      v-if="store.isLoading"
      class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4"
      role="status"
      aria-live="polite"
    >
      <SkeletonCard v-for="i in store.perPage" :key="`sk-${i}`" />
    </div>
     
    <div
      v-else-if="store.loadError"
      class="mt-6 p-4 border rounded-xl bg-red-50 text-red-700 flex items-center justify-between gap-3"
      role="alert"
    >
      <span>Failed to load data ({{ store.loadError }}). Showing fallback data.</span>
    </div>

    <div
      v-else-if="!store.filteredNews.length"
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
      <div v-for="n in store.paginatedNews" :key="n.id" role="listitem">
        <NewsCard :news="n" />
      </div>
    </TransitionGroup>

    <Pagination
      class="mt-2"
      :page="store.currentPage"
      :total="store.totalPages"
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
