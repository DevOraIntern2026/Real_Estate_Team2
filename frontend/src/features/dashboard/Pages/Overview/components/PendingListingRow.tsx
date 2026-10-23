import { Link } from "react-router-dom";
import LinkButton from "../../../components/shared/LinkButton";
import StatusBadge from "../../../components/shared/StatusBadge";
import Thumbnail from "../../../components/shared/Thumbnail";
import { PROPERTY_STATUS_TONE } from "../../../components/properties/propertyColumns";
import { listingDetailsPath } from "../../../constants/paths";
import { formatLocalDate } from "../../../utils/dateTime";
import { toPropertyStatus } from "../mappers";
import type { PendingListingVm } from "../types";

const iconLink =
  "flex h-9 w-9 items-center justify-center rounded-sm border-[0.8px] border-[#87400E] text-[#87400E] hover:bg-[#F3E9E0]";

export default function PendingListingRow({ listing }: { listing: PendingListingVm }) {
  const to = listingDetailsPath(listing.id);
  const status = toPropertyStatus(listing.statusLabel);

  return (
    <li className="flex flex-wrap items-center justify-between gap-4 rounded-sm border-[0.8px] border-[#87400E] p-3">
      <div className="flex min-w-0 items-center gap-4">
        <Thumbnail src={listing.thumbnail} alt={listing.title} />
        <div className="min-w-0">
          <p className="font-medium text-[#241A12]">{listing.title}</p>
          <p className="text-sm text-[#5A4F49]">
            {listing.ownerName}. {listing.propertyType}. {listing.transaction}. {listing.area}.{" "}
            {listing.priceLabel}
          </p>
          <p className="text-xs text-[#5A4F49]">
            {listing.code} · Submitted {formatLocalDate(new Date(listing.submittedAt))}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <StatusBadge
          label={listing.statusLabel}
          tone={status ? PROPERTY_STATUS_TONE[status] : "neutral"}
        />
        {/* approving / rejecting needs the decision dialogs, which live on the details page */}
        <Link to={to} aria-label={`Approve ${listing.title} (opens review)`} className={iconLink}>
          <i className="fa-solid fa-check" />
        </Link>
        <Link to={to} aria-label={`Reject ${listing.title} (opens review)`} className={iconLink}>
          <i className="fa-solid fa-xmark" />
        </Link>
        <LinkButton to={to}>Review</LinkButton>
      </div>
    </li>
  );
}
