<script setup lang="ts">
import Uploader from 'vue-media-upload'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth.ts'

interface Props {
 modelValue?: string[]
}
const props = withDefaults(defineProps<Props>(), {
 modelValue: () => []
})

const convertStringToMedia = (str: string[] | undefined): any[] => {
 if (!Array.isArray(str) || str.length === 0) {
   return []
 }
 const first = str[0]
 return first ? [{ name: first }] : []
}

const emit = defineEmits(['update:modelValue'])

const convertMediaToString = (media: any): string[] => {
 if (!media) {
   return []
 }
 const list = Array.isArray(media) ? media : [media]
 const first = list[0]
 return first && first.name ? [first.name] : []
}

const media = ref(convertStringToMedia(props.modelValue))
const uploadUrl = ref(import.meta.env.VITE_UPLOAD_URL)
const authStore = useAuthStore()

const authorizeHeader = computed(() => {
  if (authStore.token) {
    return {
      Authorization: `Bearer ${authStore.token}`
    }
  }
  return {}
})

watch(
  () => props.modelValue,
  (newValue) => {
    media.value = convertStringToMedia(newValue)
  },
  { deep: false }
)

const onChanged = (files: any) => {
  const single = convertMediaToString(files)
  media.value = convertStringToMedia(single)
  emit('update:modelValue', single)
}
</script>
<template>
  <Uploader
    :server="uploadUrl"
    @change="onChanged"
    :media="media"
    :headers="authorizeHeader" :max="1" :multiple="false" field-name="image"
  />
</template>
