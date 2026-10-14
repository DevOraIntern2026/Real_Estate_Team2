import { useMemo, useState } from "react";
import { usePagination } from "../../../../../hooks/usePagination";
import type { InquiryRow } from "../../../../../types/inquiry";
import { INQUIRIES_PAGE_SIZE, type InquiryTab } from "../constants";

export function useInquiriesTable(rows: InquiryRow[]) {
  const [tab, setTab] = useState<InquiryTab>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (tab !== "all" && r.status !== tab) return false;
      if (!q) return true;
      return [r.property.title, r.property.code, r.customerName, r.phone, r.message].some((f) =>
        f.toLowerCase().includes(q)
      );
    });
  }, [rows, tab, search]);

  const { page, totalPages, pageItems, setPage, reset } = usePagination(
    filtered,
    INQUIRIES_PAGE_SIZE
  );

  const changeTab = (v: InquiryTab) => {
    setTab(v);
    reset();
  };
  const changeSearch = (v: string) => {
    setSearch(v);
    reset();
  };

  const isFiltering = search.trim() !== "" || tab !== "all";

  return {
    tab,
    search,
    changeTab,
    changeSearch,
    rows: pageItems,
    total: filtered.length,
    isFiltering,
    page,
    totalPages,
    setPage,
  };
}
