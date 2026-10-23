import type { InquiryStatus } from "../../../../../types/inquiry";

export type InquiryStatusParam = "new" | "responded" | "closed";

export interface InquiriesParams {
  status?: InquiryStatusParam; // omitted = all
  propertyId?: string;
  page: number;
  limit: number;
}

/** Customer card + Submission Info on the reply page. */
export interface InquiryDetailVm {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAvatar?: string;
  message: string; // the customer's first message
  status: InquiryStatus | string;
  createdAt: string;
  property: {
    title: string;
    code: string;
    type: string; // "Apartment"
    purpose: string; // "Sale"
    priceLabel: string; // "4,500,000 EGP"
  };
}
