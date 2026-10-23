import { useQuery } from "@tanstack/react-query";
import { fetchOwnerDashboard } from "./api";
import { normalizeOwnerDashboard } from "./mappers";

export const ownerDashboardKey = ["owner", "dashboard"] as const;

export function useOwnerDashboard() {
  return useQuery({
    queryKey: ownerDashboardKey,
    queryFn: async ({ signal }) => normalizeOwnerDashboard(await fetchOwnerDashboard(signal)),
  });
}
