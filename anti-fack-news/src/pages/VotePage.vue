<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNewsStore, type NewsStatus } from '@/stores/NewsStore'

const route = useRoute()
const router = useRouter()
const store = useNewsStore()

const id = Number(route.params.id)
const news = store.getNewsById(id)

const vote = ref<NewsStatus>('fake')
const text = ref('')
const imageURL = ref<string>('')
const author = ref('')

function submit() {
  store.addVoteAndComment(id, vote.value, text.value, imageURL.value || undefined, author.value)
  router.push({ name: 'news-detail', params: { id } })
}
</script>

<template>
  <section v-if="news">
    <h2 class="text-2xl font-semibold">Vote on: {{ news.title }}</h2>
    <form class="mt-4 space-y-4 bg-white border rounded-2xl p-4 max-w-2xl" @submit.prevent="submit">
      <div>
        <label class="block text-sm font-medium">Your vote</label>
        <div class="mt-2 flex gap-3">
          <label class="inline-flex items-center gap-1 text-sm">
            <input type="radio" value="fake" v-model="vote" /> Fake
          </label>
          <label class="inline-flex items-center gap-1 text-sm">
            <input type="radio" value="not-fake" v-model="vote" /> Not Fake
          </label>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium">Comment (why?)</label>
        <textarea v-model="text" rows="4" class="mt-2 w-full border rounded-xl p-2" placeholder="Explain your reasoning..." required></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium">Evidence image URL (optional)</label>
        <input v-model="imageURL" type="url" class="mt-2 w-full border rounded-xl p-2" placeholder="https://..." />
      </div>

      <div>
        <label class="block text-sm font-medium">Your name</label>
        <input v-model="author" type="text" class="mt-2 w-full border rounded-xl p-2" placeholder="e.g., Student A" required />
      </div>

      <div class="pt-2 flex items-center gap-3">
        <button class="px-4 py-2 rounded-xl bg-blue-600 text-white">Submit</button>
        <RouterLink :to="{ name: 'news-detail', params: { id } }" class="text-sm text-gray-600 hover:underline">Cancel</RouterLink>
      </div>
      <p class="text-xs text-gray-500">Note: This app stores new votes/comments locally in Pinia only (mock single‑page app). Reloading the page will clear them.</p>
    </form>
  </section>
  <p v-else>News not found.</p>
</template>