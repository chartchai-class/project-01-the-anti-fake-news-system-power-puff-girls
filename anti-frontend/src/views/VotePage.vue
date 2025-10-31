<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import * as yup from 'yup'
import { useForm, useField } from 'vee-validate'
import type { CommentItem, NewsItem } from '@/types'
import CommentService from '@/service/CommentService'
import NewsService from '@/service/NewsService'
import ImageUpload from '@/components/ImageUpload.vue'
import InputText from '@/components/InputText.vue'
import StatusPopup from '@/components/PopUp.vue'
import { normalizeStatus } from '@/utils/status'
import NewsStatusBadge from '@/components/NewsStatusBadge.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const id = Number(route.params.id)

const news = ref<NewsItem | null>(null)

onMounted(() => {
  if (!Number.isNaN(id)) {
    NewsService.getNewsById(id)
      .then((res) => {
        news.value = res.data
      })
      .catch(() => {
        news.value = null
      })
  }
})

const validationSchema = yup.object({
  vote: yup.string().oneOf(['fake', 'not-fake']).required('Please choose a vote.'),
  text: yup.string().trim().required('Please explain your reasoning.'),
  author: yup.string().trim().required('Display name is required.'),
  imageURL: yup.string().nullable()
})

const authStore = useAuthStore()
const currentUsername = computed(() => authStore.user?.username ?? '')

const { handleSubmit, setFieldValue, values } = useForm({
  validationSchema,
  initialValues: {
    vote: 'fake',
    text: '',
    author: '',
    imageURL: ''
  }
})

const {
  value: vote,
  errorMessage: voteError,
  meta: voteMeta
} = useField<'fake' | 'not-fake'>('vote')

const {
  value: text,
  errorMessage: textError,
  handleBlur: handleTextBlur,
  meta: textMeta
} = useField<string>('text')

const imageModel = computed<string[]>({
  get: () => (values.imageURL ? [values.imageURL] : []),
  set: (newValue) => {
    setFieldValue('imageURL', newValue.length > 0 ? newValue[0] : '')
  }
})

setFieldValue('author', currentUsername.value, false)
watch(currentUsername, (value) => {
  setFieldValue('author', value, false)
})

const hasVoteError = computed(() => !!voteError.value && (voteMeta.touched || voteMeta.dirty))
const hasTextError = computed(() => !!textError.value && (textMeta.touched || textMeta.dirty))

const textClasses = computed(() => {
  const base =
    'mt-2 w-full border rounded-xl p-2 placeholder:text-gray-400 focus:ring-2 focus:border-blue-400 transition'
  if (hasTextError.value) {
    return `${base} border-red-300 text-red-700 focus:ring-red-500 focus:border-red-500 bg-red-50`
  }
  return `${base} border-gray-300 bg-white`
})

const isLoading = ref(false)
const showSuccessPopup = ref(false)
const showErrorPopup = ref(false)
const errorMessage = ref<string>('')

const votes = computed(() => {
  const list = news.value?.ownComments ?? []
  const fake = list.filter((c) => normalizeStatus(c.vote) === 'fake').length
  const notFake = list.filter((c) => normalizeStatus(c.vote) === 'not-fake').length
  return { fake, notFake }
})

const submitVote = handleSubmit(async (formValues) => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    const payload: CommentItem = {
      id: 0,
      newsId: id,
      vote: formValues.vote as CommentItem['vote'],
      text: formValues.text,
      imageURL: formValues.imageURL ?? '',
      author: formValues.author,
      createdAt: new Date().toISOString()
    }
    await CommentService.saveComment(payload)
    showSuccessPopup.value = true
    setTimeout(() => {
      showSuccessPopup.value = false
      router.push({ name: 'news-detail', params: { id } })
    }, 1200)
  } catch (error) {
    errorMessage.value = 'Unable to submit your vote right now. Please try again.' + error
    showErrorPopup.value = true
    setTimeout(() => {
      showErrorPopup.value = false
    }, 1500)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section
    v-if="news"
    aria-labelledby="news-detail-heading"
    class="bg-gradient-to-br from-blue-50 via-white to-green-50 min-h-screen px-4 py-8 rounded-2xl shadow-lg"
  >
    <div class="mb-6 pb-4 border-b border-gray-200">
      <h2
        id="news-detail-heading"
        class="text-3xl font-bold text-gray-900 bg-gradient-to-r from-[#326771] to-[#326771] bg-clip-text text-transparent mb-2"
      >
        {{ news.title }}
      </h2>
      <div class="mt-2 text-sm text-gray-500">
        By <span class="font-medium text-gray-700">{{ news.reporter }}</span>
        <span class="mx-2">•</span>
        <time :datetime="news.reportedAt">{{ new Date(news.reportedAt).toLocaleString() }}</time>
      </div>
    </div>

    <img
      :src="news.imageURL"
      alt="news image"
      class="w-full max-h-80 object-cover rounded-xl border shadow-md transition-all duration-300 hover:scale-105"
    />
    <p class="text-gray-700 mt-4 mb-2">{{ news.fullDetail }}</p>

    <div class="mt-3 flex flex-wrap items-center gap-3 text-sm">
      <NewsStatusBadge :status="news.status" :comments="news.ownComments" />
      <span class="text-gray-500">
        Votes →
        <span class="font-bold text-red-500">Fake: {{ votes.fake }}</span>
        <span class="mx-1">|</span>
        <span class="font-bold text-green-500">Not Fake: {{ votes.notFake }}</span>
      </span>
      <RouterLink
        :to="{ name: 'news-detail', params: { id } }"
        class="ml-auto text-blue-600 hover:text-blue-800 hover:underline"
      >
        View full article →
      </RouterLink>
    </div>

    <div class="mt-4 mb-4 rounded-xl px-4 py-3 bg-blue-50 text-blue-800 text-sm">
      Help verify the accuracy of this news by voting and providing reliable evidence (images). Please keep
      your comments respectful and explain your reasoning clearly.
    </div>

    <form
      class="mt-6 space-y-4 rounded-2xl p-6 bg-gradient-to-br from-white via-white/90 to-slate-50 ring-1 ring-black/5 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.3)] hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.35)] transition-shadow"
      @submit.prevent="submitVote"
      novalidate
    >
      <label class="block text-sm font-medium">Choose Your Verdict</label>
      <div class="mt-2 flex gap-3">
        <label
          class="cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-2xl border text-sm transition-all font-semibold hover:shadow-md hover:-translate-y-[1px]"
          :class="
            vote === 'fake'
              ? 'bg-red-600 text-white border-red-600 shadow'
              : 'bg-red-50 text-gray-800 border-red-200'
          "
        >
          <input type="radio" value="fake" v-model="vote" class="hidden" />
          <span
            class="material-symbols-outlined text-[18px] leading-none transition-opacity"
            :class="vote === 'fake' ? 'opacity-100' : 'opacity-80 text-red-700'"
          >
            thumb_down
          </span>
          Fake
        </label>
        <label
          class="cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-2xl border text-sm transition-all font-semibold hover:shadow-md hover:-translate-y-[1px]"
          :class="
            vote === 'not-fake'
              ? 'bg-green-600 text-white border-green-600 shadow'
              : 'bg-green-50 text-gray-800 border-green-200'
          "
        >
          <input type="radio" value="not-fake" v-model="vote" class="hidden" />
          <span
            class="material-symbols-outlined text-[18px] leading-none transition-opacity"
            :class="vote === 'not-fake' ? 'opacity-100' : 'opacity-80 text-emerald-700'"
          >
            thumb_up
          </span>
          Not Fake
        </label>
      </div>
      <p v-if="hasVoteError" class="text-xs text-red-600">{{ voteError }}</p>

      <div>
        <label class="block text-sm font-medium" for="comment">Why do you think so?</label>
        <textarea
          id="comment"
          v-model="text"
          rows="4"
          :class="textClasses"
          @blur="handleTextBlur"
          aria-describedby="comment-hint"
          placeholder="Explain your reasoning (what evidence, why you think so, any links)…"
        />
        <p id="comment-hint" class="mt-1 text-xs text-gray-500">
          Be respectful and specific. Aim for 1–2 sentences. Include links, screenshots, or sources if
          possible.
        </p>
        <p v-if="hasTextError" class="mt-1 text-xs text-red-600">{{ textError }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium">Evidence Image (optional)</label>
        <div class="mt-2">
          <ImageUpload v-model="imageModel" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium">Display Name</label>
        <InputText name="author" type="text" readonly />
      </div>

      <div class="pt-2 flex items-center gap-3">
        <button
          :disabled="isLoading"
          class="px-5 py-2 rounded-xl text-white font-semibold shadow bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 hover:scale-105 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span v-if="!isLoading">Submit</span>
          <span v-else class="inline-flex items-center gap-2">
            <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
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
    </form>

    <StatusPopup
      :visible="showSuccessPopup"
      title="Vote submitted!"
      message="Thanks for contributing."
      variant="success"
      @close="showSuccessPopup = false"
    />
    <StatusPopup
      :visible="showErrorPopup"
      title="Vote failed"
      :message="errorMessage"
      variant="error"
      @close="showErrorPopup = false"
    />
  </section>

  <p v-else class="px-4 py-8 text-center text-gray-600">News not found.</p>
</template>
