export type SearchFilterOption = {
  value: number
  label: string
}

export type SearchFilterMetadata = {
  lookingFor: SearchFilterOption[]
  areas: string[]
  propertyTypes: SearchFilterOption[]
  bedrooms: number[]
  bathrooms: number[]
  priceRange: { min: number; max: number }
  unitAreaRange: { min: number; max: number }
  finishing: SearchFilterOption[]
  amenities: string[]
}

export type SearchProperty = {
  _id: string
  title: string
  slug: string
  image: string
  propertyType: number
  transactionType: number
  price: number
  currency: string
  bedrooms: number
  bathrooms: number
  area: number
  location: {
    city: string
    area: string
    address: string
  }
  isFeatured: boolean
}

export type SearchQuery = {
  search?: string
  transactionType?: string
  city?: string
  area?: string
  propertyType?: string
  bedrooms?: string
  bathrooms?: string
  minPrice?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
  furnishing?: string
  amenities?: string
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc'
  page?: number
  limit?: number
}

export type SearchPageData = {
  filters: SearchFilterMetadata
  properties: SearchProperty[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}
