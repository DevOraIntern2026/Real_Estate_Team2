import ReportBar from "./ReportBar";
import type { ReportSection } from "./reportTypes";

type ReportSectionsProps = { sections: ReportSection[]; emptyMessage: string };

export default function ReportSections({ sections, emptyMessage }: ReportSectionsProps) {
  if (sections.length === 0) {
    return <p className="py-10 text-center text-sm text-[#5A4F49]">{emptyMessage}</p>;
  }

  return (
    <div>
      {sections.map((section) => {
        const max = section.max ?? Math.max(0, ...section.items.map((i) => i.value));
        return (
          <div
            key={section.title}
            className="border-b-[0.8px] border-[#87400E]/40 py-6 last:border-b-0"
          >
            <h2 className="mb-4 text-sm font-medium text-[#241A12]">{section.title}</h2>
            <div className="flex flex-col gap-3">
              {section.items.map((item) => (
                <ReportBar key={item.label} {...item} max={max} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
