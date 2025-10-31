<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { computed } from 'vue'
import { SpeedInsights } from '@vercel/speed-insights/vue'
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'
import { mdiAccount, mdiLogout, mdiAccountPlus, mdiLogin } from '@mdi/js'

const displayName = computed(() => authStore.currentUserName)
const profileImage = computed(() => authStore.user?.profileImage || '')
const displayInitial = computed(() => (displayName.value ? displayName.value.charAt(0).toUpperCase() : '?'))
const isAuthenticated = computed(() => !!authStore.user)
const authStore = useAuthStore()
const router = useRouter()

const token = localStorage.getItem('access_token')
const user = localStorage.getItem('user')
if (token && user && user !== 'undefined' && user !== 'null') {
  try {
    authStore.reload(token, JSON.parse(user))
  } catch (e) {
    console.error("Failed to parse user data from localStorage:", e)
    authStore.logout()
  }
} else {
  authStore.logout()
}

function logout() {
  authStore.logout()
  router.push({ name: 'login' })
}

</script>

<template>
  <SpeedInsights/>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-white to-green-100">
    <header class="sticky top-0 z-30 bg-white/80 backdrop-blur border-b shadow-lg">
      <nav class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        <RouterLink
          to="/"
          class="flex items-center gap-2"
        >
          <span class="inline-block w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-green-400 shadow-lg"></span>
          <span class="text-2xl font-extrabold tracking-tight text-[#326771] drop-shadow flex items-center gap-2">
            SocialFact
            <span
              class="bg-red-600 text-white text-3xl font-extrabold px-4 py-2 leading-none rounded-sm shadow-md
                      transition-all duration-300 hover:scale-110 hover:bg-red-700 hover:shadow-xl"
            >
              NEWS
            </span>
          </span>
        </RouterLink>

        <div class="flex items-center gap-4">
          <span v-if="authStore.canSubmitNews">
          <RouterLink
            :to="{ name: 'submit' }"
            class="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full
                    bg-gradient-to-r from-blue-500 to-green-400 text-white font-bold shadow-lg
                    hover:scale-105 hover:from-blue-600 hover:to-green-500
                    transition-all text-sm sm:text-base"
          >
            <span class="material-symbols-outlined text-base sm:text-xl -translate-y-[1px]">add</span>
            <span>Add News</span>
          </RouterLink>
          </span>

          <div v-if="isAuthenticated" class="flex items-center gap-3">
            <RouterLink
              to="/account"
              class="flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 shadow transition hover:bg-white"
              aria-label="Account details"
            >
              <span
                v-if="profileImage"
                class="h-8 w-8 overflow-hidden rounded-full border border-gray-200"
              >
                <img :src="profileImage" alt="Profile image" class="h-full w-full object-cover" />
              </span>
              <span
                v-else
                class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-green-400 text-sm font-semibold text-white shadow"
              >
                {{ displayInitial }}
              </span>
              <span class="text-sm font-semibold text-gray-700">{{ displayName }}</span>
            </RouterLink>
            <button
              type="button"
              class="hidden sm:inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-red-500"
              @click="logout"
            >
              <span class="material-symbols-outlined text-base">logout</span>
              Sign out
            </button>
          </div>

          <RouterLink
            v-else
            :to="{ name: 'login' }"
            class="inline-flex items-center gap-2 rounded-full border border-blue-500 px-4 py-1.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-500 hover:text-white"
          >
            <span class="material-symbols-outlined text-base">login</span>
            Login
          </RouterLink>
        </div> </nav>
    </header>

    <main class="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
      <RouterView />
    </main>

    <footer class="border-t bg-white/80 py-6 mt-10">
      <div class="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2">
        <span class="text-sm text-gray-500">
          © 2025 <span class="font-bold text-[#326771]">SocialFact News</span>. All rights reserved.
        </span>
        <span class="text-xs text-gray-400">
          Made with <span class="text-pink-400">♥</span> by Power Puff Girls
        </span>
      </div>
    </footer>
  </div>
</template>
