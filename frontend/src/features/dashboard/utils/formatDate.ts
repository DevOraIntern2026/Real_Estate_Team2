/** "2026-09-24" -> "Sep 24, 2026" (UTC so the day never shifts by timezone). */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
