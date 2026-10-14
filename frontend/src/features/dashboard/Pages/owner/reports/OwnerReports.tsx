import { useMemo, useState } from "react";
import PageHeader from "../../../components/shared/PageHeader";
import SearchInput from "../../../components/shared/SearchInput";
import ReportSections from "../../../components/reports/ReportSections";
import { filterSections } from "../../../components/reports/reportTypes";
import { TEXT } from "../constants";
import { useOwnerData } from "../useOwnerData";
import { buildOwnerReport } from "./buildOwnerReport";

export default function OwnerReports() {
  const { properties } = useOwnerData();
  const [search, setSearch] = useState("");

  const sections = useMemo(() => buildOwnerReport(properties), [properties]);
  const visible = useMemo(() => filterSections(sections, search), [sections, search]);

  return (
    <section className="p-8 text-[#241A12]">
      <PageHeader title={TEXT.reportsTitle} subtitle={TEXT.reportsSubtitle}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={TEXT.searchProperties}
          className="w-full min-w-[240px] md:w-72"
        />
      </PageHeader>
      <ReportSections sections={visible} emptyMessage={TEXT.reportsNoMatch} />
    </section>
  );
}
