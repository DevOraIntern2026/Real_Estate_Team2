import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getErrorMessage, isApiError } from "../../../api";
import Button from "../../../components/shared/Button";
import ConfirmDialog from "../../../components/shared/ConfirmDialog";
import DetailList from "../../../components/shared/DetailList";
import ImageGallery from "../../../components/shared/ImageGallery";
import InfoCard from "../../../components/shared/InfoCard";
import LinkButton from "../../../components/shared/LinkButton";
import LoadingState from "../../../components/shared/LoadingState";
import PageHeader from "../../../components/shared/PageHeader";
import QueryErrorState from "../../../components/shared/QueryErrorState";
import StatusBadge from "../../../components/shared/StatusBadge";
import { OWNER_PATHS } from "../../../constants/paths";
import { formatLocalDate } from "../../../utils/dateTime";
import { FACILITY_ICONS, NEARBY_ICONS } from "../../listing-details/constants";
import TagSection from "../../listing-details/components/TagSection";
import { ownerPropertyEditPath } from "./paths";
import { useDeleteProperty, useOwnerProperty } from "./queries";

const dateLabel = (iso: string) => (iso ? formatLocalDate(new Date(iso)) : "");
const orDash = (v: string | number | undefined) => (v === undefined || v === "" ? "—" : v);

export default function PropertyDetails() {
  const { propertyId = "" } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const property = useOwnerProperty(propertyId);
  const remove = useDeleteProperty(propertyId);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const header = <PageHeader title="Property Details" subtitle="Review and manage your property listing." />;

  if (property.isPending) {
    return (
      <section className="p-8">
        {header}
        <LoadingState rows={4} />
      </section>
    );
  }

  if (property.isError) {
    const notFound = isApiError(property.error) && property.error.status === 404;
    return (
      <section className="p-8">
        {header}
        {notFound ? (
          <p className="py-10 text-center text-sm text-[#5A4F49]">
            Property not found.{" "}
            <Link to={OWNER_PATHS.properties} className="text-[#87400E] underline">
              Back to my properties
            </Link>
          </p>
        ) : (
          <QueryErrorState error={property.error} onRetry={() => void property.refetch()} isRetrying={property.isRefetching} />
        )}
      </section>
    );
  }

  const p = property.data;

  const closeDialog = () => {
    if (remove.isPending) return; // don't dismiss while the request runs
    setConfirmOpen(false);
    remove.reset();
  };

  const confirmDelete = () =>
    remove.mutate(undefined, { onSuccess: () => navigate(OWNER_PATHS.properties, { replace: true }) });

  // only rows that have a date (a draft was never submitted)
  const submissionRows = [
    { label: "Created", value: dateLabel(p.createdAt) },
    { label: "Submitted", value: dateLabel(p.submittedAt) },
    { label: "Last Updated", value: dateLabel(p.updatedAt) },
  ].filter((r) => r.value);

  return (
    <section className="p-8 text-[#241A12]">
      {header}

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-medium">{p.title}</h2>
            <StatusBadge label={p.status.label} tone={p.status.tone} />
          </div>
          <p className="mt-1 text-sm text-[#5A4F49]">
            {[p.code, ...submissionRows.map((r) => `${r.label} ${r.value}`)].filter(Boolean).join(" · ")}
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setConfirmOpen(true)} className="w-32">
            Delete
          </Button>
          {p.isDraft && (
            <LinkButton to={ownerPropertyEditPath(p.id)} className="w-40">
              Continue Editing
            </LinkButton>
          )}
        </div>
      </div>

      <div className="mt-6">
        <ImageGallery images={p.images} alt={p.title} badge={p.purpose || undefined} />
      </div>

      <div className="mt-8">
        <InfoCard title="Property Information">
          <div className="grid gap-x-12 gap-y-4 md:grid-cols-2">
            <DetailList
              items={[
                { label: "Property Title", value: orDash(p.title) },
                { label: "Property ID", value: orDash(p.code) },
                { label: "Property Type", value: orDash(p.type) },
                { label: "Transaction", value: orDash(p.purpose) },
                { label: "Price", value: p.priceLabel },
              ]}
            />
            <DetailList
              items={[
                { label: "Location", value: orDash(p.address) },
                { label: "Area", value: orDash(p.size) },
                { label: "Bedrooms", value: orDash(p.bedrooms) },
                { label: "Bathrooms", value: orDash(p.bathrooms) },
                { label: "Furnishing", value: orDash(p.furnishing) },
              ]}
            />
          </div>
        </InfoCard>
      </div>

      <TagSection title="Facilities and Equipment" items={p.facilities} icons={FACILITY_ICONS} />
      <TagSection title="It's located near" items={p.nearby} icons={NEARBY_ICONS} />

      {p.description && (
        <section className="mt-8">
          <h2 className="mb-2 text-sm font-medium">Description</h2>
          <p className="text-sm leading-relaxed text-[#5A4F49]">{p.description}</p>
        </section>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <InfoCard title="Submission Info">
          <DetailList
            items={[
              ...submissionRows,
              { label: "Status", value: <StatusBadge label={p.status.label} tone={p.status.tone} /> },
            ]}
          />
        </InfoCard>
        <InfoCard title="Performance Indicators">
          <DetailList
            items={[
              { label: "Views", value: p.views },
              { label: "Inquiries", value: p.inquiries },
            ]}
          />
        </InfoCard>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this property?"
        message={
          <>
            <strong>{p.title}</strong> will be removed from your properties.
            {remove.isError && (
              <span role="alert" className="mt-2 block text-red-500">
                {getErrorMessage(remove.error)}
              </span>
            )}
          </>
        }
        confirmLabel="Delete"
        isLoading={remove.isPending}
        onConfirm={confirmDelete}
        onCancel={closeDialog}
      />
    </section>
  );
}
