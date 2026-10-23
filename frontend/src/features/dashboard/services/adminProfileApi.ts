import { api } from "../api";
import type { EditableAdminFields } from "../../../types/admin";

// The response bodies weren't in the Swagger text I got, so these return `unknown`.
// After every change we simply re-GET the profile, so nothing depends on the PATCH/POST responses.

/** GET /v1/admin/profile */
export function fetchAdminProfile(signal?: AbortSignal) {
  return api.get<unknown>("/v1/admin/profile", undefined, { signal });
}

/** PATCH /v1/admin/profile: send ONLY the fields that changed */
export function updateAdminProfile(changes: Partial<EditableAdminFields>) {
  return api.patch<unknown>("/v1/admin/profile", changes);
}

/** POST /v1/admin/profile/photo: multipart/form-data, field name "file" */
export function uploadAdminPhoto(file: File) {
  const form = new FormData();
  form.append("file", file);
  return api.post<unknown>("/v1/admin/profile/photo", form);
}

/**
 * POST /v1/admin/profile/password
 * handleUnauthorized:false -> if the server answers 401 for a wrong current password,
 * the user sees the message in the dialog instead of being logged out.
 */
export function changeAdminPassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) {
  return api.post<unknown>(
    "/v1/admin/profile/password",
    { currentPassword, newPassword, confirmPassword },
    { handleUnauthorized: false }
  );
}
