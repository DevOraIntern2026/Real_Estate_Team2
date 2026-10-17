import { useMutation } from '@tanstack/react-query'
import { getAIRecommendations } from '@/features/chatbot/api/aiRecommendationApi'

export function useAIRecommendations() {
  return useMutation({
    mutationFn: getAIRecommendations,
  })
}
