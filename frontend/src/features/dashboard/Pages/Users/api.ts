import { api } from "../../api";
import type { UsersParams } from "./types";

// Response bodies weren't in the Swagger text I got, so these return `unknown`
// and mappers.ts turns them into typed data (ONE place to fix if the shape differs).

const userPath = (id: string) => `/v1/admin/users/${encodeURIComponent(id)}`;

/** GET /v1/admin/users */
export function fetchAdminUsers(params: UsersParams, signal?: AbortSignal) {
  const { role, status, q, page, limit } = params;
  return api.get<unknown>("/v1/admin/users", { role, status, q, page, limit }, { signal });
}

/** GET /v1/admin/users/{id}: user + listings summary */
export function fetchAdminUser(id: string, signal?: AbortSignal) {
  return api.get<unknown>(userPath(id), undefined, { signal });
}

/** GET /v1/admin/users/{id}/listings */
export function fetchUserListings(
  id: string,
  { page, limit }: { page: number; limit: number },
  signal?: AbortSignal
) {
  return api.get<unknown>(`${userPath(id)}/listings`, { page, limit }, { signal });
}

/** POST /v1/admin/users/{id}/activate */
export function activateUser(id: string) {
  return api.post<unknown>(`${userPath(id)}/activate`);
}

/**
 * POST /v1/admin/users/{id}/suspend
 * The Swagger says it "records suspension reason", but I wasn't given the request body.
 * No body is sent for now: if the server requires a reason, its message shows in the dialog.
 */
export function suspendUser(id: string) {
  return api.post<unknown>(`${userPath(id)}/suspend`);
}
