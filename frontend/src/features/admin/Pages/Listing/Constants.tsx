import type { Option } from "../../components/shared/FilterDropdown";
import type { PropertyPurpose, PropertyStatus } from "../../../../types/property";

export const PAGE_SIZE = 4;

export type TabValue = "all" | PropertyStatus;
export type PurposeFilter = "all" | PropertyPurpose;

export const TABS_CONFIG: { label: string; value: TabValue; showBadge?: boolean }[] = [
  { label: "All", value: "all" },
  { label: "Pending Review", value: "Under Review" },
  { label: "Change Required", value: "Change Required" },
  { label: "Published", value: "Published", showBadge: true },
  { label: "Rejected", value: "Rejected" },
  { label: "Inactive", value: "Inactive", showBadge: true },
  { label: "Sold/Rent", value: "Sold/Rented" },
];

export const PURPOSE_OPTIONS: Option<PurposeFilter>[] = [
  { label: "Sale & Rent", value: "all" },
  { label: "Sale", value: "Sale" },
  { label: "Rent", value: "Rent" },
];

export const TYPE_OPTIONS: Option<string>[] = [
  { label: "All Types", value: "all" },
  ...["Apartment", "Villa", "Duplex", "Office", "Shop", "Studio", "House"].map(
    (t) => ({ label: t, value: t })
  ),
];

export const CITY_OPTIONS: Option<string>[] = [
  { label: "All Location", value: "all" },
  ...["Cairo", "Giza", "Aswan"].map((c) => ({ label: c, value: c })),
];

export const TEXT = {
  title: "Listings",
  subtitle: "Review and manage all properties submitted to Devora",
  searchPlaceholder: "Search By Property, Owner, Location, Or ID",
  noMatch: "No listings match your filters.",
};
