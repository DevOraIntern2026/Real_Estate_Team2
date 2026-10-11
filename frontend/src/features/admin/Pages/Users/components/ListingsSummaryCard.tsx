import DetailList from "../../../components/shared/DetailList";
import InfoCard from "../../../components/shared/InfoCard";
import type { SummaryItem } from "../listingsSummary";

export default function ListingsSummaryCard({
  summary,
}: {
  summary: SummaryItem[];
}) {
  return (
    <InfoCard title="Listings Summary">
      <DetailList
        items={summary.map((s) => ({ label: s.label, value: s.value }))}
      />
    </InfoCard>
  );
}
