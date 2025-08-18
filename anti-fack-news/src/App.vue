<template>
  <SpeedInsights/>
  <Analytics/>
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
      </nav>
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

<script setup lang="ts">
import { SpeedInsights } from '@vercel/speed-insights/next';
import { RouterLink, RouterView } from 'vue-router'
</script>
