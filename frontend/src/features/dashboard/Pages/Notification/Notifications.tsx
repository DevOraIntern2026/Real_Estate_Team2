import { useMemo, useState } from "react";
import ConfirmDialog from "../../components/shared/ConfirmDialog";
import EmptyState from "../../components/shared/EmptyState";
import PageHeader from "../../components/shared/PageHeader";
import SearchInput from "../../components/shared/SearchInput";
import { useNotifications } from "../../context/NotificationsContext";

// adjust this path to your assets folder
import emptyImg from "../../../../../public/dashboardImgs/notifications-empty.png";

import NotificationGroup from "./components/NotificationGroup";
import NotificationsToolbar from "./components/NotificationsToolbar";
import { TEXT } from "./constants";
import { groupNotifications } from "./groupNotifications";

/** Used by BOTH dashboards. Admin: canClear (default). Owner: <Notifications canClear={false} /> */
export default function Notifications({ canClear = true }: { canClear?: boolean }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } =
    useNotifications();

  const [search, setSearch] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return notifications;
    return notifications.filter(
      (n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
    );
  }, [notifications, search]);

  const groups = useMemo(() => groupNotifications(filtered), [filtered]);

  const listIsEmpty = notifications.length === 0;
  const noMatch = !listIsEmpty && filtered.length === 0;

  const handleClearAll = () => {
    clearAll();
    setConfirmOpen(false);
  };

  return (
    <section className="p-8 text-[#241A12]">
      <PageHeader title={TEXT.title} subtitle={`${unreadCount} unread`}>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={TEXT.searchPlaceholder}
          className="w-full min-w-[240px] md:w-72"
        />
      </PageHeader>

      <NotificationsToolbar
        showActions={!listIsEmpty}
        showClear={canClear}
        hasUnread={unreadCount > 0}
        onClearAll={() => setConfirmOpen(true)}
        onMarkAllAsRead={markAllAsRead}
      />

      {listIsEmpty ? (
        <EmptyState image={emptyImg} title={TEXT.empty} />
      ) : noMatch ? (
        <EmptyState image={emptyImg} title={TEXT.noMatch} description={TEXT.noMatchHint} />
      ) : (
        groups.map((g) => (
          <NotificationGroup key={g.key} label={g.label} items={g.items} onMarkAsRead={markAsRead} />
        ))
      )}

      {canClear && (
        <ConfirmDialog
          open={confirmOpen}
          title={TEXT.clearDialogTitle}
          message={TEXT.clearDialogMessage}
          confirmLabel={TEXT.clearAll}
          onConfirm={handleClearAll}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </section>
  );
}
