export interface EnumOption {
  value: number;
  label: string;
}

export interface IPropertyCard {
  _id: string;
  title: string;
  slug: string;
  image: string;
  propertyType: number;
  transactionType: number;
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  location: {
    city: string;
    area: string;
    address: string;
  };
  isFeatured: boolean;
}

export interface ICityCard {
  name: string;
  image: string;
  propertiesCount: number;
}

export interface ILandingPageResponse {
  totalProperties: number;
  filters: {
    transactionTypes: EnumOption[];
    propertyTypes: EnumOption[];
    bedrooms: number[];
  };
  hero: {
    title: string;
    subtitle: string;
    image: string;
    searchPlaceholder: string;
  };
  exclusiveOffers: Array<{
    id: string;
    title: string;
    subtitle: string;
    image: string;
    discount: string;
  }>;
  discoverProperties: IPropertyCard[];
  cities: ICityCard[];
  topRecommended: IPropertyCard[];
}