import { Link, useParams } from "react-router-dom";
import PageHeader from "../../components/shared/PageHeader";
import { LISTING_PATH } from "../../constants/paths";
import { useProperties } from "../../context/PropertiesContext";
import { TEXT } from "./constants";
import ListingDetailsView from "./ListingDetailsView";

/** Route component: finds the listing from the URL, then renders the view. */
export default function ListingDetails() {
  const { listingId = "" } = useParams<{ listingId: string }>();
  const { getPropertyById } = useProperties();
  const property = getPropertyById(listingId);

  if (!property) {
    return (
      <section className="p-8">
        <PageHeader title={TEXT.pageTitle} subtitle={TEXT.pageSubtitle} />
        <p className="py-10 text-center text-sm text-[#5A4F49]">
          {TEXT.notFound}{" "}
          <Link to={LISTING_PATH} className="text-[#87400E] underline">
            Back to listings
          </Link>
        </p>
      </section>
    );
  }

  return <ListingDetailsView property={property} />;
}
