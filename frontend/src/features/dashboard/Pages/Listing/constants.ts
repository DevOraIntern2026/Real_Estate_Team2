import type { Option } from "../../components/shared/FilterDropdown";
import type { ListingStatusFilter, Transaction } from "./types";

export const LISTING_PAGE_SIZE = 10;
export const DEFAULT_SORT = "-submittedAt";

export type PurposeFilter = "all" | Transaction;

export const TABS_CONFIG: { label: string; value: ListingStatusFilter; showBadge?: boolean }[] = [
  { label: "All", value: "all" },
  { label: "Pending Review", value: "under_review" },
  { label: "Change Required", value: "change_required" },
  { label: "Published", value: "published", showBadge: true },
  { label: "Rejected", value: "rejected" },
  { label: "Inactive", value: "inactive", showBadge: true },
  { label: "Sold/Rent", value: "sold_rented" },
];

export const PURPOSE_OPTIONS: Option<PurposeFilter>[] = [
  { label: "Sale & Rent", value: "all" },
  { label: "Sale", value: "sale" },
  { label: "Rent", value: "rent" },
];

export const ALL_TYPES: Option<string> = { label: "All Types", value: "all" };
export const ALL_LOCATIONS: Option<string> = { label: "All Location", value: "all" };

export const TEXT = {
  title: "Listings",
  subtitle: "Review and manage all properties submitted to Devora",
  searchPlaceholder: "Search By Title, Listing Code, Or City",
  noMatch: "No listings match your filters.",
};
