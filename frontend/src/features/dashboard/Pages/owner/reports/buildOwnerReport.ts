import type { ReportSection } from "../../../components/reports/reportTypes";
import type { Property } from "@/types/property";

/** Turns the owner's properties into the report sections (all numbers are computed). */
export function buildOwnerReport(properties: Property[]): ReportSection[] {
  const count = (fn: (p: Property) => boolean) => properties.filter(fn).length;

  return [
    {
      title: "Transaction Distribution",
      items: [
        { label: "Sale", value: count((p) => p.purpose === "Sale") },
        { label: "Rent", value: count((p) => p.purpose === "Rent") },
      ],
    },
    {
      title: "Listings Overview",
      max: properties.length, // every bar is "part of the total"
      items: [
        { label: "Total", value: properties.length },
        { label: "Published", value: count((p) => p.status === "Published") },
        { label: "Pending", value: count((p) => p.status === "Under Review") },
        { label: "Rejected", value: count((p) => p.status === "Rejected") },
        { label: "Inactive", value: count((p) => p.status === "Inactive") },
      ],
    },
  ];
}
