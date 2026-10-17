export interface EnumOption {
  value: number;
  label: string;
}

export interface IPropertyCard {
  _id: string;
  title: string;
  slug: string;
  image: string;
  status: number;
  propertyType: number;
  transactionType: number;
  furnishing?: number;
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  location: { city: string; area: string; address: string };
  isFeatured: boolean;
}

export interface ISearchFilters {
  lookingFor: EnumOption[];        // For Rent / For Buy
  areas: string[];                  // New Cairo, Future City, ...
  propertyTypes: EnumOption[];      // Apartment, Villa, Duplex, ...
  bedrooms: number[];               // 1,2,3,4,5
  bathrooms: number[];              // 0,1,2,3,4
  priceRange: { min: number; max: number };
  unitAreaRange: { min: number; max: number };
  finishing: EnumOption[];          // Fully finished, Semi finished, ...
  amenities: string[];              // Garden, Has roof, ...
}

export interface ISearchPageResponse {
  filters: ISearchFilters;
  properties: IPropertyCard[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}