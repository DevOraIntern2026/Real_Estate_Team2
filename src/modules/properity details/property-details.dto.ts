export interface IAgent {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
}

export interface IReview {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface IRelatedProperty {
  _id: string;
  title: string;
  image: string;
  status: number;
  propertyType: number;
  transactionType: number;
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  location: { city: string; area: string };
}

export interface IPropertyDetailsResponse {
  // ---- top / hero ----
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  transactionType: number;
  propertyType: number;
  status: number;
  isFeatured: boolean;
  views: number;
  createdAt: Date;

  // ---- gallery ----
  images: string[];
  coverImage: string;

  // ---- location + map ----
  location: {
    address: string;
    city: string;
    area: string;
    state?: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };

  // ---- about section ----
  about: {
    bedrooms: number;
    bathrooms: number;
    area: number;        // m²
    floor?: number;
    furnishing?: number;
    completionYear?: number;
    readyBy?: string;
  };

  // ---- amenities ----
  amenities: string[];

  // ---- agent ----
  agent: IAgent;

  // ---- reviews ----
  reviews: {
    count: number;
    averageRating: number;
    items: IReview[];
  };

  // ---- related ----
  related: IRelatedProperty[];
}