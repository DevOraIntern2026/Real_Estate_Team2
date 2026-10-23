import type { AppNotification, NotificationKind } from "../../../../types/notification";
import { formatActivityTime } from "../../utils/dateTime";

const ICONS: Record<NotificationKind, string> = {
  info: "fa-solid fa-circle-info",
  success: "fa-solid fa-circle-check",
  danger: "fa-solid fa-circle-xmark",
};

/** "Recent Notifications" block: shared by the admin and the owner overview. */
export default function NotificationPreviewList({ items }: { items: AppNotification[] }) {
  return (
    <ul>
      {items.map((n) => (
        <li
          key={n.id}
          className="flex items-start gap-4 border-b-[0.8px] border-[#87400E]/40 py-3 last:border-b-0"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[0.8px] border-[#87400E] text-[#87400E]">
            <i className={ICONS[n.kind ?? "info"]} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium text-[#241A12]">
              {!n.read && <span className="sr-only">Unread: </span>}
              {n.title}
            </p>
            {n.message && <p className="text-sm text-[#5A4F49]">{n.message}</p>}
            <p className="mt-1 text-xs text-[#5A4F49]">{formatActivityTime(n.createdAt)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
