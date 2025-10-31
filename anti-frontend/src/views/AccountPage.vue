<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, type AuthUser } from '@/stores/auth'
import { useMessageStore } from '@/stores/message'
import NewsService from '@/service/NewsService'
import CommentService from '@/service/CommentService'
import type { NewsItem, CommentItem } from '@/types'

const authStore = useAuthStore()
const messageStore = useMessageStore()
const router = useRouter()

const currentUser = computed(() => authStore.user)
const isAdmin = computed(() => authStore.isAdmin)
const profileImage = computed(() => currentUser.value?.profileImage || '')

const users = ref<AuthUser[]>([])
const isLoadingUsers = ref(false)
const promoteBusy = ref<number | null>(null)
const removedNews = ref<NewsItem[]>([])
const removedComments = ref<CommentItem[]>([])
const isLoadingRemoved = ref(false)

const roleLabels: Record<string, string> = {
  ROLE_READER: 'Reader',
  ROLE_MEMBER: 'Member',
  ROLE_ADMIN: 'Admin'
}

const describeRoles = (roles?: string[]) =>
  roles && roles.length ? roles.map((role) => roleLabels[role] ?? role).join(', ') : '—'

const managedUsers = computed(() =>
  users.value.filter((user) => user.id !== currentUser.value?.id)
)

const loadUsers = async () => {
  if (!isAdmin.value) return
  isLoadingUsers.value = true
  try {
    const { data } = await authStore.fetchUsers()
    users.value = data
  } catch (error) {
    console.error(error)
    messageStore.updateMessage('Unable to load users.')
    setTimeout(() => messageStore.resetMessage(), 3000)
  } finally {
    isLoadingUsers.value = false
  }
}

onMounted(() => {
  if (isAdmin.value) {
    loadUsers()
    loadRemoved()
  }
})

const logout = () => {
  authStore.logout()
  router.push({ name: 'login' })
}

const promoteToMember = async (userId: number) => {
  promoteBusy.value = userId
  try {
    await authStore.promoteUser(userId, 'ROLE_MEMBER')
    messageStore.updateMessage('User promoted to member.')
    await loadUsers()
  } catch (error) {
    console.error(error)
    messageStore.updateMessage('Unable to update user role.')
  } finally {
    setTimeout(() => messageStore.resetMessage(), 3000)
    promoteBusy.value = null
  }
}

const loadRemoved = async () => {
  if (!isAdmin.value) return
  isLoadingRemoved.value = true
  try {
    const [newsRes, commentsRes] = await Promise.all([
      NewsService.getRemovedNews(),
      CommentService.getRemovedComments()
    ])
    removedNews.value = newsRes.data
    removedComments.value = commentsRes.data
  } catch (error) {
    console.error(error)
    messageStore.updateMessage('Unable to load removed items.')
    setTimeout(() => messageStore.resetMessage(), 3000)
  } finally {
    isLoadingRemoved.value = false
  }
}

</script>

<template>
  <section class="mx-auto max-w-4xl px-4 py-12">
    <div class="rounded-2xl bg-white p-8 shadow-md">
      <header class="flex flex-col items-center gap-3 text-center">
        <div
          v-if="profileImage"
          class="h-24 w-24 overflow-hidden rounded-full border border-gray-200 shadow"
        >
          <img :src="profileImage" alt="Profile image" class="h-full w-full object-cover" />
        </div>
        <div
          v-else
          class="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-green-500 text-3xl font-semibold text-white shadow"
        >
          {{ currentUser?.firstname?.[0] || currentUser?.username?.[0] || '?' }}
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-800">{{ currentUser?.firstname }} {{ currentUser?.lastname }}</h1>
          <p class="text-sm text-gray-500">@{{ currentUser?.username }}</p>
          <p class="text-sm text-gray-500">{{ currentUser?.email }}</p>
        </div>
        <p class="rounded-full bg-gray-100 px-4 py-1 text-sm font-medium text-gray-600">
          {{ describeRoles(currentUser?.roles) }}
        </p>
      </header>

      <div class="mt-8 flex justify-end">
        <button
          type="button"
          @click="logout"
          class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>
    </div>

    <div v-if="isAdmin" class="mt-10 rounded-2xl bg-white p-8 shadow-md">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-800">Manage Users</h2>
        <button
          type="button"
          @click="loadUsers"
          class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      <div v-if="isLoadingUsers" class="py-10 text-center text-gray-500">Loading users…</div>
      <div v-else>
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th class="px-4 py-3">Name</th>
              <th class="px-4 py-3">Username</th>
              <th class="px-4 py-3">Role</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="user in managedUsers" :key="user.id">
              <td class="px-4 py-3">
                <span class="font-medium text-gray-800">
                  {{ user.firstname }} {{ user.lastname }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-600">@{{ user.username }}</td>
              <td class="px-4 py-3">
                <span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  {{ describeRoles(user.roles) }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <button
                  v-if="user.roles.includes('ROLE_READER')"
                  type="button"
                  :disabled="promoteBusy === user.id"
                  class="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  @click="promoteToMember(user.id)"
                >
                  <span v-if="promoteBusy === user.id">Updating…</span>
                  <span v-else>Promote to Member</span>
                </button>
                <span v-else class="text-xs text-gray-400">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="isAdmin" class="mt-10 space-y-8">
      <div class="rounded-2xl bg-white p-6 shadow-md">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-800">Removed News</h2>
          <button
            type="button"
            @click="loadRemoved"
            class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
        <div v-if="isLoadingRemoved" class="py-6 text-center text-gray-500">Loading…</div>
        <div v-else-if="removedNews.length === 0" class="py-6 text-center text-gray-400">
          No removed news.
        </div>
        <ul v-else class="space-y-3">
          <li
            v-for="news in removedNews"
            :key="news.id"
            class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="font-semibold text-gray-900">Title: {{ news.title }}</p>
                <p class="mt-1 text-sm text-gray-700">Reporter: {{ news.reporter }}</p>
                <p class="mt-1 text-sm text-gray-700">Short Details: {{ news.shortDetail }}</p>
                <p class="mt-1 text-sm text-gray-500">Status: {{ news.status }}</p>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <div class="rounded-2xl bg-white p-6 shadow-md">
        <h2 class="mb-4 text-xl font-semibold text-gray-800">Removed Comments</h2>
        <div v-if="isLoadingRemoved" class="py-6 text-center text-gray-500">Loading…</div>
        <div v-else-if="removedComments.length === 0" class="py-6 text-center text-gray-400">
          No removed comments.
        </div>
        <ul v-else class="space-y-3">
          <li
            v-for="comment in removedComments"
            :key="comment.id"
            class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700"
          >
            <p class="font-semibold text-gray-900">Author: {{ comment.author }}</p>
            <p class="mt-1 text-sm text-gray-700">Comment: {{ comment.text }}</p>
            <p class="mt-1 text-xs text-gray-500">Vote: {{ comment.vote }}</p>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
