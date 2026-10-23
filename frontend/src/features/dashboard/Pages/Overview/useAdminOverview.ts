import { useQuery } from "@tanstack/react-query";
import { fetchAdminOverview } from "./api";
import { toOverviewVm } from "./mappers";
import type { OverviewParams } from "./types";

export const adminOverviewKey = (params: OverviewParams) =>
  ["admin", "overview", params] as const;

export function useAdminOverview(params: Partial<OverviewParams> = {}) {
  const { pendingLimit = 5, notificationsLimit = 3 } = params;
  const query = { pendingLimit, notificationsLimit };

  return useQuery({
    queryKey: adminOverviewKey(query),
    queryFn: ({ signal }) => fetchAdminOverview(query, signal),
    select: toOverviewVm, // cache keeps the raw response; the page gets the mapped one
  });
}
