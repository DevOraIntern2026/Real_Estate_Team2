type StatCardProps = { label: string; value: number | string };

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-sm border-[0.8px] border-[#87400E] p-3">
      <p className="text-sm text-[#5A4F49]">{label}</p>
      <p className="text-lg font-medium text-[#241A12]">{value}</p>
    </div>
  );
}
