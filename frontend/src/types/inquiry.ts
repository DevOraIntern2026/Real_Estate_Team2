import type { PropertyDetails } from "./property";

export type InquiryStatus = "New" | "Responded";

export interface Inquiry {
  id: string;
  propertyId: string;
  customerName: string;
  customerEmail: string;
  customerAvatar?: string;
  phone: string;
  message: string; // the customer's first message
  status: InquiryStatus;
  createdAt: string; // ISO date-time
}

/** Messages after the first one (the owner's replies, or customer follow-ups). */
export interface InquiryReply {
  id: string;
  inquiryId: string;
  sender: "customer" | "owner";
  text: string;
  createdAt: string; // ISO date-time
}

/** An inquiry joined with the property it is about. */
export type InquiryRow = Inquiry & { property: PropertyDetails };
