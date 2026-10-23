export type LandingFilterOption = {
  value: number
  label: string
}

export type LandingProperty = {
  _id: string
  title: string
  slug: string
  image: string
  propertyType: number
  transactionType: number
  price: number
  currency: string
  bedrooms: number
  bathrooms: number
  area: number
  location: {
    city: string
    area: string
    address: string
  }
  isFeatured: boolean
}

export type LandingPageData = {
  totalProperties: number
  filters: {
    transactionTypes: LandingFilterOption[]
    propertyTypes: LandingFilterOption[]
    bedrooms: number[]
  }
  discoverProperties: LandingProperty[]
  cities: {
    propertiesCount: number
    name: string
    image: string
  }[]
  topRecommended: LandingProperty[]
}
