import { IMessage } from "../../common/interfaces";
import { messageModel } from "../models";
import { DataBaseRepo } from "./base.repo";

export class MessageRepo extends DataBaseRepo<IMessage> {
  constructor() {
    super(messageModel);
  }
}
