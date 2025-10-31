<script setup lang="ts">
import { computed, ref, nextTick, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Pagination from '@/components/AppPagination.vue'
import { toVote } from '@/router'
import type { NewsItem, CommentItem } from '@/types'
import { NP } from '@/plugins/nprogress'
import NewsService from '@/service/NewsService'
import { useAuthStore } from '@/stores/auth.ts'
import { useMessageStore } from '@/stores/message.ts'
import CommentService from '@/service/CommentService'
import { normalizeStatus } from '@/utils/status'
import NewsStatusBadge from '@/components/NewsStatusBadge.vue'
import StatusPopup from '@/components/PopUp.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const messageStore = useMessageStore()
const id = Number(route.params.id)

const news = ref<NewsItem | null>(null)
const comments = ref<CommentItem[]>([])
const isAdmin = computed(() => authStore.isAdmin)

onMounted(() => {
  if (!Number.isNaN(id)) {
     NewsService.getNewsById(id).then((res) => {
      news.value = res.data
    }).catch(() => {
      news.value = null
    })
    CommentService.getComment().then((res) => {
      comments.value = (res.data || [])
        .filter((c: CommentItem) => c.newsId === id)
        .map((c: CommentItem) => ({ ...c, vote: normalizeStatus(c.vote) }))
    }).catch(() => {
      comments.value = []
    })
  }
})

const votes = computed(() => {
  const list = news.value?.ownComments ?? []
  const fake = list.filter((c) => normalizeStatus(c.vote) === 'fake').length
  const notFake = list.filter((c) => normalizeStatus(c.vote) === 'not-fake').length
  return { fake, notFake }
})

const commentsTop = ref<HTMLElement | null>(null)
const page = ref(1)
const perPage = 6
const all = computed(() => comments.value)
const totalPages = computed(() => Math.max(1, Math.ceil(all.value.length / perPage)))
const pagedComments = computed(() => {
  const start = (page.value - 1) * perPage
  return all.value.slice(start, start + perPage)
})

function onCommentPage(v: number) {
  return NP.track(() => {
    page.value = v
    return nextTick().then(() => {
      commentsTop.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  })
}

function removeCurrentNews() {
  if (!news.value) return
  try {
    NewsService.removeNews(news.value.id)
    showActionPopup('News removed successfully.')
    messageStore.updateMessage('News removed successfully.')
    setTimeout(() => {
      router.push({ name: 'home' })
    }, 800)
  } catch (error) {
    console.error('Failed to remove news', error)
    errorMessage.value = 'Could not remove news.'
    showErrorPopup.value = true
    setTimeout(() => {
      showErrorPopup.value = false
    }, 1500)
  } finally {
    setTimeout(() => messageStore.resetMessage(), 3000)
  }
}

function removeCommentById(commentId: number) {
  try {
    CommentService.removeComment(commentId)
    comments.value = comments.value.filter((c) => c.id !== commentId)
    showActionPopup('Comment removed successfully.')
  } catch (error) {
    console.error('Failed to remove comment', error)
    errorMessage.value = 'Could not remove comment.'
    showErrorPopup.value = true
    setTimeout(() => {
      showErrorPopup.value = false
    }, 1500)
  }
}

const showSuccessPopup = ref(false)
const successTitle = ref('Success')
const successMessage = ref('')
const showErrorPopup = ref(false)
const errorMessage = ref('')

const showActionPopup = (message: string, title = 'Success') => {
  successTitle.value = title
  successMessage.value = message
  showSuccessPopup.value = true
  setTimeout(() => {
    showSuccessPopup.value = false
  }, 1200)
}

watch(
  () => comments.value,
  (newComments) => {
    if (news.value) {
      news.value.ownComments = newComments.map((c) => ({
        id: c.id,
        vote: normalizeStatus(c.vote)
      }))
    }
  },
  { deep: true }
)

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
      <span class="mx-2"> • </span>
      <time :datetime="news.reportedAt">{{ new Date(news.reportedAt).toLocaleString() }}</time>
    </div>
  </div>
    <img :src="news.imageURL" alt="news image" class="w-full max-h-80 object-cover rounded-xl border shadow-md transition-all duration-300 hover:scale-105" />
    <p class="text-gray-700 mt-4 mb-2">{{ news.fullDetail }}</p>

    <div class="mt-3 flex items-center gap-2 text-sm">
      <NewsStatusBadge :status="news.status" :comments="news.ownComments" />
      <span class="text-gray-500">
        Score →
        <span class="font-bold text-red-500">Fake: {{ votes.fake }}</span>
        ·
        <span class="font-bold text-green-500">Not Fake: {{ votes.notFake }}</span>
      </span>
    </div>

    <div class="mt-8 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-800">Comments</h3>
      <RouterLink
        :to="toVote(id)"
class="inline-block px-4 py-2 rounded-xl border bg-gradient-to-r from-blue-500 to-green-400 text-white shadow-lg hover:scale-110 hover:from-blue-600 hover:to-green-500 transition-all text-sm"
>

        Vote / Add Comment 
      </RouterLink>
      <button
        v-if="isAdmin"
        type="button"
        class="ml-3 inline-flex items-center rounded-xl border   px-3 py-1.5 text-sm font-semibold bg-red-500 text-white shoadow-lg hover:scale-110 transition-all hover:bg-red-600 hover:text-white"
        @click="removeCurrentNews"
      >
        Remove News
      </button>
    </div>

    <ul ref="commentsTop" class="mt-4 space-y-4">
 <li
  v-for="c in pagedComments"
  :key="c.id"
  class="bg-white border rounded-xl p-4 shadow transition-all duration-200
         hover:shadow-2xl hover:scale-105 hover:border-[#326771] hover:bg--50"
>
  <div class="text-sm text-gray-500 flex items-center justify-between">
    <span>By {{ c.author }}</span>
    <time :datetime="c.createdAt">{{ new Date(c.createdAt).toLocaleString() }}</time>
  </div>
  <p class="mt-2 text-gray-700">{{ c.text }}</p>
  <div class="mt-2 text-xs">
    <span
      class="px-2 py-0.5 rounded-full border font-semibold"
      :class="normalizeStatus(c.vote)==='fake' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'"
    >
      {{ normalizeStatus(c.vote)==='fake' ? 'Voted: Fake' : 'Voted: Not Fake' }}
    </span>
  </div>
  <div class="mt-3 flex items-center justify-between text-xs">
    
    <a
      v-if="c.imageURL"
      :href="c.imageURL"
      target="_blank"
      class="inline-block text-blue-600 hover:underline hover:text-blue-800"
    >
      Evidence image
    </a>
    
    <p v-else >
      <span class="text-gray-500 mr-2">No Evidence image</span>
    </p>
    <button
      v-if="isAdmin"
      type="button"
      class="inline-flex items-center rounded-lg border px-2 py-1 text-xs font-semibold bg-red-500 text-white shoadow-lg hover:scale-110 transition-all hover:bg-red-600 hover:text-white"
      @click="removeCommentById(c.id)"
    >
      Remove Comment
    </button>
  </div>
</li>
    </ul>

    <Pagination class="mt-8" :page="page" :total="totalPages" @update:page="onCommentPage" />
    <StatusPopup
      :visible="showSuccessPopup"
      :title="successTitle"
      :message="successMessage"
      variant="success"
      @close="showSuccessPopup = false"
    />
    <StatusPopup
      :visible="showErrorPopup"
      title="Action failed"
      :message="errorMessage"
      variant="error"
      @close="showErrorPopup = false"
    />
  </section>
  <p v-else class="text-center py-12 text-gray-500">News not found.</p>
</template>
