<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { CreateNewsPayload } from '@/types'
import NewsService from '@/service/NewsService'
import ImageUpload from '@/components/ImageUpload.vue'
import { toNewsDetail } from '@/router/routes'


const news = reactive<CreateNewsPayload>({
  title: '',
  shortDetail: '',
  fullDetail: '',
  reporter: '',
  imageURL: '',
  reportedAt: new Date().toISOString(),
  status: 'equal'
})

const router = useRouter()
const imageModel = computed({
  get: () => (news.imageURL ? [news.imageURL] : []),
  set: (newValue: string[]) => {
    news.imageURL = newValue.length > 0 ? newValue[0] : ''
  }
})

const isLoading = ref(false)
const showPopup = ref(false)
const submitError = ref<string | null>(null)

async function submit() {
  if (isLoading.value) return
  isLoading.value = true
  submitError.value = null

  const reportedAt = new Date().toISOString()
  news.reportedAt = reportedAt

  const payload: CreateNewsPayload = {
    ...news,
    status: 'equal',
    reportedAt,
    imageURL: news.imageURL?.trim() ?? ''
  }

  try {
    const { data } = await NewsService.saveNews(payload)
    showPopup.value = true
    setTimeout(() => {
      showPopup.value = false
      router.push(toNewsDetail(data.id))
    }, 1200)
  } catch (error) {
    submitError.value = 'Unable to submit news right now. Please try again.'
  } finally {
    isLoading.value = false
  }
}

</script>

<template>
  <section class="flex items-center justify-center min-h-screen px-4">
    <div class="w-full max-w-2xl">
      <!-- Heading -->
      <h2 class="text-3xl font-extrabold text-center
                 bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
        Submit News/Article
      </h2>
      <p class="text-sm text-gray-600 mt-1 text-center">
        Your news matters. Letโ€s fact-check, vote, and discuss.
      </p>
<form
  class="mt-6 space-y-4 bg-white border rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
  @submit.prevent="submit"
>
  <!-- Title -->
  <div>
    <label class="block text-sm font-medium">Title</label>
    <input
      v-model="news.title"
      type="text"
      required
      placeholder="Write a clear, specific headlineโ€ฆ"
      class="mt-2 w-full border rounded-xl p-2 placeholder:text-gray-400
             focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
    />
    <p class="mt-1 text-xs text-gray-500">Tip: Make it specific and neutral.</p>
  </div>

  <!-- Short detail -->
  <div>
    <label class="block text-sm font-medium">Short detail</label>
    <textarea
      v-model="news.shortDetail"
      rows="2"
      required
      placeholder="A quick summary (what/when/where)โ€ฆ"
      class="mt-2 w-full border rounded-xl p-2 placeholder:text-gray-400
             focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
    />
    <p class="mt-1 text-xs text-gray-500">Tip: Keep it concise (1โ€“2 sentences).</p>
  </div>

  <!-- Full detail -->
  <div>
    <label class="block text-sm font-medium">Full detail</label>
    <textarea
      v-model="news.fullDetail"
      rows="6"
      required
      placeholder="Provide evidence, links, sources, and contextโ€ฆ"
      class="mt-2 w-full border rounded-xl p-2 placeholder:text-gray-400
             focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
    />
    <p class="mt-1 text-xs text-gray-500">
      Tip: Add 2โ€“3 verification points with links or screenshots.
    </p>
  </div>

  <!-- Reporter -->
  <div>
    <label class="block text-sm font-medium">Reporter</label>
    <input
      v-model="news.reporter"
      type="text"
      required
      placeholder="Your name or source"
      class="mt-2 w-full border rounded-xl p-2 placeholder:text-gray-400
             focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
    />
    <p class="mt-1 text-xs text-gray-500">Tip: Use a consistent display name.</p>
  </div>

  <!-- Image -->
  <div>
<label class="block text-sm font-medium">Upload Image (optional)</label>
    <div class="mt-2">
      <ImageUpload v-model="imageModel" />
    </div>
  </div>

  <p v-if="submitError" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
    {{ submitError }}
  </p>

  <!-- Actions -->
<div class="pt-2 flex items-center gap-3 justify-center">
  <button
    :disabled="isLoading"
    class="px-5 py-2 rounded-xl text-white font-semibold shadow
           bg-gradient-to-r from-blue-600 to-green-500
           hover:from-blue-700 hover:to-green-600
           hover:scale-105 transition-transform
           disabled:opacity-60 disabled:cursor-not-allowed"
  >
    <span v-if="!isLoading">Submit</span>
    <span v-else class="inline-flex items-center gap-2">
      <!-- spinner -->
      <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
      </svg>
      Processingโ€ฆ
    </span>
  </button>
  <RouterLink
    :to="{ name: 'home' }"
    class="text-sm text-gray-600 hover:text-red-600 hover:underline transition"
  >
    Cancel
  </RouterLink>
</div>

<!-- Success Popup -->
<Transition
  enter-active-class="transition duration-200 ease-out"
  enter-from-class="opacity-0 scale-95"
  enter-to-class="opacity-100 scale-100"
  leave-active-class="transition duration-150 ease-in"
  leave-from-class="opacity-100 scale-100"
  leave-to-class="opacity-0 scale-95"
>
  <div v-if="showPopup" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
    <div class="relative mx-4 w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
      <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
        <svg class="w-7 h-7 text-green-600" viewBox="0 0 24 24" fill="none">
          <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900">Submitted!</h3>
      <p class="mt-1 text-sm text-gray-600">Thanks for contributing. Redirecting...</p>
    </div>
  </div>
</Transition>
</form>
    </div>
  </section>
</template>



