import { useMemo, useState } from "react";
import { INQUIRIES_PAGE_SIZE, type InquiryTab } from "../constants";
import { useInquiries } from "./queries";
import type { InquiriesParams, InquiryStatusParam } from "./types";

const tabToStatus = (tab: InquiryTab): InquiryStatusParam | undefined =>
  tab === "all" ? undefined : (tab.toLowerCase() as InquiryStatusParam); // "New" -> "new"

/** tab + page -> query params -> server data. (The API has no text-search param, only status/propertyId.) */
export function useInquiriesTable() {
  const [tab, setTab] = useState<InquiryTab>("all");
  const [page, setPage] = useState(1);

  const params: InquiriesParams = useMemo(
    () => ({ status: tabToStatus(tab), page, limit: INQUIRIES_PAGE_SIZE }),
    [tab, page]
  );

  const query = useInquiries(params);

  const changeTab = (v: InquiryTab) => {
    setTab(v);
    setPage(1); // any filter change sends the user back to page 1
  };

  return {
    tab,
    changeTab,
    rows: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isFiltering: tab !== "all",
    page,
    totalPages: query.data?.totalPages ?? 1,
    setPage,
    isLoading: query.isPending,
    isRefreshing: query.isPlaceholderData,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRetrying: query.isRefetching,
  };
}
