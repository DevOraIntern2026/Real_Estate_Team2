import { Types } from "mongoose";

export interface IAgentClient {
  _id?: Types.ObjectId;
  agent: Types.ObjectId;
  client: Types.ObjectId;
  notes?: string;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}
