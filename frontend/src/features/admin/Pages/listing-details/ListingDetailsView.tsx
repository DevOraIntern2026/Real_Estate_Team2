import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/shared/ConfirmDialog";
import ImageGallery from "../../components/shared/ImageGallery";
import PageHeader from "../../components/shared/PageHeader";
import { listingEditPath } from "../../constants/paths";
import type { PropertyDetails } from "../../../../types/property";
import { formatDate } from "../../utils/formatDate";
import { useUsers } from "../Users/UsersContext";
import ClassifyDialog from "./components/dialogs/ClassifyDialog";
import RejectDialog from "./components/dialogs/RejectDialog";
import DecisionPanel from "./components/DecisionPanel";
import OwnerCard from "./components/OwnerCard";
import PropertyInfoCards from "./components/PropertyInfoCards";
import SubmissionInfoCard from "./components/SubmissionInfoCard";
import TagSection from "./components/TagSection";
import {
  FACILITY_ICONS,
  NEARBY_ICONS,
  TEXT,
  type DecisionActionKind,
} from "./constants";
import { useDecisionFlow } from "./useDecisionFlow";

export default function ListingDetailsView({
  property,
}: {
  property: PropertyDetails;
}) {
  const navigate = useNavigate();
  const { getUserById } = useUsers();
  const owner = getUserById(property.ownerId);
  const flow = useDecisionFlow(property);

  // each button kind -> what it does (no switch / if-else chain)
  const actionHandlers: Record<DecisionActionKind, () => void> = {
    approve: () => flow.open("classify"),
    edit: () => navigate(listingEditPath(property.id)),
    reject: () => flow.open("reject"),
    deactivate: () => flow.open("deactivate"),
  };

  return (
    <section className="p-8 text-[#241A12]">
      <PageHeader title={TEXT.pageTitle} subtitle={TEXT.pageSubtitle} />

      <div className="mt-6">
        <h2 className="text-lg font-medium">{property.title}</h2>
        <p className="text-sm text-[#5A4F49]">
          {property.code} · Submitted {formatDate(property.submittedAt)} ·
          Updated {formatDate(property.updatedAt)}
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <ImageGallery
          images={property.images}
          alt={property.title}
          badge={property.purpose}
        />

        <div className="flex flex-col gap-6">
          <DecisionPanel
            status={property.status}
            rejection={property.rejection}
            onAction={(kind) => actionHandlers[kind]()}
          />
          {owner && <OwnerCard user={owner} />}
          <SubmissionInfoCard property={property} />
        </div>
      </div>

      <PropertyInfoCards property={property} />

      <TagSection
        title="Facilities and Equipment"
        items={property.facilities}
        icons={FACILITY_ICONS}
      />
      <TagSection
        title="It's located near"
        items={property.nearby}
        icons={NEARBY_ICONS}
      />

      <section className="mt-8">
        <h2 className="mb-2 text-sm font-medium">Description</h2>
        <p className="text-sm leading-relaxed text-[#5A4F49]">
          {property.description}
        </p>
      </section>

      {/* ---- dialogs ---- */}
      <ClassifyDialog
        open={flow.dialog === "classify"}
        initial={flow.classification}
        onCancel={flow.close}
        onSubmit={flow.submitClassification}
      />

      <ConfirmDialog
        open={flow.dialog === "approve"}
        title={TEXT.approveTitle}
        message={TEXT.approveMessage}
        confirmLabel={TEXT.approveConfirm}
        onConfirm={flow.confirmApprove}
        onCancel={flow.close}
      />

      <RejectDialog
        open={flow.dialog === "reject"}
        onCancel={flow.close}
        onSubmit={flow.submitReject}
      />

      <ConfirmDialog
        open={flow.dialog === "deactivate"}
        title={TEXT.deactivateTitle}
        message={
          <>
            This will remove <strong>{property.title}</strong> in{" "}
            {property.location} from public view. You can reactivate it later.
          </>
        }
        confirmLabel={TEXT.deactivateConfirm}
        onConfirm={flow.confirmDeactivate}
        onCancel={flow.close}
      />
    </section>
  );
}
