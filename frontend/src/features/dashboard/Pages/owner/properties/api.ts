import { api } from "../../../api";

// NOTE: no /v1 prefix, exactly as in your Swagger. The response bodies weren't in the Swagger
// text I got, so these return `unknown` and mappers.ts types them (ONE place to fix).

const propertyPath = (id: string) => `/properties/${encodeURIComponent(id)}`;

/** GET /properties/my (params: page, limit, status) */
export function fetchMyPropertiesPage(page: number, limit: number, signal?: AbortSignal) {
  return api.get<unknown>("/properties/my", { page, limit }, { signal });
}

/** GET /properties/{id}: owners can open their non-public listings too */
export function fetchProperty(id: string, signal?: AbortSignal) {
  return api.get<unknown>(propertyPath(id), undefined, { signal });
}

/** DELETE /properties/{id} (soft delete) */
export function deleteProperty(id: string) {
  return api.delete<unknown>(propertyPath(id));
}

// Not used yet (needs the edit form design):  PATCH /properties/{id}
