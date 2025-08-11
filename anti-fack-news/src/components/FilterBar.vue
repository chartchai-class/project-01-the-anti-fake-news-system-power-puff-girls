<script setup lang="ts">
defineProps<{ modelValue: 'all' | 'fake' | 'not-fake'; perPage: number; perPageOptions: number[] }>();
const options = [
  { label: 'All', value: 'all' },
  { label: 'Fake', value: 'fake' },
  { label: 'Not Fake', value: 'not-fake' },
] as const
</script>

<template>
  <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
    <div class="inline-flex rounded-xl border overflow-hidden">
      <button
        v-for="opt in options"
        :key="opt.value"
        @click="$emit('update:filter', opt.value)"
        class="px-3 py-2 text-sm hover:bg-gray-50"
        :class="opt.value === modelValue ? 'bg-gray-100 font-medium' : ''"
      >
        {{ opt.label }}
      </button>
    </div>

    <label class="text-sm text-gray-600">Per page
      <select class="ml-2 border rounded-lg px-2 py-1" :value="perPage" @change="$emit('update:perPage', Number(($event.target as HTMLSelectElement).value))">
        <option v-for="n in perPageOptions" :key="n" :value="n">{{ n }}</option>
      </select>
    </label>
  </div>
</template>