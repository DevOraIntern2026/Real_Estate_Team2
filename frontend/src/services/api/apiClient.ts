import axios from 'axios'
import { clearAuthTokens, getAccessToken } from '@/services/api/tokenStorage'

const baseURL = import.meta.env.VITE_API_BASE_URL

if (!baseURL) {
  throw new Error('VITE_API_BASE_URL is not configured.')
}

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken()

  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && typeof window !== 'undefined') {
      const status = error.response?.status
      const hasSession = Boolean(getAccessToken())

      // Keep credential and form errors in their local UI; only redirect when
      // an authenticated API request has lost its authorization.
      const isLoginRequest = error.config?.url?.includes('/auth/login')

      if (status === 401 && hasSession && !isLoginRequest && window.location.pathname !== '/error/401') {
        clearAuthTokens()
        window.location.assign('/error/401')
      } else if (status === 403 && window.location.pathname !== '/error/403') {
        window.location.assign('/error/403')
      }
    }

    return Promise.reject(error)
  },
)
