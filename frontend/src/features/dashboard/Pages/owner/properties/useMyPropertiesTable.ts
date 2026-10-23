import { useMemo, useState } from "react";
import type { Option } from "../../../components/shared/FilterDropdown";
import { usePagination } from "../../../../../hooks/usePagination";
import { ALL_LOCATIONS, ALL_TYPES } from "../../Listing/constants";
import type { PurposeFilter } from "../../Listing/constants";
import type { PropertyTab } from "./status";
import { useMyProperties } from "./queries";

const PAGE_SIZE = 10;

const distinct = (values: string[]) => [...new Set(values.filter(Boolean))].sort();
const toOptions = (values: string[]): Option<string>[] => values.map((v) => ({ value: v, label: v }));

/** Everything is loaded once; tabs, search and the dropdowns filter it here. */
export function useMyPropertiesTable() {
  const query = useMyProperties();
  const all = useMemo(() => query.data ?? [], [query.data]);

  const [tab, setTab] = useState<PropertyTab>("all");
  const [search, setSearch] = useState("");
  const [purpose, setPurpose] = useState<PurposeFilter>("all");
  const [type, setType] = useState("all");
  const [location, setLocation] = useState("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((p) => {
      if (tab !== "all" && p.status.tab !== tab) return false;
      if (purpose !== "all" && p.transaction !== purpose) return false;
      if (type !== "all" && p.type !== type) return false;
      if (location !== "all" && p.location !== location) return false;
      if (!q) return true;
      return [p.title, p.code, p.location].some((f) => f.toLowerCase().includes(q));
    });
  }, [all, tab, search, purpose, type, location]);

  const { page, totalPages, pageItems, setPage, reset } = usePagination(filtered, PAGE_SIZE);

  // any filter change sends the user back to page 1
  const changeTab = (v: PropertyTab) => { setTab(v); reset(); };
  const changeSearch = (v: string) => { setSearch(v); reset(); };
  const changePurpose = (v: PurposeFilter) => { setPurpose(v); reset(); };
  const changeType = (v: string) => { setType(v); reset(); };
  const changeLocation = (v: string) => { setLocation(v); reset(); };

  return {
    tab, search, purpose, type, location,
    changeTab, changeSearch, changePurpose, changeType, changeLocation,
    typeOptions: [ALL_TYPES, ...toOptions(distinct(all.map((p) => p.type)))],
    locationOptions: [ALL_LOCATIONS, ...toOptions(distinct(all.map((p) => p.location)))],
    rows: pageItems,
    total: filtered.length,
    accountIsEmpty: all.length === 0,
    isFiltering: tab !== "all" || search.trim() !== "" || purpose !== "all" || type !== "all" || location !== "all",
    page, totalPages, setPage,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRetrying: query.isRefetching,
  };
}
