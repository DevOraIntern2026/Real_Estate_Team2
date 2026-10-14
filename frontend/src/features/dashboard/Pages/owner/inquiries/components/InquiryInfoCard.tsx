import DetailList from "../../../../components/shared/DetailList";
import InfoCard from "../../../../components/shared/InfoCard";
import { formatPrice } from "../../../../components/properties/propertyColumns";
import type { InquiryRow } from "../../../../../../types/inquiry";

export default function InquiryInfoCard({ inquiry }: { inquiry: InquiryRow }) {
  const { property } = inquiry;

  return (
    <InfoCard title="Submission Info">
      <DetailList
        items={[
          { label: "Property Title", value: property.title },
          { label: "Property Type", value: property.type },
          { label: "Transaction", value: property.purpose },
          { label: "Price", value: formatPrice(property) },
        ]}
      />
    </InfoCard>
  );
}
