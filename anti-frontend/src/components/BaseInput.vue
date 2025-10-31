<script setup lang="ts">
const modelValue = defineModel() // Modern way to handle v-model
interface BaseInputProps {
  label: string
}
const props = withDefaults(defineProps<BaseInputProps>(), {
  label: ''
})
</script>
<template>
  <label v-if="label">
    {{ props.label }}
  </label>
  <input class="mb-6" v-bind="$attrs" v-model="modelValue" :placeholder="label" />
</template>

<style scoped>
/* You may want to integrate your existing styles here for a cleaner look */
.mb-6 {
  margin-bottom: 1rem; /* Adjust if 'mb-6' means something else in your Tailwind config */
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>