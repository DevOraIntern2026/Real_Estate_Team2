export const isToday = (date: Date, now: Date = new Date()) =>
  date.toDateString() === now.toDateString();

/** Date in the user's local timezone -> "Sep 17, 2026" */
export const formatLocalDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

/** "20 min ago" / "3 hours ago" / "Sep 17, 2026" */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const diffMin = Math.floor((now.getTime() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const hours = Math.floor(diffMin / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  return formatLocalDate(new Date(iso));
}

/** Today's items show a relative time, older ones show their date. */
export function formatActivityTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  return isToday(date, now) ? timeAgo(iso, now) : formatLocalDate(date);
}

/** "Sep 20, 2026 · 4:32 PM" (chat bubbles) */
export function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${formatLocalDate(date)} · ${time}`;
}
