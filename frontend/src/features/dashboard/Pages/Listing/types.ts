// ---- request ----
export type ListingStatusFilter =
  | "all"
  | "under_review"
  | "change_required"
  | "published"
  | "rejected"
  | "inactive"
  | "sold_rented";

export type Transaction = "sale" | "rent";

export interface ListingsParams {
  status: ListingStatusFilter;
  transaction?: Transaction;
  type?: string;
  location?: string;
  q?: string;
  sort: string; // "-submittedAt" = newest first
  page: number;
  limit: number;
}

export type ListingCounts = Record<ListingStatusFilter, number>;

// ---- response item from GET /v1/admin/listings (legacy aliases retained for overview payloads) ----
export interface ListingSummaryDto {
  id?: string;
  _id?: string;
  code?: string;
  title?: string;
  thumbnail?: string | null;
  owner?: { id?: string; name?: string; role?: string } | null;
  type?: string;
  typeLabel?: string;
  propertyType?: string;
  transaction?: string;
  location?: string;
  area?: string;
  city?: string;
  price?: number;
  priceUnit?: string;
  currency?: string;
  status?: string;
  submittedAt?: string;
}

// ---- what the table uses ----
export interface ListingRowVm {
  id: string;
  code: string;
  title: string;
  ownerName: string;
  type: string; // "Villa"
  purpose: string; // "Rent"
  location: string; // "Riverside, Cairo"
  priceLabel: string; // "75,000/Mo EGP"
  statusLabel: string; // "Under Review"
  submittedAt: string; // ISO
}
