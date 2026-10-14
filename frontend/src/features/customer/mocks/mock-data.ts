import type { Inquiry } from '../schema/inquiry.schema'
import type { User } from '../types/user'

export const mockUser: User = {
  _id: '6ac5279aeca41412fe09fe01',
  firstName: 'Nova',
  lastName: 'Bennett',
  email: 'john.doe@example.com',
  phone: '10 000 00 000',
  phoneCode: '+20',
  gender: 'female',
  country: 'Egypt',
  address: 'Street 90, Fifth Settlement',
  zipCode: '11835',
  role: 'customer',
  avatar:
    'https://images.unsplash.com/photo-1546961329-78bef0414d7c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
}

const img = (seed: string) => [`https://picsum.photos/seed/${seed}/200/200`]

export const mockInquiries: Inquiry[] = [
  {
    _id: 'inq_001',
    status: 'pending',
    createdAt: '2026-10-10T10:45:00.000Z',
    property: {
      _id: 'p1',
      slug: 'modern-apartment-09fe04',
      title: 'Modern Apartment',
      price: 25000,
      currency: 'EGP',
      transactionType: 'rent',
      images: img('apt1'),
      location: { city: 'New Cairo', country: 'Egypt' },
    },
    owner: {
      _id: 'o1',
      name: 'Ahmed Hassan',
      title: 'Verified Agent',
      avatar: 'https://i.pravatar.cc/80?img=12',
    },
  },
  {
    _id: 'inq_002',
    status: 'replied',
    createdAt: '2026-10-08T16:20:00.000Z',
    property: {
      _id: 'p2',
      slug: 'luxury-villa-09fe05',
      title: 'Luxury Villa',
      price: 8000000,
      currency: 'EGP',
      transactionType: 'sale',
      images: img('villa2'),
      location: { city: 'Sheikh Zayed', country: 'Egypt' },
    },
    owner: {
      _id: 'o2',
      name: 'Sara Mahmoud',
      title: 'Direct Owner',
      avatar: 'https://i.pravatar.cc/80?img=45',
    },
  },
  {
    _id: 'inq_003',
    status: 'replied',
    createdAt: '2026-10-05T13:15:00.000Z',
    property: {
      _id: 'p3',
      slug: 'studio-for-rent-09fe06',
      title: 'Studio for Rent',
      price: 30000,
      currency: 'EGP',
      transactionType: 'sale',
      images: img('studio3'),
      location: { city: 'Future City', country: 'Egypt' },
    },
    owner: {
      _id: 'o3',
      name: 'Omar Ali',
      title: 'Senior Broker',
      avatar: 'https://i.pravatar.cc/80?img=33',
    },
  },
  {
    _id: 'inq_004',
    status: 'closed',
    createdAt: '2026-10-01T09:00:00.000Z',
    property: {
      _id: 'p4',
      slug: 'cozy-apartment-09fe07',
      title: 'Cozy Apartment',
      price: 4000000,
      currency: 'EGP',
      transactionType: 'sale',
      images: img('cozy4'),
      location: { city: 'Future City', country: 'Egypt' },
    },
    owner: {
      _id: 'o4',
      name: 'Laila Sami',
      title: 'Commercial Specialist',
      avatar: 'https://i.pravatar.cc/80?img=5',
    },
  },
  ...Array.from({ length: 8 }, (_, i): Inquiry => ({
    _id: `inq_${100 + i}`,
    status: (['pending', 'replied', 'closed'] as const)[i % 3],
    createdAt: new Date(Date.UTC(2026, 8, 28 - i, 11, 30)).toISOString(),
    property: {
      _id: `px${i}`,
      slug: `property-${i}`,
      title: `Family Apartment ${i + 1}`,
      price: 3_000_000 + i * 250_000,
      currency: 'EGP',
      transactionType: 'sale',
      images: img(`fam${i}`),
      location: { city: 'New Cairo', country: 'Egypt' },
    },
    owner: {
      _id: `ox${i}`,
      name: `Owner ${i + 1}`,
      title: 'Verified Agent',
      avatar: `https://i.pravatar.cc/80?img=${20 + i}`,
    },
  })),
]
