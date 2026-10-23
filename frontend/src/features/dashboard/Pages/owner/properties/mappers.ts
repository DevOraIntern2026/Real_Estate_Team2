import { ApiError } from "../../../api";
import { AREA_UNIT } from "../../listing-details/constants";
import { formatPriceLabel, prettify } from "../../../utils/labels";
import { isRecord, listOf, pick, pickNumber, pickString } from "../../../utils/pick";
import { ownerStatusInfo } from "./status";
import type { OwnerPropertyDetailVm, OwnerPropertyRowVm } from "./types";

const joinParts = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(", ");

/** ASSUMED fields (same names as the admin listing in /v1/admin/overview): id, code, title, propertyType, transaction, area, price, currency, status, submittedAt */
export function toOwnerPropertyRow(item: unknown): OwnerPropertyRowVm {
  const transaction = (pickString(item, "transaction", "purpose", "listingType") ?? "").toLowerCase();
  const price = pickNumber(item, "price") ?? 0;
  const status = ownerStatusInfo(pickString(item, "status") ?? "");

  return {
    id: pickString(item, "id", "_id") ?? "",
    code: pickString(item, "code", "propertyCode") ?? "",
    title: pickString(item, "title", "name") ?? "",
    type: prettify(pickString(item, "propertyType", "type") ?? ""),
    purpose: prettify(transaction),
    transaction,
    location: joinParts(pickString(item, "area", "location"), pickString(item, "city")),
    // ASSUMED: EGP when no currency is sent
    priceLabel: formatPriceLabel(price, pickString(item, "currency") ?? "EGP", transaction),
    status,
    date: pickString(item, "submittedAt", "updatedAt", "createdAt") ?? "",
    isDraft: status.key === "draft",
  };
}

/** "Elevator" or { name: "Elevator" } -> "Elevator" */
function names(value: unknown): string[] {
  return listOf(value)
    .map((v) => (typeof v === "string" ? v : pickString(v, "name", "label", "title") ?? ""))
    .filter(Boolean);
}

function imageUrls(value: unknown): string[] {
  return listOf(value)
    .map((v) => (typeof v === "string" ? v : pickString(v, "url", "secure_url", "src") ?? ""))
    .filter(Boolean);
}

/**
 * GET /properties/{id}. ASSUMED fields: title, code, description, propertyType, transaction, price,
 * currency, status, address (or area+city), size, bedrooms, bathrooms, furnishing, facilities[],
 * nearby[], images[], createdAt/submittedAt/updatedAt, views, inquiriesCount.
 */
export function normalizeOwnerProperty(raw: unknown): OwnerPropertyDetailVm {
  const root = isRecord(raw) ? (isRecord(raw.data) ? raw.data : isRecord(raw.property) ? raw.property : raw) : {};
  const id = pickString(root, "id", "_id");

  if (!id) {
    if (import.meta.env?.DEV) console.warn("[api] Unrecognized property response:", raw);
    throw new ApiError(500, "Unexpected response from the server.", raw);
  }

  const transaction = (pickString(root, "transaction", "purpose", "listingType") ?? "").toLowerCase();
  const price = pickNumber(root, "price");
  const size = pickNumber(root, "size", "areaSize", "squareFeet", "sqft", "areaSqm", "builtUpArea");

  return {
    id,
    code: pickString(root, "code", "propertyCode") ?? "",
    title: pickString(root, "title", "name") ?? "",
    status: ownerStatusInfo(pickString(root, "status") ?? ""),
    type: prettify(pickString(root, "propertyType", "type") ?? ""),
    purpose: prettify(transaction),
    priceLabel: price === undefined ? "—" : formatPriceLabel(price, pickString(root, "currency") ?? "EGP", transaction),
    address:
      pickString(root, "address", "location.address", "fullAddress") ??
      joinParts(pickString(root, "area"), pickString(root, "city"), pickString(root, "country")),
    // ASSUMED unit when the API doesn't send one
    size: size === undefined ? undefined : `${size} ${pickString(root, "areaUnit", "sizeUnit") ?? AREA_UNIT}`,
    bedrooms: pickNumber(root, "bedrooms", "beds"),
    bathrooms: pickNumber(root, "bathrooms", "baths"),
    furnishing: prettify(pickString(root, "furnishing", "furnished") ?? ""),
    description: pickString(root, "description") ?? "",
    images: imageUrls(pick(root, "images", "photos", "gallery")),
    facilities: names(pick(root, "facilities", "amenities", "equipment")),
    nearby: names(pick(root, "nearby", "nearbyPlaces", "nearbyFacilities")),
    createdAt: pickString(root, "createdAt") ?? "",
    submittedAt: pickString(root, "submittedAt") ?? "",
    updatedAt: pickString(root, "updatedAt") ?? "",
    views: pickNumber(root, "views", "viewCount", "viewsCount") ?? 0,
    inquiries: pickNumber(root, "inquiriesCount", "inquiryCount", "inquiries") ?? 0,
    isDraft: ownerStatusInfo(pickString(root, "status") ?? "").key === "draft",
  };
}
