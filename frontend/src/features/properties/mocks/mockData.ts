import type { PropertyData } from '../types/types'

export const mockPropertyDetails: PropertyData = {
  _id: '6ac53c82eca41412fe09fe03',
  title: 'Luxury 3-Bedroom Apartment in New Cairo',
  slug: 'luxury-3-bedroom-apartment-in-new-cairo-09fe04',
  description:
    "A stunning modern apartment located in the heart of New Cairo's Fifth Settlement.",
  price: 500000,
  currency: 'EGP',
  transactionType: 0,
  propertyType: 0,
  status: 1,
  isFeatured: false,
  views: 8,
  createdAt: '2026-10-06T18:22:58.290Z',
  coverImage:
    'https://res.cloudinary.com/dpran96qw/image/upload/v1791317481/devora/real-estate/properties/dwomjkvaylbppqcp6flu.jpg',
  images: [
    'https://res.cloudinary.com/dpran96qw/image/upload/v1791317481/devora/real-estate/properties/dwomjkvaylbppqcp6flu.jpg',
  ],
  location: {
    city: 'New Cairo',
    area: 'Fifth Settlement',
    state: 'Cairo',
  },
  about: {
    bedrooms: 3,
    bathrooms: 2,
    area: 180,
    floor: 5,
    furnishing: 1,
  },
  amenities: ['Swimming Pool', 'Gym', '24/7 Security'],
  agent: {
    _id: '6ac5279aeca41412fe09fe01',
    username: 'Mohamed Awad',
    email: 'mohamemd3waad@gmail.com',
    phone: '+201000000000',
    role: 1,
  },
  reviews: { count: 0, averageRating: 0 },
  related: [],
}
