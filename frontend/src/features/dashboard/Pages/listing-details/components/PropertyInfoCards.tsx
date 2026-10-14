import DetailList from "../../../components/shared/DetailList";
import InfoCard from "../../../components/shared/InfoCard";
import { formatPrice } from "../../../components/properties/propertyColumns";
import type { PropertyDetails } from "../../../../../types/property";
import { AREA_UNIT } from "../constants";

export default function PropertyInfoCards({
  property: p,
}: {
  property: PropertyDetails;
}) {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr_1fr]">
      <InfoCard title="Property Information">
        <DetailList
          items={[
            { label: "Property Title", value: p.title },
            { label: "Listing Type", value: p.purpose },
            { label: "Property ID", value: p.code },
            { label: "Property Type", value: p.type },
            { label: "Price", value: formatPrice(p) },
          ]}
        />
      </InfoCard>

      <InfoCard title="Property Details">
        <DetailList
          items={[
            { label: "Bedrooms", value: p.bedrooms },
            { label: "Bathrooms", value: p.bathrooms },
            { label: "The area", value: `${p.area} ${AREA_UNIT}` },
            { label: "Floor", value: p.floor },
            { label: "Furnishing", value: p.furnishing },
            {
              label: "Building Age",
              value: `${p.buildingAgeYears} ${p.buildingAgeYears === 1 ? "year" : "years"}`,
            },
          ]}
        />
      </InfoCard>

      <InfoCard title="Location">
        <DetailList
          items={[
            { label: "City", value: p.city },
            { label: "Address", value: p.address },
            { label: "Area", value: p.location },
            { label: "Landmark", value: p.landmark },
          ]}
        />
      </InfoCard>
    </div>
  );
}
