import { defineStore } from 'pinia'
import apiClient from '@/service/AxiosClient'

export interface AuthUser {
  id: number
  username: string
  firstname: string
  lastname: string
  email: string
  profileImage?: string | null
  roles: string[]
}

const persistState = (token: string | null, user: AuthUser | null) => {
  if (token && user) {
    localStorage.setItem('access_token', token)
    localStorage.setItem('user', JSON.stringify(user))
  } else {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  }
}

const hasRole = (user: AuthUser | null, role: string) =>
  !!user?.roles?.includes(role)

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as AuthUser | null
  }),
  getters: {
    currentUserName(state): string {
      if (!state.user) return ''
      const name = [state.user.username].filter(Boolean).join(' ')
      return name || state.user.username
    },
    isAdmin(): boolean {
      return hasRole(this.user, 'ROLE_ADMIN')
    },
    isMember(): boolean {
      return hasRole(this.user, 'ROLE_MEMBER')
    },
    isReader(): boolean {
      return hasRole(this.user, 'ROLE_READER')
    },
    canSubmitNews(): boolean {
      return this.isAdmin || this.isMember
    },
    authorizationHeader(): string {
      return `Bearer ${this.token}`
    }
  },
  actions: {
    register(firstname: string, lastname: string, username: string, email: string, password: string, profileImage?: string | null) {
      return apiClient
        .post('/api/v1/auth/register', {
          firstname,
          lastname,
          username,
          email,
          password,
          profileImage
        })
        .then((response) => {
          this.token = response.data.access_token
          this.user = response.data.user
          persistState(this.token, this.user)
          return response
        })
    },
    login(username: string, password: string) {
      return apiClient
        .post('/api/v1/auth/authenticate', {
          username,
          password
        })
        .then((response) => {
          this.token = response.data.access_token
          this.user = response.data.user
          persistState(this.token, this.user)
          return response
        })
    },
    logout() {
      this.token = null
      this.user = null
      persistState(null, null)
    },
    reload(token: string, user: AuthUser) {
      this.token = token
      this.user = user
    },
    promoteUser(userId: number, role: string) {
      return apiClient.put(`/api/v1/users/${userId}/role`, { role })
    },
    fetchUsers() {
      return apiClient.get<AuthUser[]>('/api/v1/users')
    }
  }
})
