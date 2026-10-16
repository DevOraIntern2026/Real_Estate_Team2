import { Types } from "mongoose";
import { AgentClientRepo } from "../../DB/repo/agent-client.repo";
import { UserRepo } from "../../DB/repo/user.repo";
import { PropertyRepo } from "../../DB/repo/property.repo";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../common/exceptions";
import { decrypt } from "../../common/utils/security";

export class AgentService {
  private readonly agentClientRepo: AgentClientRepo;
  private readonly userRepo: UserRepo;
  private readonly propertyRepo: PropertyRepo;

  constructor() {
    this.agentClientRepo = new AgentClientRepo();
    this.userRepo = new UserRepo();
    this.propertyRepo = new PropertyRepo();
  }

  async listClients(
    agentId: string,
    query: { page?: string; limit?: string; status?: string; q?: string },
  ) {
    const filter: Record<string, any> = {
      agent: new Types.ObjectId(agentId),
    };

    if (query.status) {
      filter.status = query.status;
    }

    const paginated = await this.agentClientRepo.paginate({
      filter,
      page: query.page || "1",
      limit: query.limit || "10",
      options: {
        sort: { createdAt: -1 },
        populate: [
          {
            path: "client",
            select: "firstName lastName username email phone profileImage role",
          },
        ],
      },
    });

    const docs = paginated.docs || [];
    // Map clients and format phone/names
    const formattedData = await Promise.all(
      docs.map(async (item: any) => {
        const doc = item.toObject ? item.toObject() : item;
        const u = doc.client;
        let phone = u?.phone || "";
        if (phone) {
          try {
            phone = await decrypt(phone);
          } catch {}
        }

        const name = u
          ? `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username
          : "Unknown Client";

        return {
          _id: doc._id,
          clientId: u?._id,
          name,
          email: u?.email,
          phone,
          avatar: u?.profileImage || null,
          status: doc.status,
          notes: doc.notes || "",
          createdAt: doc.createdAt,
        };
      }),
    );

    let filtered = formattedData;
    if (query.q) {
      const regex = new RegExp(query.q, "i");
      filtered = formattedData.filter(
        (c: any) => regex.test(c.name) || regex.test(c.email) || regex.test(c.phone),
      );
    }

    return {
      ...paginated,
      data: filtered,
      docs: filtered,
    };
  }

  async addClient(
    agentId: string,
    dto: {
      clientId?: string;
      email?: string;
      name?: string;
      phone?: string;
      notes?: string;
    },
  ) {
    let clientUser: any = null;

    if (dto.clientId) {
      clientUser = await this.userRepo.findOne({
        filter: { _id: new Types.ObjectId(dto.clientId) },
      });
      if (!clientUser) throw new NotFoundException("Client user not found");
    } else if (dto.email) {
      clientUser = await this.userRepo.findOne({
        filter: { email: dto.email.toLowerCase() },
      });
      if (!clientUser) {
        throw new NotFoundException(
          "No registered user found with that email. Please have the client create an account first.",
        );
      }
    } else {
      throw new BadRequestException("Either clientId or email must be provided");
    }

    if (clientUser._id.toString() === agentId) {
      throw new BadRequestException("You cannot add yourself as a client");
    }

    const existingRel = await this.agentClientRepo.findOne({
      filter: {
        agent: new Types.ObjectId(agentId),
        client: clientUser._id,
      },
    });

    if (existingRel) {
      if (existingRel.status === "active") {
        throw new ConflictException("Client is already actively associated with this agent");
      }
      // Reactivate
      const updated = await this.agentClientRepo.findOneAndUpdate({
        filter: { _id: existingRel._id },
        update: { status: "active", notes: dto.notes ?? existingRel.notes },
      });
      return updated;
    }

    const newRel = await this.agentClientRepo.createOne({
      data: {
        agent: new Types.ObjectId(agentId),
        client: clientUser._id,
        status: "active",
        notes: dto.notes,
      },
    });

    return newRel;
  }

  async getClientDetails(agentId: string, clientId: string) {
    const relationship = await this.agentClientRepo.findOne({
      filter: {
        agent: new Types.ObjectId(agentId),
        $or: [
          { client: new Types.ObjectId(clientId) },
          { _id: new Types.ObjectId(clientId) },
        ],
      },
      options: {
        populate: [
          {
            path: "client",
            select: "firstName lastName username email phone profileImage role",
          },
        ],
      },
    });

    if (!relationship) {
      throw new NotFoundException("Client relationship not found");
    }

    const clientDoc = (relationship as any).client;
    const actualClientId = clientDoc?._id || relationship.client;

    let phone = clientDoc?.phone || "";
    if (phone) {
      try {
        phone = await decrypt(phone);
      } catch {}
    }

    // Retrieve properties managed for this client
    const properties = await this.propertyRepo.find({
      filter: {
        owner: actualClientId,
        agent: new Types.ObjectId(agentId),
      },
      options: {
        sort: { updatedAt: -1 },
        populate: [{ path: "category", select: "name slug icon" }],
      },
    });

    return {
      client: {
        _id: actualClientId,
        relationshipId: relationship._id,
        name: clientDoc
          ? `${clientDoc.firstName || ""} ${clientDoc.lastName || ""}`.trim() ||
            clientDoc.username
          : "Unknown",
        email: clientDoc?.email,
        phone,
        avatar: clientDoc?.profileImage || null,
        status: relationship.status,
        notes: relationship.notes,
        createdAt: relationship.createdAt,
      },
      properties,
    };
  }
}

export default new AgentService();
