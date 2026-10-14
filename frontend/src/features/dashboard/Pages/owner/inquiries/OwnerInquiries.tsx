import { useNavigate } from "react-router-dom";
import DataTable from "../../../components/shared/DataTable";
import EmptyState from "../../../components/shared/EmptyState";
import PageHeader from "../../../components/shared/PageHeader";
import Pagination from "../../../components/shared/Pagination";
import SearchInput from "../../../components/shared/SearchInput";
import Tabs from "../../../components/shared/Tabs";
import { ownerInquiryPath } from "../../../constants/paths";

// adjust these paths to your assets folder
import emptyImg from "../../../../../../public/dashboardImgs/inquiries-empty.png";
import noMatchImg from "../../../../../../public/dashboardImgs/no-results.png";

import { inquiryColumns } from "../columns";
import { INQUIRY_TABS, TEXT } from "../constants";
import { useOwnerData } from "../useOwnerData";
import { useInquiriesTable } from "./useInquiriesTable";

export default function OwnerInquiries() {
  const navigate = useNavigate();
  const { inquiries } = useOwnerData();
  const t = useInquiriesTable(inquiries);

  // Screen 4: "1 Result Matched" (hidden when there are 0 results)
  const resultLabel =
    t.isFiltering && t.total > 0
      ? `${t.total} ${t.total === 1 ? "Result" : "Results"} Matched`
      : null;

  return (
    <section className="p-8 text-[#241A12]">
      <PageHeader title={TEXT.inquiriesTitle} subtitle={TEXT.inquiriesSubtitle}>
        <SearchInput
          value={t.search}
          onChange={t.changeSearch}
          placeholder={TEXT.searchProperties}
          className="w-full min-w-[240px] md:w-96"
        />
      </PageHeader>

      <Tabs tabs={INQUIRY_TABS} value={t.tab} onChange={t.changeTab} spread />

      {inquiries.length === 0 ? (
        // Screen 3: the owner has no inquiries at all
        <EmptyState
          image={emptyImg}
          title={TEXT.inquiriesEmpty}
          description={TEXT.inquiriesEmptyHint}
        />
      ) : (
        <div className="mt-6">
          {resultLabel && (
            <p className="mb-4 text-sm font-medium text-[#241A12]">{resultLabel}</p>
          )}

          {/* Screen 1 (table) + Screen 5 (no match: header stays, illustration below) */}
          <DataTable
            columns={inquiryColumns}
            rows={t.rows}
            getRowKey={(i) => i.id}
            onRowClick={(i) => navigate(ownerInquiryPath(i.id))}
            empty={
              <EmptyState
                image={noMatchImg}
                title={TEXT.noMatch}
                description={TEXT.noMatchHint}
              />
            }
          />
          <Pagination page={t.page} totalPages={t.totalPages} onChange={t.setPage} />
        </div>
      )}
    </section>
  );
}
