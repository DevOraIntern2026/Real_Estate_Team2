import { Types } from "mongoose";

export enum InquiryStatusEnum {
  NEW = "new",
  RESPONDED = "responded",
  CLOSED = "closed",
}

export interface IInquiry {
  _id?: Types.ObjectId;
  property: Types.ObjectId;
  owner: Types.ObjectId;
  agent?: Types.ObjectId;
  customer?: Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: InquiryStatusEnum | "new" | "responded" | "closed";
  subject?: string;
  message?: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMessage {
  _id?: Types.ObjectId;
  inquiry: Types.ObjectId;
  sender?: Types.ObjectId;
  senderRole: "customer" | "owner" | "agent" | "admin";
  senderType?: string;
  senderName?: string;
  text: string;
  isRead?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
