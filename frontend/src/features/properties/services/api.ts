import axios from 'axios'
import type { PropertyApiResponse, PropertyData } from '../types/types'
import { mockPropertyDetails } from '../mocks/mockData'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
export interface InquiryPayload {
  propertyId: string
  fullName: string
  email: string
  phone: string
  message: string
}

export const submitInquiry = async (payload: InquiryPayload): Promise<void> => {
  await apiClient.post('/inquiries', payload)
}
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

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
