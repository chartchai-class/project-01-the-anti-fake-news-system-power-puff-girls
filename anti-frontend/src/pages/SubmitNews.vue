<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNewsStore, type NewsStatus } from '@/stores/NewsStore'
import { NP } from '@/plugins/nprogress'

const store = useNewsStore()
const router = useRouter()

const title = ref('')
const shortDetail = ref('')
const fullDetail = ref('')
const reporter = ref('')
const imageURL = ref('')
const status = ref<NewsStatus>('not-fake')

async function submit() {
  await NP.track(async () => {
    store.addNews({ title: title.value, shortDetail: shortDetail.value, fullDetail: fullDetail.value, reporter: reporter.value, imageURL: imageURL.value, status: status.value })
    await router.push({ name: 'home' })
  })
}
</script>

<template>
  <section class="max-w-2xl">
    <h2 class="text-2xl font-semibold">Submit News</h2>
    <p class="text-sm text-gray-600 mt-1">
      Add a news item so others can view, vote, and comment.
    </p>

    <form class="mt-4 space-y-4 bg-white border rounded-2xl p-4" @submit.prevent="submit">
      <div>
        <label class="block text-sm font-medium">Title</label>
        <input v-model="title" type="text" required class="mt-2 w-full border rounded-xl p-2" />
      </div>

      <div>
        <label class="block text-sm font-medium">Short detail</label>
        <textarea v-model="shortDetail" rows="2" required class="mt-2 w-full border rounded-xl p-2" />
      </div>

      <div>
        <label class="block text-sm font-medium">Full detail</label>
        <textarea v-model="fullDetail" rows="6" required class="mt-2 w-full border rounded-xl p-2" />
      </div>

      <div>
        <label class="block text-sm font-medium">Reporter</label>
        <input v-model="reporter" type="text" required class="mt-2 w-full border rounded-xl p-2" />
      </div>

      <div>
        <label class="block text-sm font-medium">Image URL (optional)</label>
        <input v-model="imageURL" type="url" placeholder="https://..." class="mt-2 w-full border rounded-xl p-2" />
      </div>

      <div class="pt-2 flex items-center gap-3">
        <button class="px-4 py-2 rounded-xl bg-blue-600 text-white">Add News</button>
        <RouterLink :to="{ name: 'home' }" class="text-sm text-gray-600 hover:underline">Cancel</RouterLink>
      </div>
    </form>
  </section>
</template>


