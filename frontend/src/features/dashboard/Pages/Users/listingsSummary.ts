import type { Property } from "../../../../types/property";

export type SummaryItem = { label: string; value: number };

export function getListingsSummary(listings: Property[]): SummaryItem[] {
  const count = (fn: (p: Property) => boolean) => listings.filter(fn).length;
  return [
    { label: "Total Listing", value: listings.length },
    { label: "Published", value: count((p) => p.status === "Published") },
    { label: "Pending", value: count((p) => p.status === "Under Review") },
    { label: "Rejected", value: count((p) => p.status === "Rejected") },
    { label: "Rent", value: count((p) => p.purpose === "Rent") },
    { label: "Sale", value: count((p) => p.purpose === "Sale") },
  ];
}
