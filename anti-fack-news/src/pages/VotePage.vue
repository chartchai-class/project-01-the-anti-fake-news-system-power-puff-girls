<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNewsStore, type NewsStatus } from '@/stores/NewsStore'
import { NP } from '@/plugins/nprogress'

const route = useRoute()
const router = useRouter()
const store = useNewsStore()

const id = Number(route.params.id)
const news = store.getNewsById(id)

const vote = ref<NewsStatus>('fake')
const text = ref('')
const imageURL = ref<string>('')
const author = ref('')

const isLoading = ref(false)
const showPopup = ref(false)

const votes = computed(() => store.voteCountsByNews(id))
const derived = computed(() => store.derivedStatusByNews(id))

async function submit() {
  isLoading.value = true
  await NP.track(async () => {
    store.addVoteAndComment(
      id,
      vote.value as NewsStatus,
      text.value,
      imageURL.value || undefined,
      author.value
    )
  })

  isLoading.value = false
  showPopup.value = true

    setTimeout(async () => {
    showPopup.value = false
    await router.push({ name: 'news-detail', params: { id } })
  }, 1200)
}
</script>

<template>
 <section v-if="news" aria-labelledby="news-detail-heading" class="bg-gradient-to-br from-blue-50 via-white to-green-50 min-h-screen px-4 py-8 rounded-2xl shadow-lg">
    <div class="mb-6 pb-4 border-b border-gray-200">
      <h2
        id="news-detail-heading"
        class="text-3xl font-bold text-gray-900 bg-gradient-to-r from-[#326771] to-[#326771] bg-clip-text text-transparent mb-2"
      >
        {{ news.title }}
      </h2>
    <div class="mt-2 text-sm text-gray-500">
      By <span class="font-medium text-gray-700">{{ news.reporter }}</span>
      <span class="mx-2">·</span>
      <time :datetime="news.reportedAt">{{ new Date(news.reportedAt).toLocaleString() }}</time>
    </div>
  </div>
    <img :src="news.imageURL" alt="news image" class="w-full max-h-80 object-cover rounded-xl border shadow-md transition-all duration-300 hover:scale-105" />
    <p class="text-gray-700 mt-4 mb-2">{{ news.fullDetail }}</p>


<!-- แทนที่บล็อกสองอันนี้ทั้งหมด -->
<!--
<div class="mt-3 flex items-center gap-2 text-sm">...</div>
<RouterLink ...>View full article →</RouterLink>
-->

<div class="mt-3 flex flex-wrap items-center gap-3 text-sm">
  <span
    class="px-2 py-0.5 rounded-full border font-semibold shadow"
    :class="
      derived === 'fake'
        ? 'bg-red-50 text-red-700 border-red-200'
        : derived === 'not-fake'
        ? 'bg-green-50 text-green-700 border-green-200'
        : 'bg-yellow-50 text-yellow-800 border-yellow-200'
    "
  >
    {{ derived === 'fake' ? 'Fake' : derived === 'not-fake' ? 'Not Fake' : 'Equal' }}
  </span>

  <span class="text-gray-500">
    Votes →
    <span class="font-bold text-red-500">Fake: {{ votes.fake }}</span>
    ·
    <span class="font-bold text-green-500">Not Fake: {{ votes.notFake }}</span>
  </span>

  <!-- ดันลิงก์ไปชิดขวา -->
  <RouterLink
    :to="{ name: 'news-detail', params: { id } }"
    class="ml-auto text-blue-600 hover:text-blue-800 hover:underline"
  >
    View full article →
  </RouterLink>
</div>


<!-- Card intro message -->
<div class="mt-4 mb-4 rounded-xl px-4 py-3 bg-blue-50 text-blue-800 text-sm">
  Help verify the accuracy of this news by voting and providing reliable evidence
  (links, images, or sources). Please keep your comments respectful
  and explain your reasoning clearly.
</div>


    <!-- Card form -->
    <form
      class="mt-6 space-y-4 rounded-2xl p-6
             bg-gradient-to-br from-white via-white/90 to-slate-50
             ring-1 ring-black/5
             shadow-[0_12px_32px_-8px_rgba(0,0,0,0.3)]
             hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.35)]
             transition-shadow"
      @submit.prevent="submit"
    >
      <label class="block text-sm font-medium" for="comment">Choose Your Verdict</label>
      <!-- Vote -->
      <div class="mt-2 flex gap-3">
      <!-- Fake -->
<label
  class="cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-2xl border text-sm
         transition-all font-semibold
         hover:shadow-md hover:-translate-y-[1px]"
  :class="vote==='fake'
    ? 'bg-red-600 text-white border-red-600 shadow'
    : 'bg-red-50 text-gray-800 border-red-200'"
>
  <input type="radio" value="fake" v-model="vote" class="hidden" />
  <span
    class="material-symbols-outlined text-[18px] leading-none transition-opacity"
    :class="vote==='fake' ? 'opacity-100' : 'opacity-80 text-red-700'"
  >
    thumb_down
  </span>
  Fake
</label>


        <!-- Not Fake -->
        <label
          class="cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-2xl border text-sm
                 transition-all font-semibold
                 hover:shadow-md hover:-translate-y-[1px]"
          :class="vote==='not-fake'
            ? 'bg-green-600 text-white border-green-600 shadow'
            : 'bg-green-50 text-gray-800 border-green-200'"
        >
          <input type="radio" value="not-fake" v-model="vote" class="hidden" />
          <span
            class="material-symbols-outlined text-[18px] leading-none
                   transition-opacity"
            :class="vote==='not-fake' ? 'opacity-100' : 'opacity-80 text-emerald-700'"
          >thumb_up</span>
          Not Fake
        </label>
      </div>

<!-- Comment -->
<div>
  <label class="block text-sm font-medium" for="comment">Why do you think so?</label>
  <textarea
    id="comment"
    v-model="text"
    rows="4"
    required
    aria-describedby="comment-hint"
    placeholder="Explain your reasoning (what evidence, why you think so, any links)…"
    class="mt-2 w-full border rounded-xl p-2 placeholder:text-gray-400
           focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
  ></textarea>

  <!-- Hint / helper text -->
  <p id="comment-hint" class="mt-1 text-xs text-gray-500">
    Be respectful and specific. Aim for 1–2 sentences. Include links, screenshots, or sources if possible.
  </p>
</div>


      <!-- Evidence URL -->
      <div>
        <label class="block text-sm font-medium">Evidence image URL (optional)</label>
        <input
          v-model="imageURL"
          type="url"
          placeholder="https://..."
          class="mt-2 w-full border rounded-xl p-2 placeholder:text-gray-400
                 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
        />
      </div>

      <!-- Author -->
      <div>
        <label class="block text-sm font-medium">Display Name</label>
        <input
          v-model="author"
          type="text"
          required
          placeholder="e.g., Student A"
          class="mt-2 w-full border rounded-xl p-2 placeholder:text-gray-400
                 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
        />
      </div>

      <!-- Actions -->
<div class="pt-2 flex items-center gap-3">
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
    :to="{ name: 'news-detail', params: { id } }"
    class="text-sm text-gray-600 hover:text-red-600 hover:underline transition"
  >
    Cancel
  </RouterLink>
</div>

      <p class="text-xs text-gray-500">
        Note: This app stores new votes/comments locally in Pinia only (mock single-page app). Reloading the page will clear them.
      </p>
    </form>

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
      <h3 class="text-lg font-semibold text-gray-900">Vote submitted!</h3>
      <p class="mt-1 text-sm text-gray-600">Thanks for contributing.</p>
    </div>
  </div>
</Transition>

  </section>

  <p v-else class="px-4 py-8 text-center text-gray-600">News not found.</p>
</template>
