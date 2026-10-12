import DetailList from "../../../components/shared/DetailList";
import InfoCard from "../../../components/shared/InfoCard";
import StatusBadge from "../../../components/shared/StatusBadge";
import { PROPERTY_STATUS_TONE } from "../../../components/properties/propertyColumns";
import type { PropertyDetails } from "../../../../../types/property";
import { formatDate } from "../../../utils/formatDate";

export default function SubmissionInfoCard({
  property,
}: {
  property: PropertyDetails;
}) {
  return (
    <InfoCard title="Submission Info">
      <DetailList
        items={[
          { label: "Submitted", value: formatDate(property.submittedAt) },
          { label: "Last Updated", value: formatDate(property.updatedAt) },
          {
            label: "Status",
            value: (
              <StatusBadge
                label={property.status}
                tone={PROPERTY_STATUS_TONE[property.status]}
              />
            ),
          },
        ]}
      />
    </InfoCard>
  );
}
