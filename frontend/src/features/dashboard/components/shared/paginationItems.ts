export type PageItem = number | "…";

/** 1 … 4 5 6 … 20  (never more than 7 slots) */
export function getPageItems(page: number, total: number): PageItem[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  let start = Math.max(2, page - 1);
  let end = Math.min(total - 1, page + 1);
  if (page <= 3) end = Math.min(total - 1, 4);
  if (page >= total - 2) start = Math.max(2, total - 3);

  const items: PageItem[] = [1];
  if (start > 2) items.push("…");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 1) items.push("…");
  items.push(total);
  return items;
}
