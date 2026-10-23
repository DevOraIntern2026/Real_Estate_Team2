import type { AppNotification } from "../../../types/notification";

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

export const ownerNotificationsMock: AppNotification[] = [
  { id: "on1", kind: "success", title: "Your property has been approved.", message: '"Spacious Family Villa with Garden" is now live on DevOra.', createdAt: minutesAgo(20), read: false },
  { id: "on2", kind: "info", title: "You received a new inquiry.", message: 'Maya Harlow asked about "Spacious Family Villa with Garden".', createdAt: minutesAgo(3 * 60), read: true },
  { id: "on3", kind: "info", title: "Your property is under review.", message: '"Cozy Studio Near Riverside Walk" was submitted and is awaiting review.', createdAt: "2026-09-17T10:00:00", read: false },
  { id: "on4", kind: "danger", title: "Your property was rejected.", message: 'Downtown Loft with City Views" — images is Low Quality', createdAt: "2026-09-17T09:00:00", read: true },
  { id: "on5", kind: "info", title: "Your property is under review.", message: '"Sunset Vista Villa" was submitted and is awaiting review.', createdAt: "2026-09-16T12:00:00", read: false },
];
