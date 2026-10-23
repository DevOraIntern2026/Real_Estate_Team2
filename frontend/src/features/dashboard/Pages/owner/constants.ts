import type { BadgeTone } from "../../components/shared/StatusBadge";
import type { TabItem } from "../../components/shared/Tabs";
import type { InquiryStatus } from "../../../../types/inquiry";
import type { NotificationKind } from "../../../../types/notification";

export const NEW_INQUIRY_DAYS = 30;
export const INQUIRIES_PAGE_SIZE = 10;

export const INQUIRY_STATUS_TONE: Record<InquiryStatus, BadgeTone> = {
  New: "brand",
  Responded: "success",
  Closed: "neutral",
};

export const NOTIFICATION_ICONS: Record<NotificationKind, string> = {
  info: "fa-solid fa-circle-info",
  success: "fa-solid fa-circle-check",
  danger: "fa-solid fa-circle-xmark",
};

export type InquiryTab = "all" | InquiryStatus;

export const INQUIRY_TABS: TabItem<InquiryTab>[] = [
  { label: "All", value: "all" },
  { label: "New", value: "New" },
  { label: "Responded", value: "Responded" },
];

export const TEXT = {
  overviewSubtitle: "Track your listings, inquiries, and notifications.",
  noProperties: "You have no properties yet.",
  noInquiries: "You have no inquiries yet.",
  noNotifications: "You have no notifications yet.",

  inquiriesTitle: "Inquiries",
  inquiriesSubtitle: "Respond to those who inquire about your work On Devora",
  searchProperties: "Search Your Properties",
  inquiriesEmpty: "There are no inquiries about your properties.",
  inquiriesEmptyHint: "Keep moving forward with your real estate work",
  noMatch: "No Things Matched To Your Search",
  noMatchHint: "Try A New Keyword",

  replyTitle: "Reply to the inquiry",
  replyPlaceholder: "Write your reply...",
  replyLabel: "Your reply",
  inquiryNotFound: "Inquiry not found.",
  backToInquiries: "Back to inquiries",

  reportsTitle: "Reports",
  reportsSubtitle: "Platform-level metrics across listings, users, and inquiries.",
  reportsNoMatch: "No report data matches your search.",
};
