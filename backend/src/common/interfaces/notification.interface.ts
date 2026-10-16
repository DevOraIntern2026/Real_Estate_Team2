import { Types } from "mongoose";

export type NotificationType =
  | "listing_submitted"
  | "listing_rejected"
  | "listing_approved"
  | "user_registered"
  | "system"
  | "property_under_review"
  | "property_approved"
  | "property_rejected"
  | "new_inquiry"
  | "property_updated";

export interface INotification {
  recipient?: Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  target?: {
    kind: "listing" | "property" | "inquiry" | "user" | "report";
    id: string;
  };
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

