import { getErrorMessage } from "../../../api";
import DataTable from "../../../components/shared/DataTable";
import ErrorState from "../../../components/shared/ErrorState";
import LoadingState from "../../../components/shared/LoadingState";
import Pagination from "../../../components/shared/Pagination";
import { adminListingColumns } from "../../Listing/columns";
import type { ListingRowVm } from "../../Listing/types";
import { TEXT } from "../constants";

type UserListingsProps = {
  rows: ListingRowVm[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: unknown;
  onRetry: () => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSelect: (row: ListingRowVm) => void;
};

export default function UserListings({
  rows,
  isLoading,
  isRefreshing,
  error,
  onRetry,
  page,
  totalPages,
  onPageChange,
  onSelect,
}: UserListingsProps) {
  return (
    <section className="mt-8">
      <h2 className="mb-2 text-sm font-medium text-ink">Listings</h2>

      {isLoading ? (
        <LoadingState rows={3} />
      ) : error ? (
        <ErrorState message={getErrorMessage(error)} onRetry={onRetry} />
      ) : (
        <>
          <div aria-busy={isRefreshing} className={isRefreshing ? "opacity-60 transition-opacity" : ""}>
            <DataTable
              columns={adminListingColumns}
              rows={rows}
              getRowKey={(r) => r.id}
              showHeader={false}
              onRowClick={onSelect}
              empty={<p className="py-8 text-center text-sm text-muted">{TEXT.noUserListings}</p>}
            />
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
        </>
      )}
    </section>
  );
}
