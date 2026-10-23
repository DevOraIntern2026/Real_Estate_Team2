import { useMemo, useState } from "react";
import type { TabItem } from "../../components/shared/Tabs";
import { usePagination } from "../../../../hooks/usePagination";
import type { Property, PropertyStatus } from "../../../../types/property";
import { TABS_CONFIG, type PurposeFilter } from "./constants";
import type { ListingStatusFilter } from "./types";

const PROPERTY_STATUS_FILTER: Record<
  PropertyStatus,
  Exclude<ListingStatusFilter, "all">
> = {
  "Under Review": "under_review",
  Published: "published",
  Rejected: "rejected",
  "Change Required": "change_required",
  Inactive: "inactive",
  "Sold/Rented": "sold_rented",
};

/** Tabs + search + 3 filters + pagination for the listing table. */
export function useListingTable<T extends Property>(properties: T[]) {
  const [tab, setTab] = useState<ListingStatusFilter>("all");
  const [search, setSearch] = useState("");
  const [purpose, setPurpose] = useState<PurposeFilter>("all");
  const [type, setType] = useState("all");
  const [city, setCity] = useState("all");

  const tabs: TabItem<ListingStatusFilter>[] = useMemo(
    () =>
      TABS_CONFIG.map(({ label, value, showBadge }) => ({
        label,
        value,
        badge: showBadge
          ? properties.filter((p) => PROPERTY_STATUS_FILTER[p.status] === value)
              .length
          : undefined,
      })),
    [properties]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return properties.filter((p) => {
      if (tab !== "all" && PROPERTY_STATUS_FILTER[p.status] !== tab) return false;
      if (purpose !== "all" && p.purpose.toLowerCase() !== purpose) return false;
      if (type !== "all" && p.type !== type) return false;
      if (city !== "all" && p.city !== city) return false;
      if (!q) return true;
      return [p.title, p.owner, p.location, p.city, p.code].some((f) =>
        f.toLowerCase().includes(q)
      );
    });
  }, [properties, tab, search, purpose, type, city]);

  const { page, totalPages, pageItems, setPage, reset } = usePagination(
    filtered,
    4
  );

  // any filter change sends the user back to page 1
  const changeTab = (v: ListingStatusFilter) => { setTab(v); reset(); };
  const changeSearch = (v: string) => { setSearch(v); reset(); };
  const changePurpose = (v: PurposeFilter) => { setPurpose(v); reset(); };
  const changeType = (v: string) => { setType(v); reset(); };
  const changeCity = (v: string) => { setCity(v); reset(); };

  return {
    tabs, tab, search, purpose, type, city,
    changeTab, changeSearch, changePurpose, changeType, changeCity,
    rows: pageItems,
    page, totalPages, setPage,
  };
}
