import { apiClient } from '@/services/api/apiClient'
import type { ApiResponse } from '@/types/api'
import type { AIRecommendationRequest, AIRecommendationResponse } from '@/features/chatbot/types/aiRecommendation'

export async function getAIRecommendations(payload: AIRecommendationRequest) {
  const { data } = await apiClient.post<ApiResponse<AIRecommendationResponse>>(
    '/ai/recommend',
    payload,
  )

  if (!data.data) {
    throw new Error(data.message || 'The assistant did not return a response.')
  }

  return data.data
}
