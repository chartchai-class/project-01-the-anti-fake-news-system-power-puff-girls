<script setup lang="ts">
import { computed } from 'vue'
import { useField } from 'vee-validate'
import UniqueID from '@/features/UniqueID'
import ErrorMessage from '@/components/ErrorMessage.vue'

interface Props {
  name: string
  type?: string
  placeholder?: string
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  required: false
})

const idSeed = UniqueID().getID()
const controlId = computed(() => `${props.name || idSeed}-input`)
const errorId = computed(() => `${controlId.value}-error`)

const { value, errorMessage, handleBlur, handleChange, meta } = useField<string>(() => props.name, undefined, {
  validateOnValueUpdate: true
})

const hasError = computed(() => !!errorMessage.value && (meta.touched || meta.dirty))

const inputClasses = computed(() => {
  const base = 'block w-full rounded-md border-0 py-2 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 transition-colors'
  if (hasError.value) {
    return `${base} text-red-700 ring-red-300 placeholder:text-red-400 focus:ring-red-600 bg-red-50`
  }
  return `${base} text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-indigo-600 bg-white`
})
</script>

<template>
  <div class="mt-2">
    <input
      :id="controlId"
      v-model="value"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      :class="inputClasses"
      :aria-invalid="hasError"
      :aria-describedby="hasError ? errorId : undefined"
      @blur="handleBlur"
      @input="handleChange"
      v-bind="$attrs"
    />
    <ErrorMessage
      v-if="hasError && errorMessage"
      :id="errorId"
      class="mt-1 inline-flex items-center space-x-1 text-sm text-red-700"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      <span>{{ errorMessage }}</span>
    </ErrorMessage>
  </div>
</template>
