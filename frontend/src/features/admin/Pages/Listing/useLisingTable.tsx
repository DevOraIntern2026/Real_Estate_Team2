import { useMemo, useState } from "react";
import type { TabItem } from "../../components/shared/Tabs";
import { usePagination } from "../../../../hooks/usePagination";
import type { Property } from "../../../../types/property";
import { PAGE_SIZE, TABS_CONFIG, type PurposeFilter, type TabValue } from "./Constants";

/** Tabs + search + 3 filters + pagination for the listing table. */
export function useListingTable<T extends Property>(properties: T[]) {
  const [tab, setTab] = useState<TabValue>("all");
  const [search, setSearch] = useState("");
  const [purpose, setPurpose] = useState<PurposeFilter>("all");
  const [type, setType] = useState("all");
  const [city, setCity] = useState("all");

  const tabs: TabItem<TabValue>[] = useMemo(
    () =>
      TABS_CONFIG.map(({ label, value, showBadge }) => ({
        label,
        value,
        badge: showBadge
          ? properties.filter((p) => p.status === value).length
          : undefined,
      })),
    [properties]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return properties.filter((p) => {
      if (tab !== "all" && p.status !== tab) return false;
      if (purpose !== "all" && p.purpose !== purpose) return false;
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
    PAGE_SIZE
  );

  // any filter change sends the user back to page 1
  const changeTab = (v: TabValue) => { setTab(v); reset(); };
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
