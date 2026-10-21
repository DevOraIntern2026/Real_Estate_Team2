import type { Option } from "../../components/shared/FilterDropdown";
import { formatPriceLabel, prettify, toPropertyStatus } from "../../utils/labels";
import type { ListingCounts, ListingRowVm, ListingStatusFilter, ListingSummaryDto } from "./types";

type Rec = Record<string, unknown>;
const isRecord = (v: unknown): v is Rec => typeof v === "object" && v !== null && !Array.isArray(v);

// ---------- list rows ----------
/** `fallbackOwnerName` is used when the API doesn't send an owner (e.g. inside a user's own listings). */
export function toListingRowVm(dto: ListingSummaryDto, fallbackOwnerName = ""): ListingRowVm {
  const propertyType = dto.type ?? dto.propertyType ?? "Property";
  const transaction = dto.transaction ?? "";
  const [typeFromLabel, purposeFromLabel] = (dto.typeLabel ?? "").split(/\s*[-/]\s*/, 2);
  const type = propertyType === "Property" && typeFromLabel ? typeFromLabel : prettify(propertyType);
  const purpose = transaction
    ? prettify(transaction)
    : purposeFromLabel
      ? prettify(purposeFromLabel)
      : "—";

  return {
    id: dto.id ?? dto._id ?? "",
    code: dto.code ?? "",
    title: dto.title ?? "Untitled property",
    ownerName: dto.owner?.name ?? fallbackOwnerName,
    type,
    purpose,
    location: dto.location ?? ([dto.area, dto.city].filter(Boolean).join(", ") || "—"),
    priceLabel: formatPriceLabel(dto.price ?? 0, dto.currency ?? "EGP", transaction),
    statusLabel: dto.status
      ? toPropertyStatus(dto.status) ?? prettify(dto.status)
      : "Unknown",
    submittedAt: dto.submittedAt ?? "",
  };
}

// ---------- counts ----------
const STATUS_KEYS: ListingStatusFilter[] = [
  "all",
  "under_review",
  "change_required",
  "published",
  "rejected",
  "inactive",
  "sold_rented",
];

const toSnake = (key: string) =>
  key.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[-\s]+/g, "_").toLowerCase();

/** { all: 12, under_review: 3, ... } (or camelCase, or wrapped in counts/data, or [{status,count}]) */
export function normalizeCounts(raw: unknown): ListingCounts {
  const counts = Object.fromEntries(STATUS_KEYS.map((k) => [k, 0])) as ListingCounts;

  const source = isRecord(raw) ? (raw.counts ?? raw.data ?? raw) : raw;

  const assign = (key: string, value: unknown) => {
    const k = toSnake(key) as ListingStatusFilter;
    const n = Number(value);
    if (STATUS_KEYS.includes(k) && Number.isFinite(n)) counts[k] = n;
  };

  if (Array.isArray(source)) {
    for (const item of source) {
      if (isRecord(item) && typeof item.status === "string") assign(item.status, item.count ?? item.total);
    }
  } else if (isRecord(source)) {
    for (const [key, value] of Object.entries(source)) assign(key, value);
  }
  return counts;
}

// ---------- filter dropdown options ----------
export interface ListingFilterOptions {
  types: Option<string>[];
  locations: Option<string>[];
}

function toOptions(list: unknown, labelize: (v: string) => string): Option<string>[] {
  if (!Array.isArray(list)) return [];
  return list.flatMap((item): Option<string>[] => {
    if (typeof item === "string" && item) return [{ value: item, label: labelize(item) }];
    if (isRecord(item)) {
      const value = String(item.value ?? item.id ?? item.slug ?? item.name ?? "");
      if (!value) return [];
      return [{ value, label: String(item.label ?? item.name ?? labelize(value)) }];
    }
    return [];
  });
}

/** { types: [...], transactions: [...], locations: [...] } */
export function normalizeFilters(raw: unknown): ListingFilterOptions {
  const source = isRecord(raw) ? (isRecord(raw.data) ? raw.data : raw) : {};
  const pick = (keys: string[]) => keys.map((k) => source[k]).find((v) => Array.isArray(v));
  return {
    types: toOptions(pick(["types", "propertyTypes", "property_types"]), prettify),
    locations: toOptions(pick(["locations", "areas"]), (v) => v),
  };
}
