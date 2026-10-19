import { Types } from "mongoose";
import { InquiryRepo } from "../../DB/repo/inquiry.repo";
import { MessageRepo } from "../../DB/repo/message.repo";
import { PropertyRepo } from "../../DB/repo/property.repo";
import { NotificationRepo } from "../../DB/repo/notification.repo";
import { AgentClientRepo } from "../../DB/repo/agent-client.repo";
import { UserRepo } from "../../DB/repo/user.repo";
import {
  ForbiddenException,
  NotFoundException,
} from "../../common/exceptions";
import {
  PropertyTypeLabel,
  RoleEnum,
  TransactionTypeLabel,
} from "../../common/enums";
import { InquiryStatusEnum } from "../../common/interfaces";
import { decrypt } from "../../common/utils/security";

function formatTimestamp(d?: Date | string | null): string {
  if (!d) return "";
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[dateObj.getUTCMonth()];
  const day = String(dateObj.getUTCDate()).padStart(2, "0");
  const year = dateObj.getUTCFullYear();
  let hours = dateObj.getUTCHours();
  const minutes = String(dateObj.getUTCMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = String(hours).padStart(2, "0");
  return `${month} ${day}, ${year} - ${strHours}:${minutes} ${ampm}`;
}

function formatRelativeDate(d?: Date | string | null): string {
  if (!d) return "";
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return "";
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - dateObj.getTime());
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} M`;
  if (diffHour < 24) return `${diffHour} H Ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} Days Ago`;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[dateObj.getUTCMonth()]} ${dateObj.getUTCDate()}, ${dateObj.getUTCFullYear()}`;
}

function formatDateDivider(d?: Date | string | null): string {
  if (!d) return "";
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${dateObj.getUTCDate()} ${months[dateObj.getUTCMonth()]} ${dateObj.getUTCFullYear()}`;
}

function mapCustomerStatus(status: string): "Pending" | "Replied" | "Closed" {
  const s = (status || "").toLowerCase();
  if (s === "closed" || s === "published/archived") return "Closed";
  if (s === "responded" || s === "replied") return "Replied";
  return "Pending";
}

function mapAgentStatus(status: string): "New" | "Responded" | "Closed" {
  const s = (status || "").toLowerCase();
  if (s === "closed" || s === "published/archived") return "Closed";
  if (s === "responded" || s === "replied") return "Responded";
  return "New";
}

function formatPriceShort(price?: number, currency = "EGP"): string {
  if (typeof price !== "number" || isNaN(price)) return `${currency} 0`;
  if (price >= 1_000_000) {
    const val = (price / 1_000_000).toFixed(price % 1_000_000 === 0 ? 0 : 1);
    return `${currency} ${val}M`;
  }
  if (price >= 1_000) {
    const val = (price / 1_000).toFixed(price % 1_000 === 0 ? 0 : 1);
    return `${currency} ${val}K`;
  }
  return `${currency} ${price}`;
}

function capitalize(str?: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export class InquiryService {
  private readonly inquiryRepo: InquiryRepo;
  private readonly messageRepo: MessageRepo;
  private readonly propertyRepo: PropertyRepo;
  private readonly notificationRepo: NotificationRepo;
  private readonly agentClientRepo: AgentClientRepo;
  private readonly userRepo: UserRepo;

  constructor() {
    this.inquiryRepo = new InquiryRepo();
    this.messageRepo = new MessageRepo();
    this.propertyRepo = new PropertyRepo();
    this.notificationRepo = new NotificationRepo();
    this.agentClientRepo = new AgentClientRepo();
    this.userRepo = new UserRepo();
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

  ////////////////////////////////////////////////////////////// Customer Workflow
  async getCustomerInquiries(
    user: { id: string; email: string },
    query: {
      page?: string;
      limit?: string;
      status?: string;
      search?: string;
      sort_by?: string;
    },
  ) {
    const pageNum = Math.max(1, Number(query.page || 1));
    const limitNum = Math.max(1, Number(query.limit || 4));

    const filter: Record<string, any> = {
      $or: [
        { customer: new Types.ObjectId(user.id) },
        { customerEmail: user.email },
      ],
    };

    if (query.status && query.status.toLowerCase() !== "all") {
      const st = query.status.toLowerCase();
      if (st === "pending" || st === "new") {
        filter.status = { $in: ["new", "pending"] };
      } else if (st === "replied" || st === "responded") {
        filter.status = { $in: ["responded", "replied"] };
      } else if (st === "closed") {
        filter.status = "closed";
      }
    }

    if (query.search) {
      const regex = new RegExp(query.search, "i");
      const matchedProps = await this.propertyRepo.find({
        filter: { title: regex },
        options: { projection: "_id" },
      });
      const propIds = matchedProps.map((p) => p._id);

      filter.$and = [
        {
          $or: [
            { property: { $in: propIds } },
            { customerName: regex },
            { message: regex },
          ],
        },
      ];
    }

    let sortOption: any = { createdAt: -1 };
    if (query.sort_by === "oldest") {
      sortOption = { createdAt: 1 };
    }

    const total = await this.inquiryRepo.countDocuments(filter);
    const result = await this.inquiryRepo.paginate({
      filter,
      page: String(pageNum),
      limit: String(limitNum),
      options: {
        sort: sortOption,
        populate: [
          {
            path: "property",
            select: "title slug price currency transactionType propertyType location coverImage images propertyCode",
          },
          {
            path: "owner",
            select: "firstName lastName email profileImage role phone",
          },
          {
            path: "agent",
            select: "firstName lastName email profileImage role phone",
          },
        ],
      },
    });

    const userDoc = await this.userRepo.findOne({
      filter: { _id: new Types.ObjectId(user.id) },
    });

    let userPhone = userDoc?.phone || "";
    if (userPhone && userPhone.length > 25) {
      try {
        userPhone = await decrypt(userPhone);
      } catch {}
    }

    const customerProfile = {
      id: user.id,
      name: userDoc ? `${userDoc.firstName} ${userDoc.lastName}`.trim() : "Customer",
      email: userDoc?.email || user.email,
      phone: userPhone,
      avatar: userDoc?.profileImage || "",
    };

    const mappedInquiries = (result.docs || []).map((doc: any) => {
      const prop = doc.property as any;
      const owner = (doc.agent || doc.owner) as any;
      const transLabel = TransactionTypeLabel[prop?.transactionType] || "sale";

      return {
        inquiry_id: doc._id,
        _id: doc._id,
        id: doc._id,
        property: {
          id: prop?._id,
          _id: prop?._id,
          slug: prop?.slug || "",
          title: prop?.title || "Property",
          price: prop?.price || 0,
          currency: prop?.currency || "EGP",
          transactionType: transLabel,
          thumbnail: prop?.coverImage || prop?.images?.[0] || "",
          images: prop?.images || [],
          location: prop?.location || { city: "", country: "Egypt" },
        },
        owner: {
          id: owner?._id,
          _id: owner?._id,
          name: owner ? `${owner.firstName} ${owner.lastName}`.trim() : "Agent",
          avatar: owner?.profileImage || "",
          role: owner?.role === RoleEnum.AGENT ? "Agent" : "Owner",
          role_badge: owner?.role === RoleEnum.AGENT ? "Agent" : "Owner",
          title: owner?.role === RoleEnum.AGENT ? "Property Consultant" : "Property Owner",
        },
        createdAt: doc.createdAt,
        formatted_date: formatTimestamp(doc.createdAt),
        timestamp: formatTimestamp(doc.createdAt),
        status: mapCustomerStatus(doc.status),
        raw_status: doc.status,
        message: doc.message,
        lastMessage: doc.lastMessage || doc.message,
      };
    });

    return {
      customer: customerProfile,
      inquiries: mappedInquiries,
      pagination: {
        page: result.currentPage || pageNum,
        limit: limitNum,
        total,
        totalPages: result.pages || Math.ceil(total / limitNum) || 0,
      },
    };
  }

  async getCustomerChat(chatId: string, user: { id: string; email: string }) {
    if (!Types.ObjectId.isValid(chatId)) {
      throw new NotFoundException("Chat not found");
    }
    const inquiry = await this.inquiryRepo.findOne({
      filter: { _id: new Types.ObjectId(chatId) },
      options: {
        populate: [
          {
            path: "property",
            select: "title slug price currency transactionType propertyType location coverImage images propertyCode",
          },
          {
            path: "owner",
            select: "firstName lastName email profileImage role phone",
          },
          {
            path: "agent",
            select: "firstName lastName email profileImage role phone",
          },
          {
            path: "customer",
            select: "firstName lastName email profileImage phone",
          },
        ],
      },
    });

    if (!inquiry) throw new NotFoundException("Chat not found");

    const inqCustomerId = inquiry.customer?._id?.toString() || inquiry.customer?.toString();
    const isOwnerOfChat = inqCustomerId === user.id || inquiry.customerEmail === user.email;
    if (!isOwnerOfChat) {
      throw new ForbiddenException("You are not authorized to access this chat");
    }

    const messages = await this.messageRepo.find({
      filter: { inquiry: inquiry._id },
      options: {
        sort: { createdAt: 1 },
        populate: [{ path: "sender", select: "firstName lastName email profileImage role" }],
      },
    });

    const prop = inquiry.property as any;
    const ownerOrAgent = (inquiry.agent || inquiry.owner) as any;
    const transLabel = TransactionTypeLabel[prop?.transactionType] || "sale";

    const propertyCard = {
      id: prop?._id,
      _id: prop?._id,
      title: prop?.title || "Property",
      price: prop?.price || 0,
      currency: prop?.currency || "EGP",
      location: prop?.location?.address || `${prop?.location?.city || ""}, ${prop?.location?.country || "Egypt"}`,
      thumbnail: prop?.coverImage || prop?.images?.[0] || "",
      transactionType: transLabel,
    };

    const timelineMap: Map<string, any[]> = new Map();
    const formattedMessages = messages.map((m: any, index: number) => {
      const dateDivider = formatDateDivider(m.createdAt);
      const isOutboundCustomer = m.senderRole === "customer";

      const msgObj = {
        id: m._id,
        _id: m._id,
        sender: m.sender?._id || m.sender,
        senderRole: m.senderRole,
        senderName: m.senderName || (isOutboundCustomer ? inquiry.customerName : (ownerOrAgent ? `${ownerOrAgent.firstName} ${ownerOrAgent.lastName}`.trim() : "Agent")),
        text: m.text,
        timestamp: formatTimestamp(m.createdAt),
        createdAt: m.createdAt,
        property_card: isOutboundCustomer && index === 0 ? propertyCard : undefined,
        attachments: [],
      };

      if (!timelineMap.has(dateDivider)) {
        timelineMap.set(dateDivider, []);
      }
      timelineMap.get(dateDivider)!.push(msgObj);

      return msgObj;
    });

    const timeline = Array.from(timelineMap.entries()).map(([date, msgs]) => ({
      date,
      messages: msgs,
    }));

    return {
      chat_id: inquiry._id,
      inquiry_id: inquiry._id,
      status: mapCustomerStatus(inquiry.status),
      property: propertyCard,
      owner: {
        id: ownerOrAgent?._id,
        _id: ownerOrAgent?._id,
        name: ownerOrAgent ? `${ownerOrAgent.firstName} ${ownerOrAgent.lastName}`.trim() : "Agent",
        avatar: ownerOrAgent?.profileImage || "",
        role: ownerOrAgent?.role === RoleEnum.AGENT ? "agent" : "owner",
      },
      customer: {
        id: inquiry.customer?._id || user.id,
        name: inquiry.customerName,
        email: inquiry.customerEmail,
        phone: inquiry.customerPhone && inquiry.customerPhone.length > 25 ? (await decrypt(inquiry.customerPhone).catch(() => inquiry.customerPhone)) : inquiry.customerPhone,
        avatar: (inquiry.customer as any)?.profileImage || "",
      },
      timeline,
      messages: formattedMessages,
    };
  }

  async sendCustomerMessage(
    chatId: string,
    user: { id: string; email: string; name?: string },
    text: string,
  ) {
    if (!Types.ObjectId.isValid(chatId)) {
      throw new NotFoundException("Chat not found");
    }
    const inquiry = await this.inquiryRepo.findOne({
      filter: { _id: new Types.ObjectId(chatId) },
    });
    if (!inquiry) throw new NotFoundException("Chat not found");

    const inqCustomerId = inquiry.customer?._id?.toString() || inquiry.customer?.toString();
    const isOwnerOfChat = inqCustomerId === user.id || inquiry.customerEmail === user.email;
    if (!isOwnerOfChat) {
      throw new ForbiddenException("You are not authorized to message in this chat");
    }

    const message = await this.messageRepo.createOne({
      data: {
        inquiry: inquiry._id,
        sender: new Types.ObjectId(user.id),
        senderRole: "customer",
        senderType: "customer",
        senderName: user.name || inquiry.customerName,
        text,
      },
    });

    await this.inquiryRepo.updateOne({
      filter: { _id: inquiry._id },
      update: {
        lastMessage: text,
        lastMessageAt: new Date(),
      },
    });

    const recipients = [inquiry.owner];
    if (inquiry.agent && inquiry.agent.toString() !== inquiry.owner.toString()) {
      recipients.push(inquiry.agent);
    }
    for (const recipient of recipients) {
      try {
        await this.notificationRepo.createOne({
          data: {
            recipient,
            type: "new_inquiry_message",
            title: "New Customer Message",
            body: `${user.name || inquiry.customerName} sent a message regarding the inquiry.`,
            isRead: false,
            target: { kind: "inquiry", id: inquiry._id.toString() },
          },
        });
      } catch {}
    }

    return {
      message: "Message sent successfully",
      data: {
        id: message._id,
        senderRole: "customer",
        senderName: message.senderName,
        text: message.text,
        timestamp: formatTimestamp(message.createdAt),
        createdAt: message.createdAt,
      },
    };
  }

  ////////////////////////////////////////////////////////////// Agent Workflow
  async getAgentInquiriesDashboard(
    user: { id: string; role: RoleEnum },
    query: {
      page?: string;
      limit?: string;
      status?: string;
      search?: string;
    },
  ) {
    const authorizedPropIds = await this.getAuthorizedPropertyIds(user);
    if (authorizedPropIds.length === 0) {
      return {
        data: [],
        meta: {
          page: Number(query.page || 1),
          limit: Number(query.limit || 10),
          total: 0,
          totalPages: 0,
        },
      };
    }

    const filter: Record<string, any> = {
      property: { $in: authorizedPropIds },
    };

    if (query.status && query.status.toLowerCase() !== "all") {
      const st = query.status.toLowerCase();
      if (st === "new" || st === "pending") {
        filter.status = { $in: ["new", "pending"] };
      } else if (st === "responded" || st === "replied") {
        filter.status = { $in: ["responded", "replied"] };
      } else if (st === "closed") {
        filter.status = "closed";
      }
    }

    if (query.search) {
      const regex = new RegExp(query.search, "i");
      const matchedProps = await this.propertyRepo.find({
        filter: {
          _id: { $in: authorizedPropIds },
          title: regex,
        },
        options: { projection: "_id" },
      });
      const propIds = matchedProps.map((p) => p._id);

      filter.$or = [
        { property: { $in: propIds } },
        { customerName: regex },
        { customerPhone: regex },
        { message: regex },
      ];
    }

    const pageNum = String(Math.max(1, Number(query.page || 1)));
    const limitNum = String(Math.max(1, Number(query.limit || 10)));

    const total = await this.inquiryRepo.countDocuments(filter);
    const paginated = await this.inquiryRepo.paginate({
      filter,
      page: pageNum,
      limit: limitNum,
      options: {
        sort: { createdAt: -1 },
        populate: [
          {
            path: "property",
            select: "title propertyCode propertyType transactionType location coverImage price currency",
          },
        ],
      },
    });

    const rows = await Promise.all(
      (paginated.docs || []).map(async (doc: any) => {
        const prop = doc.property as any;
        const propType = PropertyTypeLabel[prop?.propertyType] || "property";
        const transType = TransactionTypeLabel[prop?.transactionType] || "sale";
        const typeStr = `${capitalize(propType)}-${capitalize(transType)}`;
        const propCode = prop?.propertyCode || `Dev-${prop?._id?.toString().slice(-4)}`;
        const snippet = (doc.message || "").length > 60
          ? (doc.message || "").slice(0, 60) + "..."
          : (doc.message || "");

        let phone = doc.customerPhone || "";
        if (phone && phone.length > 25) {
          try {
            phone = await decrypt(phone);
          } catch {}
        }

        return {
          inquiry_id: doc._id,
          _id: doc._id,
          id: doc._id,
          property: {
            title: prop?.title || "Property",
            id: propCode,
            _id: prop?._id,
            propertyCode: propCode,
          },
          type: typeStr,
          customer_name: doc.customerName,
          phone_number: phone,
          customer_email: doc.customerEmail,
          message_snippet: snippet,
          status: mapAgentStatus(doc.status),
          raw_status: doc.status,
          date: formatRelativeDate(doc.createdAt),
          createdAt: doc.createdAt,
        };
      }),
    );

    return {
      data: rows,
      meta: {
        page: paginated.currentPage || Number(pageNum),
        limit: Number(limitNum),
        total,
        totalPages: paginated.pages || Math.ceil(total / Number(limitNum)) || 0,
      },
    };
  }

  async getAgentInquiryDetails(inquiryId: string, user: { id: string; role: RoleEnum }) {
    const inquiry = await this.verifyInquiryAccess(inquiryId, user);

    const prop = inquiry.property as any;
    const propType = PropertyTypeLabel[prop?.propertyType] || "Apartment";
    const transType = TransactionTypeLabel[prop?.transactionType] || "Sale";
    const propCode = prop?.propertyCode || `Dev-${prop?._id?.toString().slice(-4)}`;

    let customerUser: any = null;
    if (inquiry.customer) {
      customerUser = await this.userRepo.findOne({
        filter: { _id: inquiry.customer },
      });
    }

    const messages = await this.messageRepo.find({
      filter: { inquiry: inquiry._id },
      options: {
        sort: { createdAt: 1 },
      },
    });

    const conversation = messages.map((m: any) => ({
      id: m._id,
      _id: m._id,
      sender_id: m.sender,
      senderRole: m.senderRole,
      senderName: m.senderName,
      text: m.text,
      timestamp: formatTimestamp(m.createdAt),
      createdAt: m.createdAt,
      attachments: [],
    }));

    return {
      inquiry_id: inquiry._id,
      status: mapAgentStatus(inquiry.status),
      customer_status: mapCustomerStatus(inquiry.status),
      raw_status: inquiry.status,
      user_profile: {
        user_name: inquiry.customerName,
        email: inquiry.customerEmail,
        phone_number: inquiry.customerPhone && inquiry.customerPhone.length > 25 ? (await decrypt(inquiry.customerPhone).catch(() => inquiry.customerPhone)) : inquiry.customerPhone,
        avatar_url: customerUser?.profileImage || "",
        id: inquiry.customer?._id || inquiry.customer || null,
      },
      submission_info: {
        property_id: prop?._id,
        property_code: propCode,
        property_title: prop?.title,
        property_type: capitalize(propType),
        transaction: capitalize(transType),
        price: formatPriceShort(prop?.price, prop?.currency),
        raw_price: prop?.price || 0,
        currency: prop?.currency || "EGP",
        location: prop?.location?.address || `${prop?.location?.city || ""}, ${prop?.location?.country || "Egypt"}`,
      },
      conversation,
    };
  }

  async agentReply(
    inquiryId: string,
    user: { id: string; role: RoleEnum; firstName?: string; lastName?: string },
    text: string,
  ) {
    const inquiry = await this.verifyInquiryAccess(inquiryId, user);

    const senderRole = user.role === RoleEnum.AGENT ? "agent" : "owner";
    const senderName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || (senderRole === "agent" ? "Agent" : "Owner");

    const message = await this.messageRepo.createOne({
      data: {
        inquiry: inquiry._id,
        senderRole,
        senderType: senderRole,
        senderName,
        sender: new Types.ObjectId(user.id),
        text,
      },
    });

    // State Machine Hook:
    // Executing this POST request MUST trigger a system-wide state change mutation.
    // Automatically upgrades inquiry status row to Responded / Replied.
    await this.inquiryRepo.updateOne({
      filter: { _id: inquiry._id },
      update: {
        status: InquiryStatusEnum.RESPONDED,
        lastMessage: text,
        lastMessageAt: new Date(),
      },
    });

    if (inquiry.customer) {
      try {
        await this.notificationRepo.createOne({
          data: {
            recipient: inquiry.customer,
            type: "inquiry_reply",
            title: "New Agent Reply",
            body: `You received a reply from ${senderName} regarding your inquiry.`,
            isRead: false,
            target: { kind: "inquiry", id: inquiry._id.toString() },
          },
        });
      } catch {}
    }

    return {
      inquiry_id: inquiry._id,
      status: "Responded",
      customer_status: "Replied",
      raw_status: "responded",
      reply: {
        id: message._id,
        _id: message._id,
        senderRole: message.senderRole,
        senderName: message.senderName,
        text: message.text,
        timestamp: formatTimestamp(message.createdAt),
        createdAt: message.createdAt,
      },
    };
  }

  async closeInquiry(
    inquiryId: string,
    user: { id: string; role: RoleEnum; email?: string },
  ) {
    if (!Types.ObjectId.isValid(inquiryId)) {
      throw new NotFoundException("Inquiry not found");
    }

    const inquiry = await this.inquiryRepo.findOne({
      filter: { _id: new Types.ObjectId(inquiryId) },
    });
    if (!inquiry) throw new NotFoundException("Inquiry not found");

    if (user.role === RoleEnum.ADMIN) {
      // Admin has full access
    } else if (user.role === RoleEnum.CUSTOMER) {
      const inqCustomerId = inquiry.customer?._id?.toString() || inquiry.customer?.toString();
      const isOwnerOfChat = inqCustomerId === user.id || (user.email && inquiry.customerEmail === user.email);
      if (!isOwnerOfChat) {
        throw new ForbiddenException("You are not authorized to close this inquiry");
      }
    } else {
      await this.verifyInquiryAccess(inquiryId, user);
    }

    await this.inquiryRepo.updateOne({
      filter: { _id: inquiry._id },
      update: { status: InquiryStatusEnum.CLOSED },
    });

    return {
      inquiry_id: inquiry._id,
      status: "Closed",
      customer_status: "Closed",
      agent_status: "Closed",
      raw_status: "closed",
    };
  }
}

export default new InquiryService();
