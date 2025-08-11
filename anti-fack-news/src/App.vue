
<template>
  <div class="min-h-screen flex flex-col">
    <header class="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 class="text-xl font-semibold">Social Anti‑Fake News</h1>
        <RouterLink to="/" class="text-sm text-blue-600 hover:underline">Home</RouterLink>
      </div>
    </header>
    <main class="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
      <RouterView />
    </main>
    <footer class="border-t text-center text-xs text-gray-500 py-4">© 2025 Anti‑Fake News</footer>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>