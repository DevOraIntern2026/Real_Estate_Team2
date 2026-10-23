import type { ReportItem } from "./reportTypes";

export default function ReportBar({ label, value, max }: ReportItem & { max: number }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className="flex items-center gap-4">
      <span className="w-24 shrink-0 text-sm text-[#241A12]">{label}</span>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className="h-2 flex-1 overflow-hidden rounded-full border-[0.8px] border-[#87400E] bg-white"
      >
        <div
          className="h-full rounded-full bg-[#87400E] transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="w-10 shrink-0 text-end text-sm text-[#241A12]">{value}</span>
    </div>
  );
}
