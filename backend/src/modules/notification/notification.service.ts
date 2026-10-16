import { Types } from "mongoose";
import { NotificationRepo } from "../../DB/repo/notification.repo";
import { ForbiddenException, NotFoundException } from "../../common/exceptions";

export class NotificationService {
  private readonly notificationRepo: NotificationRepo;

  constructor() {
    this.notificationRepo = new NotificationRepo();
  }

  async list(userId: string, query: { page?: string; limit?: string; isRead?: boolean }) {
    const filter: Record<string, any> = {
      recipient: new Types.ObjectId(userId),
    };

    if (query.isRead !== undefined) {
      filter.isRead = query.isRead;
    }

    return this.notificationRepo.paginate({
      filter,
      page: query.page || "1",
      limit: query.limit || "10",
      options: {
        sort: { createdAt: -1 },
      },
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationRepo.countDocuments({
      recipient: new Types.ObjectId(userId),
      isRead: false,
    });
    return { count };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationRepo.findOne({
      filter: { _id: new Types.ObjectId(notificationId) },
    });
    if (!notification) throw new NotFoundException("Notification not found");

    if (notification.recipient && notification.recipient.toString() !== userId) {
      throw new ForbiddenException("You cannot modify another user's notification");
    }

    const updated = await this.notificationRepo.findOneAndUpdate({
      filter: { _id: notification._id },
      update: { isRead: true },
    });
    return updated;
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepo.updateMany({
      filter: { recipient: new Types.ObjectId(userId), isRead: false },
      update: { isRead: true },
    });
    return { success: true };
  }

  async remove(notificationId: string, userId: string) {
    const notification = await this.notificationRepo.findOne({
      filter: { _id: new Types.ObjectId(notificationId) },
    });
    if (!notification) throw new NotFoundException("Notification not found");

    if (notification.recipient && notification.recipient.toString() !== userId) {
      throw new ForbiddenException("You cannot delete another user's notification");
    }

    await this.notificationRepo.updateOne({
      filter: { _id: notification._id },
      update: { deletedAt: new Date() },
    });
  }
}

export default new NotificationService();
