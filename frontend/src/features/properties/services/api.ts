import axios from 'axios'
import type { PropertyApiResponse, PropertyData, Review } from '../types/types'
import { apiClient } from '@/services/api/apiClient'
import { getAccessToken } from '@/services/api/tokenStorage'

export interface InquiryPayload {
  propertyId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  message: string
}

function findValidationMessage(value: unknown): string | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const message = findValidationMessage(item)
      if (message) return message
    }
    return null
  }
  if (!value || typeof value !== 'object') return null

  const record = value as Record<string, unknown>
  if (typeof record.message === 'string') {
    const path = Array.isArray(record.path) ? record.path.filter((part) => typeof part === 'string').join('.') : ''
    return path ? `${path}: ${record.message}` : record.message
  }
  for (const nested of Object.values(record)) {
    const message = findValidationMessage(nested)
    if (message) return message
  }
  return null
}

export const submitInquiry = async (payload: InquiryPayload): Promise<string> => {
  const accessToken = getAccessToken()?.replace(/^Bearer\s+/i, '').trim()
  if (!accessToken) throw new Error('Please sign in again before sending an inquiry.')

  try {
    const response = await apiClient.post<{ message?: string }>(
      '/customer/inquiries',
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
    return response.data.message ?? 'Inquiry submitted successfully.'
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data as { message?: unknown; Error?: unknown; errors?: unknown } | undefined
      const serverMessage = typeof responseData?.message === 'string'
        ? responseData.message
        : typeof responseData?.Error === 'string'
          ? responseData.Error
          : null
      const validationMessage = findValidationMessage(responseData?.errors)
        ?? findValidationMessage((responseData as { cause?: unknown } | undefined)?.cause)
      throw new Error(serverMessage ?? validationMessage ?? (error.response
        ? `The server could not submit your inquiry (${error.response.status}).`
        : 'Could not connect to the server. Check that the API is running and try again.'), { cause: error })
    }
    throw error
  }
}

export const getPropertyDetails = async (id: string): Promise<PropertyData> => {
  if (!id) throw new Error('A property ID is required to load its details.')

  const response = await apiClient.get<PropertyApiResponse>(
    `/property-details/${encodeURIComponent(id)}`,
  )
  const raw = response.data.data
  if (!raw?._id) throw new Error(response.data.message || 'The property details response was empty.')

  const images = Array.isArray(raw.images) ? raw.images.filter((image) => typeof image === 'string' && image.trim()) : []
  if (!images.length && raw.coverImage) images.push(raw.coverImage)
  const rawReviews = (raw.reviews?.items ?? []) as Array<Partial<Review> & { user?: { name?: string; avatar?: string } }>
  const reviews = rawReviews
    .filter((review) => Boolean(review.author || review.user?.name) && typeof review.comment === 'string' && typeof review.rating === 'number')
    .map((review, index): Review => ({
      _id: review._id || `review-${index}`,
      avatar: review.avatar || review.user?.avatar || '',
      author: review.author || review.user?.name || 'Customer',
      rating: review.rating ?? 0,
      comment: review.comment ?? '',
      createdAt: review.createdAt || '',
    }))

  return {
    ...raw,
    images,
    coverImage: raw.coverImage || images[0] || '',
    location: { ...raw.location, city: raw.location?.city ?? '', area: raw.location?.area ?? '' },
    about: {
      ...raw.about,
      bedrooms: raw.about?.bedrooms ?? 0,
      bathrooms: raw.about?.bathrooms ?? 0,
      area: raw.about?.area ?? 0,
    },
    agent: raw.agent ?? { _id: '', username: '', email: '', phone: null, role: 'agent' },
    amenities: Array.isArray(raw.amenities) ? raw.amenities : [],
    reviews: {
      count: raw.reviews?.count ?? reviews.length,
      averageRating: raw.reviews?.averageRating ?? 0,
      items: reviews,
    },
    related: Array.isArray(raw.related) ? raw.related : [],
  }
}
