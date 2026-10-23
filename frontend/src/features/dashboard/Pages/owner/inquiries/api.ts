import { api } from "../../../api";
import type { InquiriesParams } from "./types";

// NOTE: no /v1 prefix, exactly as in your Swagger. The response bodies weren't in the
// Swagger text I got, so these return `unknown` and mappers.ts types them (ONE place to fix).

const inquiryPath = (id: string) => `/inquiries/${encodeURIComponent(id)}`;

/** GET /inquiries: inquiries for the properties of the logged-in owner */
export function fetchInquiries(params: InquiriesParams, signal?: AbortSignal) {
  const { page, limit, status, propertyId } = params;
  return api.get<unknown>("/inquiries", { page, limit, status, propertyId }, { signal });
}

/** GET /inquiries/{id} */
export function fetchInquiry(id: string, signal?: AbortSignal) {
  return api.get<unknown>(inquiryPath(id), undefined, { signal });
}

/** GET /inquiries/{id}/messages */
export function fetchInquiryMessages(id: string, signal?: AbortSignal) {
  return api.get<unknown>(`${inquiryPath(id)}/messages`, undefined, { signal });
}

/**
 * POST /inquiries/{id}/messages: the server moves the inquiry to "responded" by itself.
 * ASSUMED body: { message } (same field name as the "create inquiry" body in the Swagger).
 * If the server wants another name, its validation message shows under the reply box.
 */
export function sendInquiryReply(id: string, message: string) {
  return api.post<unknown>(`${inquiryPath(id)}/messages`, { message });
}

// Not used yet (no design for them):
//   PATCH /inquiries/{id}/status   PATCH /inquiries/{id}/close
