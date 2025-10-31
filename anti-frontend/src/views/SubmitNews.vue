<script setup lang="ts">
import { computed, ref, type Ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as yup from 'yup'
import { useForm, useField, type FieldMeta } from 'vee-validate'
import type { CreateNewsPayload } from '@/types'
import NewsService from '@/service/NewsService'
import ImageUpload from '@/components/ImageUpload.vue'
import InputText from '@/components/InputText.vue'
import { toNewsDetail } from '@/router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const canSubmit = computed(() => authStore.canSubmitNews)
const currentUsername = computed(() => authStore.user?.username ?? '')

const validationSchema = yup.object({
  title: yup.string().required('Title is required'),
  shortDetail: yup.string().required('Short detail is required'),
  fullDetail: yup.string().required('Full detail is required'),
  reporter: yup.string().required('Reporter name is required'),
  imageURL: yup.string().nullable()
})

const { handleSubmit, setFieldValue, values } = useForm({
  validationSchema,
  initialValues: {
    title: '',
    shortDetail: '',
    fullDetail: '',
    reporter: '',
    imageURL: ''
  }
})

const {
  value: shortDetail,
  errorMessage: shortDetailError,
  handleBlur: handleShortDetailBlur,
  meta: shortDetailMeta
} = useField<string>('shortDetail')

const {
  value: fullDetail,
  errorMessage: fullDetailError,
  handleBlur: handleFullDetailBlur,
  meta: fullDetailMeta
} = useField<string>('fullDetail')

const imageModel = computed<string[]>({
  get: () => (values.imageURL ? [values.imageURL] : []),
  set: (newValue) => {
    setFieldValue('imageURL', newValue.length > 0 ? newValue[0] : '')
  }
})

setFieldValue('reporter', currentUsername.value, false)
watch(currentUsername, (value) => {
  setFieldValue('reporter', value, false)
})

const isLoading = ref(false)
const showPopup = ref(false)
const submitError = ref<string | null>(null)

const createTextareaClasses = (meta: FieldMeta<any>, error: Ref<string | undefined>) => {
  const base =
    'mt-2 w-full border rounded-xl p-2 placeholder:text-gray-400 focus:ring-2 focus:border-blue-400 transition'
  return computed(() => {
    if (error.value && (meta.touched || meta.dirty)) {
      return `${base} border-red-300 text-red-700 focus:ring-red-500 focus:border-red-500 bg-red-50`
    }
    return `${base} border-gray-300 bg-white`
  })
}

const shortDetailClasses = createTextareaClasses(shortDetailMeta, shortDetailError)
const fullDetailClasses = createTextareaClasses(fullDetailMeta, fullDetailError)

const hasShortDetailError = computed(
  () => !!shortDetailError.value && (shortDetailMeta.touched || shortDetailMeta.dirty)
)
const hasFullDetailError = computed(
  () => !!fullDetailError.value && (fullDetailMeta.touched || fullDetailMeta.dirty)
)

const submit = handleSubmit(async (formValues) => {
  if (!canSubmit.value || isLoading.value) return
  isLoading.value = true
  submitError.value = null

  const reportedAt = new Date().toISOString()

  const payload: CreateNewsPayload = {
    title: formValues.title,
    shortDetail: formValues.shortDetail,
    fullDetail: formValues.fullDetail,
    reporter: formValues.reporter,
    imageURL: formValues.imageURL?.trim() ?? '',
    reportedAt,
    status: 'equal'
  }

  try {
    const { data } = await NewsService.saveNews(payload)
    showPopup.value = true
    setTimeout(() => {
      showPopup.value = false
      router.push(toNewsDetail(data.id))
    }, 1200)
  } catch (error) {
    submitError.value = 'Unable to submit news right now. Please try again.' + error
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section class="flex items-center justify-center min-h-screen px-4">
    <div class="w-full max-w-2xl">
      <h2 class="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
        Submit News/Article
      </h2>
      <p class="text-sm text-gray-600 mt-1 text-center">
        Your news matters. Let's fact-check, vote, and discuss.
      </p>

      <div
        v-if="!canSubmit"
        class="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-center text-amber-800"
      >
        <p class="font-semibold">You need to be a verified member to submit news.</p>
        <p class="mt-2 text-sm">Please contact an administrator to upgrade your account.</p>
      </div>

      <form
        v-else
        class="mt-6 space-y-4 bg-white border rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
        @submit.prevent="submit"
        novalidate
      >
        <div>
          <label class="block text-sm font-medium" for="title">Title</label>
          <InputText name="title" type="text" placeholder="Write a clear, specific headline…" />
          <p class="mt-1 text-xs text-gray-500">Tip: Make it specific and neutral.</p>
        </div>

        <div>
          <label class="block text-sm font-medium" for="shortDetail">Short detail</label>
          <textarea
            id="shortDetail"
            v-model="shortDetail"
            rows="2"
            placeholder="A quick summary (what/when/where)…"
            :class="shortDetailClasses"
            @blur="handleShortDetailBlur"
          />
          <p class="mt-1 text-xs text-gray-500">Tip: Keep it concise (1–2 sentences).</p>
          <p v-if="hasShortDetailError" class="mt-1 text-xs text-red-600">{{ shortDetailError }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium" for="fullDetail">Full detail</label>
          <textarea
            id="fullDetail"
            v-model="fullDetail"
            rows="6"
            placeholder="Provide evidence, links, sources, and context…"
            :class="fullDetailClasses"
            @blur="handleFullDetailBlur"
          />
          <p class="mt-1 text-xs text-gray-500">
            Tip: Add 2–3 verification points with links or screenshots.
          </p>
          <p v-if="hasFullDetailError" class="mt-1 text-xs text-red-600">{{ fullDetailError }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium" for="reporter">Reporter</label>
          <InputText name="reporter" type="text" readonly />
          <p class="mt-1 text-xs text-gray-500">Tip: Use a consistent display name.</p>
        </div>

        <div>
          <label class="block text-sm font-medium" for="image">Upload Image (optional)</label>
          <div class="mt-2">
            <ImageUpload v-model="imageModel" />
          </div>
        </div>

        <p v-if="submitError" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {{ submitError }}
        </p>

        <div class="pt-2 flex items-center gap-3 justify-center">
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
            :to="{ name: 'home' }"
            class="text-sm text-gray-600 hover:text-red-600 hover:underline transition"
          >
            Cancel
          </RouterLink>
        </div>

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
                  <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
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
