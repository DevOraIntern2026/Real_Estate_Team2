import axios from 'axios'
import { getAccessToken } from '@/services/api/tokenStorage'

// const baseURL = import.meta.env.VITE_API_BASE_URL
const baseURL = import.meta.env.VITE_API_URL

// if (!baseURL) {
//   throw new Error('VITE_API_BASE_URL is not configured.')
// }

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
