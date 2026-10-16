import { HydratedDocument, Types } from "mongoose";
import { PropertyRepo } from "../../DB/repo/property.repo";
import { CategoryRepo } from "../../DB/repo/category.repo";
import { AgentClientRepo } from "../../DB/repo/agent-client.repo";
import { NotificationRepo } from "../../DB/repo/notification.repo";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../../common/exceptions";
import {
  FurnishingMap,
  PropertyStatusEnum,
  PropertyStatusMap,
  PropertyTypeMap,
  PUBLIC_PROPERTY_STATUSES,
  RoleEnum,
  TransactionTypeMap,
} from "../../common/enums";
import { IPaginate, IProperty } from "../../common/interfaces";
import {
  deleteManyFromCloudinary,
  uploadManyBuffersToCloudinary,
} from "../../common/utils/cloudinary";
import {
  CreatePropertyDto,
  ListPropertiesDto,
  MyPropertiesDto,
  UpdatePropertyDto,
  UpdatePropertyStatusDto,
} from "./property.dto";

// Which owner-editable statuses an admin decision can move to, and from where
const STATUS_TRANSITIONS: Record<string, PropertyStatusEnum[]> = {
  approved: [
    PropertyStatusEnum.SUBMITTED,
    PropertyStatusEnum.UNDER_REVIEW,
    PropertyStatusEnum.CHANGE_REQUIRED,
  ],
  published: [
    PropertyStatusEnum.SUBMITTED,
    PropertyStatusEnum.UNDER_REVIEW,
    PropertyStatusEnum.APPROVED,
    PropertyStatusEnum.CHANGE_REQUIRED,
  ],
  rejected: [
    PropertyStatusEnum.SUBMITTED,
    PropertyStatusEnum.UNDER_REVIEW,
    PropertyStatusEnum.CHANGE_REQUIRED,
  ],
  change_required: [
    PropertyStatusEnum.SUBMITTED,
    PropertyStatusEnum.UNDER_REVIEW,
  ],
  inactive: [PropertyStatusEnum.PUBLISHED],
  sold: [PropertyStatusEnum.PUBLISHED],
  rented: [PropertyStatusEnum.PUBLISHED],
};

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  most_viewed: { views: -1 },
};

const OWNER_EDITABLE_STATUSES = [
  PropertyStatusEnum.DRAFT,
  PropertyStatusEnum.REJECTED,
  PropertyStatusEnum.CHANGE_REQUIRED,
];

class PropertyService {
  private readonly propertyRepo: PropertyRepo;
  private readonly categoryRepo: CategoryRepo;
  private readonly agentClientRepo: AgentClientRepo;
  private readonly notificationRepo: NotificationRepo;

  constructor() {
    this.propertyRepo = new PropertyRepo();
    this.categoryRepo = new CategoryRepo();
    this.agentClientRepo = new AgentClientRepo();
    this.notificationRepo = new NotificationRepo();
  }

  ////////////////////////////////////////////////////////////// helpers
  private mapEnumFields<T extends Record<string, any>>(dto: T) {
    const mapped: Record<string, any> = { ...dto };
    if (dto.propertyType) mapped.propertyType = PropertyTypeMap[dto.propertyType as keyof typeof PropertyTypeMap];
    if (dto.transactionType)
      mapped.transactionType =
        TransactionTypeMap[dto.transactionType as keyof typeof TransactionTypeMap];
    if (dto.furnishing)
      mapped.furnishing = FurnishingMap[dto.furnishing as keyof typeof FurnishingMap];
    return mapped;
  }

  public isAuthorizedManager(
    property: HydratedDocument<IProperty> | IProperty,
    userId: string,
    role: RoleEnum,
  ): boolean {
    if (role === RoleEnum.ADMIN) return true;
    const ownerId =
      (property.owner as any)?._id?.toString() ||
      (property.owner as any)?.toString();
    if (ownerId === userId) return true;
    const agentId =
      (property.agent as any)?._id?.toString() ||
      (property.agent as any)?.toString();
    if (agentId === userId) return true;
    return false;
  }

  ////////////////////////////////////////////////////////////// create
  async create(
    user: { id: string; role: RoleEnum },
    dto: CreatePropertyDto,
  ): Promise<IProperty> {
    const category = await this.categoryRepo.findOne({
      filter: { _id: new Types.ObjectId(dto.category), isActive: true },
      projection: "_id",
      options: { lean: true },
    });
    if (!category) {
      throw new BadRequestException("Invalid or inactive category");
    }

    let ownerId = user.id;
    let agentId: string | undefined = undefined;

    if (user.role === RoleEnum.AGENT) {
      if (!dto.ownerId) {
        throw new BadRequestException(
          "Agents must specify a valid ownerId (client) to create a property on their behalf",
        );
      }
      const relationship = await this.agentClientRepo.findOne({
        filter: {
          agent: new Types.ObjectId(user.id),
          client: new Types.ObjectId(dto.ownerId),
          status: "active",
        },
      });
      if (!relationship) {
        throw new ForbiddenException(
          "Agent is not authorized to create properties for this client",
        );
      }
      ownerId = dto.ownerId;
      agentId = user.id;
    }

    const data = this.mapEnumFields(dto);
    delete data.ownerId;

    return this.propertyRepo.createOne({
      data: {
        ...data,
        owner: new Types.ObjectId(ownerId),
        ...(agentId ? { agent: new Types.ObjectId(agentId) } : {}),
        status: PropertyStatusEnum.DRAFT,
      },
    });
  }

  ////////////////////////////////////////////////////////////// public search / filter
  async search(dto: ListPropertiesDto): Promise<IPaginate<IProperty>> {
    const {
      page,
      limit,
      search,
      category,
      propertyType,
      transactionType,
      furnishing,
      city,
      area,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      bedrooms,
      bathrooms,
      isFeatured,
      sort,
    } = dto;

    const filter: Record<string, any> = { status: { $in: PUBLIC_PROPERTY_STATUSES } };

    if (search) filter.$text = { $search: search };
    if (category) filter.category = new Types.ObjectId(category);
    if (propertyType) filter.propertyType = PropertyTypeMap[propertyType as keyof typeof PropertyTypeMap];
    if (transactionType)
      filter.transactionType =
        TransactionTypeMap[transactionType as keyof typeof TransactionTypeMap];
    if (furnishing) filter.furnishing = FurnishingMap[furnishing as keyof typeof FurnishingMap];
    if (city) filter["location.city"] = new RegExp(city, "i");
    if (area) filter["location.area"] = new RegExp(area, "i");
    if (typeof isFeatured === "boolean") filter.isFeatured = isFeatured;
    if (typeof bedrooms === "number") filter.bedrooms = { $gte: bedrooms };
    if (typeof bathrooms === "number") filter.bathrooms = { $gte: bathrooms };

    if (typeof minPrice === "number" || typeof maxPrice === "number") {
      filter.price = {};
      if (typeof minPrice === "number") filter.price.$gte = minPrice;
      if (typeof maxPrice === "number") filter.price.$lte = maxPrice;
    }
    if (typeof minArea === "number" || typeof maxArea === "number") {
      filter.area = {};
      if (typeof minArea === "number") filter.area.$gte = minArea;
      if (typeof maxArea === "number") filter.area.$lte = maxArea;
    }

    return this.propertyRepo.paginate({
      filter,
      page: page || "1",
      limit: limit || "12",
      options: {
        sort: SORT_MAP[sort || "newest"],
        populate: [
          { path: "category", select: "name slug icon" },
          { path: "owner", select: "username email phone role" },
        ],
      },
    });
  }

  private async getStatusCounts(baseFilter: Record<string, any>) {
    const counts = await this.propertyRepo.aggregate<{
      _id: number;
      count: number;
    }>([
      { $match: baseFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const countMap: Record<number, number> = {};
    let total = 0;
    for (const c of counts) {
      countMap[c._id] = c.count;
      total += c.count;
    }

    return {
      all: total,
      draft: countMap[PropertyStatusEnum.DRAFT] || 0,
      underReview:
        (countMap[PropertyStatusEnum.SUBMITTED] || 0) +
        (countMap[PropertyStatusEnum.UNDER_REVIEW] || 0),
      published: countMap[PropertyStatusEnum.PUBLISHED] || 0,
      rejected: countMap[PropertyStatusEnum.REJECTED] || 0,
    };
  }

  ////////////////////////////////////////////////////////////// details
  async getById(
    id: string,
    viewer?: { id: string; role: RoleEnum },
  ): Promise<any> {
    const property = await this.propertyRepo.findOne({
      filter: { _id: new Types.ObjectId(id) },
      options: {
        populate: [
          { path: "category", select: "name slug icon" },
          { path: "owner", select: "username email phone role" },
          { path: "agent", select: "username email phone role licenseNumber agencyName" },
        ],
      },
    });
    if (!property) throw new NotFoundException("Property not found");

    const isPublic = PUBLIC_PROPERTY_STATUSES.includes(property.status);
    const canSeePrivate = viewer && this.isAuthorizedManager(property, viewer.id, viewer.role);
    if (!isPublic && !canSeePrivate) {
      // Hide existence of non-public listings from everyone else
      throw new NotFoundException("Property not found");
    }

    // Count a view only for genuine public traffic, not the owner/admin previewing
    if (isPublic && !canSeePrivate) {
      await this.propertyRepo.updateOne({
        filter: { _id: property._id },
        update: { $inc: { views: 1 } },
      });
    }

    const doc = (property as any).toObject ? (property as any).toObject() : { ...property };
    if (canSeePrivate) {
      doc.allowedActions = {
        canEdit: [
          PropertyStatusEnum.DRAFT,
          PropertyStatusEnum.REJECTED,
          PropertyStatusEnum.PUBLISHED,
          PropertyStatusEnum.CHANGE_REQUIRED,
        ].includes(property.status),
        canSubmit: [
          PropertyStatusEnum.DRAFT,
          PropertyStatusEnum.REJECTED,
        ].includes(property.status),
        canDelete: true,
      };
    }
    return doc;
  }

  ////////////////////////////////////////////////////////////// owner/agent listings
  async myProperties(
    user: { id: string; role: RoleEnum },
    dto: MyPropertiesDto,
  ): Promise<any> {
    const { page, limit, status, transactionType, propertyType, city, q, ownerId, sort } = dto;
    let baseFilter: Record<string, any> = {};

    if (user.role === RoleEnum.AGENT) {
      if (ownerId) {
        const rel = await this.agentClientRepo.findOne({
          filter: {
            agent: new Types.ObjectId(user.id),
            client: new Types.ObjectId(ownerId),
            status: "active",
          },
        });
        if (!rel) {
          throw new ForbiddenException(
            "Agent is not authorized to access properties for this client",
          );
        }
        baseFilter = {
          owner: new Types.ObjectId(ownerId),
          agent: new Types.ObjectId(user.id),
        };
      } else {
        baseFilter = {
          $or: [
            { agent: new Types.ObjectId(user.id) },
            { owner: new Types.ObjectId(user.id) },
          ],
        };
      }
    } else {
      baseFilter = { owner: new Types.ObjectId(user.id) };
    }

    const filter: Record<string, any> = { ...baseFilter };
    if (status) {
      const mapped = PropertyStatusMap[status as keyof typeof PropertyStatusMap];
      filter.status = mapped !== undefined ? mapped : Number(status);
    }
    if (transactionType) {
      filter.transactionType =
        TransactionTypeMap[transactionType as keyof typeof TransactionTypeMap];
    }
    if (propertyType) {
      filter.propertyType =
        PropertyTypeMap[propertyType as keyof typeof PropertyTypeMap];
    }
    if (city) {
      filter["location.city"] = new RegExp(city, "i");
    }
    if (q) {
      filter.$or = [
        { title: new RegExp(q, "i") },
        { propertyCode: new RegExp(q, "i") },
        { "location.address": new RegExp(q, "i") },
        { "location.city": new RegExp(q, "i") },
      ];
    }

    const [paginated, statusCounts] = await Promise.all([
      this.propertyRepo.paginate({
        filter,
        page: page || "1",
        limit: limit || "10",
        options: {
          sort: SORT_MAP[sort || "newest"] || { updatedAt: -1 },
          populate: [
            { path: "category", select: "name slug icon" },
            { path: "owner", select: "username email phone role" },
            { path: "agent", select: "username email phone role" },
          ],
        },
      }),
      this.getStatusCounts(baseFilter),
    ]);

    const docs = (paginated as any).docs || (paginated as any).data || [];
    const dataWithActions = docs.map((item: any) => {
      const doc = item.toObject ? item.toObject() : { ...item };
      doc.allowedActions = {
        canEdit: [
          PropertyStatusEnum.DRAFT,
          PropertyStatusEnum.REJECTED,
          PropertyStatusEnum.PUBLISHED,
          PropertyStatusEnum.CHANGE_REQUIRED,
        ].includes(doc.status),
        canSubmit: [
          PropertyStatusEnum.DRAFT,
          PropertyStatusEnum.REJECTED,
        ].includes(doc.status),
        canDelete: true,
      };
      return doc;
    });

    return {
      ...paginated,
      data: dataWithActions,
      docs: dataWithActions,
      statusCounts,
    };
  }

  ////////////////////////////////////////////////////////////// review step
  async getReview(id: string, viewer: { id: string; role: RoleEnum }) {
    const property = await this.propertyRepo.findOne({
      filter: { _id: new Types.ObjectId(id) },
      options: {
        populate: [
          { path: "category", select: "name slug icon" },
          { path: "owner", select: "username email phone role" },
          { path: "agent", select: "username email phone role licenseNumber agencyName" },
        ],
      },
    });
    if (!property) throw new NotFoundException("Property not found");
    if (!this.isAuthorizedManager(property, viewer.id, viewer.role)) {
      throw new ForbiddenException("You can only manage your own listings");
    }

    const missingFields: string[] = [];
    if (!property.title) missingFields.push("title");
    if (!property.description) missingFields.push("description");
    if (!property.category) missingFields.push("category");
    if (!property.price || property.price <= 0) missingFields.push("price");
    if (!property.area || property.area <= 0) missingFields.push("area");
    if (!property.location?.address) missingFields.push("location.address");
    if (!property.location?.city) missingFields.push("location.city");
    if (!property.images || property.images.length === 0) missingFields.push("images");

    return {
      property,
      isComplete: missingFields.length === 0,
      missingFields,
      canSubmit:
        [PropertyStatusEnum.DRAFT, PropertyStatusEnum.REJECTED].includes(property.status) &&
        missingFields.length === 0,
    };
  }

  ////////////////////////////////////////////////////////////// update
  async update(
    id: string,
    requester: { id: string; role: RoleEnum },
    dto: UpdatePropertyDto,
  ): Promise<IProperty> {
    const property = await this.propertyRepo.findOne({
      filter: { _id: new Types.ObjectId(id) },
    });
    if (!property) throw new NotFoundException("Property not found");
    if (!this.isAuthorizedManager(property, requester.id, requester.role)) {
      throw new ForbiddenException("You can only manage your own listings");
    }

    if (dto.category) {
      const category = await this.categoryRepo.findOne({
        filter: { _id: new Types.ObjectId(dto.category), isActive: true },
        projection: "_id",
        options: { lean: true },
      });
      if (!category) throw new BadRequestException("Invalid or inactive category");
    }

    const data = this.mapEnumFields(dto);

    // A non-admin editing a listing that already went public sends it back
    // for re-review instead of silently changing what was approved.
    if (
      requester.role !== RoleEnum.ADMIN &&
      ![PropertyStatusEnum.DRAFT, PropertyStatusEnum.REJECTED].includes(property.status)
    ) {
      data.status = PropertyStatusEnum.SUBMITTED;
      data.rejectionReason = undefined;
    }

    const updated = await this.propertyRepo.findOneAndUpdate({
      filter: { _id: property._id },
      update: data,
    });
    if (!updated) throw new NotFoundException("Property not found");
    return updated;
  }

  ////////////////////////////////////////////////////////////// submit for review
  async submit(
    id: string,
    requester: { id: string; role: RoleEnum },
  ): Promise<IProperty> {
    const property = await this.propertyRepo.findOne({
      filter: { _id: new Types.ObjectId(id) },
    });
    if (!property) throw new NotFoundException("Property not found");
    if (!this.isAuthorizedManager(property, requester.id, requester.role)) {
      throw new ForbiddenException("You can only manage your own listings");
    }
    if (!OWNER_EDITABLE_STATUSES.includes(property.status)) {
      throw new BadRequestException(
        "Only draft or rejected listings can be submitted for review",
      );
    }

    const missing: string[] = [];
    if (!property.title) missing.push("title");
    if (!property.description) missing.push("description");
    if (!property.price || property.price <= 0) missing.push("price");
    if (!property.area || property.area <= 0) missing.push("area");
    if (!property.location?.city) missing.push("location.city");

    if (missing.length > 0) {
      throw new BadRequestException(
        `Cannot submit incomplete property. Missing fields: ${missing.join(", ")}`,
      );
    }

    const updated = await this.propertyRepo.findOneAndUpdate({
      filter: { _id: property._id },
      update: {
        status: PropertyStatusEnum.SUBMITTED,
        $unset: { rejectionReason: 1 },
      },
    });

    try {
      await this.notificationRepo.createOne({
        data: {
          recipient: property.owner,
          type: "property_under_review",
          title: "Property Submitted for Review",
          body: `Your property "${property.title}" has been submitted for review.`,
          isRead: false,
          target: { kind: "property", id: property._id.toString() },
        },
      });
    } catch {}

    return updated as IProperty;
  }

  ////////////////////////////////////////////////////////////// set cover image
  async setCoverImage(
    id: string,
    requester: { id: string; role: RoleEnum },
    imageUrl: string,
  ): Promise<IProperty> {
    const property = await this.propertyRepo.findOne({
      filter: { _id: new Types.ObjectId(id) },
    });
    if (!property) throw new NotFoundException("Property not found");
    if (!this.isAuthorizedManager(property, requester.id, requester.role)) {
      throw new ForbiddenException("You can only manage your own listings");
    }

    if (!property.images || !property.images.includes(imageUrl)) {
      throw new BadRequestException("The specified image does not belong to this property");
    }

    const updated = await this.propertyRepo.findOneAndUpdate({
      filter: { _id: property._id },
      update: { coverImage: imageUrl },
    });
    return updated as IProperty;
  }

  ////////////////////////////////////////////////////////////// remove all images
  async removeAllImages(
    id: string,
    requester: { id: string; role: RoleEnum },
  ): Promise<IProperty> {
    const property = await this.propertyRepo.findOne({
      filter: { _id: new Types.ObjectId(id) },
      projection: "+imagePublicIds",
    });
    if (!property) throw new NotFoundException("Property not found");
    if (!this.isAuthorizedManager(property, requester.id, requester.role)) {
      throw new ForbiddenException("You can only manage your own listings");
    }

    if (property.imagePublicIds?.length) {
      await deleteManyFromCloudinary(property.imagePublicIds);
    }

    const updated = await this.propertyRepo.findOneAndUpdate({
      filter: { _id: property._id },
      update: {
        images: [],
        imagePublicIds: [],
        coverImage: null,
      },
    });
    return updated as IProperty;
  }

  ////////////////////////////////////////////////////////////// assign property
  async assignProperty(
    id: string,
    requester: { id: string; role: RoleEnum },
    clientId: string,
  ): Promise<IProperty> {
    const property = await this.propertyRepo.findOne({
      filter: { _id: new Types.ObjectId(id) },
    });
    if (!property) throw new NotFoundException("Property not found");

    if (requester.role === RoleEnum.AGENT) {
      const relationship = await this.agentClientRepo.findOne({
        filter: {
          agent: new Types.ObjectId(requester.id),
          client: new Types.ObjectId(clientId),
          status: "active",
        },
      });
      if (!relationship) {
        throw new ForbiddenException("Agent is not authorized to manage this client");
      }
      if (!this.isAuthorizedManager(property, requester.id, requester.role)) {
        throw new ForbiddenException("You cannot assign properties you do not manage");
      }
    } else if (requester.role !== RoleEnum.ADMIN) {
      throw new ForbiddenException("Only agents and admins can reassign properties");
    }

    const updated = await this.propertyRepo.findOneAndUpdate({
      filter: { _id: property._id },
      update: {
        owner: new Types.ObjectId(clientId),
        ...(requester.role === RoleEnum.AGENT
          ? { agent: new Types.ObjectId(requester.id) }
          : {}),
      },
    });
    return updated as IProperty;
  }

  ////////////////////////////////////////////////////////////// admin status transitions
  async updateStatus(
    id: string,
    { status, rejectionReason }: UpdatePropertyStatusDto,
  ): Promise<IProperty> {
    if (status === "rejected" && !rejectionReason) {
      throw new BadRequestException("A rejectionReason is required to reject a listing");
    }
    const property = await this.propertyRepo.findOne({
      filter: { _id: new Types.ObjectId(id) },
    });
    if (!property) throw new NotFoundException("Property not found");

    const allowedFrom = STATUS_TRANSITIONS[status];
    if (!allowedFrom || !allowedFrom.includes(property.status)) {
      throw new BadRequestException(
        `Cannot move a listing to "${status}" from its current status`,
      );
    }

    const update: Record<string, any> = {
      status: PropertyStatusMap[status as keyof typeof PropertyStatusMap],
    };
    if (status === "rejected") update.rejectionReason = rejectionReason;
    else update.$unset = { rejectionReason: 1 };

    const updated = await this.propertyRepo.findOneAndUpdate({
      filter: { _id: property._id },
      update,
    });

    try {
      const notifType =
        status === "approved" || status === "published"
          ? "property_approved"
          : status === "rejected"
          ? "property_rejected"
          : "property_updated";

      await this.notificationRepo.createOne({
        data: {
          recipient: property.owner,
          type: notifType,
          title: `Property ${status.toUpperCase()}`,
          body:
            status === "rejected"
              ? `Your property "${property.title}" was rejected: ${rejectionReason}`
              : `Your property "${property.title}" status is now ${status}.`,
          isRead: false,
          target: { kind: "property", id: property._id.toString() },
        },
      });
    } catch {}

    return updated as IProperty;
  }

  ////////////////////////////////////////////////////////////// delete (soft)
  async remove(id: string, requester: { id: string; role: RoleEnum }): Promise<void> {
    const property = await this.propertyRepo.findOne({
      filter: { _id: new Types.ObjectId(id) },
      projection: "+imagePublicIds",
    });
    if (!property) throw new NotFoundException("Property not found");
    if (!this.isAuthorizedManager(property, requester.id, requester.role)) {
      throw new ForbiddenException("You can only manage your own listings");
    }

    await this.propertyRepo.updateOne({
      filter: { _id: property._id },
      update: { deletedAt: new Date() },
    });
  }

  ////////////////////////////////////////////////////////////// images
  async addImages(
    id: string,
    requester: { id: string; role: RoleEnum },
    files: Express.Multer.File[],
  ): Promise<IProperty> {
    if (!files?.length) throw new BadRequestException("No images were provided");

    const property = await this.propertyRepo.findOne({
      filter: { _id: new Types.ObjectId(id) },
    });
    if (!property) throw new NotFoundException("Property not found");
    if (!this.isAuthorizedManager(property, requester.id, requester.role)) {
      throw new ForbiddenException("You can only manage your own listings");
    }
    if ((property.images?.length || 0) + files.length > 15) {
      throw new BadRequestException("A property can have at most 15 images");
    }

    const uploaded = await uploadManyBuffersToCloudinary({ files });
    const urls = uploaded.map((u) => u.secure_url);
    const publicIds = uploaded.map((u) => u.public_id);

    const updated = await this.propertyRepo.findOneAndUpdate({
      filter: { _id: property._id },
      update: {
        $push: { images: { $each: urls }, imagePublicIds: { $each: publicIds } },
        ...(property.coverImage ? {} : { coverImage: urls[0] }),
      },
    });
    return updated as IProperty;
  }

  async removeImage(
    id: string,
    requester: { id: string; role: RoleEnum },
    imageUrl: string,
  ): Promise<IProperty> {
    const property = await this.propertyRepo.findOne({
      filter: { _id: new Types.ObjectId(id) },
      projection: "+imagePublicIds",
    });
    if (!property) throw new NotFoundException("Property not found");
    if (!this.isAuthorizedManager(property, requester.id, requester.role)) {
      throw new ForbiddenException("You can only manage your own listings");
    }

    const index = (property.images || []).indexOf(imageUrl);
    if (index === -1) throw new NotFoundException("Image not found on this property");
    const publicId = (property.imagePublicIds || [])[index];

    if (publicId) await deleteManyFromCloudinary([publicId]);

    const remainingImages = (property.images || []).filter((img) => img !== imageUrl);
    const update: Record<string, any> = {
      $pull: { images: imageUrl, imagePublicIds: publicId },
    };
    if (property.coverImage === imageUrl) {
      update.coverImage = remainingImages[0] || null;
    }

    const updated = await this.propertyRepo.findOneAndUpdate({
      filter: { _id: property._id },
      update,
    });
    return updated as IProperty;
  }

  ////////////////////////////////////////////////////////////// filter metadata for UI / options
  async getFilterMeta() {
    return this.getOptions();
  }

  async getOptions() {
    const [categories, priceRange, cities] = await Promise.all([
      this.categoryRepo.find({ filter: { isActive: true }, options: { lean: true } }),
      this.propertyRepo.aggregate<{ minPrice: number; maxPrice: number }>([
        { $match: { status: { $in: PUBLIC_PROPERTY_STATUSES } } },
        {
          $group: {
            _id: null,
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" },
          },
        },
      ]),
      this.propertyRepo.distinct("location.city", {
        status: { $in: PUBLIC_PROPERTY_STATUSES },
      } as any),
    ]);

    return {
      categories,
      propertyTypes: Object.keys(PropertyTypeMap),
      transactionTypes: Object.keys(TransactionTypeMap),
      furnishingOptions: Object.keys(FurnishingMap),
      priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 },
      cities,
      facilities: [
        "Balcony",
        "Private Garden",
        "Security",
        "Parking",
        "Elevator",
        "Swimming Pool",
        "Gym",
        "Central AC",
        "Maids Room",
        "Pets Allowed",
      ],
      nearbyAmenities: [
        "Metro Station",
        "Shopping Mall",
        "Hospital",
        "School",
        "Supermarket",
        "Public Park",
        "Pharmacy",
        "Restaurants",
        "Mosque",
      ],
      imageLimits: {
        maxImages: 10,
        maxSizeBytes: 5242880,
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      },
    };
  }
}

export default new PropertyService();
