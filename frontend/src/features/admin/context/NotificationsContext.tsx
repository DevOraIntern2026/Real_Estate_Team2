import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { notificationsMock } from "../data/notifications.mock";
import type { AppNotification } from "../../../types/notification";

type NotificationsContextValue = {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null
);

/**
 * Wrap this ABOVE your Layout so the Sidebar badge, the Overview widget
 * and the Notifications page all read the same list.
 */
export function NotificationsProvider({
  children,
  initialNotifications = notificationsMock,
}: {
  children: ReactNode;
  initialNotifications?: AppNotification[];
}) {
  const [notifications, setNotifications] =
    useState<AppNotification[]>(initialNotifications);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const value = useMemo(
    () => ({ notifications, unreadCount, markAsRead, markAllAsRead, clearAll }),
    [notifications, unreadCount, markAsRead, markAllAsRead, clearAll]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error("useNotifications must be used inside <NotificationsProvider>");
  return ctx;
}
