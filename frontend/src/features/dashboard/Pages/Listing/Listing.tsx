import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../api";
import DataTable from "../../components/shared/DataTable";
import ErrorState from "../../components/shared/ErrorState";
import FilterDropdown from "../../components/shared/FilterDropdown";
import LoadingState from "../../components/shared/LoadingState";
import PageHeader from "../../components/shared/PageHeader";
import Pagination from "../../components/shared/Pagination";
import SearchInput from "../../components/shared/SearchInput";
import Tabs from "../../components/shared/Tabs";
import { listingDetailsPath } from "../../constants/paths";
import { adminListingColumns } from "./columns";
import { PURPOSE_OPTIONS, TEXT } from "./constants";
import { useListingTable } from "./useListingTable";

export default function Listing() {
  const navigate = useNavigate();
  const t = useListingTable();

  return (
    <section className="p-8 text-[#241A12]">
      <PageHeader title={TEXT.title} subtitle={TEXT.subtitle} />

      {/* the toolbar stays mounted while data loads, so typing is never interrupted */}
      <Tabs tabs={t.tabs} value={t.tab} onChange={t.changeTab} />

      <div className="my-6 flex flex-wrap items-center gap-4">
        <SearchInput
          value={t.search}
          onChange={t.changeSearch}
          placeholder={TEXT.searchPlaceholder}
          className="min-w-[260px] flex-1"
        />
        <FilterDropdown options={PURPOSE_OPTIONS} value={t.purpose} onChange={t.changePurpose} className="w-36" />
        <FilterDropdown options={t.typeOptions} value={t.type} onChange={t.changeType} className="w-36" />
        <FilterDropdown options={t.locationOptions} value={t.location} onChange={t.changeLocation} className="w-36" />
      </div>

      {t.isLoading ? (
        <LoadingState rows={5} />
      ) : t.isError ? (
        <ErrorState
          message={getErrorMessage(t.error)}
          onRetry={() => void t.refetch()}
          isRetrying={t.isRetrying}
        />
      ) : (
        <>
          <div aria-busy={t.isRefreshing} className={t.isRefreshing ? "opacity-60 transition-opacity" : ""}>
            <DataTable
              columns={adminListingColumns}
              rows={t.rows}
              getRowKey={(r) => r.id}
              onRowClick={(r) => navigate(listingDetailsPath(r.id))}
              empty={<p className="py-10 text-center text-sm text-[#5A4F49]">{TEXT.noMatch}</p>}
            />
          </div>
          <Pagination page={t.page} totalPages={t.totalPages} onChange={t.setPage} />
        </>
      )}
    </section>
  );
}
