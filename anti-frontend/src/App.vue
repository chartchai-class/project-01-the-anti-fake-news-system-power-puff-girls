<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { SpeedInsights } from '@vercel/speed-insights/vue'
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

          <RouterLink
            :to="{ name: 'submit' }"
            class="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full
                    bg-gradient-to-r from-blue-500 to-green-400 text-white font-bold shadow-lg
                    hover:scale-105 hover:from-blue-600 hover:to-green-500
                    transition-all text-sm sm:text-base"
          >
            <span class="material-symbols-outlined text-base sm:text-xl -translate-y-[1px]">add</span>
            <span >Add News</span>
          </RouterLink>

          <router-link 
            to="/account" 
            class="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-600 shadow-md transition hover:bg-gray-100"
            aria-label="Account details"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke-width="1.5" 
              stroke="currentColor" 
              class="h-6 w-6"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" 
              />
            </svg>
          </router-link>

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

