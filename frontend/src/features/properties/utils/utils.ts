import {
  Furnishing,
  PropertyStatus,
  PropertyType,
  TransactionType,
  type FurnishingValue,
  type PropertyLocation,
  type PropertyStatusValue,
  type PropertyTypeValue,
  type TransactionTypeValue,
} from '../types/types'

export const propertyTypeLabel: Record<PropertyTypeValue, string> = {
  [PropertyType.Apartment]: 'Apartment',
  [PropertyType.Villa]: 'Villa',
  [PropertyType.House]: 'House',
  [PropertyType.Townhouse]: 'Townhouse',
  [PropertyType.Studio]: 'Studio',
  [PropertyType.Land]: 'Land',
  [PropertyType.Commercial]: 'Commercial',
}

export const furnishingLabel: Record<FurnishingValue, string> = {
  [Furnishing.Furnished]: 'Furnished',
  [Furnishing.SemiFurnished]: 'Semi-furnished',
  [Furnishing.Unfurnished]: 'Unfurnished',
}

export function formatPrice(
  price: number,
  currency: string,
  transactionType: TransactionTypeValue,
): string {
  const amount = new Intl.NumberFormat('en-US').format(price)
  const suffix = transactionType === TransactionType.Rent ? '/month' : ''
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
  transactionType: TransactionTypeValue,
  status: PropertyStatusValue,
): ListingBadge {
  if (status === PropertyStatus.Sold) return { label: 'Sold', tone: 'error' }
  if (status === PropertyStatus.Rented)
    return { label: 'Rented', tone: 'error' }
  return transactionType === TransactionType.Rent
    ? { label: 'For Rent', tone: 'info' }
    : { label: 'For Buy', tone: 'info' }
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
