/** "2026-09-24" -> "Sep 24, 2026" (UTC so the day never shifts by timezone). "—" if missing/invalid. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (!iso || Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
