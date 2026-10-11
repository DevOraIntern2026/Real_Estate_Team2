import type { AppNotification } from "../../../../../types/notification";
import NotificationItem from "./NotificationItem";

type NotificationGroupProps = {
  label: string;
  items: AppNotification[];
  onMarkAsRead: (id: string) => void;
};

export default function NotificationGroup({
  label,
  items,
  onMarkAsRead,
}: NotificationGroupProps) {
  return (
    <section className="mb-8 border-b-[0.8px] border-[#87400E]/60 pb-4 last:mb-0 last:border-b-0">
      <h3 className="mb-3 text-sm font-medium text-[#241A12]">{label}</h3>
      <ul className="space-y-2">
        {items.map((n) => (
          <NotificationItem
            key={n.id}
            notification={n}
            onMarkAsRead={onMarkAsRead}
          />
        ))}
      </ul>
    </section>
  );
}
