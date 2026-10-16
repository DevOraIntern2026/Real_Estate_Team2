import { Link } from "react-router-dom";
import type { Column } from "../../components/shared/DataTable";
import StatusBadge from "../../components/shared/StatusBadge";
import { PROPERTY_STATUS_TONE } from "../../components/properties/propertyColumns";
import { listingDetailsPath } from "../../constants/paths";
import { formatActivityTime } from "../../utils/dateTime";
import { toPropertyStatus } from "../../utils/labels";
import type { ListingRowVm } from "./types";

export const adminListingColumns: Column<ListingRowVm>[] = [
  {
    key: "title",
    header: "Property",
    render: (r) => (
      <>
        {/* real link (keyboard + new tab); stopPropagation so the row click doesn't fire twice */}
        <Link
          to={listingDetailsPath(r.id)}
          onClick={(e) => e.stopPropagation()}
          className="block font-medium hover:underline"
        >
          {r.title}
        </Link>
        <p className="text-xs text-[#5A4F49]">{r.code}</p>
      </>
    ),
  },
  { key: "owner", header: "Owner/Agent", render: (r) => r.ownerName },
  { key: "type", header: "Type", render: (r) => `${r.type}-${r.purpose}` },
  { key: "location", header: "Location", render: (r) => r.location },
  { key: "price", header: "Price", render: (r) => r.priceLabel },
  {
    key: "status",
    header: "Status",
    render: (r) => {
      const status = toPropertyStatus(r.statusLabel);
      return (
        <StatusBadge label={r.statusLabel} tone={status ? PROPERTY_STATUS_TONE[status] : "neutral"} />
      );
    },
  },
  { key: "submitted", header: "Submitted", render: (r) => formatActivityTime(r.submittedAt) },
];
