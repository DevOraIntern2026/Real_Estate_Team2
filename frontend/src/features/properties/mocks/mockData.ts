import {
  Furnishing,
  PropertyStatus,
  PropertyType,
  TransactionType,
  type InquiryPayload,
  type PropertyDetailsData,
  type PropertySummary,
} from '../types/types'

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86_400_000).toISOString()

const related: PropertySummary[] = [
  {
    _id: '6ac53c82eca41412fe09fe10',
    slug: 'luxury-townhouse-future-city-09fe10',
    title: 'Luxury Townhouse',
    images: [img('photo-1568605114967-8130f3a36994', 700)],
    transactionType: TransactionType.Rent,
    status: PropertyStatus.Published,
    categoryName: 'Townhouse',
    price: 25000,
    currency: 'EGP',
    bedrooms: 4,
    bathrooms: 2,
    area: 48,
    location: {
      address: '',
      city: 'Future City',
      area: '',
      state: '',
      country: 'Egypt',
    },
    rating: 4.8,
  },
  {
    _id: '6ac53c82eca41412fe09fe11',
    slug: 'cozy-family-home-ain-sokhna-09fe11',
    title: 'Cozy Family Home',
    images: [img('photo-1564013799919-ab600027ffc6', 700)],
    transactionType: TransactionType.Sale,
    status: PropertyStatus.Sold,
    categoryName: 'House',
    price: 1000000,
    currency: 'EGP',
    bedrooms: 4,
    bathrooms: 2,
    area: 48,
    location: {
      address: '',
      city: 'Ain Sokhna',
      area: '',
      state: '',
      country: 'Egypt',
    },
    rating: 4.8,
  },
  {
    _id: '6ac53c82eca41412fe09fe12',
    slug: 'modern-downtown-apartment-09fe12',
    title: 'Modern Downtown Apartment',
    images: [img('photo-1545324418-cc1a3fa10c00', 700)],
    transactionType: TransactionType.Sale,
    status: PropertyStatus.Published,
    categoryName: 'Apartment',
    price: 500000,
    currency: 'EGP',
    bedrooms: 4,
    bathrooms: 2,
    area: 48,
    location: {
      address: '',
      city: 'New Cairo',
      area: '',
      state: '',
      country: 'Egypt',
    },
    rating: 4.8,
  },
]

export const mockPropertyDetails: PropertyDetailsData = {
  property: {
    _id: '6ac53c82eca41412fe09fe03',
    slug: 'modern-apartment-new-cairo-09fe04',
    title: 'Modern apartment',
    description: 'Apartment For Sale in Villette, Golden Square, New Cairo',
    category: '6ac527ebeca41412fe09fe02',
    categoryName: 'Apartment',
    propertyType: PropertyType.Apartment,
    transactionType: TransactionType.Rent,
    price: 25000,
    currency: 'EGP',
    area: 139,
    bedrooms: 2,
    bathrooms: 3,
    floor: 1,
    furnishing: Furnishing.SemiFurnished,
    amenities: [
      'Elevator',
      'Clubhouse',
      'Parking',
      'Cable TV',
      'Wi-Fi Internet',
    ],
    location: {
      address: 'Villette, Golden Square',
      city: 'New Cairo',
      area: 'Golden Square',
      state: 'Cairo',
      country: 'Egypt',
    },
    images: [
      img('photo-1560448204-e02f11c3d0e2'),
      img('photo-1502672260266-1c1ef2d93688'),
      img('photo-1522708323590-d24dbb6b0267'),
      img('photo-1560185007-cde436f6a4d0'),
      img('photo-1493809842364-78817add7ffb'),
      img('photo-1484154218962-a197022b5858'),
    ],
    imagePublicIds: [],
    owner: {
      _id: '6ac5279aeca41412fe09fe01',
      name: 'Emilia Buck',
      phone: '(+20) 10 111-11-011',
      email: 'rsmartin@optonline.net',
      avatar: img('photo-1494790108377-be9c29b29330', 160),
    },
    status: PropertyStatus.Published,
    views: 128,
    isFeatured: false,
    createdAt: '2026-10-06T18:22:58.290Z',
    updatedAt: '2026-10-06T18:22:58.290Z',
    // Not in the API yet:
    extra: {
      finishing: 'Core & Shell',
      delivery: 'Ready to deliver',
      constructionYear: 2026,
    },
  },
  reviews: [
    {
      _id: 'r1',
      author: 'Sarah M.',
      avatar: img('photo-1438761681033-6461ffad8d80', 120),
      rating: 5,
      comment:
        'Great landlord! Very responsive to maintenance requests. The property is exactly as described.',
      createdAt: daysAgo(60),
    },
    {
      _id: 'r2',
      author: 'Michael R.',
      avatar: img('photo-1500648767791-00dcc994a43e', 120),
      rating: 4,
      comment:
        'Perfect location and well-maintained property. Highly recommend!',
      createdAt: daysAgo(180),
    },
    {
      _id: 'r3',
      author: 'Emily L.',
      avatar: img('photo-1544005313-94ddf0286df2', 120),
      rating: 3,
      comment:
        'Nice property in a quiet neighborhood. Good communication with the owner.',
      createdAt: daysAgo(400),
    },
    {
      _id: 'r4',
      author: 'Omar K.',
      avatar: img('photo-1507003211169-0a1dd7228f2d', 120),
      rating: 5,
      comment: 'Bright, spacious and the building is very well managed.',
      createdAt: daysAgo(500),
    },
  ],
  related,
}

/** Swap this for `GET /api/properties/:id` when the backend is ready. */
export async function fetchPropertyDetails(
  id: string,
): Promise<PropertyDetailsData> {
  await new Promise((r) => setTimeout(r, 400))
  if (!id) throw new Error('Property not found') // mirrors the API 404 message
  return mockPropertyDetails
}

/** Swap this for `POST /api/inquiries`. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function submitInquiry(_payload: InquiryPayload): Promise<void> {
  await new Promise((r) => setTimeout(r, 600))
}
