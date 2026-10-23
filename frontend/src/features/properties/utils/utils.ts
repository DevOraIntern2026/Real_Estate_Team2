import {
  type PropertyLocation,
  type PropertyData,
  type PropertyAbout,
} from '../types/types'

export const propertyTypeLabel: Record<PropertyData['propertyType'], string> = {
  0: 'Apartment',
  1: 'Villa',
  2: 'Townhouse',
} as unknown as Record<PropertyData['propertyType'], string>

export const furnishingLabel: Record<
  NonNullable<PropertyAbout['furnishing']>,
  string
> = {
  0: 'Unfurnished',
  1: 'Semi-furnished',
  2: 'Furnished',
}

export function formatPrice(
  price: number,
  currency: string,
  transactionType: PropertyData['transactionType'],
): string {
  const amount = new Intl.NumberFormat('en-US').format(price)
  const suffix = transactionType === 1 ? '/month' : ''
  return `${currency} ${amount}${suffix}`
}

export function formatLocation({
  city,
  state,
  country,
}: PropertyLocation): string {
  return [city, state, country].filter(Boolean).join(', ')
}

export interface ListingBadge {
  label: string
  tone: 'info' | 'error'
}

export function getListingBadge(
  transactionType: PropertyData['transactionType'],
  status: PropertyData['status'],
): ListingBadge {
  if (status === 2) return { label: 'Sold', tone: 'error' }
  return transactionType === 1
    ? { label: 'For Rent', tone: 'info' }
    : { label: 'For sale', tone: 'info' }
}

export function timeAgo(iso: string): string {
  const diffDays = Math.round(
    (new Date(iso).getTime() - Date.now()) / 86_400_000,
  )
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'always' })
  const abs = Math.abs(diffDays)
  if (abs >= 365) return rtf.format(Math.round(diffDays / 365), 'year')
  if (abs >= 30) return rtf.format(Math.round(diffDays / 30), 'month')
  if (abs >= 1) return rtf.format(diffDays, 'day')
  return 'today'
}

export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
