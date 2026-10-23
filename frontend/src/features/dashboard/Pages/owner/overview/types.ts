// ---- what the UI uses ----
export interface OwnerStatsVm {
  totalProperties: number;
  published: number;
  underReview: number;
  newInquiries30d: number;
  unreadNotifications: number;
  // agents only (no design for them yet)
  clients?: number;
  closedDeals?: number;
}

export interface RecentPropertyVm {
  id: string;
  code: string;
  title: string;
  purpose: string; // "Rent"
  type: string; // "Villa"
  location: string; // "Riverside, Cairo"
  priceLabel: string; // "75,000/Mo EGP"
  statusLabel: string; // "Under Review"
  updatedAt: string; // ISO
}

export interface RecentInquiryVm {
  id: string;
  propertyTitle: string;
  propertyCode: string;
  typeLabel: string; // "Office-Sale"
  customerName: string;
  phone: string;
  message: string;
  statusLabel: string; // "New" | "Responded"
  createdAt: string; // ISO
}
