import type { AppNotification } from "../../../../types/notification";
import { formatLocalDate, isToday } from "../../utils/dateTime";

export type NotificationGroupData = {
  key: string;
  label: string;
  items: AppNotification[];
};

/** Newest first, grouped by calendar day ("Today", "Sep 17, 2026", ...). */
export function groupNotifications(
  items: AppNotification[],
  now: Date = new Date()
): NotificationGroupData[] {
  const sorted = [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const groups = new Map<string, NotificationGroupData>();

  for (const n of sorted) {
    const date = new Date(n.createdAt);
    const key = date.toDateString();
    const group = groups.get(key) ?? {
      key,
      label: isToday(date, now) ? "Today" : formatLocalDate(date),
      items: [],
    };
    group.items.push(n);
    groups.set(key, group);
  }

  // Map keeps insertion order, and we inserted newest-first
  return [...groups.values()];
}
