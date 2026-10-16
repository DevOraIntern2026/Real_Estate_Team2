import { Types } from "mongoose";
import { InquiryRepo } from "../../DB/repo/inquiry.repo";
import { MessageRepo } from "../../DB/repo/message.repo";
import { PropertyRepo } from "../../DB/repo/property.repo";
import { NotificationRepo } from "../../DB/repo/notification.repo";
import { AgentClientRepo } from "../../DB/repo/agent-client.repo";
import {
  ForbiddenException,
  NotFoundException,
} from "../../common/exceptions";
import { RoleEnum } from "../../common/enums";
import { InquiryStatusEnum } from "../../common/interfaces";

export class InquiryService {
  private readonly inquiryRepo: InquiryRepo;
  private readonly messageRepo: MessageRepo;
  private readonly propertyRepo: PropertyRepo;
  private readonly notificationRepo: NotificationRepo;
  private readonly agentClientRepo: AgentClientRepo;

  constructor() {
    this.inquiryRepo = new InquiryRepo();
    this.messageRepo = new MessageRepo();
    this.propertyRepo = new PropertyRepo();
    this.notificationRepo = new NotificationRepo();
    this.agentClientRepo = new AgentClientRepo();
  }

  private async getAuthorizedPropertyIds(
    user: { id: string; role: RoleEnum },
    ownerIdFilter?: string,
  ): Promise<Types.ObjectId[]> {
    if (user.role === RoleEnum.ADMIN) {
      const filter: Record<string, any> = {};
      if (ownerIdFilter) filter.owner = new Types.ObjectId(ownerIdFilter);
      return this.propertyRepo.distinct("_id", filter as any);
    }

    if (user.role === RoleEnum.AGENT) {
      if (ownerIdFilter) {
        const rel = await this.agentClientRepo.findOne({
          filter: {
            agent: new Types.ObjectId(user.id),
            client: new Types.ObjectId(ownerIdFilter),
            status: "active",
          },
        });
        if (!rel) {
          throw new ForbiddenException(
            "Agent is not authorized to access inquiries for this client",
          );
        }
        return this.propertyRepo.distinct("_id", {
          owner: new Types.ObjectId(ownerIdFilter),
          agent: new Types.ObjectId(user.id),
        } as any);
      }
      return this.propertyRepo.distinct("_id", {
        $or: [
          { agent: new Types.ObjectId(user.id) },
          { owner: new Types.ObjectId(user.id) },
        ],
      } as any);
    }

    // Owner
    return this.propertyRepo.distinct("_id", {
      owner: new Types.ObjectId(user.id),
    } as any);
  }

  private async verifyInquiryAccess(
    inquiryId: string,
    user: { id: string; role: RoleEnum },
  ) {
    const inquiry = await this.inquiryRepo.findOne({
      filter: { _id: new Types.ObjectId(inquiryId) },
      options: {
        populate: [
          {
            path: "property",
            select: "title propertyCode propertyType transactionType location owner agent",
          },
        ],
      },
    });
    if (!inquiry) throw new NotFoundException("Inquiry not found");

    if (user.role === RoleEnum.ADMIN) return inquiry;

    const prop = inquiry.property as any;
    const propOwner = prop?.owner?._id?.toString() || prop?.owner?.toString();
    const propAgent = prop?.agent?._id?.toString() || prop?.agent?.toString();
    const inqOwner = (inquiry.owner as any)?._id?.toString() || (inquiry.owner as any)?.toString();
    const inqAgent = (inquiry.agent as any)?._id?.toString() || (inquiry.agent as any)?.toString();

    const isOwner = propOwner === user.id || inqOwner === user.id;
    const isAgent = propAgent === user.id || inqAgent === user.id;

    if (!isOwner && !isAgent) {
      throw new ForbiddenException("You are not authorized to access this inquiry");
    }

    return inquiry;
  }

  ////////////////////////////////////////////////////////////// Public/Customer: create
  async createInquiry(dto: {
    propertyId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    message: string;
    customerId?: string;
  }) {
    const property = await this.propertyRepo.findOne({
      filter: { _id: new Types.ObjectId(dto.propertyId) },
    });
    if (!property) throw new NotFoundException("Property not found");

    const inquiry = await this.inquiryRepo.createOne({
      data: {
        property: property._id,
        owner: property.owner,
        agent: property.agent,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        customerPhone: dto.customerPhone,
        customer: dto.customerId ? new Types.ObjectId(dto.customerId) : undefined,
        message: dto.message,
        lastMessage: dto.message,
        lastMessageAt: new Date(),
        status: InquiryStatusEnum.NEW,
      },
    });

    // Create initial message in conversation
    await this.messageRepo.createOne({
      data: {
        inquiry: inquiry._id,
        senderRole: "customer",
        senderType: "customer",
        senderName: dto.customerName,
        sender: dto.customerId ? new Types.ObjectId(dto.customerId) : undefined,
        text: dto.message,
      },
    });

    // Create notification for property owner and agent
    const recipients = [property.owner];
    if (property.agent && property.agent.toString() !== property.owner.toString()) {
      recipients.push(property.agent);
    }

    for (const recipient of recipients) {
      try {
        await this.notificationRepo.createOne({
          data: {
            recipient,
            type: "new_inquiry",
            title: "New Customer Inquiry",
            body: `You received a new inquiry on "${property.title}" from ${dto.customerName}.`,
            isRead: false,
            target: { kind: "inquiry", id: inquiry._id.toString() },
          },
        });
      } catch {}
    }

    return inquiry;
  }

  ////////////////////////////////////////////////////////////// Owner/Agent: list
  async listInquiries(
    user: { id: string; role: RoleEnum },
    query: {
      page?: string;
      limit?: string;
      status?: string;
      propertyId?: string;
      ownerId?: string;
      q?: string;
    },
  ) {
    const authorizedPropIds = await this.getAuthorizedPropertyIds(
      user,
      query.ownerId,
    );

    if (authorizedPropIds.length === 0) {
      return {
        data: [],
        meta: { page: Number(query.page || 1), limit: Number(query.limit || 10), total: 0, totalPages: 0 },
      };
    }

    const filter: Record<string, any> = {
      property: { $in: authorizedPropIds },
    };

    if (query.propertyId) {
      const match = authorizedPropIds.some(
        (id) => id.toString() === query.propertyId,
      );
      if (!match) {
        throw new ForbiddenException("You are not authorized for this property");
      }
      filter.property = new Types.ObjectId(query.propertyId);
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.q) {
      filter.$or = [
        { customerName: new RegExp(query.q, "i") },
        { customerPhone: new RegExp(query.q, "i") },
        { customerEmail: new RegExp(query.q, "i") },
        { message: new RegExp(query.q, "i") },
      ];
    }

    return this.inquiryRepo.paginate({
      filter,
      page: query.page || "1",
      limit: query.limit || "10",
      options: {
        sort: { createdAt: -1 },
        populate: [
          {
            path: "property",
            select: "title propertyCode propertyType transactionType location coverImage",
          },
        ],
      },
    });
  }

  ////////////////////////////////////////////////////////////// Details
  async getById(id: string, user: { id: string; role: RoleEnum }) {
    return this.verifyInquiryAccess(id, user);
  }

  ////////////////////////////////////////////////////////////// Messages
  async getMessages(inquiryId: string, user: { id: string; role: RoleEnum }) {
    await this.verifyInquiryAccess(inquiryId, user);

    const messages = await this.messageRepo.find({
      filter: { inquiry: new Types.ObjectId(inquiryId) },
      options: {
        sort: { createdAt: 1 },
        populate: [{ path: "sender", select: "username email role" }],
      },
    });

    return messages;
  }

  async sendMessage(
    inquiryId: string,
    user: { id: string; role: RoleEnum },
    text: string,
  ) {
    const inquiry = await this.verifyInquiryAccess(inquiryId, user);

    const senderRole = user.role === RoleEnum.AGENT ? "agent" : "owner";

    const message = await this.messageRepo.createOne({
      data: {
        inquiry: inquiry._id,
        senderRole,
        senderType: senderRole,
        sender: new Types.ObjectId(user.id),
        text,
      },
    });

    // If inquiry was new, automatically transition to responded
    if (inquiry.status === InquiryStatusEnum.NEW) {
      await this.inquiryRepo.updateOne({
        filter: { _id: inquiry._id },
        update: { status: InquiryStatusEnum.RESPONDED },
      });
    }

    return message;
  }

  ////////////////////////////////////////////////////////////// Status
  async updateStatus(
    inquiryId: string,
    user: { id: string; role: RoleEnum },
    status: InquiryStatusEnum,
  ) {
    const inquiry = await this.verifyInquiryAccess(inquiryId, user);

    const updated = await this.inquiryRepo.findOneAndUpdate({
      filter: { _id: inquiry._id },
      update: { status },
    });
    return updated;
  }
}

export default new InquiryService();
