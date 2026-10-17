import { Types } from "mongoose";
import { PropertyRepo } from "../../DB/repo/property.repo";
import { AgentClientRepo } from "../../DB/repo/agent-client.repo";
import {
  PropertyStatusEnum,
  RoleEnum,
  TransactionTypeEnum,
} from "../../common/enums";

export class ReportsService {
  private readonly propertyRepo: PropertyRepo;
  private readonly agentClientRepo: AgentClientRepo;

  constructor() {
    this.propertyRepo = new PropertyRepo();
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

  async getSummary(
    user: { id: string; role: RoleEnum },
    dateRange?: { from?: string; to?: string },
  ) {
    const scopeFilter = this.getScopeFilter(user);

    if (dateRange?.from || dateRange?.to) {
      scopeFilter.createdAt = {};
      if (dateRange.from) {
        scopeFilter.createdAt.$gte = new Date(dateRange.from);
      }
      if (dateRange.to) {
        scopeFilter.createdAt.$lte = new Date(dateRange.to);
      }
    }

    const [statusAgg, transactionAgg] = await Promise.all([
      this.propertyRepo.aggregate<{ _id: number; count: number }>([
        { $match: scopeFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      this.propertyRepo.aggregate<{ _id: number; count: number }>([
        { $match: scopeFilter },
        { $group: { _id: "$transactionType", count: { $sum: 1 } } },
      ]),
    ]);

    const statusCounts: Record<number, number> = {};
    let total = 0;
    for (const item of statusAgg) {
      statusCounts[item._id] = item.count;
      total += item.count;
    }

    const published = statusCounts[PropertyStatusEnum.PUBLISHED] || 0;
    const underReview =
      (statusCounts[PropertyStatusEnum.SUBMITTED] || 0) +
      (statusCounts[PropertyStatusEnum.UNDER_REVIEW] || 0);
    const rejected = statusCounts[PropertyStatusEnum.REJECTED] || 0;
    const draft = statusCounts[PropertyStatusEnum.DRAFT] || 0;

    let saleCount = 0;
    let rentCount = 0;
    for (const item of transactionAgg) {
      if (item._id === TransactionTypeEnum.SALE) saleCount = item.count;
      if (item._id === TransactionTypeEnum.RENT) rentCount = item.count;
    }

    const response: Record<string, any> = {
      transactionDistribution: {
        sale: saleCount,
        rent: rentCount,
      },
      listingsOverview: {
        total,
        published,
        underReview,
        rejected,
        draft,
      },
    };

    if (user.role === RoleEnum.AGENT) {
      // Aggregate properties by owner for this agent
      const byOwnerAgg = await this.propertyRepo.aggregate<{
        _id: Types.ObjectId;
        propertyCount: number;
      }>([
        {
          $match: {
            agent: new Types.ObjectId(user.id),
            ...(scopeFilter.createdAt ? { createdAt: scopeFilter.createdAt } : {}),
          },
        },
        { $group: { _id: "$owner", propertyCount: { $sum: 1 } } },
      ]);

      // Populate client names
      const clients = await this.agentClientRepo.find({
        filter: { agent: new Types.ObjectId(user.id), status: "active" },
        options: { populate: [{ path: "client", select: "username email firstName lastName" }] },
      });

      const clientMap = new Map<string, string>();
      for (const c of clients) {
        const u = c.client as any;
        if (u) {
          const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username;
          clientMap.set(u._id.toString(), name);
        }
      }

      response.byOwner = byOwnerAgg.map((item) => ({
        ownerId: item._id,
        ownerName: clientMap.get(item._id.toString()) || "Unknown Client",
        propertyCount: item.propertyCount,
      }));
    }

    return response;
  }
}

export default new ReportsService();
