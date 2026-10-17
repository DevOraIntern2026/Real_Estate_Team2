import { Types } from "mongoose";
import { PropertyRepo } from "../../DB/repo/property.repo";
import { InquiryRepo } from "../../DB/repo/inquiry.repo";
import { NotificationRepo } from "../../DB/repo/notification.repo";
import { AgentClientRepo } from "../../DB/repo/agent-client.repo";
import {
  PropertyStatusEnum,
  PropertyTypeEnum,
  RoleEnum,
  TransactionTypeEnum,
} from "../../common/enums";

export class DashboardService {
  private readonly propertyRepo: PropertyRepo;
  private readonly inquiryRepo: InquiryRepo;
  private readonly notificationRepo: NotificationRepo;
  private readonly agentClientRepo: AgentClientRepo;

  constructor() {
    this.propertyRepo = new PropertyRepo();
    this.inquiryRepo = new InquiryRepo();
    this.notificationRepo = new NotificationRepo();
    this.agentClientRepo = new AgentClientRepo();
  }

  private getScopeFilter(user: { id: string; role: RoleEnum }): Record<string, any> {
    if (user.role === RoleEnum.ADMIN) {
      return {};
    }
    if (user.role === RoleEnum.AGENT) {
      return {
        $or: [
          { agent: new Types.ObjectId(user.id) },
          { owner: new Types.ObjectId(user.id) },
        ],
      };
    }
    return { owner: new Types.ObjectId(user.id) };
  }

  async getSummary(user: { id: string; role: RoleEnum }) {
    const scopeFilter = this.getScopeFilter(user);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [propertyAgg, userPropIds, unreadNotifications] = await Promise.all([
      this.propertyRepo.aggregate<{ _id: number; count: number }>([
        { $match: scopeFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      this.propertyRepo.distinct("_id", scopeFilter as any),
      this.notificationRepo.countDocuments({
        recipient: new Types.ObjectId(user.id),
        isRead: false,
      }),
    ]);

    const statusCounts: Record<number, number> = {};
    let totalProperties = 0;
    for (const item of propertyAgg) {
      statusCounts[item._id] = item.count;
      totalProperties += item.count;
    }

    const published = statusCounts[PropertyStatusEnum.PUBLISHED] || 0;
    const underReview =
      (statusCounts[PropertyStatusEnum.SUBMITTED] || 0) +
      (statusCounts[PropertyStatusEnum.UNDER_REVIEW] || 0);

    // Inquiries in last 30 days
    let newInquiries30d = 0;
    if (userPropIds.length > 0) {
      newInquiries30d = await this.inquiryRepo.countDocuments({
        property: { $in: userPropIds },
        createdAt: { $gte: thirtyDaysAgo },
      });
    }

    let agentExtra: Record<string, any> = {};
    if (user.role === RoleEnum.AGENT) {
      const [clientsCount] = await Promise.all([
        this.agentClientRepo.countDocuments({
          agent: new Types.ObjectId(user.id),
          status: "active",
        }),
      ]);
      const closedDeals =
        (statusCounts[PropertyStatusEnum.SOLD] || 0) +
        (statusCounts[PropertyStatusEnum.RENTED] || 0);

      agentExtra = {
        clients: clientsCount,
        closedDeals,
      };
    }

    return {
      totalProperties,
      published,
      underReview,
      newInquiries30d,
      unreadNotifications,
      ...agentExtra,
    };
  }

  async getRecentProperties(user: { id: string; role: RoleEnum }, limit = 3) {
    const scopeFilter = this.getScopeFilter(user);
    const properties = await this.propertyRepo.find({
      filter: scopeFilter,
      options: {
        sort: { updatedAt: -1 },
        limit,
        populate: [
          { path: "category", select: "name slug icon" },
          { path: "owner", select: "username email phone" },
        ],
      },
    });

    return properties.map((p) => {
      const doc = p.toObject ? p.toObject() : p;
      return {
        _id: doc._id,
        propertyCode:
          (doc as any).propertyCode ||
          (doc as any).code ||
          `PROP-${doc._id.toString().slice(-6).toUpperCase()}`,
        title: doc.title,
        transactionType: TransactionTypeEnum[doc.transactionType]?.toLowerCase() || "sale",
        propertyType: PropertyTypeEnum[doc.propertyType]?.toLowerCase() || "apartment",
        location: doc.location,
        price: doc.price,
        currency: doc.currency || "EGP",
        priceUnit: doc.priceUnit,
        status: doc.status,
        coverImage: doc.coverImage || doc.images?.[0] || null,
        images: doc.images || [],
        updatedAt: doc.updatedAt,
        createdAt: doc.createdAt,
      };
    });
  }

  async getRecentInquiries(user: { id: string; role: RoleEnum }, limit = 3) {
    const scopeFilter = this.getScopeFilter(user);
    const userPropIds = await this.propertyRepo.distinct("_id", scopeFilter as any);

    if (userPropIds.length === 0) {
      return [];
    }

    const inquiries = await this.inquiryRepo.find({
      filter: { property: { $in: userPropIds } },
      options: {
        sort: { createdAt: -1 },
        limit,
        populate: [
          {
            path: "property",
            select: "title propertyCode propertyType transactionType location coverImage",
          },
        ],
      },
    });

    return inquiries.map((inq) => {
      const doc = inq.toObject ? inq.toObject() : inq;
      const prop = doc.property as any;
      return {
        _id: doc._id,
        property: prop
          ? {
              _id: prop._id,
              code: prop.propertyCode,
              title: prop.title,
              propertyType:
                PropertyTypeEnum[prop.propertyType]?.toLowerCase() || "apartment",
              transactionType:
                TransactionTypeEnum[prop.transactionType]?.toLowerCase() || "sale",
              location: prop.location,
              coverImage: prop.coverImage,
            }
          : null,
        customerName: doc.customerName,
        customerEmail: doc.customerEmail,
        customerPhone: doc.customerPhone,
        message: doc.message,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    });
  }

  async getRecentNotifications(user: { id: string; role: RoleEnum }, limit = 3) {
    const notifs = await this.notificationRepo.find({
      filter: { recipient: new Types.ObjectId(user.id) },
      options: {
        sort: { createdAt: -1 },
        limit,
      },
    });

    return notifs.map((n) => {
      const doc = n.toObject ? n.toObject() : n;
      return {
        _id: doc._id,
        type: doc.type,
        title: doc.title,
        description: doc.body,
        isRead: doc.isRead,
        target: doc.target,
        createdAt: doc.createdAt,
      };
    });
  }

  async getDashboard(user: { id: string; role: RoleEnum }) {
    const [summary, recentProperties, recentInquiries, recentNotifications] =
      await Promise.all([
        this.getSummary(user),
        this.getRecentProperties(user, 3),
        this.getRecentInquiries(user, 3),
        this.getRecentNotifications(user, 3),
      ]);

    return {
      summary,
      recentProperties,
      recentInquiries,
      recentNotifications,
    };
  }
}

export default new DashboardService();
