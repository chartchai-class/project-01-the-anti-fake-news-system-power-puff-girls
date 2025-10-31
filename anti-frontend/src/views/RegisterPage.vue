<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import * as yup from 'yup'
import { useForm, useField } from 'vee-validate'
import { useAuthStore } from '@/stores/auth'
import { useMessageStore } from '@/stores/message'
import InputText from '@/components/InputText.vue'
import ImageUpload from '@/components/ImageUpload.vue'

const authStore = useAuthStore()
const messageStore = useMessageStore()
const router = useRouter()

const showPwd = ref(false)
const isLoading = ref(false)
const showPopup = ref(false)

const validationSchema = yup.object({
  firstname: yup.string().required('First name is required'),
  lastname: yup.string().required('Last name is required'),
  username: yup.string().required().min(4, 'Username must be at least 4 characters'),
  email: yup.string().required().email(),
  password: yup.string().required().min(4, 'Password must be at least 4 characters')
})

const { errors, handleSubmit } = useForm({ validationSchema })

const { value: firstname } = useField<string>('firstname')
const { value: lastname } = useField<string>('lastname')
const { value: username } = useField<string>('username')
const { value: email } = useField<string>('email')
const { value: password } = useField<string>('password')
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
    messageStore.updateMessage(`Welcome, ${values.firstname}!`)
    setTimeout(() => messageStore.resetMessage(), 3000)
    showPopup.value = true
    setTimeout(() => router.push({ name: 'home' }), 800)
  } catch (err) {
    console.error('Registration error:', err)
    messageStore.updateMessage('Could not register. Please try again.')
    setTimeout(() => messageStore.resetMessage(), 3000)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section class="flex justify-center py-20 px-4 min-h-[70vh]">
    <div class="w-full max-w-2xl">
      <!-- Heading -->
      <h2
        class="text-3xl font-extrabold text-center
               bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent"
      >
        Create your account
      </h2>
      <p class="text-sm text-gray-600 mt-1 text-center">
        Join SocialFact. Track news, vote, and discuss responsibly.
      </p>

      <!-- Card -->
      <form
        class="mt-6 space-y-4 bg-white border rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
        @submit.prevent="onSubmit"
        novalidate
      >
        <!-- Name -->
        <div class="grid grid-cols-1 md:grid-cols-2 md:gap-4">
          <div>
            <label class="block text-sm font-medium" for="firstname">First name</label>
            <InputText type="text" v-model="firstname" :error="errors.firstname" />
            <p v-if="errors.firstname" class="mt-1 text-xs text-red-600">{{ errors.firstname }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium" for="lastname">Last name</label>
            <InputText type="text" v-model="lastname" :error="errors.lastname" />
            <p v-if="errors.lastname" class="mt-1 text-xs text-red-600">{{ errors.lastname }}</p>
          </div>
        </div>

        <!-- Username -->
        <div>
          <label class="block text-sm font-medium" for="username">Username</label>
          <InputText type="text" v-model="username" :error="errors.username" />
          <p v-if="errors.username" class="mt-1 text-xs text-red-600">{{ errors.username }}</p>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium" for="email">Email</label>
          <InputText type="email" v-model="email" :error="errors.email" />
          <p id="email-hint" class="mt-1 text-xs text-gray-500">We'll send a verification link.</p>
          <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
        </div>

        <!-- Profile image -->
        <div>
          <label class="block text-sm font-medium" for="profileImage">Profile image (optional)</label>
          <ImageUpload v-model="profileImage" />
          <p class="mt-1 text-xs text-gray-500">Recommended 1:1 aspect ratio. Leave empty to use initials.</p>
        </div>

        <!-- Password -->
        <div>
          <label class="block text-sm font-medium" for="password">Password</label>
          <div class="relative mt-2">
            <InputText :type="showPwd ? 'text' : 'password'" v-model="password" :error="errors['password']" />
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
          <p v-if="errors.password" class="mt-1 text-xs text-red-600">{{ errors.password }}</p>
        </div>

        <!-- Actions -->
        <div class="pt-2 flex flex-col items-center gap-3 justify-center">
<button
  :disabled="isLoading"
  class="w-full py-3 rounded-xl text-white font-semibold shadow
         bg-gradient-to-r from-blue-600 to-green-500
         hover:from-blue-700 hover:to-green-600
         hover:scale-[1.02] transition-all duration-200
         disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
>
  <span v-if="!isLoading">Create account</span>
  <span v-else class="inline-flex items-center gap-2">
    <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
    </svg>
    Processing…
  </span>
</button>


          <!-- Link -->
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

        <!-- Popup -->
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
              <h3 class="text-lg font-semibold text-gray-900">Account created!</h3>
              <p class="mt-1 text-sm text-gray-600">Redirecting you home…</p>
            </div>
          </div>
        </Transition>
      </form>
    </div>
  </section>
</template>
