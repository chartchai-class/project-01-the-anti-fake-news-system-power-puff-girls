<script setup lang="ts">
import Uploader from 'vue-media-upload'
import { ref, withDefaults, defineProps, defineEmits } from 'vue'
interface Props {
  modelValue?: string[]
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: () => []
})
const convertStringToMedia = (arr: string[]): any[] => {
  return (arr || []).map((name: string) => ({ name }))
}
const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()
const convertMediaToString = (media: any): string[] => {
  const output: string[] = []
  if (Array.isArray(media)) {
    media.forEach((el: any) => {
      if (el && typeof el.name === 'string') output.push(el.name)
    })
  }
  return output
}
const media = ref<any[]>(convertStringToMedia(props.modelValue))
const uploadUrl = ref<string>(import.meta.env.VITE_UPLOAD_URL as string)
const onChanged = (files: any) => {
  emit('update:modelValue', convertMediaToString(files))
}
</script>
<template>
  <Uploader :server="uploadUrl" :media="media" @change="onChanged" />
  
</template>