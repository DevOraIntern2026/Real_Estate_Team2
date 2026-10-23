import { Link } from "react-router-dom";

type SectionHeaderProps = {
  title: string;
  to?: string; // shows the "See All" link when provided
  actionLabel?: string;
};

export default function SectionHeader({
  title,
  to,
  actionLabel = "See All",
}: SectionHeaderProps) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-sm font-medium text-[#241A12]">{title}</h2>
      {to && (
        <Link to={to} className="text-xs text-[#87400E] underline">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
