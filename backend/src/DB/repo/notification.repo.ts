import { INotification } from "../../common/interfaces";
import { notificationModel } from "../models";
import { DataBaseRepo } from "./base.repo";

export class NotificationRepo extends DataBaseRepo<INotification> {
  constructor() {
    super(notificationModel);
  }
}
