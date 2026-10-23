import type { AppNotification } from "@/types/notification";
import { formatActivityTime } from "../../../utils/dateTime";
import { NOTIFICATION_ICONS } from "../constants";

export default function RecentNotifications({ items }: { items: AppNotification[] }) {
  return (
    <ul>
      {items.map((n) => (
        <li
          key={n.id}
          className="flex items-start gap-4 border-b-[0.8px] border-[#87400E]/40 py-3 last:border-b-0"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[0.8px] border-[#87400E] text-[#87400E]">
            <i className={NOTIFICATION_ICONS[n.kind ?? "info"]} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium text-[#241A12]">{n.title}</p>
            <p className="text-sm text-[#5A4F49]">{n.message}</p>
            <p className="mt-1 text-xs text-[#5A4F49]">{formatActivityTime(n.createdAt)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
