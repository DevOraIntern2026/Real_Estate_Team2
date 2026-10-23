import { Link } from "react-router-dom";
import type { Column } from "../../../components/shared/DataTable";
import StatusBadge from "../../../components/shared/StatusBadge";
import { PROPERTY_STATUS_TONE } from "../../../components/properties/propertyColumns";
import { ownerInquiryPath } from "../../../constants/paths";
import type { InquiryStatus } from "../../../../../types/inquiry";
import { formatActivityTime } from "../../../utils/dateTime";
import { toPropertyStatus } from "../../../utils/labels";
import { INQUIRY_STATUS_TONE } from "../constants";
import type { RecentInquiryVm, RecentPropertyVm } from "./types";

const dash = (v: string) => v || "—";

/** "Recent Properties" */
export const recentPropertyColumns: Column<RecentPropertyVm>[] = [
  {
    key: "title",
    header: "Property",
    render: (p) => (
      <>
        <p className="font-medium">{p.title}</p>
        <p className="text-xs text-[#5A4F49]">{p.code}</p>
      </>
    ),
  },
  { key: "purpose", header: "Sale/Rent", render: (p) => dash(p.purpose) },
  { key: "type", header: "Type", render: (p) => dash(p.type) },
  { key: "location", header: "Location", render: (p) => dash(p.location) },
  { key: "price", header: "Price", render: (p) => p.priceLabel },
  {
    key: "status",
    header: "Status",
    render: (p) => {
      const status = toPropertyStatus(p.statusLabel);
      return <StatusBadge label={p.statusLabel} tone={status ? PROPERTY_STATUS_TONE[status] : "neutral"} />;
    },
  },
  { key: "update", header: "Update", render: (p) => (p.updatedAt ? formatActivityTime(p.updatedAt) : "—") },
];

/** "Recent Inquiries" */
export const recentInquiryColumns: Column<RecentInquiryVm>[] = [
  {
    key: "property",
    header: "Property",
    render: (i) => (
      <>
        <p className="font-medium">{i.propertyTitle}</p>
        <p className="text-xs text-[#5A4F49]">{i.propertyCode}</p>
      </>
    ),
  },
  { key: "type", header: "Types", render: (i) => dash(i.typeLabel) },
  {
    key: "customer",
    header: "Customer Name",
    render: (i) => (
      // real link (keyboard + new tab); stopPropagation so the row click doesn't fire twice
      <Link to={ownerInquiryPath(i.id)} onClick={(e) => e.stopPropagation()} className="hover:underline">
        {i.customerName}
      </Link>
    ),
  },
  { key: "phone", header: "Phone Number", render: (i) => dash(i.phone) },
  {
    key: "message",
    header: "Message",
    render: (i) => (
      <span className="block max-w-[14rem] truncate" title={i.message}>
        {i.message}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (i) => (
      <StatusBadge label={i.statusLabel} tone={INQUIRY_STATUS_TONE[i.statusLabel as InquiryStatus] ?? "neutral"} />
    ),
  },
  { key: "date", header: "Date", render: (i) => (i.createdAt ? formatActivityTime(i.createdAt) : "—") },
];
