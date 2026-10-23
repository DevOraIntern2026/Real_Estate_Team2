import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { normalizePaginated } from "../../../api";
import { deleteProperty, fetchMyPropertiesPage, fetchProperty } from "./api";
import { normalizeOwnerProperty, toOwnerPropertyRow } from "./mappers";

// every key starts with ["owner","properties"]: one invalidate refreshes list + details
export const ownerPropertiesRoot = ["owner", "properties"] as const;
export const myPropertiesKey = [...ownerPropertiesRoot, "all"] as const;
export const ownerPropertyKey = (id: string) => [...ownerPropertiesRoot, "detail", id] as const;

const PAGE_SIZE = 50;
const MAX_PAGES = 20; // safety stop: 1000 properties

/**
 * The design filters by search text, sale/rent, type and location, but GET /properties/my only
 * accepts page, limit and status. So we load ALL the owner's properties (page by page) and the
 * page filters them. Fine for an owner's portfolio; if it grows a lot, ask the backend for
 * q / transaction / type / location params and switch to server-side filtering.
 */
async function fetchAllMyProperties(signal: AbortSignal): Promise<unknown[]> {
  const all: unknown[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const result = normalizePaginated<unknown>(await fetchMyPropertiesPage(page, PAGE_SIZE, signal), {
      page,
      limit: PAGE_SIZE,
    });
    all.push(...result.items);
    if (page >= result.totalPages || result.items.length === 0) break;
  }
  return all;
}

export function useMyProperties() {
  return useQuery({
    queryKey: myPropertiesKey,
    queryFn: ({ signal }) => fetchAllMyProperties(signal),
    select: (items) => items.map(toOwnerPropertyRow),
  });
}

export function useOwnerProperty(id: string) {
  return useQuery({
    queryKey: ownerPropertyKey(id),
    queryFn: async ({ signal }) => normalizeOwnerProperty(await fetchProperty(id, signal)),
    enabled: Boolean(id),
  });
}

export function useDeleteProperty(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => deleteProperty(id),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: ownerPropertiesRoot }),
        qc.invalidateQueries({ queryKey: ["owner", "dashboard"] }),
      ]),
  });
}
