type DetailItem = {
  label: string;
  value: React.ReactNode;
};

type DetailListProps = {
  items: DetailItem[];
};

export default function DetailList({ items }: DetailListProps) {
  return (
    <dl className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-start justify-between gap-3">
          <dt className="text-xs text-[#5A4F49]">{item.label}</dt>
          <dd className="text-right text-sm font-medium text-[#241A12]">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
