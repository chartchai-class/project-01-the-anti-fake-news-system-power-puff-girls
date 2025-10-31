<script setup lang="ts">
const modelValue = defineModel() 
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
.mb-6 {
  margin-bottom: 1rem;
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