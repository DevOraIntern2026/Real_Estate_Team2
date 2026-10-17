export type AIRecommendationRequest = {
  message: string
}

export type AIPropertyRecommendation = {
  _id: string
  title: string
  slug: string
  description: string
  category: string
  propertyType: number
  transactionType: number
  price: number
  currency: string
  area: number
  bedrooms: number
  bathrooms: number
  amenities: string[]
  location: {
    address: string
    city: string
    area: string
  }
  images: string[]
  coverImage: string
  isFeatured: boolean
}

export type AIRecommendationResponse = {
  success: boolean
  preferences?: {
    transactionType?: string
    propertyType?: string
    location?: string
    minPrice?: number
    maxPrice?: number
    bedrooms?: number
    bathrooms?: number
    furnished?: boolean
    preferences?: Record<string, boolean>
  }
  needsClarification: boolean
  clarificationQuestion?: string
  unsupportedAction: boolean
  actionMessage?: string
  recommendations?: AIPropertyRecommendation[]
  meta?: {
    count: number
  }
}

export type ChatbotMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  recommendations?: AIPropertyRecommendation[]
}
