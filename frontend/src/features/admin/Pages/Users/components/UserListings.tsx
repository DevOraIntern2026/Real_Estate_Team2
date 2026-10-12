import DataTable from "../../../components/shared/DataTable";
import { propertyColumns } from "../../../components/properties/propertyColumns";
import type { Property } from "../../../../../types/property";

type UserListingsProps = { listings: Property[]; emptyMessage: string };

export default function UserListings({
  listings,
  emptyMessage,
}: UserListingsProps) {
  return (
    <section className="mt-8">
      <h2 className="mb-2 text-sm font-medium text-[#241A12]">Listings</h2>
      <DataTable
        columns={propertyColumns}
        rows={listings}
        getRowKey={(p) => p.id}
        showHeader={false}
        empty={
          <p className="py-8 text-center text-sm text-[#5A4F49]">
            {emptyMessage}
          </p>
        }
      />
    </section>
  );
}
