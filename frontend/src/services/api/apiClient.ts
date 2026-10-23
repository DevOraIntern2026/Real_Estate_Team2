import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  updateAuthTokens,
} from '@/services/api/tokenStorage'

const baseURL = import.meta.env.VITE_API_BASE_URL

// if (!baseURL) {
//   throw new Error('VITE_API_BASE_URL is not configured.')
// }

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

type TokenPair = { accessToken: string; refreshToken: string }
type RefreshResponse = {
  message?: string
  accessToken?: string
  refreshToken?: string
  loginTokens?: TokenPair
  tokens?: TokenPair
  data?: {
    accessToken?: string
    refreshToken?: string
    loginTokens?: TokenPair
    tokens?: TokenPair
  } | TokenPair
}
type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let refreshInProgress: Promise<TokenPair> | null = null

async function refreshAuthTokens(): Promise<TokenPair> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token is available.')

  const response = await axios.post<RefreshResponse>(
    `${baseURL.replace(/\/$/, '')}/auth/refresh`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } },
  )
  const body = response.data
  const nestedData = body.data
  const tokens = body.loginTokens
    ?? body.tokens
    ?? (nestedData && 'loginTokens' in nestedData ? nestedData.loginTokens : undefined)
    ?? (nestedData && 'tokens' in nestedData ? nestedData.tokens : undefined)
    ?? nestedData
    ?? body

  const accessToken = tokens?.accessToken
  const nextRefreshToken = tokens?.refreshToken
  if (typeof accessToken !== 'string' || typeof nextRefreshToken !== 'string') {
    throw new Error(body.message || 'Token refresh response did not include both tokens.')
  }

  const tokenPair = { accessToken, refreshToken: nextRefreshToken }
  updateAuthTokens(tokenPair)
  return tokenPair
}

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken()

  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (axios.isAxiosError(error) && typeof window !== 'undefined') {
      const status = error.response?.status
      const hasSession = Boolean(getAccessToken())
      const originalRequest = error.config as RetryableRequestConfig | undefined
      const requestUrl = originalRequest?.url ?? ''

      const isAuthRequest = ['/auth/login', '/auth/refresh', '/auth/rotateToken', '/auth/logout']
        .some((path) => requestUrl.includes(path))

      if (status === 401 && hasSession && !isAuthRequest && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true
        try {
          refreshInProgress ??= refreshAuthTokens().finally(() => {
            refreshInProgress = null
          })
          const tokens = await refreshInProgress
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`
          return apiClient(originalRequest)
        } catch {
          clearAuthTokens()
          if (window.location.pathname !== '/error/401') window.location.assign('/error/401')
          return Promise.reject(error)
        }
      }

      // Keep credential and form errors local. Refresh failures are handled by
      // the original protected request above.
      if (status === 401 && hasSession && !isAuthRequest && window.location.pathname !== '/error/401') {
        clearAuthTokens()
        window.location.assign('/error/401')
      } else if (status === 403 && window.location.pathname !== '/error/403') {
        window.location.assign('/error/403')
      }
    }

    return Promise.reject(error)
  },
)
