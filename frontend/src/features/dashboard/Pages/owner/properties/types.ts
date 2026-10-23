import type { OwnerStatusInfo } from "./status";

/** One row of the My Properties table. */
export interface OwnerPropertyRowVm {
  id: string;
  code: string;
  title: string;
  type: string; // "House"
  purpose: string; // "Rent"
  transaction: string; // "rent" (for filtering)
  location: string;
  priceLabel: string;
  status: OwnerStatusInfo;
  date: string; // ISO: when it was submitted (or last updated)
  isDraft: boolean;
}

/** The details page. */
export interface OwnerPropertyDetailVm {
  id: string;
  code: string;
  title: string;
  status: OwnerStatusInfo;
  type: string;
  purpose: string;
  priceLabel: string;
  address: string;
  size?: string; // "1400 sq.ft"
  bedrooms?: number;
  bathrooms?: number;
  furnishing: string;
  description: string;
  images: string[];
  facilities: string[];
  nearby: string[];
  createdAt: string;
  submittedAt: string;
  updatedAt: string;
  views: number;
  inquiries: number;
  isDraft: boolean;
}
