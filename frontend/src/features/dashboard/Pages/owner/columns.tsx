import { Link } from "react-router-dom";
import type { Column } from "../../components/shared/DataTable";
import StatusBadge from "../../components/shared/StatusBadge";
import {
  PROPERTY_STATUS_TONE,
  formatPrice,
} from "../../components/properties/propertyColumns";
import { ownerInquiryPath } from "../../constants/paths";
import type { InquiryRow } from "../../../../types/inquiry";
import type { PropertyDetails } from "../../../../types/property";
import { formatActivityTime } from "../../utils/dateTime";
import { INQUIRY_STATUS_TONE } from "./constants";

/** "Recent Properties" table */
export const ownerPropertyColumns: Column<PropertyDetails>[] = [
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
  { key: "purpose", header: "Sale/Rent", render: (p) => p.purpose },
  { key: "type", header: "Type", render: (p) => p.type },
  { key: "location", header: "Location", render: (p) => `${p.location}, ${p.city}` },
  { key: "price", header: "Price", render: (p) => formatPrice(p) },
  {
    key: "status",
    header: "Status",
    render: (p) => <StatusBadge label={p.status} tone={PROPERTY_STATUS_TONE[p.status]} />,
  },
  { key: "update", header: "Update", render: (p) => formatActivityTime(p.updatedAt) },
];

/** "Recent Inquiries" table + the Inquiries page table */
export const inquiryColumns: Column<InquiryRow>[] = [
  {
    key: "property",
    header: "Property",
    render: (i) => (
      <>
        <p className="font-medium">{i.property.title}</p>
        <p className="text-xs text-[#5A4F49]">{i.property.code}</p>
      </>
    ),
  },
  { key: "type", header: "Types", render: (i) => `${i.property.type}-${i.property.purpose}` },
  {
    key: "customer",
    header: "Customer Name",
    render: (i) => (
      // real link (keyboard + new tab); stopPropagation so the row click doesn't fire twice
      <Link
        to={ownerInquiryPath(i.id)}
        onClick={(e) => e.stopPropagation()}
        className="hover:underline"
      >
        {i.customerName}
      </Link>
    ),
  },
  { key: "phone", header: "Phone Number", render: (i) => i.phone },
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
    render: (i) => <StatusBadge label={i.status} tone={INQUIRY_STATUS_TONE[i.status]} />,
  },
  { key: "date", header: "Date", render: (i) => formatActivityTime(i.createdAt) },
];
