// src/service/AxiosInterceptorSetup.ts
import apiClient from '@/service/AxiosClient'

apiClient.interceptors.request.use(
  (request) => { 
    // CRITICAL: Read token from local storage
    const token = localStorage.getItem('access_token')
    if (token) {
      // Attach the token to the Authorization header
      request.headers.Authorization = 'Bearer ' + token
    }
    return request
  },
  (error) => {
    return Promise.reject(error)
  }
)
