export type BadgeTone =
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "neutral"
  | "brand";

const tones: Record<BadgeTone, { box: string; dot: string }> = {
  success: { box: "bg-green-50 text-green-600", dot: "bg-green-500" },
  danger: { box: "bg-red-50 text-red-500", dot: "bg-red-500" },
  warning: { box: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  info: { box: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  neutral: { box: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
  brand: { box: "bg-[#F3E9E0] text-[#87400E]", dot: "bg-[#87400E]" },
};

type StatusBadgeProps = { label: string; tone?: BadgeTone };

export default function StatusBadge({
  label,
  tone = "neutral",
}: StatusBadgeProps) {
  const t = tones[tone];
  return (
    <span
      className={`inline-flex min-w-28 items-center justify-center gap-2 rounded-sm px-3 py-1 text-xs ${t.box}`}
    >
      <span className={`h-2 w-2 rounded-full ${t.dot}`} />
      {label}
    </span>
  );
}
