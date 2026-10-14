import { useNavigate } from "react-router-dom";
import DataTable from "../../components/shared/DataTable";
import FilterDropdown from "../../components/shared/FilterDropdown";
import PageHeader from "../../components/shared/PageHeader";
import Pagination from "../../components/shared/Pagination";
import SearchInput from "../../components/shared/SearchInput";
import Tabs from "../../components/shared/Tabs";
import { propertyColumns } from "../../components/properties/propertyColumns";
import { listingDetailsPath } from "../../constants/paths";
import { useProperties } from "../../context/PropertiesContext";
import { CITY_OPTIONS, PURPOSE_OPTIONS, TEXT, TYPE_OPTIONS } from "./Constants";
import { useListingTable } from "./useLisingTable";

export default function Listing() {
  const navigate = useNavigate();
  const { properties } = useProperties(); // shared data (was a local array)
  const t = useListingTable(properties);

  return (
    <section className="p-8 text-[#241A12]">
      <PageHeader title={TEXT.title} subtitle={TEXT.subtitle} />

      <Tabs tabs={t.tabs} value={t.tab} onChange={t.changeTab} />

      <div className="my-6 flex flex-wrap items-center gap-4">
        <SearchInput
          value={t.search}
          onChange={t.changeSearch}
          placeholder={TEXT.searchPlaceholder}
          className="min-w-[260px] flex-1"
        />
        <FilterDropdown options={PURPOSE_OPTIONS} value={t.purpose} onChange={t.changePurpose} className="w-36" />
        <FilterDropdown options={TYPE_OPTIONS} value={t.type} onChange={t.changeType} className="w-36" />
        <FilterDropdown options={CITY_OPTIONS} value={t.city} onChange={t.changeCity} className="w-36" />
      </div>

      <DataTable
        columns={propertyColumns}
        rows={t.rows}
        getRowKey={(p) => p.id}
        onRowClick={(p) => navigate(listingDetailsPath(p.id))}
        empty={
          <p className="py-10 text-center text-sm text-[#5A4F49]">
            {TEXT.noMatch}
          </p>
        }
      />

      <Pagination page={t.page} totalPages={t.totalPages} onChange={t.setPage} />
    </section>
  );
}
