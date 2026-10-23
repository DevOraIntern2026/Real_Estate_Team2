import { useNavigate } from "react-router-dom";
import DataTable from "../../../components/shared/DataTable";
import EmptyState from "../../../components/shared/EmptyState";
import FilterDropdown from "../../../components/shared/FilterDropdown";
import LinkButton from "../../../components/shared/LinkButton";
import LoadingState from "../../../components/shared/LoadingState";
import PageHeader from "../../../components/shared/PageHeader";
import Pagination from "../../../components/shared/Pagination";
import QueryErrorState from "../../../components/shared/QueryErrorState";
import SearchInput from "../../../components/shared/SearchInput";
import Tabs from "../../../components/shared/Tabs";
import { OWNER_PATHS } from "../../../constants/paths";
import { PURPOSE_OPTIONS } from "../../Listing/constants";

// adjust these paths to your assets folder
import emptyImg from "../../../../../../public/dashboardImgs/inquiries-empty.png";
import noMatchImg from "../../../../../../public/dashboardImgs/no-results.png";

import { ownerPropertiesColumns } from "./columns";
import { ownerPropertyPath } from "./paths";
import { PROPERTY_TABS } from "./status";
import { useMyPropertiesTable } from "./useMyPropertiesTable";

const TEXT = {
  title: "My Properties",
  subtitle: "Manage The Properties You Have Listed On Devora",
  search: "Search Your Properties",
  empty: "You haven't posted any properties",
  noMatch: "No Things Matched To Your Search",
  noMatchHint: "Try A New Keyword",
};

export default function MyProperties() {
  const navigate = useNavigate();
  const t = useMyPropertiesTable();

  const addProperty = <LinkButton to={OWNER_PATHS.addProperty}>Add Property</LinkButton>;

  // Screen 4: "1 Result Matched"
  const resultLabel =
    t.isFiltering && t.total > 0 ? `${t.total} ${t.total === 1 ? "Result" : "Results"} Matched` : null;

  return (
    <section className="p-8 text-[#241A12]">
      <PageHeader title={TEXT.title} subtitle={TEXT.subtitle} actions={addProperty} />

      <Tabs tabs={PROPERTY_TABS} value={t.tab} onChange={t.changeTab} spread />

      {t.isLoading ? (
        <LoadingState rows={5} />
      ) : t.isError ? (
        <QueryErrorState error={t.error} onRetry={() => void t.refetch()} isRetrying={t.isRetrying} />
      ) : t.accountIsEmpty ? (
        // Screen 2: the owner hasn't posted anything yet
        <EmptyState image={emptyImg} title={TEXT.empty} action={addProperty} />
      ) : (
        <>
          <div className="my-6 flex flex-wrap items-center gap-4">
            <SearchInput
              value={t.search}
              onChange={t.changeSearch}
              placeholder={TEXT.search}
              className="min-w-[260px] flex-1"
            />
            <FilterDropdown options={PURPOSE_OPTIONS} value={t.purpose} onChange={t.changePurpose} className="w-36" />
            <FilterDropdown options={t.typeOptions} value={t.type} onChange={t.changeType} className="w-36" />
            <FilterDropdown options={t.locationOptions} value={t.location} onChange={t.changeLocation} className="w-36" />
          </div>

          {resultLabel && <p className="mb-4 text-sm font-medium text-[#241A12]">{resultLabel}</p>}

          {/* Screen 1 (table) + Screen 5 (no match: header stays, illustration below) */}
          <DataTable
            columns={ownerPropertiesColumns}
            rows={t.rows}
            getRowKey={(p) => p.id}
            onRowClick={(p) => navigate(ownerPropertyPath(p.id))}
            empty={<EmptyState image={noMatchImg} title={TEXT.noMatch} description={TEXT.noMatchHint} />}
          />
          <Pagination page={t.page} totalPages={t.totalPages} onChange={t.setPage} />
        </>
      )}
    </section>
  );
}
