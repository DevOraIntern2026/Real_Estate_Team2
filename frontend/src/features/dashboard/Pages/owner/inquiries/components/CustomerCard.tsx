import Avatar from "../../../../components/shared/Avatar";
import type { InquiryRow } from "../../../../../../types/inquiry";

export default function CustomerCard({ inquiry }: { inquiry: InquiryRow }) {
  const rows = [
    { label: "User Name", value: inquiry.customerName },
    { label: "Email", value: inquiry.customerEmail },
    { label: "Phone Number", value: inquiry.phone },
  ];

  return (
    <section
      aria-label="Customer"
      className="flex items-center gap-4 rounded-sm border-[0.8px] border-[#87400E] p-4"
    >
      <Avatar
        name={inquiry.customerName}
        src={inquiry.customerAvatar}
        className="h-16 w-16 text-lg"
      />
      <dl className="min-w-0 space-y-2 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="flex flex-wrap gap-1">
            <dt className="font-medium text-[#241A12]">{r.label}:</dt>
            <dd className="break-all text-[#5A4F49]">{r.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
