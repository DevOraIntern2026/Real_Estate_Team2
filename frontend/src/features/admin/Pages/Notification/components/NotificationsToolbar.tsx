import Button from "../../../components/shared/Button";
import { TEXT } from "../constants";

type NotificationsToolbarProps = {
  showActions: boolean;
  hasUnread: boolean;
  onClearAll: () => void;
  onMarkAllAsRead: () => void;
};

export default function NotificationsToolbar({
  showActions,
  hasUnread,
  onClearAll,
  onMarkAllAsRead,
}: NotificationsToolbarProps) {
  return (
    <div className="my-6 flex flex-wrap items-center justify-between gap-4">
      <h2 className="text-sm font-medium text-[#241A12]">{TEXT.title}</h2>

      {showActions && (
        <div className="flex gap-4">
          <Button variant="outline" onClick={onClearAll} className="w-44">
            {TEXT.clearAll}
          </Button>
          <Button
            variant="outline"
            onClick={onMarkAllAsRead}
            disabled={!hasUnread}
            className="w-44"
          >
            {TEXT.markAllAsRead}
          </Button>
        </div>
      )}
    </div>
  );
}
