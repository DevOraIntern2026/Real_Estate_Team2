import { ApiError } from "../api";
import type { AdminProfile } from "../../../types/admin";

type Rec = Record<string, unknown>;
const isRecord = (v: unknown): v is Rec => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);

/** Looks inside { data } / { profile } / { admin } / { user } wrappers (up to 2 levels). */
function unwrap(raw: unknown): Rec {
  let current: Rec = isRecord(raw) ? raw : {};
  for (let depth = 0; depth < 2; depth++) {
    const inner = ["data", "profile", "admin", "user"].map((k) => current[k]).find(isRecord);
    if (!inner) break;
    current = inner;
  }
  return current;
}

/**
 * GET /v1/admin/profile. ASSUMED fields: id, name, email, phone, location and a photo URL
 * named avatar / avatarUrl / photo / photoUrl. ONE place to change once you see the real response.
 */
export function normalizeAdminProfile(raw: unknown): AdminProfile {
  const src = unwrap(raw);

  if (!str(src.email)) {
    if (import.meta.env?.DEV) console.warn("[api] Unrecognized profile response:", raw);
    throw new ApiError(500, "Unexpected response from the server.", raw);
  }

  return {
    id: String(src.id ?? src._id ?? ""),
    role: "Admin",
    name: str(src.name) ?? str(src.fullName) ?? "",
    email: src.email as string,
    phone: str(src.phone) ?? "",
    location: str(src.location),
    avatar: str(src.avatar) ?? str(src.avatarUrl) ?? str(src.photo) ?? str(src.photoUrl),
  };
}
