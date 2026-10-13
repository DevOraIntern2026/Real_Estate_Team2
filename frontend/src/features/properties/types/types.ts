// Numeric enums mirror the API response (`propertyType: 0`, `transactionType: 0`, `furnishing: 1`, `status: 0`).
// ASSUMPTION: the mapping of numbers -> names is inferred from the request/response example. Confirm with backend.
export const PropertyType = {
  Apartment: 0,
  Villa: 1,
  House: 2,
  Townhouse: 3,
  Studio: 4,
  Land: 5,
  Commercial: 6,
} as const;
export type PropertyTypeValue = (typeof PropertyType)[keyof typeof PropertyType];

export const TransactionType = { Sale: 0, Rent: 1 } as const;
export type TransactionTypeValue =
  (typeof TransactionType)[keyof typeof TransactionType];

export const Furnishing = { Furnished: 0, SemiFurnished: 1, Unfurnished: 2 } as const;
export type FurnishingValue = (typeof Furnishing)[keyof typeof Furnishing];

// Follows the listing lifecycle in the project brief.
export const PropertyStatus = {
  Draft: 0,
  Submitted: 1,
  UnderReview: 2,
  Approved: 3,
  Published: 4,
  Inactive: 5,
  Sold: 6,
  Rented: 7,
} as const;
export type PropertyStatusValue = (typeof PropertyStatus)[keyof typeof PropertyStatus];

export interface PropertyLocation {
  address: string;
  city: string;
  area: string;
  state: string;
  country: string;
}

/** Contact person shown in the "Contact agent" card (the populated `owner`). */
export interface PropertyOwner {
  _id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
}

/** Fields not (yet) in the API but present in the design. */
export interface PropertyExtraDetails {
  finishing?: string;
  delivery?: string;
  constructionYear?: number;
}

/** Shape of `GET /api/properties/:id` (based on the "add property" response). */
export interface Property {
  _id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  categoryName: string; // ASSUMPTION: populated category name
  propertyType: PropertyTypeValue;
  transactionType: TransactionTypeValue;
  price: number;
  currency: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  floor: number;
  furnishing: FurnishingValue;
  amenities: string[];
  location: PropertyLocation;
  images: string[];
  imagePublicIds: string[];
  owner: PropertyOwner;
  status: PropertyStatusValue;
  views: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  extra?: PropertyExtraDetails;
}

/** Lightweight shape for cards (related properties). */
export type PropertySummary = Pick<
  Property,
  | '_id'
  | 'slug'
  | 'title'
  | 'images'
  | 'transactionType'
  | 'status'
  | 'categoryName'
  | 'price'
  | 'currency'
  | 'bedrooms'
  | 'bathrooms'
  | 'area'
  | 'location'
> & { rating: number };

/** Reviews are not in the API docs yet — mock only. */
export interface Review {
  _id: string;
  author: string;
  avatar: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface PropertyDetailsData {
  property: Property;
  reviews: Review[];
  related: PropertySummary[];
}

export interface InquiryPayload {
  propertyId: string;
  fullName: string;
  email: string;
  phone: string;
  message: string;
}
