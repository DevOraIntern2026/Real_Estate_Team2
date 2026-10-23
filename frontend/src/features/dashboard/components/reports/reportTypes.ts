export type ReportItem = { label: string; value: number };

export type ReportSection = {
  title: string;
  items: ReportItem[];
  /** value that represents 100% of the bar; defaults to the largest item */
  max?: number;
};

/** Keeps the rows (or whole sections) that match the search text. */
export function filterSections(sections: ReportSection[], search: string): ReportSection[] {
  const q = search.trim().toLowerCase();
  if (!q) return sections;
  return sections
    .map((s) => ({
      ...s,
      items: s.items.filter(
        (i) => i.label.toLowerCase().includes(q) || s.title.toLowerCase().includes(q)
      ),
    }))
    .filter((s) => s.items.length > 0);
}
