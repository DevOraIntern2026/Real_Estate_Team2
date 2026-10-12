import type { Column } from "../shared/DataTable";
import StatusBadge, { type BadgeTone } from "../shared/StatusBadge";
import type { Property, PropertyStatus } from "../../../../types/property";

export const PROPERTY_STATUS_TONE: Record<PropertyStatus, BadgeTone> = {
  "Under Review": "brand",
  Published: "success",
  Rejected: "danger",
  "Change Required": "warning",
  Inactive: "neutral",
  "Sold/Rented": "info",
};

export function formatPrice(p: Property) {
  const n = p.price.toLocaleString("en-US");
  return p.purpose === "Rent" ? `${n}/Mo EGP` : `${n} EGP`;
}

/** Same columns for the Listing page and the user's profile page. */
export const propertyColumns: Column<Property>[] = [
  {
    key: "title",
    header: "Property",
    render: (p) => (
      <>
        <p className="font-medium">{p.title}</p>
        <p className="text-xs text-[#5A4F49]">{p.code}</p>
      </>
    ),
  },
  { key: "owner", header: "Owner/Agent", render: (p) => p.owner },
  { key: "type", header: "Type", render: (p) => `${p.type}-${p.purpose}` },
  { key: "location", header: "Location", render: (p) => `${p.location}, ${p.city}` },
  { key: "price", header: "Price", render: (p) => formatPrice(p) },
  {
    key: "status",
    header: "Status",
    render: (p) => (
      <StatusBadge label={p.status} tone={PROPERTY_STATUS_TONE[p.status]} />
    ),
  },
  { key: "submitted", header: "Submitted", render: (p) => p.submitted },
];
