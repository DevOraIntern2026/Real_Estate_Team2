import { useMemo, useState } from "react";

type ReportItem = { label: string; value: number };

type Section = {
  title: string;
  items: ReportItem[];
  // value that represents 100% of the bar; defaults to the largest item
  max?: number;
};

const sections: Section[] = [
  {
    title: "Transaction Distribution",
    items: [
      { label: "Sale", value: 100 },
      { label: "Rent", value: 300 },
    ],
  },
  {
    title: "Listings Overview",
    max: 10,
    items: [
      { label: "Total", value: 10 },
      { label: "Published", value: 5 },
      { label: "Pending", value: 8 },
      { label: "Rejected", value: 3 },
      { label: "Inactive", value: 9 },
    ],
  },
  {
    title: "User Distribution",
    items: [
      { label: "Customers", value: 10 },
      { label: "Owners", value: 10 },
      { label: "Agents", value: 10 },
    ],
  },
];

function Bar({ label, value, max }: ReportItem & { max: number }) {
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
      <span className="w-10 shrink-0 text-end text-sm text-[#241A12]">
        {value}
      </span>
    </div>
  );
}

export default function Reports() {
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sections;

    return sections
      .map((s) => ({
        ...s,
        items: s.items.filter(
          (i) =>
            i.label.toLowerCase().includes(q) ||
            s.title.toLowerCase().includes(q)
        ),
      }))
      .filter((s) => s.items.length > 0);
  }, [search]);

  return (
    <section className="p-8 text-[#241A12]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-[0.8px] border-[#87400E] pb-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#87400E] text-[#FAFAFA]">
            <i className="fa-solid fa-bars" />
          </span>
          <div>
            <p className="font-medium">Reports</p>
            <p className="text-sm text-[#5A4F49]">
              Platform-wide report across listings, users, and inquiries.
            </p>
          </div>
          <div className="flex min-w-[260px] items-center gap-2 rounded-sm border-[0.8px] border-[#87400E] px-3 py-2">
            <i className="fa-solid fa-magnifying-glass text-sm text-[#5A4F49]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search By Property, Owner, Location, Or ..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#5A4F49]"
            />
          </div>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3E9E0] text-xs font-medium text-[#87400E]">
          OO
        </span>
      </div>

      {/* Sections */}
      {visible.length === 0 ? (
        <p className="py-10 text-center text-[#5A4F49]">
          No report data matches your search.
        </p>
      ) : (
        visible.map((section) => {
          const max =
            section.max ?? Math.max(...section.items.map((i) => i.value));

          return (
            <div
              key={section.title}
              className="border-b-[0.8px] border-[#87400E]/40 py-6 last:border-b-0"
            >
              <h2 className="mb-4 text-sm font-medium">{section.title}</h2>
              <div className="flex flex-col gap-3">
                {section.items.map((item) => (
                  <Bar key={item.label} {...item} max={max} />
                ))}
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}
