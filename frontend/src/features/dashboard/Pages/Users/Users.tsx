import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../api";
import DataTable from "../../components/shared/DataTable";
import EmptyState from "../../components/shared/EmptyState";
import ErrorState from "../../components/shared/ErrorState";
import FilterDropdown from "../../components/shared/FilterDropdown";
import LoadingState from "../../components/shared/LoadingState";
import PageHeader from "../../components/shared/PageHeader";
import Pagination from "../../components/shared/Pagination";
import SearchInput from "../../components/shared/SearchInput";

// adjust these two paths to your assets folder
import emptyUsersImg from "../../../../../public/dashboardImgs/users-empty.png";
import noMatchImg from "../../../../../public/dashboardImgs/no-results.png";

import { userColumns } from "./columns";
import { ROLE_OPTIONS, STATUS_OPTIONS, TEXT } from "./constants";
import { userProfilePath } from "./paths";
import { useUsersTable } from "./useUsersTable";

export default function Users() {
  const navigate = useNavigate();
  const t = useUsersTable();

  // Screen 1: there are no users at all (no filter is hiding them)
  const listIsEmpty = !t.isLoading && !t.isError && !t.isFiltering && t.total === 0;

  // Screen 3: "1 Result Matched"
  const resultLabel =
    t.isFiltering && !t.isLoading && t.total > 0
      ? `${t.total} ${t.total === 1 ? "Result" : "Results"} Matched`
      : null;

  return (
    <section className="p-8">
      <PageHeader title={TEXT.title} subtitle={TEXT.subtitle} />

      {listIsEmpty ? (
        <EmptyState image={emptyUsersImg} title={TEXT.emptyList} />
      ) : (
        <>
          {/* stays mounted while data loads, so typing is never interrupted */}
          <div className="my-6 flex flex-wrap items-center gap-4">
            <SearchInput
              value={t.search}
              onChange={t.changeSearch}
              placeholder={TEXT.searchPlaceholder}
              className="min-w-[260px] flex-1"
            />
            <FilterDropdown options={ROLE_OPTIONS} value={t.role} onChange={t.changeRole} />
            <FilterDropdown options={STATUS_OPTIONS} value={t.status} onChange={t.changeStatus} />
          </div>

          {resultLabel && (
            <p className="mb-4 text-sm font-medium text-[#241A12]">{resultLabel}</p>
          )}

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
                  columns={userColumns}
                  rows={t.rows}
                  getRowKey={(u) => u.id}
                  onRowClick={(u) => navigate(userProfilePath(u.id))}
                  empty={
                    <EmptyState image={noMatchImg} title={TEXT.noMatch} description={TEXT.noMatchHint} />
                  }
                />
              </div>
              <Pagination page={t.page} totalPages={t.totalPages} onChange={t.setPage} />
            </>
          )}
        </>
      )}
    </section>
  );
}
