import axios from 'axios'
import type { PropertyApiResponse, PropertyData } from '../types/types'
import { mockPropertyDetails } from '../mocks/mockData'
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
        : 'Could not connect to the server. Check that the API is running and try again.'))
    }
    throw error
  }
}

export const getPropertyDetails = async (id: string): Promise<PropertyData> => {
  try {
    const response = await apiClient.get<PropertyApiResponse>(
      `/property-details/${id}`,
    )
    return response.data.data
  } catch {
    console.warn('API in down, falling back to mock data')
    return mockPropertyDetails
  }
}
