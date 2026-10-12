export type TabItem<T extends string> = {
  label: string;
  value: T;
  badge?: number; // small count bubble
};

type TabsProps<T extends string> = {
  tabs: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
};

export default function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className="mt-4 flex flex-wrap gap-x-8 gap-y-2 border-b-[0.8px] border-[#87400E]/30"
    >
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={`flex items-center gap-1 pb-2 text-sm ${
              active
                ? "border-b-2 border-[#87400E] font-medium text-[#87400E]"
                : "text-[#5A4F49]"
            }`}
          >
            {t.label}
            {t.badge !== undefined && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#87400E] px-1 text-[10px] text-[#FAFAFA]">
                {t.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
