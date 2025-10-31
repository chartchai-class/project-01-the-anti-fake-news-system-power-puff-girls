<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { NP } from '@/plugins/nprogress'

const router = useRouter()

// form state
const username = ref('')
const password = ref('')

// ui state
const showPwd = ref(false)
const isLoading = ref(false)
const showPopup = ref(false)

// validation
const errors = ref<Record<string, string>>({})

function validate() {
  const e: Record<string, string> = {}
  if (!username.value.trim()) e.username = 'Required.'
  if (!password.value.trim()) e.password = 'Required.'
  errors.value = e
  return Object.keys(e).length === 0
}

async function submit() {
  if (!validate()) return
  isLoading.value = true
  await nextTick()

  await NP.track(async () => {
    const payload = { username: username.value }
    localStorage.setItem('demo.login.payload', JSON.stringify(payload))
    await new Promise(r => setTimeout(r, 500))
  })

  isLoading.value = false
  showPopup.value = true
  setTimeout(async () => {
    showPopup.value = false
    await router.push({ name: 'home' })
  }, 1200)
}
</script>

<template>
<section class="flex justify-center py-20 px-4 min-h-[70vh]">
    <div class="w-full max-w-md">
      <!-- Profile Icon -->
<div class="flex justify-center mb-4">
  <div
    class="w-20 h-20 rounded-full bg-white-200 flex items-center justify-center text-gray-600 shadow-md hover:scale-105 transition-transform"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.8"
      stroke="currentColor"
      class="w-10 h-10"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0"
      />
    </svg>
  </div>
</div>

      <!-- Heading -->
      <h2
        class="text-3xl font-extrabold text-center
               bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent"
      >
        Sign In to Your Account
      </h2>
      <p class="text-sm text-gray-600 mt-1 text-center">
        Welcome back to SocialFact. Please enter your credentials.
      </p>

      <!-- Card -->
      <form
        class="mt-6 space-y-4 bg-white border rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
        @submit.prevent="submit"
        novalidate
      >
        <!-- Username -->
        <div>
          <label class="block text-sm font-medium" for="username">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            autocomplete="username"
            placeholder="Enter your username"
            class="mt-2 w-full border rounded-xl p-2 placeholder:text-gray-400
                   focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
            :aria-invalid="!!errors.username"
          />
          <p v-if="errors.username" class="mt-1 text-xs text-red-600">{{ errors.username }}</p>
        </div>

        <!-- Password -->
        <div>
          <label class="block text-sm font-medium" for="password">Password</label>
          <div class="mt-2 relative">
            <input
              id="password"
              v-model="password"
              :type="showPwd ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Enter your password"
              class="w-full border rounded-xl p-2 pr-24 placeholder:text-gray-400
                     focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              :aria-invalid="!!errors.password"
            />
            <button
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs rounded-lg
                     border bg-white hover:bg-gray-50 transition"
              @click="showPwd = !showPwd"
            >
              {{ showPwd ? 'Hide' : 'Show' }}
            </button>
          </div>
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
         disabled:opacity-60 disabled:cursor-not-allowed"
>

          <span v-if="!isLoading">Sign In</span>
          <span v-else class="inline-flex items-center gap-2">
         <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
         <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
       </svg>
             Signing in…
         </span>
     </button>

<p class="text-sm text-gray-400 text-center">
  Don’t have an account?
  <RouterLink
    :to="{ name: 'register' }"
    class="font-semibold text-gray-700 hover:text-red-600 hover:underline transition"
  >
    Register here
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
              <h3 class="text-lg font-semibold text-gray-900">Login successful!</h3>
              <p class="mt-1 text-sm text-gray-600">Redirecting to homepage…</p>
            </div>
          </div>
        </Transition>
      </form>
    </div>
  </section>
</template>
