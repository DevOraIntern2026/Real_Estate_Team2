// Named AppNotification so it never clashes with the browser's global `Notification` type.
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string; // ISO date-time
  read: boolean;
}
