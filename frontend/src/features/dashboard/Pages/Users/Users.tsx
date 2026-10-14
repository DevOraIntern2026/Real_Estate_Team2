import { useNavigate } from "react-router-dom";
import DataTable from "../../components/shared/DataTable";
import EmptyState from "../../components/shared/EmptyState";
import FilterDropdown from "../../components/shared/FilterDropdown";
import PageHeader from "../../components/shared/PageHeader";
import Pagination from "../../components/shared/Pagination";
import SearchInput from "../../components/shared/SearchInput";

// adjust these two paths to your assets folder
import emptyUsersImg from "../../../../../public/dashboardImgs/users-empty.png";
import noMatchImg from "../../../../../public/dashboardImgs/no-results.png";

import { userColumns } from "./columns";
import { ROLE_OPTIONS, STATUS_OPTIONS, TEXT } from "./constants";
import { userProfilePath } from "./paths";
import { useUsers } from "./UsersContext";
import { useUsersTable } from "./useUsersTable";

export default function Users() {
  const navigate = useNavigate();
  const { users } = useUsers(); // was: usersMock
  const t = useUsersTable(users);

  const listIsEmpty = users.length === 0;

  const resultLabel =
    t.isFiltering && t.total > 0
      ? `${t.total} ${t.total === 1 ? "Result" : "Results"} Matched`
      : null;

  return (
    <section className="p-8">
      <PageHeader title={TEXT.title} subtitle={TEXT.subtitle} />

      {listIsEmpty ? (
        <EmptyState image={emptyUsersImg} title={TEXT.emptyList} />
      ) : (
        <>
          <div className="my-6 flex flex-wrap items-center gap-4">
            <SearchInput
              value={t.search}
              onChange={t.changeSearch}
              placeholder={TEXT.searchPlaceholder}
              className="min-w-[260px] flex-1"
            />
            <FilterDropdown
              options={ROLE_OPTIONS}
              value={t.role}
              onChange={t.changeRole}
            />
            <FilterDropdown
              options={STATUS_OPTIONS}
              value={t.status}
              onChange={t.changeStatus}
            />
          </div>

          {resultLabel && (
            <p className="mb-4 text-sm font-medium text-[#241A12]">
              {resultLabel}
            </p>
          )}

          <DataTable
            columns={userColumns}
            rows={t.rows}
            getRowKey={(u) => u.id}
            onRowClick={(u) => navigate(userProfilePath(u.id))}
            empty={
              <EmptyState
                image={noMatchImg}
                title={TEXT.noMatch}
                description={TEXT.noMatchHint}
              />
            }
          />

          <Pagination
            page={t.page}
            totalPages={t.totalPages}
            onChange={t.setPage}
          />
        </>
      )}
    </section>
  );
}
