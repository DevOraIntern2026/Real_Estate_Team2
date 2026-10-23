import { ApiError } from "../../../api";
import type { AppNotification } from "../../../../../types/notification";
import { formatPriceLabel, prettify } from "../../../utils/labels";
import { isRecord, listOf, pick, pickNumber, pickString } from "../../../utils/pick";
import { notificationKind } from "../../Overview/mappers";
import type { OwnerStatsVm, RecentInquiryVm, RecentPropertyVm } from "./types";

const RECENT_LIMIT = 3; // the design shows 3 of each

export function toRecentProperty(item: unknown): RecentPropertyVm {
  const transaction = pickString(item, "transaction", "purpose", "listingType") ?? "";
  const price = pickNumber(item, "price") ?? 0;
  return {
    id: pickString(item, "id", "_id") ?? "",
    code: pickString(item, "code", "propertyCode") ?? "",
    title: pickString(item, "title", "name") ?? "",
    purpose: prettify(transaction),
    type: prettify(pickString(item, "propertyType", "type") ?? ""),
    location: [pickString(item, "area", "location"), pickString(item, "city")].filter(Boolean).join(", "),
    // ASSUMED: EGP when the API doesn't send a currency
    priceLabel: formatPriceLabel(price, pickString(item, "currency") ?? "EGP", transaction),
    statusLabel: prettify(pickString(item, "status") ?? ""),
    updatedAt: pickString(item, "updatedAt", "submittedAt", "createdAt") ?? "",
  };
}

/** ASSUMED: customer + property fields either flat or nested (property.title, customer.name ...) */
export function toRecentInquiry(item: unknown): RecentInquiryVm {
  const type = prettify(pickString(item, "property.propertyType", "propertyType", "property.type") ?? "");
  const transaction = prettify(pickString(item, "property.transaction", "transaction") ?? "");
  return {
    id: pickString(item, "id", "_id") ?? "",
    propertyTitle: pickString(item, "property.title", "propertyTitle", "title") ?? "",
    propertyCode: pickString(item, "property.code", "propertyCode", "code") ?? "",
    typeLabel: [type, transaction].filter(Boolean).join("-"),
    customerName: pickString(item, "customerName", "customer.name", "name") ?? "",
    phone: pickString(item, "phone", "customerPhone", "customer.phone") ?? "",
    message: pickString(item, "message", "lastMessage") ?? "",
    statusLabel: prettify(pickString(item, "status") ?? "new"),
    createdAt: pickString(item, "createdAt", "date") ?? "",
  };
}

export function toRecentNotification(item: unknown): AppNotification {
  return {
    id: pickString(item, "id", "_id") ?? "",
    title: pickString(item, "title") ?? "",
    message: pickString(item, "body", "message") ?? "",
    createdAt: pickString(item, "createdAt") ?? "",
    read: Boolean(pick(item, "isRead", "read")),
    kind: notificationKind(pickString(item, "type") ?? ""),
  };
}

/** CONFIRMED by the Swagger text: totalProperties, published, underReview, newInquiries30d, unreadNotifications (+ clients, closedDeals for agents) */
export function toStats(summary: unknown): OwnerStatsVm {
  const n = (key: string) => pickNumber(summary, key) ?? 0;
  return {
    totalProperties: n("totalProperties"),
    published: n("published"),
    underReview: n("underReview"),
    newInquiries30d: n("newInquiries30d"),
    unreadNotifications: n("unreadNotifications"),
    clients: pickNumber(summary, "clients"),
    closedDeals: pickNumber(summary, "closedDeals"),
  };
}

/** GET /dashboard -> { summary, recentProperties, recentInquiries, recentNotifications } (keys from the Swagger text) */
export function normalizeOwnerDashboard(raw: unknown) {
  const root = isRecord(raw) ? (isRecord(raw.data) ? raw.data : raw) : {};

  if (!isRecord(root.summary)) {
    if (import.meta.env?.DEV) console.warn("[api] Unrecognized dashboard response:", raw);
    throw new ApiError(500, "Unexpected response from the server.", raw);
  }

  return {
    stats: toStats(root.summary),
    properties: listOf(root.recentProperties).slice(0, RECENT_LIMIT).map(toRecentProperty),
    inquiries: listOf(root.recentInquiries).slice(0, RECENT_LIMIT).map(toRecentInquiry),
    notifications: listOf(root.recentNotifications).slice(0, RECENT_LIMIT).map(toRecentNotification),
  };
}

export type OwnerDashboardVm = ReturnType<typeof normalizeOwnerDashboard>;
