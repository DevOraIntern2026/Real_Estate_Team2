import { ADMIN_PATHS, OWNER_PATHS } from "../../constants/paths";
import type { SidebarLink } from "./AppSidebar";

export const adminLinks: SidebarLink[] = [
  { label: "Overview", to: ADMIN_PATHS.home, icon: "fa-regular fa-house", end: true },
  { label: "Listing", to: ADMIN_PATHS.listing, icon: "fa-solid fa-list-check" },
  { label: "Users", to: ADMIN_PATHS.users, icon: "fa-solid fa-user-group" },
  { label: "Notification", to: ADMIN_PATHS.notification, icon: "fa-regular fa-bell" },
  { label: "Reports", to: ADMIN_PATHS.reports, icon: "fa-regular fa-newspaper" },
];

export const ownerLinks: SidebarLink[] = [
  { label: "Home", to: OWNER_PATHS.home, icon: "fa-solid fa-house", end: true },
  { label: "Add Property", to: OWNER_PATHS.addProperty, icon: "fa-regular fa-square-plus", disabled: true },
  { label: "My Properties", to: OWNER_PATHS.properties, icon: "fa-regular fa-building", disabled: true },
  { label: "Inquiries", to: OWNER_PATHS.inquiries, icon: "fa-regular fa-comments" },
  { label: "Notifications", to: OWNER_PATHS.notifications, icon: "fa-regular fa-bell" },
  { label: "Reports", to: OWNER_PATHS.reports, icon: "fa-regular fa-newspaper" },
];
