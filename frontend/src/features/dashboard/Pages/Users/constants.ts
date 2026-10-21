import type { Option } from "../../components/common/FilterDropdown";
import type { BadgeTone } from "../../components/common/StatusBadge";
import type { RoleFilter, StatusFilter, UserStatus } from "./types";

export const USERS_PAGE_SIZE = 10;

export const ROLE_OPTIONS: Option<RoleFilter>[] = [
  { label: "All Roles", value: "all" },
  { label: "Admin", value: "Admin" },
  { label: "Customer", value: "Customer" },
  { label: "Owner", value: "Owner" },
  { label: "Agent", value: "Agent" },
];

export const STATUS_OPTIONS: Option<StatusFilter>[] = [
  { label: "All Statuses", value: "all" },
  { label: "Active", value: "Active" },
  { label: "Suspended", value: "Suspended" },
];

export const STATUS_TONE: Record<UserStatus, BadgeTone> = {
  Active: "success",
  Suspended: "danger",
};

/** What the profile button + confirm dialog do for each current status. */
export interface StatusAction {
  buttonLabel: string;
  buttonVariant: "solid" | "outline";
  nextStatus: UserStatus;
  dialogTitle: string;
  dialogMessage: string;
  confirmLabel: string;
}

export const STATUS_ACTIONS: Record<UserStatus, StatusAction> = {
  Active: {
    buttonLabel: "Suspend User",
    buttonVariant: "outline",
    nextStatus: "Suspended",
    dialogTitle: "Suspend this user?",
    dialogMessage: "The user will lose access to DevOra until reactivated.",
    confirmLabel: "Suspend",
  },
  Suspended: {
    buttonLabel: "Activate User",
    buttonVariant: "solid",
    nextStatus: "Active",
    dialogTitle: "Activate this user?",
    dialogMessage: "The user will regain full access to DevOra.",
    confirmLabel: "Activate",
  },
};

export const TEXT = {
  title: "Users",
  subtitle: "Search and manage DevOra platform users.",
  searchPlaceholder: "Search By Name Or Email",
  emptyList: "The users list is empty, there are no users to show yet.",
  noMatch: "No Things Matched To Your Search",
  noMatchHint: "Try A New Keyword",
  noUserListings: "This user has no listings yet.",
  notFound: "User not found.",
};
