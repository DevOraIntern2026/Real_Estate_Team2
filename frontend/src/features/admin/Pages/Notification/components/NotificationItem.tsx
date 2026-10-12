import Button from "../../../components/shared/Button"
import type { AppNotification } from "../../../../../types/notification";
import { formatActivityTime } from "../../../utils/dateTime";
import { TEXT } from "../constants";

type NotificationItemProps = {
  notification: AppNotification;
  onMarkAsRead: (id: string) => void;
};

export default function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  const { id, title, message, createdAt, read } = notification;

  return (
    <li
      className={`flex items-center justify-between gap-4 px-3 py-3 ${
        read ? "" : "bg-[#EDE6E1]"
      }`}
    >
      <div>
        <p className="text-sm font-medium text-[#241A12]">
          {!read && <span className="sr-only">Unread: </span>}
          {title}
        </p>
        <p className="text-sm text-[#5A4F49]">{message}</p>
        <p className="mt-1 text-xs text-[#5A4F49]">
          {formatActivityTime(createdAt)}
        </p>
      </div>

      {!read && (
        <Button
          variant="text"
          onClick={() => onMarkAsRead(id)}
          className="shrink-0"
        >
          {TEXT.markAsRead}
        </Button>
      )}
    </li>
  );
}
