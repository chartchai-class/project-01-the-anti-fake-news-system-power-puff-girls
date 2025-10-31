<script setup lang="ts">
import UniqueID from '@/features/UniqueID'
import ErrorMessage from '@/components/ErrorMessage.vue'
import { computed } from 'vue'

const modelValue = defineModel()

interface Props {
  placeholder?: string
  error?: string
  required?: boolean
  type: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  error: '',
  required: false,
  type: 'text'
})

const uuid = UniqueID().getID()
const isError = computed(() => {
  return props.error ? true : false
})

const placeholderErrorClass = computed(() => {
  const baseClass = 'block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6'
  
  if (isError.value) {
    return `${baseClass} text-red-700 ring-red-300 placeholder:text-red-400 focus:ring-red-600`
  } else {
    return `${baseClass} text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600`
  }
})
</script>
<template>
  <div> 
    <div class="mt-2">
      <input
        :type="type"
        :id="uuid"
        :class="placeholderErrorClass"
        :placeholder="placeholder"      
        v-bind="$attrs"
        v-model="modelValue"
        :aria-describedby="error ? `${uuid}-error` : undefined"
        :aria-invalid="error ? true : false"
      />
    
      <ErrorMessage class="inline-flex items-center space-x-1 text-sm text-red-700 mt-1" v-if="error" :id="`${uuid}-error`">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span>{{ error }}</span>
      </ErrorMessage>
    </div>
  </div>
</template>