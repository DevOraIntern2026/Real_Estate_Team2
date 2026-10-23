import { apiClient } from '@/services/api/apiClient'
import type { ApiResponse } from '@/types/api'
import type { SearchPageData, SearchQuery } from '@/features/search/types/search'

export async function searchProperties(query: SearchQuery = {}) {
  const params = Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== ''),
  )
  const { data } = await apiClient.get<ApiResponse<SearchPageData>>('/search', {
    params,
  })

  if (!data.data) {
    throw new Error(data.message || 'Search results were not returned.')
  }

  return data.data
}
