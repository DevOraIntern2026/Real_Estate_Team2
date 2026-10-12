export type PropertyStatus =
  | "Under Review"
  | "Published"
  | "Rejected"
  | "Change Required"
  | "Inactive"
  | "Sold/Rented";

export type PropertyPurpose = "Sale" | "Rent";
export type PropertyCategory = "Residential" | "Commercial";
export type Furnishing = "Fully Furnished" | "Semi Furnished" | "Unfurnished";

export interface Property {
  id: string; // unique key
  code: string; // display code, e.g. "Dev-1234"
  title: string;
  ownerId: string;
  owner: string;
  type: string;
  purpose: PropertyPurpose;
  location: string;
  city: string;
  price: number;
  status: PropertyStatus;
  submitted: string;
}

/** What admin picks when approving a listing. */
export interface Classification {
  type: string;
  category: PropertyCategory;
}

export interface Rejection {
  reason: string;
  feedback?: string;
}

/** Everything the details page needs (a Property + extra info). */
export interface PropertyDetails extends Property {
  submittedAt: string; // ISO date
  updatedAt: string; // ISO date
  images: string[];
  description: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  floor: string;
  furnishing: Furnishing;
  buildingAgeYears: number;
  address: string;
  landmark: string;
  facilities: string[];
  nearby: string[];
  category?: PropertyCategory;
  rejection?: Rejection;
}
