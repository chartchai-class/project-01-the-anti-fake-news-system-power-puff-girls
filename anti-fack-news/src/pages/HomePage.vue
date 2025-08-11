<script setup lang="ts">
import { useNewsStore } from '@/stores/NewsStore'
import FilterBar from '@/components/FilterBar.vue'
import Pagination from '@/components/AppPagination.vue'
import NewsCard from '@/components/NewsCard.vue'

const store = useNewsStore()
</script>

<template>
  <section>
    <FilterBar
      :model-value="store.filter"
      :per-page="store.perPage"
      :per-page-options="store.perPageOptions"
      @update:filter="store.setFilter($event)"
      @update:perPage="store.setPerPage($event)"
    />

    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      <NewsCard v-for="n in store.paginatedNews" :key="n.id" :news="n" />
    </div>

    <Pagination class="mt-2" :page="store.currentPage" :total="store.totalPages" @update:page="store.setPage($event)" />
  </section>
</template>