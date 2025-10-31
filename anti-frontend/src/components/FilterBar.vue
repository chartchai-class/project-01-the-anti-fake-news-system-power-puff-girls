<script setup lang="ts">
defineProps<{ modelValue: 'all' | 'fake' | 'not-fake' | 'equal'; perPage: number; perPageOptions: number[] }>()
const options = [
  { label: 'All', value: 'all' },
  { label: 'Fake', value: 'fake' },
  { label: 'Not Fake', value: 'not-fake' },
  { label: 'Equal', value: 'equal' },
] as const
</script>

<template>
  <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
    <div class="relative rounded-2xl bg-white p-0.5 sm:p-1 shadow-sm ring-1 ring-gray-200
              w-full sm:max-w-[25rem] overflow-hidden">
  <div
    class="absolute inset-1 rounded-xl shadow-sm will-change-transform pointer-events-none z-0
           transition-transform duration-700 ease-[cubic-bezier(.2,1.2,.3,1)]
           motion-reduce:transition-none"
    :class="modelValue === 'fake'
              ? 'bg-red-600'
              : modelValue === 'not-fake'
                ? 'bg-green-600'
                : modelValue === 'equal'
                  ? 'bg-yellow-500'
                  : 'bg-blue-600'"
    :style="{
      width: `calc((100% - 0.5rem) / ${options.length})`,
      transform: `translateX(calc(${options.findIndex(o => o.value === modelValue)} * 100%))`
    }"
    aria-hidden="true"
  ></div>
  <div class="relative flex">
    <button
      v-for="opt in options"
      :key="opt.value"
      @click="$emit('update:filter', opt.value)"
      :aria-pressed="opt.value === modelValue"
      class="relative z-10 flex-1 rounded-xl px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm whitespace-nowrap
       transition-colors duration-200 active:scale-95
       focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
       
      :class="opt.value === modelValue ? 'text-white' : 'text-gray-700 hover:bg-gray-100'"
    >
      {{ opt.label }}
    </button>
  </div>
</div>
    <label class="text-sm text-gray-700 flex items-center gap-2 whitespace-nowrap">
      Per page
      <select
        class="rounded-xl border px-2 py-1 transition-colors duration-200 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        :value="perPage"
        @change="$emit('update:perPage', Number(($event.target as HTMLSelectElement).value))"
      >
        <option v-for="n in perPageOptions" :key="n" :value="n">{{ n }}</option>
      </select>
    </label>
  </div>
</template>

