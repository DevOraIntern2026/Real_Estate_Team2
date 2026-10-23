import { ApiError } from "../../api";
import { prettify } from "../../utils/labels";
import type { SummaryItem } from "./listingsSummary";
import type { User, UserDto, UserListingsSummaryDto, UserRole, UserStatus } from "./types";

type Rec = Record<string, unknown>;
const isRecord = (v: unknown): v is Rec => typeof v === "object" && v !== null && !Array.isArray(v);

export function toUser(dto: UserDto): User {
  return {
    id: dto.id,
    name: dto.name ?? dto.fullName ?? "",
    role: prettify(dto.role) as UserRole,
    email: dto.email,
    listings: dto.listingsCount ?? 0,
    phone: dto.phone ?? "",
    location: dto.location ?? "",
    status: prettify(dto.status) as UserStatus,
    joined: dto.joinedAt ?? dto.createdAt ?? "",
    avatar: dto.avatar || undefined,
  };
}

export function toSummaryItems(s?: Partial<UserListingsSummaryDto> | null): SummaryItem[] {
  const n = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  return [
    { label: "Total Listing", value: n(s?.total) },
    { label: "Published", value: n(s?.published) },
    { label: "Pending", value: n(s?.pending) },
    { label: "Rejected", value: n(s?.rejected) },
    { label: "Rent", value: n(s?.rent) },
    { label: "Sale", value: n(s?.sale) },
  ];
}

/**
 * GET /users/{id}: "user information and computed listings summary".
 * Accepts { user, listingsSummary } or the user with the summary inside it,
 * optionally wrapped in { data }. ONE place to change once you see the real response.
 */
export function normalizeUserProfile(raw: unknown): { user: User; summary: SummaryItem[] } {
  const root = isRecord(raw) ? (isRecord(raw.data) ? raw.data : raw) : {};
  const userSource = isRecord(root.user) ? root.user : root;
  const summarySource =
    root.listingsSummary ?? root.summary ?? userSource.listingsSummary ?? userSource.summary;

  if (typeof userSource.id !== "string" || !userSource.id) {
    if (import.meta.env?.DEV) console.warn("[api] Unrecognized user response:", raw);
    throw new ApiError(500, "Unexpected response from the server.", raw);
  }

  return {
    user: toUser(userSource as unknown as UserDto),
    summary: toSummaryItems(isRecord(summarySource) ? (summarySource as Partial<UserListingsSummaryDto>) : null),
  };
}
