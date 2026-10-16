import { api } from "../../api";
import type { AdminOverviewDto, OverviewParams } from "./types";

/** GET /v1/admin/overview  (JWT bearer, Admin role) */
export function fetchAdminOverview(
  { pendingLimit, notificationsLimit }: OverviewParams,
  signal?: AbortSignal
) {
  return api.get<AdminOverviewDto>(
    "/v1/admin/overview",
    { pendingLimit, notificationsLimit },
    { signal }
  );
}
