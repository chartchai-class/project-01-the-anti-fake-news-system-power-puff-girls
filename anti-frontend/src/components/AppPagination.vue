<script setup lang="ts">

const props = defineProps<{ page: number; total: number }>()
</script>

<template>
  <nav class="mt-6 flex items-center justify-center gap-3 select-none"
       aria-label="Pagination">
    <button
      class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm
             transition-all duration-200 
             bg-gray-50
             hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-sm
             disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
      :disabled="props.page <= 1"
      @click="$emit('update:page', props.page - 1)"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="hidden sm:inline">Prev</span>
      <span class="sr-only">Previous page</span>
    </button>
    <span class="inline-flex items-center gap-2 text-sm text-gray-600">
      <span class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
        {{ props.page }}
      </span>
      <span>/ {{ props.total }}</span>
    </span>
    <button
      class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm
             transition-all duration-200 
             bg-gray-50
             hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-sm
             disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
      :disabled="props.page >= props.total"
      @click="$emit('update:page', props.page + 1)"
    >
      <span class="hidden sm:inline">Next</span>
      <span class="sr-only">Next page</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </nav>
</template>
