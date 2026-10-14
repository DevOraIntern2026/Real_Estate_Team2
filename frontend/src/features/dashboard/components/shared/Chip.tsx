type ChipProps = { label: string; icon?: string };

export default function Chip({ label, icon }: ChipProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-sm border-[0.8px] border-[#87400E]/40 bg-[#F3E9E0] px-3 py-1.5 text-xs text-[#5A4F49]">
      {icon && <i className={icon} aria-hidden="true" />}
      {label}
    </span>
  );
}
