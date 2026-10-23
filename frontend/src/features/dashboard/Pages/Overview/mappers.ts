import type { AppNotification, NotificationKind } from "../../../../types/notification";
import { prettify, toPropertyStatus } from "../../utils/labels";
import type {
  AdminOverviewDto,
  OverviewNotificationDto,
  PendingListingDto,
  PendingListingVm,
} from "./types";

export { prettify, toPropertyStatus };

// NOTE: only "listing_submitted" is known from the Swagger example. Send me the
// full list of notification types and I'll replace this guess with an exact map.
export function notificationKind(type: string): NotificationKind {
  const t = type.toLowerCase();
  if (t.includes("reject")) return "danger";
  if (t.includes("approv") || t.includes("publish")) return "success";
  return "info";
}

export function toAppNotification(dto: OverviewNotificationDto): AppNotification {
  return {
    id: dto.id,
    title: dto.title,
    message: dto.body,
    createdAt: dto.createdAt,
    read: dto.isRead,
    kind: notificationKind(dto.type),
  };
}

export function toPendingListingVm(dto: PendingListingDto): PendingListingVm {
  return {
    id: dto.id,
    code: dto.code,
    title: dto.title,
    thumbnail: dto.thumbnail || undefined,
    ownerName: dto.owner?.name ?? "",
    propertyType: prettify(dto.propertyType),
    transaction: prettify(dto.transaction),
    area: dto.area,
    priceLabel: `${dto.price.toLocaleString("en-US")} ${dto.currency}`,
    submittedAt: dto.submittedAt,
    statusLabel: toPropertyStatus(dto.status) ?? prettify(dto.status),
  };
}

/** Defensive: if the server leaves a list out, the page still renders. */
export function toOverviewVm(dto: AdminOverviewDto) {
  return {
    stats: dto.stats,
    pendingListings: (dto.pendingListings ?? []).map(toPendingListingVm),
    notifications: (dto.recentNotifications ?? []).map(toAppNotification),
    unreadNotifications: dto.unreadNotifications ?? 0,
  };
}

export type OverviewVm = ReturnType<typeof toOverviewVm>;
