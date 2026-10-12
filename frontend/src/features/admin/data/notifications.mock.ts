import type { AppNotification } from "../../../types/notification";

const minutesAgo = (m: number) =>
  new Date(Date.now() - m * 60_000).toISOString();

// Replace with an API call later. Pass [] to see the empty screen.
export const notificationsMock: AppNotification[] = [
  {
    id: "n1",
    title: "2 new listings are awaiting review.",
    message:
      '"Cozy Studio Near Riverside Walk" and "Office Suite in Old Town Business Park" are awaiting review.',
    createdAt: minutesAgo(20),
    read: false,
  },
  {
    id: "n2",
    title: "New user registration.",
    message: "Priya Anand joined DevOra as a Customer.",
    createdAt: minutesAgo(3 * 60),
    read: true,
  },
  {
    id: "n3",
    title: "Listing #DEV-1061 was submitted.",
    message: "Submitted by Ahmen Omran Brenner for review.",
    createdAt: "2026-09-17T10:00:00",
    read: false,
  },
  {
    id: "n4",
    title: "Listing #DEV-1044 was rejected.",
    message: "Rejected — reason: Low-quality images.",
    createdAt: "2026-09-17T09:00:00",
    read: true,
  },
  {
    id: "n5",
    title: "Listing #DEV-1032 was approved.",
    message: "Approved by James Cole and published on DevOra.",
    createdAt: "2026-09-16T12:00:00",
    read: false,
  },
];
