import { useNavigate } from "react-router-dom";
import DataTable from "../../../components/shared/DataTable";
import EmptyState from "../../../components/shared/EmptyState";
import LoadingState from "../../../components/shared/LoadingState";
import PageHeader from "../../../components/shared/PageHeader";
import Pagination from "../../../components/shared/Pagination";
import QueryErrorState from "../../../components/shared/QueryErrorState";
import Tabs from "../../../components/shared/Tabs";
import { ownerInquiryPath } from "../../../constants/paths";

// adjust these paths to your assets folder
import emptyImg from "../../../../../../public/dashboardImgs/inquiries-empty.png";
import noMatchImg from "../../../../../../public/dashboardImgs/no-results.png";

import { INQUIRY_TABS, TEXT } from "../constants";
import { recentInquiryColumns } from "../overview/recentColumns";
import { useInquiriesTable } from "./useInquiriesTable";

export default function OwnerInquiries() {
  const navigate = useNavigate();
  const t = useInquiriesTable();

  // Screen 3: the owner has no inquiries at all (no tab is hiding them)
  const listIsEmpty = !t.isLoading && !t.isError && !t.isFiltering && t.total === 0;

  // Screen 4: "N Results Matched"
  const resultLabel =
    t.isFiltering && !t.isLoading && t.total > 0
      ? `${t.total} ${t.total === 1 ? "Result" : "Results"} Matched`
      : null;

  return (
    <section className="p-8 text-[#241A12]">
      {/* The design has a search box here, but the API only filters by status and propertyId. */}
      <PageHeader title={TEXT.inquiriesTitle} subtitle={TEXT.inquiriesSubtitle} />

      <Tabs tabs={INQUIRY_TABS} value={t.tab} onChange={t.changeTab} spread />

      {t.isLoading ? (
        <LoadingState rows={4} />
      ) : t.isError ? (
        <QueryErrorState error={t.error} onRetry={() => void t.refetch()} isRetrying={t.isRetrying} />
      ) : listIsEmpty ? (
        <EmptyState image={emptyImg} title={TEXT.inquiriesEmpty} description={TEXT.inquiriesEmptyHint} />
      ) : (
        <div className="mt-6">
          {resultLabel && <p className="mb-4 text-sm font-medium text-[#241A12]">{resultLabel}</p>}

          {/* Screen 1 (table) + Screen 5 (nothing in this tab: header stays, illustration below) */}
          <div aria-busy={t.isRefreshing} className={t.isRefreshing ? "opacity-60 transition-opacity" : ""}>
            <DataTable
              columns={recentInquiryColumns}
              rows={t.rows}
              getRowKey={(i) => i.id}
              onRowClick={(i) => navigate(ownerInquiryPath(i.id))}
              empty={<EmptyState image={noMatchImg} title={TEXT.noMatch} description={TEXT.noMatchHint} />}
            />
          </div>
          <Pagination page={t.page} totalPages={t.totalPages} onChange={t.setPage} />
        </div>
      )}
    </section>
  );
}
