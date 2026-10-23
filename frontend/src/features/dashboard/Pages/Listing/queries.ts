import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { normalizePaginated, type Paginated } from "../../api";
import { fetchAdminListings, fetchListingCounts, fetchListingFilters } from "./api";
import { normalizeCounts, normalizeFilters, toListingRowVm } from "./mappers";
import type { ListingRowVm, ListingsParams, ListingSummaryDto } from "./types";

// every key starts with ["admin","listings"], so after approve/reject/... one
// queryClient.invalidateQueries({ queryKey: adminListingsRoot }) refreshes list + counts
export const adminListingsRoot = ["admin", "listings"] as const;
export const listingsKey = (params: ListingsParams) => [...adminListingsRoot, "list", params] as const;
export const countsKey = [...adminListingsRoot, "counts"] as const;
export const filtersKey = [...adminListingsRoot, "filters"] as const;

const toRows = (page: Paginated<ListingSummaryDto>): Paginated<ListingRowVm> => ({
  ...page,
  items: page.items.map((item) => toListingRowVm(item)), // NOT .map(toListingRowVm): map would pass the index as 2nd argument
});

export function useAdminListings(params: ListingsParams) {
  return useQuery({
    queryKey: listingsKey(params),
    queryFn: async ({ signal }) =>
      normalizePaginated<ListingSummaryDto>(await fetchAdminListings(params, signal), {
        page: params.page,
        limit: params.limit,
      }),
    select: toRows,
    placeholderData: keepPreviousData, // keep showing the old page while the next one loads
  });
}

export function useListingCounts() {
  return useQuery({
    queryKey: countsKey,
    queryFn: ({ signal }) => fetchListingCounts(signal),
    select: normalizeCounts,
  });
}

export function useListingFilters() {
  return useQuery({
    queryKey: filtersKey,
    queryFn: ({ signal }) => fetchListingFilters(signal),
    select: normalizeFilters,
    staleTime: 5 * 60_000, // dropdown values rarely change
  });
}
