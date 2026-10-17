import { apiClient } from '@/services/api/apiClient'
import type { ApiResponse } from '@/types/api'
import type { LandingPageData } from '@/features/landing/types/landingPage'

export async function getLandingPageData() {
  const { data } = await apiClient.get<ApiResponse<LandingPageData>>('/landingPage')

  if (!data.data) {
    throw new Error(data.message || 'Landing page data was not returned.')
  }

  return data.data
}
