export interface PropertyLocation {
  address?: string
  city: string
  area: string
  state?: string
  country?: string
  coordinates?: { lat?: number; lng?: number }
}

export interface PropertyAbout {
  bedrooms: number
  bathrooms: number
  area: number
  floor?: number
  furnishing?: number
  completionYear?: number
  readyBy?: string
}

export interface PropertyAgent {
  _id: string
  username: string
  email: string
  phone: string | null
  role: number | string
  avatar?: string
}

export interface RelatedProperty {
  _id: string
  title: string
  slug?: string
  image: string
  status?: number
  propertyType: number
  transactionType: number
  price: number
  currency: string
  bedrooms: number
  bathrooms: number
  area: number
  isFeatured?: boolean
  location: {
    city: string
    area: string
  }
}

export interface PropertyData {
  _id: string
  title: string
  slug: string
  description: string
  price: number
  currency: string
  transactionType: number
  propertyType: number
  status: number
  isFeatured: boolean
  views: number
  createdAt: string
  images: string[]
  coverImage: string
  location: {
    city: string
    area: string
    state?: string
    country?: string
    coordinates?: { lat?: number; lng?: number }
  }
  about: PropertyAbout
  amenities: string[]
  agent: PropertyAgent
  reviews: {
    count: number
    averageRating: number
    items?: Review[]
  }
  related: RelatedProperty[]
}

export type Property = PropertyData

export interface Review {
  _id: string
  avatar: string
  author: string
  rating: number
  comment: string
  createdAt: string
}

export interface PropertyApiResponse {
  message: string
  data: PropertyData
}
