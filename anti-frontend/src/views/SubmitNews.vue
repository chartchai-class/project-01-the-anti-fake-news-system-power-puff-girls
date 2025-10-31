<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { NewsItem } from '@/types'
import NewsService from '@/service/NewsService'
import ImageUpload from '@/components/ImageUpload.vue'

const news = ref<NewsItem>({
  id: 0,
  title: '',
  shortDetail: '',
  fullDetail: '',
  reporter: '',
  imageURL: '',
  images: [],
  reportedAt: new Date().toISOString(),
  status: 'equal',
  ownComments: []
})

const router = useRouter()
const ImageUrl = computed({
  get() {
    return news.value.imageURL ? [news.value.imageURL] : [];
  },
  set(newValue: string[]) {
  
    news.value.imageURL = newValue.length > 0 ? newValue[0] : '';
  }
});

// popup state
 const isLoading = ref(false)
  const showPopup = ref(false)
function submit() {
 
    isLoading.value = true
    NewsService.saveNews(news.value) 
        .then((response) => {
            router.push({ name: 'news-detail-view', params: { id: response.data.id } })
        })
        .catch(() => {
            router.push({ name: 'network-error-view' })
        })
          isLoading.value = false
  showPopup.value = true
  setTimeout(() => {
    showPopup.value = false
    router.push({ name: 'home' })
  }, 3000)
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
        Your news matters. Let’s fact-check, vote, and discuss.
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
      placeholder="Write a clear, specific headline…"
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
      placeholder="A quick summary (what/when/where)…"
      class="mt-2 w-full border rounded-xl p-2 placeholder:text-gray-400
             focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
    />
    <p class="mt-1 text-xs text-gray-500">Tip: Keep it concise (1–2 sentences).</p>
  </div>

  <!-- Full detail -->
  <div>
    <label class="block text-sm font-medium">Full detail</label>
    <textarea
      v-model="news.fullDetail"
      rows="6"
      required
      placeholder="Provide evidence, links, sources, and context…"
      class="mt-2 w-full border rounded-xl p-2 placeholder:text-gray-400
             focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
    />
    <p class="mt-1 text-xs text-gray-500">
      Tip: Add 2–3 verification points with links or screenshots.
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
      <ImageUpload v-model="ImageUrl" />
    </div>
    <p class="mt-2 text-xs text-gray-500">Or paste an image URL manually:</p>   
     <input
      v-model="news.imageURL"
      type="url"
      placeholder="https://example.com/image.png"
      class="mt-2 w-full border rounded-xl p-2 placeholder:text-gray-400
             focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
    />
  </div>

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
      Processing…
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
