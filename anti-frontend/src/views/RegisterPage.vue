<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import * as yup from 'yup'
import { useForm } from 'vee-validate'
import { useAuthStore } from '@/stores/auth'
import InputText from '@/components/InputText.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import StatusPopup from '@/components/PopUp.vue'

const authStore = useAuthStore()
const router = useRouter()

const showPwd = ref(false)
const isLoading = ref(false)
const showSuccessPopup = ref(false)
const showErrorPopup = ref(false)
const errorMessage = ref<string>('Could not register. Please try again.')

const validationSchema = yup.object({
  firstname: yup.string().required('First name is required'),
  lastname: yup.string().required('Last name is required'),
  username: yup.string().required().min(4, 'Username must be at least 4 characters'),
  email: yup.string().required().email(),
  password: yup.string().required().min(4, 'Password must be at least 4 characters')
})

const { handleSubmit } = useForm({
  validationSchema,
  initialValues: {
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: ''
  }
})

const profileImage = ref<string[]>([])

const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true
  try {
    await authStore.register(
      values.firstname,
      values.lastname,
      values.username,
      values.email,
      values.password,
      profileImage.value[0] ?? null
    )
    showSuccessPopup.value = true
    setTimeout(() => {
      showSuccessPopup.value = false
      router.push({ name: 'home' })
    }, 800)
  } catch (err) {
    console.error('Registration error:', err)
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
  <section class="flex justify-center py-20 px-4 min-h-[70vh]">
    <div class="w-full max-w-2xl">
      <h2 class="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
        Create your account
      </h2>
      <p class="text-sm text-gray-600 mt-1 text-center">
        Join SocialFact. Track news, vote, and discuss responsibly.
      </p>

      <form
        class="mt-6 space-y-4 bg-white border rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
        @submit.prevent="onSubmit"
        novalidate
      >
        <div class="grid grid-cols-1 md:grid-cols-2 md:gap-4">
          <div>
            <label class="block text-sm font-medium" for="firstname">First name</label>
            <InputText name="firstname" type="text" />
          </div>
          <div>
            <label class="block text-sm font-medium" for="lastname">Last name</label>
            <InputText name="lastname" type="text" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium" for="username">Username</label>
          <InputText name="username" type="text" />
        </div>

        <div>
          <label class="block text-sm font-medium" for="email">Email</label>
          <InputText name="email" type="email" />
          <p id="email-hint" class="mt-1 text-xs text-gray-500">We'll send a verification link.</p>
        </div>

        <div>
          <label class="block text-sm font-medium" for="profileImage">Profile image (optional)</label>
          <ImageUpload v-model="profileImage" />
          <p class="mt-1 text-xs text-gray-500">Recommended 1:1 aspect ratio. Leave empty to use initials.</p>
        </div>

        <div>
          <label class="block text-sm font-medium" for="password">Password</label>
          <div class="relative mt-2">
            <InputText name="password" :type="showPwd ? 'text' : 'password'" />
            <button
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs rounded-lg border bg-white hover:bg-gray-50 transition"
              @click="showPwd = !showPwd"
            >
              {{ showPwd ? 'Hide' : 'Show' }}
            </button>
          </div>
          <p id="pwd-hint" class="mt-1 text-xs text-gray-500">
            Use 8+ characters. Mix letters, numbers, and symbols for better security.
          </p>
        </div>

        <div class="pt-2 flex flex-col items-center gap-3 justify-center">
          <button
            :disabled="isLoading"
            class="w-full py-3 rounded-xl text-white font-semibold shadow bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 hover:scale-[1.02] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span v-if="!isLoading">Create account</span>
            <span v-else class="inline-flex items-center gap-2">
              <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Processing…
            </span>
          </button>

          <p class="text-sm text-gray-400 text-center">
            Already have an account?
            <RouterLink
              :to="{ name: 'login' }"
              class="font-semibold text-gray-700 hover:text-red-600 hover:underline transition"
            >
              Login
            </RouterLink>
          </p>
        </div>

        <StatusPopup
          :visible="showSuccessPopup"
          title="Account created!"
          message="Redirecting you home…"
          variant="success"
          @close="showSuccessPopup = false"
        />
        <StatusPopup
          :visible="showErrorPopup"
          title="Registration failed"
          :message="errorMessage"
          variant="error"
          @close="showErrorPopup = false"
        />
      </form>
    </div>
  </section>
</template>

