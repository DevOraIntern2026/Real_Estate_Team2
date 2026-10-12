import type { Option } from "../../components/shared/FilterDropdown";
import type { PropertyCategory, PropertyStatus } from "../../../../types/property";

export const AREA_UNIT = "sq.ft"; // change to "m²" if you prefer

export type DecisionActionKind = "approve" | "edit" | "reject" | "deactivate";

/** Which buttons appear for each status (empty = no actions). */
export const DECISION_ACTIONS: Record<PropertyStatus, DecisionActionKind[]> = {
  "Under Review": ["approve", "edit", "reject"],
  "Change Required": ["edit"],
  Published: ["deactivate"],
  Rejected: [],
  Inactive: [],
  "Sold/Rented": [],
};

export const ACTION_UI: Record<
  DecisionActionKind,
  { label: string; variant: "solid" | "outline" }
> = {
  approve: { label: "Approve Listing", variant: "solid" },
  edit: { label: "Edit", variant: "outline" },
  reject: { label: "Reject Listing", variant: "outline" },
  deactivate: { label: "Deactivate Listing", variant: "outline" },
};

export const PROPERTY_TYPE_OPTIONS: Option<string>[] = [
  "Apartment",
  "Villa",
  "Duplex",
  "House",
  "Office",
  "Shop",
  "Studio",
].map((t) => ({ label: t, value: t }));

export const CATEGORY_OPTIONS: Option<PropertyCategory>[] = [
  { label: "Residential", value: "Residential" },
  { label: "Commercial", value: "Commercial" },
];

const DEFAULT_ICON = "fa-solid fa-circle-check";

export const FACILITY_ICONS: Record<string, string> = {
  Elevator: "fa-solid fa-elevator",
  "Air Conditioning": "fa-solid fa-snowflake",
  Internet: "fa-solid fa-wifi",
  Security: "fa-solid fa-shield-halved",
  Parking: "fa-solid fa-square-parking",
};

export const NEARBY_ICONS: Record<string, string> = {
  Mosque: "fa-solid fa-mosque",
  Hospital: "fa-solid fa-hospital",
  GYM: "fa-solid fa-dumbbell",
  Garden: "fa-solid fa-tree",
  "Gas station": "fa-solid fa-gas-pump",
  School: "fa-solid fa-school",
};

export const iconFor = (map: Record<string, string>, key: string) =>
  map[key] ?? DEFAULT_ICON;

export const TEXT = {
  pageTitle: "Property",
  pageSubtitle: "Review and manage this property listing.",
  notFound: "Listing not found.",
  classifyTitle: "Continue To Approve this listing?",
  classifyConfirm: "Continue",
  approveTitle: "Approve this listing?",
  approveMessage:
    "Once approved, this property can be published and become visible to customers on DevOra.",
  approveConfirm: "Approve",
  rejectTitle: "Reject Listing",
  rejectConfirm: "Reject Listing",
  reasonLabel: "Reason",
  reasonPlaceholder: "EX. Incorrect Price",
  feedbackLabel: "Additional feedback",
  feedbackPlaceholder: "Please Confirm The Listed Price Is Correct",
  deactivateTitle: "Deactivate this listing?",
  deactivateConfirm: "Deactivate",
};
