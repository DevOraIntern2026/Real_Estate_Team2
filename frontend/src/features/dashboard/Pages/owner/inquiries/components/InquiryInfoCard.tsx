import DetailList from "../../../../components/shared/DetailList";
import InfoCard from "../../../../components/shared/InfoCard";
import type { InquiryDetailVm } from "../types";

export default function InquiryInfoCard({ inquiry }: { inquiry: InquiryDetailVm }) {
  const { property } = inquiry;

  return (
    <InfoCard title="Submission Info">
      <DetailList
        items={[
          { label: "Property Title", value: property.title || "—" },
          { label: "Property Type", value: property.type || "—" },
          { label: "Transaction", value: property.purpose || "—" },
          { label: "Price", value: property.priceLabel },
        ]}
      />
    </InfoCard>
  );
}
