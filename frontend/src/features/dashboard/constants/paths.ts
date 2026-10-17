// ---- admin ----
export const ADMIN_PATHS = {
  home: "/admin",
  listing: "/admin/listing",
  users: "/admin/users",
  notification: "/admin/notification",
  reports: "/admin/reports",
  profile: "/admin/profile",
} as const;

export const LISTING_PATH = ADMIN_PATHS.listing;
export const listingDetailsPath = (id: string) => `${LISTING_PATH}/${id}`;
export const listingEditPath = (id: string) => `${LISTING_PATH}/${id}/edit`; // page not built yet

export const PROFILE_PATH = ADMIN_PATHS.profile;
export const LOGIN_PATH = "/login";

// ---- owner ----
export const OWNER_PATH = "/owner";
export const OWNER_PATHS = {
  home: OWNER_PATH,
  addProperty: `${OWNER_PATH}/add-property`,
  properties: `${OWNER_PATH}/properties`,
  inquiries: `${OWNER_PATH}/inquiries`,
  notifications: `${OWNER_PATH}/notifications`,
  reports: `${OWNER_PATH}/reports`,
  profile: `${OWNER_PATH}/profile`,
} as const;

export const ownerInquiryPath = (id: string) => `${OWNER_PATHS.inquiries}/${id}`;