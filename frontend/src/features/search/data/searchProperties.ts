import available from '@/assets/images/property-available.png'
import comingSoon from '@/assets/images/property-coming-soon.png'

export type SearchProperty = {
  id: number
  title: string
  status: 'Available' | 'Coming Soon'
  type: 'Townhouse' | 'Apartement'
  location: string
  areaName: string
  price: number
  beds: number
  baths: number
  area: number
  image: string
}

export const searchProperties: SearchProperty[] = [
  { id: 1, title: 'LuxuryTownhouse', status: 'Available', type: 'Townhouse', location: 'Future City, Egypt', areaName: 'Future City', price: 5000000, beds: 4, baths: 2, area: 144, image: available },
  { id: 2, title: 'Modern Downtown Apartment', status: 'Coming Soon', type: 'Apartement', location: 'New Cairo, Egypt', areaName: 'New Cairo', price: 500000, beds: 4, baths: 2, area: 144, image: comingSoon },
  { id: 3, title: 'LuxuryTownhouse', status: 'Available', type: 'Townhouse', location: 'Future City, Egypt', areaName: 'Future City', price: 5000000, beds: 4, baths: 2, area: 144, image: available },
  { id: 4, title: 'Modern Downtown Apartment', status: 'Coming Soon', type: 'Apartement', location: 'New Cairo, Egypt', areaName: 'New Cairo', price: 500000, beds: 4, baths: 2, area: 144, image: comingSoon },
  { id: 5, title: 'LuxuryTownhouse', status: 'Available', type: 'Townhouse', location: 'Future City, Egypt', areaName: 'Future City', price: 5000000, beds: 4, baths: 2, area: 144, image: available },
  { id: 6, title: 'Modern Downtown Apartment', status: 'Coming Soon', type: 'Apartement', location: 'New Cairo, Egypt', areaName: 'New Cairo', price: 500000, beds: 4, baths: 2, area: 144, image: comingSoon },
]
