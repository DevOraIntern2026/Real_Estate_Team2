import { useQuery } from '@tanstack/react-query'
import { getLandingPageData } from '@/features/landing/api/landingPageApi'

export function useLandingPage() {
  return useQuery({
    queryKey: ['landingPage'],
    queryFn: getLandingPageData,
  })
}
