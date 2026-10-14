export type NotificationKind = "info" | "success" | "danger";

// Named AppNotification so it never clashes with the browser's global `Notification` type.
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string; // ISO date-time
  read: boolean;
  kind?: NotificationKind; // used for the icon in "Recent Notifications"
}
