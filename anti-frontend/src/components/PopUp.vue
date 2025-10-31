<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'success' | 'error'

const props = withDefaults(
  defineProps<{
    visible: boolean
    title: string
    message?: string
    variant?: Variant
  }>(),
  {
    message: '',
    variant: 'success'
  }
)

const emit = defineEmits<{
  close: []
}>()

const palette = computed(() => {
  if (props.variant === 'error') {
    return {
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      title: 'text-red-700',
      message: 'text-red-600'
    }
  }
  return {
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    title: 'text-gray-900',
    message: 'text-gray-600'
  }
})

const iconPath = computed(() => {
  return props.variant === 'error'
    ? 'M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2zm3.71 12.29a1 1 0 01-1.42 1.42L12 13.41l-2.29 2.3a1 1 0 01-1.42-1.42L10.59 12l-2.3-2.29a1 1 0 011.42-1.42L12 10.59l2.29-2.3a1 1 0 011.42 1.42L13.41 12z'
    : 'M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2zm5 8.59l-5.66 5.65a1 1 0 01-1.41 0l-2.95-2.95a1 1 0 111.41-1.41l2.24 2.23 4.95-4.94a1 1 0 111.41 1.41z'
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div v-if="visible" class="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="emit('close')"></div>
      <div
        class="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
        role="alert"
        aria-live="assertive"
      >
        <div :class="['mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full', palette.iconBg]">
          <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none">
            <path :d="iconPath" :class="palette.iconColor" fill="currentColor" />
          </svg>
        </div>
        <h3 :class="['text-lg font-semibold', palette.title]">{{ title }}</h3>
        <p v-if="message" :class="['mt-1 text-sm', palette.message]">
          {{ message }}
        </p>
        <button
          type="button"
          class="mt-4 inline-flex items-center rounded-full border border-gray-200 px-4 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
          @click="emit('close')"
        >
          Close
        </button>
      </div>
    </div>
  </Transition>
</template>
