import { Link } from "react-router-dom";
import type { Column } from "../../../components/shared/DataTable";
import StatusBadge from "../../../components/shared/StatusBadge";
import { formatActivityTime } from "../../../utils/dateTime";
import { ownerPropertyEditPath, ownerPropertyPath } from "./paths";
import type { OwnerPropertyRowVm } from "./types";

const dash = (v: string) => v || "—";

export const ownerPropertiesColumns: Column<OwnerPropertyRowVm>[] = [
  {
    key: "title",
    header: "Property",
    render: (p) => (
      <>
        {/* real link (keyboard + new tab); stopPropagation so the row click doesn't fire twice */}
        <Link
          to={ownerPropertyPath(p.id)}
          onClick={(e) => e.stopPropagation()}
          className="block font-medium hover:underline"
        >
          {p.title}
        </Link>
        <p className="text-xs text-[#5A4F49]">{p.code}</p>
      </>
    ),
  },
  { key: "type", header: "type", render: (p) => dash([p.type, p.purpose].filter(Boolean).join("-")) },
  { key: "location", header: "Location", render: (p) => dash(p.location) },
  { key: "price", header: "Price", render: (p) => p.priceLabel },
  {
    key: "status",
    header: "Status",
    render: (p) => <StatusBadge label={p.status.label} tone={p.status.tone} />,
  },
  {
    key: "submitted",
    header: "Submitted",
    render: (p) =>
      p.isDraft ? (
        <Link
          to={ownerPropertyEditPath(p.id)}
          onClick={(e) => e.stopPropagation()}
          className="border-b-[0.8px] border-[#87400E] pb-0.5 text-[#87400E]"
        >
          Continue Edit
        </Link>
      ) : p.date ? (
        formatActivityTime(p.date)
      ) : (
        "—"
      ),
  },
];
