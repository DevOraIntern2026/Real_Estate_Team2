import { Types } from "mongoose";

export interface IListingStatusHistory {
  listing: Types.ObjectId;
  fromStatus: string;
  toStatus: string;
  admin: Types.ObjectId;
  reason?: string;
  feedback?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
