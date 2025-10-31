// src/service/AxiosInterceptorSetup.ts
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import apiClient from '@/service/AxiosClient'

// Attach Authorization header from local storage on every request
apiClient.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      request.headers = request.headers || {}
      ;(request.headers as any).Authorization = 'Bearer ' + token
    }
    return request
  },
  (error: AxiosError) => Promise.reject(error)
)

// No response fallback; enforce using only VITE_BACKEND_URL.
