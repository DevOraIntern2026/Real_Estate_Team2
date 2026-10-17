import { useQuery } from '@tanstack/react-query'
import { searchProperties } from '@/features/search/api/searchApi'
import type { SearchQuery } from '@/features/search/types/search'

export function useSearchProperties(query: SearchQuery) {
  return useQuery({
    queryKey: ['searchProperties', query],
    queryFn: () => searchProperties(query),
    placeholderData: (previousData) => previousData,
  })
}
