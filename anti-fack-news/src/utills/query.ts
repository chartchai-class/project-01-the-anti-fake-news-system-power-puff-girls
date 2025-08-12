import { useRoute, useRouter } from 'vue-router'

export function useQuerySync() {
  const route = useRoute()
  const router = useRouter()

  function setQuery(next: Record<string, any>) {
    router.replace({ query: { ...route.query, ...next } })
  }

  return { route, router, setQuery }
}
