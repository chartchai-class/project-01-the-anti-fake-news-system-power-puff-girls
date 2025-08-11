<script setup lang="ts">

const props = defineProps<{ page: number; total: number }>()
</script>

<template>
  <div class="flex items-center justify-center gap-2 mt-4 select-none">
    <button class="px-3 py-1.5 rounded-lg border disabled:opacity-50" :disabled="props.page <= 1" @click="$emit('update:page', props.page - 1)">Prev</button>
    <span class="text-sm">Page {{ props.page }} / {{ props.total }}</span>
    <button class="px-3 py-1.5 rounded-lg border disabled:opacity-50" :disabled="props.page >= props.total" @click="$emit('update:page', props.page + 1)">Next</button>
  </div>
</template>