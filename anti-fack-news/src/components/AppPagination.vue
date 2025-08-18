<script setup lang="ts">

const props = defineProps<{ page: number; total: number }>()
</script>

<template>
  <nav class="mt-6 flex items-center justify-center gap-3 select-none"
       aria-label="Pagination">
    <!-- Prev -->
    <button
      class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm
             transition-all duration-200 transform-gpu
             hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-sm
             active:translate-y-0 active:scale-95
             focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40
             disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
      :disabled="props.page <= 1"
      @click="$emit('update:page', props.page - 1)"
    >
      <!-- Left -->
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="hidden sm:inline">Prev</span>
      <span class="sr-only">Previous page</span>
    </button>

    <!-- Indicator -->
    <span class="inline-flex items-center gap-2 text-sm text-gray-600">
      <span class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
        {{ props.page }}
      </span>
      <span>/ {{ props.total }}</span>
    </span>

    <!-- Next -->
    <button
      class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm
             transition-all duration-200 transform-gpu
             hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-sm
             active:translate-y-0 active:scale-95
             focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40
             disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
      :disabled="props.page >= props.total"
      @click="$emit('update:page', props.page + 1)"
    >
      <span class="hidden sm:inline">Next</span>
      <span class="sr-only">Next page</span>
      <!-- Right -->
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </nav>
</template>
