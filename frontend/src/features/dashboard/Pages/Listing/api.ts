import { api } from "../../api";
import type { ListingsParams } from "./types";

// The response bodies weren't in the Swagger text I got, so these return `unknown`
// and mappers.ts turns them into typed data (ONE place to fix if the shape differs).

/** GET /v1/admin/listings */
export function fetchAdminListings(params: ListingsParams, signal?: AbortSignal) {
  const { status, transaction, type, location, q, sort, page, limit } = params;
  return api.get<unknown>(
    "/v1/admin/listings",
    { status, transaction, type, location, q, sort, page, limit },
    { signal }
  );
}

/** GET /v1/admin/listings/counts: badge per status tab */
export function fetchListingCounts(signal?: AbortSignal) {
  return api.get<unknown>("/v1/admin/listings/counts", undefined, { signal });
}

/** GET /v1/admin/listings/filters: distinct types / transactions / locations */
export function fetchListingFilters(signal?: AbortSignal) {
  return api.get<unknown>("/v1/admin/listings/filters", undefined, { signal });
}
