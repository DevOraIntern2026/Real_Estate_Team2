import type { BadgeTone } from "../../../components/shared/StatusBadge";
import type { TabItem } from "../../../components/shared/Tabs";
import { prettify } from "../../../utils/labels";

export type PropertyTab = "all" | "under_review" | "published" | "rejected" | "draft";

export interface OwnerStatusInfo {
  key: string; // "under_review"
  label: string; // "Under Review"
  tone: BadgeTone;
  tab: Exclude<PropertyTab, "all"> | null; // which tab it belongs to (null = only in "All")
}

// The API statuses: draft, submitted, under_review, approved, published, rejected, inactive, sold, rented
const KNOWN: Record<string, Omit<OwnerStatusInfo, "key">> = {
  draft: { label: "Draft", tone: "neutral", tab: "draft" },
  submitted: { label: "Submitted", tone: "brand", tab: "under_review" },
  under_review: { label: "Under Review", tone: "brand", tab: "under_review" },
  approved: { label: "Approved", tone: "success", tab: "published" },
  published: { label: "Published", tone: "success", tab: "published" },
  rejected: { label: "Rejected", tone: "danger", tab: "rejected" },
  inactive: { label: "Inactive", tone: "neutral", tab: null },
  sold: { label: "Sold", tone: "info", tab: null },
  rented: { label: "Rented", tone: "info", tab: null },
};

export function ownerStatusInfo(apiStatus: string): OwnerStatusInfo {
  const key = apiStatus.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return { key, ...(KNOWN[key] ?? { label: prettify(apiStatus) || "—", tone: "neutral", tab: null }) };
}

export const PROPERTY_TABS: TabItem<PropertyTab>[] = [
  { label: "All", value: "all" },
  { label: "Under Review", value: "under_review" },
  { label: "Published", value: "published" },
  { label: "Rejected", value: "rejected" },
  { label: "Draft", value: "draft" },
];
