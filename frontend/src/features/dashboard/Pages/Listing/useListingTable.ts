import { useMemo, useState } from "react";
import type { Option } from "../../components/shared/FilterDropdown";
import type { TabItem } from "../../components/shared/Tabs";
import { useDebouncedValue } from "../../../../hooks/useDebouncedValue";
import {
  ALL_LOCATIONS,
  ALL_TYPES,
  DEFAULT_SORT,
  LISTING_PAGE_SIZE,
  TABS_CONFIG,
  type PurposeFilter,
} from "./constants";
import { useAdminListings, useListingCounts, useListingFilters } from "./queries";
import type { ListingStatusFilter, ListingsParams } from "./types";

/** UI state (tab, search, filters, page) -> query params -> server data. */
export function useListingTable() {
  const [tab, setTab] = useState<ListingStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [purpose, setPurpose] = useState<PurposeFilter>("all");
  const [type, setType] = useState("all");
  const [location, setLocation] = useState("all");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search.trim(), 400);

  const params: ListingsParams = useMemo(
    () => ({
      status: tab,
      transaction: purpose === "all" ? undefined : purpose,
      type: type === "all" ? undefined : type,
      location: location === "all" ? undefined : location,
      q: debouncedSearch || undefined,
      sort: DEFAULT_SORT,
      page,
      limit: LISTING_PAGE_SIZE,
    }),
    [tab, purpose, type, location, debouncedSearch, page]
  );

  const listings = useAdminListings(params);
  const counts = useListingCounts();
  const filters = useListingFilters();

  const tabs: TabItem<ListingStatusFilter>[] = TABS_CONFIG.map(({ label, value, showBadge }) => ({
    label,
    value,
    badge: showBadge && counts.data ? counts.data[value] : undefined,
  }));

  const typeOptions: Option<string>[] = [ALL_TYPES, ...(filters.data?.types ?? [])];
  const locationOptions: Option<string>[] = [ALL_LOCATIONS, ...(filters.data?.locations ?? [])];

  // any filter change sends the user back to page 1
  const changeTab = (v: ListingStatusFilter) => { setTab(v); setPage(1); };
  const changeSearch = (v: string) => { setSearch(v); setPage(1); };
  const changePurpose = (v: PurposeFilter) => { setPurpose(v); setPage(1); };
  const changeType = (v: string) => { setType(v); setPage(1); };
  const changeLocation = (v: string) => { setLocation(v); setPage(1); };

  return {
    tabs, tab, search, purpose, type, location,
    typeOptions, locationOptions,
    changeTab, changeSearch, changePurpose, changeType, changeLocation,
    rows: listings.data?.items ?? [],
    total: listings.data?.total ?? 0,
    page,
    totalPages: listings.data?.totalPages ?? 1,
    setPage,
    isLoading: listings.isPending,
    isRefreshing: listings.isPlaceholderData, // showing the previous page while loading the next
    isError: listings.isError,
    error: listings.error,
    refetch: listings.refetch,
    isRetrying: listings.isRefetching,
  };
}
