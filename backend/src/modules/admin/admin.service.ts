import { Types } from "mongoose";
import {
  FurnishingLabel,
  PropertyStatusEnum,
  PropertyStatusLabel,
  PropertyStatusMap,
  PropertyTypeLabel,
  PropertyTypeMap,
  RoleEnum,
  RoleLabel,
  RoleMap,
  TransactionTypeEnum,
  TransactionTypeLabel,
  TransactionTypeMap,
} from "../../common/enums";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "../../common/exceptions";
import { redisService, RedisService } from "../../common/services/redis";
import { decrypt } from "../../common/utils/security";
import {
  CategoryRepo,
  ListingStatusHistoryRepo,
  NotificationRepo,
  PropertyRepo,
  UserRepo,
} from "../../DB/repo";
import {
  ApproveListingDto,
  ListingsQueryDto,
  NotificationsQueryDto,
  OverviewQueryDto,
  RejectListingDto,
  ReportsQueryDto,
  RequestChangesDto,
  SuspendUserDto,
  UsersQueryDto,
} from "./admin.dto";

const capitalize = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

class AdminService {
  private readonly propertyRepo: PropertyRepo;
  private readonly userRepo: UserRepo;
  private readonly categoryRepo: CategoryRepo;
  private readonly notificationRepo: NotificationRepo;
  private readonly statusHistoryRepo: ListingStatusHistoryRepo;
  private readonly redis: RedisService;

  constructor() {
    this.propertyRepo = new PropertyRepo();
    this.userRepo = new UserRepo();
    this.categoryRepo = new CategoryRepo();
    this.notificationRepo = new NotificationRepo();
    this.statusHistoryRepo = new ListingStatusHistoryRepo();
    this.redis = redisService;
  }

  ////////////////////////////////////////////////////////////////////////////////
  // 1) OVERVIEW
  ////////////////////////////////////////////////////////////////////////////////
  async getOverview(query: OverviewQueryDto) {
    const pendingLimit = Math.max(1, parseInt(query.pendingLimit || "5", 10));
    const notificationsLimit = Math.max(
      1,
      parseInt(query.notificationsLimit || "3", 10),
    );

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalListings,
      newUsers30d,
      publishedListings,
      pendingProperties,
      recentNotifications,
      unreadCount,
    ] = await Promise.all([
      this.userRepo
        .aggregate([
          { $match: { deletedAt: { $exists: false } } },
          { $count: "count" },
        ])
        .then((res) => res[0]?.count || 0),
      this.propertyRepo
        .aggregate([
          { $match: { deletedAt: { $exists: false } } },
          { $count: "count" },
        ])
        .then((res) => res[0]?.count || 0),
      this.userRepo
        .aggregate([
          {
            $match: {
              createdAt: { $gte: thirtyDaysAgo },
              deletedAt: { $exists: false },
            },
          },
          { $count: "count" },
        ])
        .then((res) => res[0]?.count || 0),
      this.propertyRepo
        .aggregate([
          {
            $match: {
              status: PropertyStatusEnum.PUBLISHED,
              deletedAt: { $exists: false },
            },
          },
          { $count: "count" },
        ])
        .then((res) => res[0]?.count || 0),
      this.propertyRepo.find({
        filter: {
          status: {
            $in: [
              PropertyStatusEnum.UNDER_REVIEW,
              PropertyStatusEnum.SUBMITTED,
            ],
          },
          deletedAt: { $exists: false },
        },
        options: {
          sort: { submittedAt: -1, createdAt: -1 },
          limit: pendingLimit,
          populate: [{ path: "owner", select: "firstName lastName username role" }],
        },
      }),
      this.notificationRepo.find({
        filter: { deletedAt: { $exists: false } },
        options: {
          sort: { createdAt: -1 },
          limit: notificationsLimit,
        },
      }),
      this.notificationRepo
        .aggregate([
          {
            $match: {
              isRead: false,
              deletedAt: { $exists: false },
            },
          },
          { $count: "count" },
        ])
        .then((res) => res[0]?.count || 0),
    ]);

    const formattedPending = pendingProperties.map((p: any) => {
      const owner = p.owner || {};
      const ownerName =
        owner.username ||
        `${owner.firstName || ""} ${owner.lastName || ""}`.trim() ||
        "Unknown";
      const ownerRole =
        typeof owner.role === "number"
          ? RoleLabel[owner.role] || "agent"
          : "agent";

      return {
        id: p._id.toString(),
        code:
          p.code ||
          `DEV-${p._id.toString().slice(-4).toUpperCase()}`,
        title: p.title,
        thumbnail:
          p.coverImage || (p.images && p.images[0]) || "",
        owner: {
          id: owner._id ? owner._id.toString() : "",
          name: ownerName,
          role: ownerRole,
        },
        propertyType:
          PropertyTypeLabel[p.propertyType as keyof typeof PropertyTypeLabel] ||
          "villa",
        transaction:
          TransactionTypeLabel[
            p.transactionType as keyof typeof TransactionTypeLabel
          ] || "rent",
        area: p.location?.area || p.location?.city || "",
        price: p.price,
        currency: p.currency || "EGP",
        status:
          PropertyStatusLabel[
            p.status as keyof typeof PropertyStatusLabel
          ] || "under_review",
        submittedAt: p.submittedAt || p.createdAt,
      };
    });

    const formattedNotifications = recentNotifications.map((n: any) => ({
      id: n._id.toString(),
      type: n.type,
      title: n.title,
      body: n.body,
      isRead: n.isRead,
      createdAt: n.createdAt,
    }));

    return {
      stats: {
        totalUsers,
        totalListings,
        newUsers30d,
        published: publishedListings,
      },
      pendingListings: formattedPending,
      recentNotifications: formattedNotifications,
      unreadNotifications: unreadCount,
    };
  }

  ////////////////////////////////////////////////////////////////////////////////
  // 2) LISTINGS (TABLE & FILTERS)
  ////////////////////////////////////////////////////////////////////////////////
  async getListings(query: ListingsQueryDto) {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "10", 10)));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { deletedAt: { $exists: false } };

    // Status tab filter
    if (query.status && query.status !== "all") {
      const lowerStatus = query.status.toLowerCase();
      if (lowerStatus === "sold_rented") {
        filter.status = {
          $in: [PropertyStatusEnum.SOLD, PropertyStatusEnum.RENTED],
        };
      } else if (lowerStatus === "under_review") {
        filter.status = {
          $in: [
            PropertyStatusEnum.UNDER_REVIEW,
            PropertyStatusEnum.SUBMITTED,
          ],
        };
      } else if (lowerStatus in PropertyStatusMap) {
        filter.status =
          PropertyStatusMap[lowerStatus as keyof typeof PropertyStatusMap];
      }
    }

    // Transaction filter
    if (query.transaction) {
      const lowerTrans = query.transaction.toLowerCase();
      if (lowerTrans in TransactionTypeMap) {
        filter.transactionType =
          TransactionTypeMap[lowerTrans as keyof typeof TransactionTypeMap];
      }
    }

    // Property Type filter
    if (query.type) {
      const lowerType = query.type.toLowerCase();
      if (lowerType in PropertyTypeMap) {
        filter.propertyType =
          PropertyTypeMap[lowerType as keyof typeof PropertyTypeMap];
      }
    }

    // Location filter
    if (query.location) {
      const locRegex = new RegExp(query.location, "i");
      filter.$or = [
        { "location.city": locRegex },
        { "location.area": locRegex },
        { "location.address": locRegex },
      ];
    }

    // Text search filter (?q=)
    if (query.q) {
      const qRegex = new RegExp(query.q, "i");
      const searchConditions = [
        { title: qRegex },
        { code: qRegex },
        { "location.city": qRegex },
        { "location.area": qRegex },
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    // Sorting
    let sortOption: Record<string, 1 | -1> = { submittedAt: -1, createdAt: -1 };
    if (query.sort) {
      const isDesc = query.sort.startsWith("-");
      const field = isDesc ? query.sort.substring(1) : query.sort;
      sortOption = { [field]: isDesc ? -1 : 1 };
    }

    const [total, docs] = await Promise.all([
      this.propertyRepo
        .aggregate([{ $match: filter }, { $count: "count" }])
        .then((res) => res[0]?.count || 0),
      this.propertyRepo.find({
        filter,
        options: {
          sort: sortOption,
          skip,
          limit,
          populate: [
            { path: "owner", select: "firstName lastName username role email phone" },
          ],
        },
      }),
    ]);

    const data = docs.map((p: any) => {
      const owner = p.owner || {};
      const ownerName =
        owner.username ||
        `${owner.firstName || ""} ${owner.lastName || ""}`.trim() ||
        "Unknown";
      const typeStr =
        PropertyTypeLabel[p.propertyType as keyof typeof PropertyTypeLabel] ||
        "house";
      const transStr =
        TransactionTypeLabel[
          p.transactionType as keyof typeof TransactionTypeLabel
        ] || "rent";

      return {
        id: p._id.toString(),
        code:
          p.code ||
          `DEV-${p._id.toString().slice(-4).toUpperCase()}`,
        title: p.title,
        owner: {
          id: owner._id ? owner._id.toString() : "",
          name: ownerName,
        },
        type: typeStr,
        transaction: transStr,
        typeLabel: `${capitalize(typeStr)}-${capitalize(transStr)}`,
        location: `${p.location?.area ? p.location.area + ", " : ""}${p.location?.city || ""}`.trim(),
        price: p.price,
        priceUnit:
          p.priceUnit ||
          (p.transactionType === TransactionTypeEnum.RENT ? "month" : "total"),
        currency: p.currency || "EGP",
        status:
          PropertyStatusLabel[
            p.status as keyof typeof PropertyStatusLabel
          ] || "under_review",
        submittedAt: p.submittedAt || p.createdAt,
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getListingsCounts() {
    const pipeline = [
      { $match: { deletedAt: { $exists: false } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ];

    const results = await this.propertyRepo.aggregate(pipeline);
    const countMap: Record<number, number> = {};
    let totalAll = 0;

    for (const item of results) {
      countMap[item._id] = item.count;
      totalAll += item.count;
    }

    const underReview =
      (countMap[PropertyStatusEnum.UNDER_REVIEW] || 0) +
      (countMap[PropertyStatusEnum.SUBMITTED] || 0);
    const changeRequired = countMap[PropertyStatusEnum.CHANGE_REQUIRED] || 0;
    const published = countMap[PropertyStatusEnum.PUBLISHED] || 0;
    const rejected = countMap[PropertyStatusEnum.REJECTED] || 0;
    const inactive = countMap[PropertyStatusEnum.INACTIVE] || 0;
    const soldRented =
      (countMap[PropertyStatusEnum.SOLD] || 0) +
      (countMap[PropertyStatusEnum.RENTED] || 0);

    return {
      all: totalAll,
      under_review: underReview,
      change_required: changeRequired,
      published,
      rejected,
      inactive,
      sold_rented: soldRented,
    };
  }

  async getListingsFilters() {
    const types = Object.keys(PropertyTypeMap);
    const transactions = ["sale", "rent"];
    const distinctCities = await this.propertyRepo.distinct("location.city", {
      deletedAt: { $exists: false },
    });

    const locations = distinctCities.filter(Boolean);

    return {
      types,
      transactions,
      locations,
    };
  }

  async getListingsCategories() {
    const categories = await this.categoryRepo.find({
      filter: { isActive: true, deletedAt: { $exists: false } },
      projection: "name slug icon image",
    });

    return categories.map((c: any) => ({
      id: c._id.toString(),
      name: c.name,
      slug: c.slug,
    }));
  }

  ////////////////////////////////////////////////////////////////////////////////
  // 3) PROPERTY DETAILS & ACTIONS
  ////////////////////////////////////////////////////////////////////////////////
  async getListingById(id: string) {
    const property = await this.propertyRepo.findOne({
      filter: { _id: new Types.ObjectId(id) },
      options: {
        populate: [
          { path: "category", select: "name slug" },
          { path: "owner", select: "firstName lastName username email phone role profileImage location" },
        ],
      },
    });

    if (!property) throw new NotFoundException("Listing not found");

    const owner = (property as any).owner || {};
    let ownerPhone = owner.phone;
    if (ownerPhone) {
      try {
        ownerPhone = await decrypt(ownerPhone);
      } catch {
        // Plaintext fallback
      }
    }

    // Images array formatting
    const rawImages = property.images || [];
    const images = rawImages.map((url, index) => ({
      id: `img-${index}`,
      url,
      isCover: url === property.coverImage || index === 0,
      order: index,
    }));

    // Allowed actions calculation based on status
    let allowedActions: string[] = ["edit"];
    const currentStatus = property.status;
    if (
      currentStatus === PropertyStatusEnum.UNDER_REVIEW ||
      currentStatus === PropertyStatusEnum.SUBMITTED
    ) {
      allowedActions = ["approve", "reject", "request_changes", "edit"];
    } else if (currentStatus === PropertyStatusEnum.PUBLISHED) {
      allowedActions = ["deactivate", "edit"];
    } else if (currentStatus === PropertyStatusEnum.INACTIVE) {
      allowedActions = ["reactivate", "edit"];
    } else if (currentStatus === PropertyStatusEnum.CHANGE_REQUIRED) {
      allowedActions = ["approve", "reject", "edit"];
    }

    const typeStr =
      PropertyTypeLabel[
        property.propertyType as keyof typeof PropertyTypeLabel
      ] || "apartment";
    const transStr =
      TransactionTypeLabel[
        property.transactionType as keyof typeof TransactionTypeLabel
      ] || "rent";
    const statusStr =
      PropertyStatusLabel[
        property.status as keyof typeof PropertyStatusLabel
      ] || "under_review";

    return {
      id: property._id.toString(),
      code:
        property.code ||
        `DEV-${property._id.toString().slice(-4).toUpperCase()}`,
      title: property.title,
      status: statusStr,
      submittedAt: property.submittedAt || property.createdAt,
      updatedAt: property.updatedAt || property.createdAt,
      images,
      owner: {
        id: owner._id ? owner._id.toString() : "",
        name:
          owner.username ||
          `${owner.firstName || ""} ${owner.lastName || ""}`.trim() ||
          "Unknown",
        role:
          typeof owner.role === "number"
            ? RoleLabel[owner.role] || "owner"
            : "owner",
        email: owner.email || "",
        phone: ownerPhone || "",
        location: owner.location || "",
        avatar: owner.profileImage || "",
      },
      info: {
        transaction: transStr,
        propertyType: typeStr,
        price: property.price,
        priceUnit:
          property.priceUnit ||
          (property.transactionType === TransactionTypeEnum.RENT
            ? "month"
            : "total"),
        currency: property.currency || "EGP",
      },
      details: {
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        areaSqm: property.area || 0,
        floor: property.floor || 0,
        furnishing:
          property.furnishing !== undefined
            ? FurnishingLabel[
                property.furnishing as keyof typeof FurnishingLabel
              ] || "unfurnished"
            : "unfurnished",
        buildingAgeYears: property.buildingAgeYears || 0,
      },
      location: {
        city: property.location?.city || "",
        address: property.location?.address || "",
        area: property.location?.area || "",
        landmark: "",
        lat: property.location?.coordinates?.lat || 0,
        lng: property.location?.coordinates?.lng || 0,
      },
      facilities: property.facilities || property.amenities || [],
      nearby: property.nearby || [],
      description: property.description || "",
      allowedActions,
    };
  }

  async updateListing(id: string, body: any, adminId: string) {
    const property = await this.propertyRepo.findOne({
      filter: { _id: new Types.ObjectId(id) },
    });
    if (!property) throw new NotFoundException("Listing not found");

    if (body.title) property.title = body.title;
    if (body.description) property.description = body.description;
    if (body.price) property.price = body.price;
    if (body.priceUnit) property.priceUnit = body.priceUnit;

    if (body.propertyType) {
      const lower = body.propertyType.toLowerCase();
      if (lower in PropertyTypeMap) {
        property.propertyType =
          PropertyTypeMap[lower as keyof typeof PropertyTypeMap];
      }
    }
    if (body.transactionType) {
      const lower = body.transactionType.toLowerCase();
      if (lower in TransactionTypeMap) {
        property.transactionType =
          TransactionTypeMap[lower as keyof typeof TransactionTypeMap];
      }
    }
    if (body.category) {
      property.category = new Types.ObjectId(body.category);
    }
    if (body.facilities) property.facilities = body.facilities;
    if (body.nearby) property.nearby = body.nearby;

    if (body.details) {
      if (body.details.bedrooms !== undefined)
        property.bedrooms = body.details.bedrooms;
      if (body.details.bathrooms !== undefined)
        property.bathrooms = body.details.bathrooms;
      if (body.details.floor !== undefined) property.floor = body.details.floor;
      if (body.details.buildingAgeYears !== undefined)
        property.buildingAgeYears = body.details.buildingAgeYears;
      if (body.details.areaSqm !== undefined)
        property.area = body.details.areaSqm;
    }

    if (body.location) {
      property.location = {
        ...property.location,
        ...body.location,
        coordinates: {
          lat: body.location.lat ?? property.location?.coordinates?.lat,
          lng: body.location.lng ?? property.location?.coordinates?.lng,
        },
      };
    }

    await property.save();
    return this.getListingById(id);
  }

  async approveListing(id: string, dto: ApproveListingDto, adminId: string) {
    const property = await this.propertyRepo.findOne({
      filter: { _id: new Types.ObjectId(id) },
    });
    if (!property) throw new NotFoundException("Listing not found");

    if (
      property.status !== PropertyStatusEnum.UNDER_REVIEW &&
      property.status !== PropertyStatusEnum.SUBMITTED &&
      property.status !== PropertyStatusEnum.CHANGE_REQUIRED
    ) {
      throw new ConflictException("Listing is not under review");
    }

    // Verify property type
    const lowerType = dto.propertyType.toLowerCase();
    if (!(lowerType in PropertyTypeMap)) {
      throw new BadRequestException("Invalid property type");
    }

    // Verify category (by ID or slug or name)
    let categoryDoc: any = null;
    if (Types.ObjectId.isValid(dto.category)) {
      categoryDoc = await this.categoryRepo.findOne({
        filter: { _id: new Types.ObjectId(dto.category), isActive: true },
      });
    }
    if (!categoryDoc) {
      categoryDoc = await this.categoryRepo.findOne({
        filter: {
          $or: [{ slug: dto.category.toLowerCase() }, { name: dto.category }],
          isActive: true,
        },
      });
    }
    if (!categoryDoc) {
      throw new BadRequestException("Category not found or inactive");
    }

    const previousStatus =
      PropertyStatusLabel[
        property.status as keyof typeof PropertyStatusLabel
      ] || "under_review";

    property.propertyType =
      PropertyTypeMap[lowerType as keyof typeof PropertyTypeMap];
    property.category = categoryDoc._id;
    property.status = PropertyStatusEnum.PUBLISHED;
    property.publishedAt = new Date();
    delete property.rejectionReason;
    delete property.feedback;
    await property.save();

    // Log history
    await this.statusHistoryRepo.createOne({
      data: {
        listing: property._id,
        fromStatus: previousStatus,
        toStatus: "published",
        admin: new Types.ObjectId(adminId),
      },
    });

    // Notify owner
    await this.notificationRepo.createOne({
      data: {
        recipient: property.owner,
        type: "listing_approved",
        title: "Listing Approved",
        body: `Your listing "${property.title}" has been approved and published.`,
        isRead: false,
        target: { kind: "listing", id: property._id.toString() },
      },
    });

    return {
      id: property._id.toString(),
      status: "published",
      publishedAt: property.publishedAt,
    };
  }

  async rejectListing(id: string, dto: RejectListingDto, adminId: string) {
    const property = await this.propertyRepo.findOne({
      filter: { _id: new Types.ObjectId(id) },
    });
    if (!property) throw new NotFoundException("Listing not found");

    if (
      property.status !== PropertyStatusEnum.UNDER_REVIEW &&
      property.status !== PropertyStatusEnum.SUBMITTED &&
      property.status !== PropertyStatusEnum.CHANGE_REQUIRED
    ) {
      throw new ConflictException("Listing is not under review");
    }

    const previousStatus =
      PropertyStatusLabel[
        property.status as keyof typeof PropertyStatusLabel
      ] || "under_review";

    property.status = PropertyStatusEnum.REJECTED;
    property.rejectionReason = dto.reason;
    if (dto.feedback) property.feedback = dto.feedback;
    await property.save();

    // Log history
    await this.statusHistoryRepo.createOne({
      data: {
        listing: property._id,
        fromStatus: previousStatus,
        toStatus: "rejected",
        admin: new Types.ObjectId(adminId),
        reason: dto.reason,
        feedback: dto.feedback,
      },
    });

    // Notify owner
    await this.notificationRepo.createOne({
      data: {
        recipient: property.owner,
        type: "listing_rejected",
        title: "Listing Rejected",
        body: `Your listing "${property.title}" was rejected. Reason: ${dto.reason}`,
        isRead: false,
        target: { kind: "listing", id: property._id.toString() },
      },
    });

    return {
      id: property._id.toString(),
      status: "rejected",
      rejectionReason: dto.reason,
    };
  }

  async requestChanges(id: string, dto: RequestChangesDto, adminId: string) {
    const property = await this.propertyRepo.findOne({
      filter: { _id: new Types.ObjectId(id) },
    });
    if (!property) throw new NotFoundException("Listing not found");

    if (
      property.status !== PropertyStatusEnum.UNDER_REVIEW &&
      property.status !== PropertyStatusEnum.SUBMITTED
    ) {
      throw new ConflictException("Listing is not under review");
    }

    const previousStatus =
      PropertyStatusLabel[
        property.status as keyof typeof PropertyStatusLabel
      ] || "under_review";

    property.status = PropertyStatusEnum.CHANGE_REQUIRED;
    property.feedback = dto.feedback;
    await property.save();

    // Log history
    await this.statusHistoryRepo.createOne({
      data: {
        listing: property._id,
        fromStatus: previousStatus,
        toStatus: "change_required",
        admin: new Types.ObjectId(adminId),
        feedback: dto.feedback,
      },
    });

    // Notify owner
    await this.notificationRepo.createOne({
      data: {
        recipient: property.owner,
        type: "listing_rejected",
        title: "Changes Required",
        body: `Changes required for "${property.title}": ${dto.feedback}`,
        isRead: false,
        target: { kind: "listing", id: property._id.toString() },
      },
    });

    return {
      id: property._id.toString(),
      status: "change_required",
      feedback: dto.feedback,
    };
  }

  async deactivateListing(id: string, adminId: string) {
    const property = await this.propertyRepo.findOne({
      filter: { _id: new Types.ObjectId(id) },
    });
    if (!property) throw new NotFoundException("Listing not found");

    if (property.status !== PropertyStatusEnum.PUBLISHED) {
      throw new ConflictException("Only published listings can be deactivated");
    }

    property.status = PropertyStatusEnum.INACTIVE;
    await property.save();

    await this.statusHistoryRepo.createOne({
      data: {
        listing: property._id,
        fromStatus: "published",
        toStatus: "inactive",
        admin: new Types.ObjectId(adminId),
      },
    });

    return {
      id: property._id.toString(),
      status: "inactive",
    };
  }

  async reactivateListing(id: string, adminId: string) {
    const property = await this.propertyRepo.findOne({
      filter: { _id: new Types.ObjectId(id) },
    });
    if (!property) throw new NotFoundException("Listing not found");

    if (property.status !== PropertyStatusEnum.INACTIVE) {
      throw new ConflictException("Only inactive listings can be reactivated");
    }

    property.status = PropertyStatusEnum.PUBLISHED;
    await property.save();

    await this.statusHistoryRepo.createOne({
      data: {
        listing: property._id,
        fromStatus: "inactive",
        toStatus: "published",
        admin: new Types.ObjectId(adminId),
      },
    });

    return {
      id: property._id.toString(),
      status: "published",
    };
  }

  ////////////////////////////////////////////////////////////////////////////////
  // 4) USERS MANAGEMENT
  ////////////////////////////////////////////////////////////////////////////////
  async getUsers(query: UsersQueryDto) {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "10", 10)));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { deletedAt: { $exists: false } };

    if (query.role) {
      const lowerRole = query.role.toLowerCase();
      if (lowerRole in RoleMap) {
        filter.role = RoleMap[lowerRole as keyof typeof RoleMap];
      }
    }

    if (query.status) {
      filter.status = query.status.toLowerCase();
    }

    if (query.q) {
      const qRegex = new RegExp(query.q, "i");
      filter.$or = [
        { firstName: qRegex },
        { lastName: qRegex },
        { email: qRegex },
      ];
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (query.sort) {
      const isDesc = query.sort.startsWith("-");
      const field = isDesc ? query.sort.substring(1) : query.sort;
      sortOption = { [field]: isDesc ? -1 : 1 };
    }

    const [total, userDocs, listingsCountAgg] = await Promise.all([
      this.userRepo
        .aggregate([{ $match: filter }, { $count: "count" }])
        .then((res) => res[0]?.count || 0),
      this.userRepo.find({
        filter,
        options: {
          sort: sortOption,
          skip,
          limit,
        },
      }),
      this.propertyRepo.aggregate([
        { $match: { deletedAt: { $exists: false } } },
        { $group: { _id: "$owner", count: { $sum: 1 } } },
      ]),
    ]);

    const countMap: Record<string, number> = {};
    for (const item of listingsCountAgg) {
      if (item._id) countMap[item._id.toString()] = item.count;
    }

    const data = await Promise.all(
      userDocs.map(async (u: any) => {
        let phone = u.phone;
        if (phone) {
          try {
            phone = await decrypt(phone);
          } catch {
            // Plaintext fallback
          }
        }

        const name =
          u.username || `${u.firstName || ""} ${u.lastName || ""}`.trim();
        const roleStr = RoleLabel[u.role] || "customer";

        return {
          id: u._id.toString(),
          name,
          role: roleStr,
          email: u.email,
          phone: phone || "",
          listingsCount: countMap[u._id.toString()] || 0,
          status: u.status || "active",
          joinedAt: u.createdAt,
        };
      }),
    );

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.userRepo.findOne({
      filter: { _id: new Types.ObjectId(id) },
    });
    if (!user) throw new NotFoundException("User not found");

    let phone = user.phone;
    if (phone) {
      try {
        phone = await decrypt(phone);
      } catch {
        // Plaintext fallback
      }
    }

    // Listings summary aggregation
    const ownerId = new Types.ObjectId(id);
    const summaryAgg = await this.propertyRepo.aggregate([
      { $match: { owner: ownerId, deletedAt: { $exists: false } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          published: {
            $sum: {
              $cond: [{ $eq: ["$status", PropertyStatusEnum.PUBLISHED] }, 1, 0],
            },
          },
          pending: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$status",
                    [
                      PropertyStatusEnum.UNDER_REVIEW,
                      PropertyStatusEnum.SUBMITTED,
                      PropertyStatusEnum.CHANGE_REQUIRED,
                    ],
                  ],
                },
                1,
                0,
              ],
            },
          },
          rejected: {
            $sum: {
              $cond: [{ $eq: ["$status", PropertyStatusEnum.REJECTED] }, 1, 0],
            },
          },
          rent: {
            $sum: {
              $cond: [
                { $eq: ["$transactionType", TransactionTypeEnum.RENT] },
                1,
                0,
              ],
            },
          },
          sale: {
            $sum: {
              $cond: [
                { $eq: ["$transactionType", TransactionTypeEnum.SALE] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const summary = summaryAgg[0] || {
      total: 0,
      published: 0,
      pending: 0,
      rejected: 0,
      rent: 0,
      sale: 0,
    };

    return {
      id: user._id.toString(),
      name:
        user.username ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      role: RoleLabel[user.role] || "agent",
      avatar: user.profileImage || "",
      status: user.status || "active",
      email: user.email,
      phone: phone || "",
      location: user.location || "",
      joinedAt: user.createdAt,
      suspendedAt: user.suspendedAt || null,
      listingsSummary: {
        total: summary.total,
        published: summary.published,
        pending: summary.pending,
        rejected: summary.rejected,
        rent: summary.rent,
        sale: summary.sale,
      },
    };
  }

  async getUserListings(userId: string, query: { page?: string; limit?: string }) {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "10", 10)));
    const skip = (page - 1) * limit;

    const filter = {
      owner: new Types.ObjectId(userId),
      deletedAt: { $exists: false },
    };

    const [total, docs] = await Promise.all([
      this.propertyRepo
        .aggregate([{ $match: filter }, { $count: "count" }])
        .then((res) => res[0]?.count || 0),
      this.propertyRepo.find({
        filter,
        options: {
          sort: { createdAt: -1 },
          skip,
          limit,
          populate: [
            { path: "owner", select: "firstName lastName username role" },
          ],
        },
      }),
    ]);

    const data = docs.map((p: any) => {
      const owner = p.owner || {};
      const ownerName =
        owner.username ||
        `${owner.firstName || ""} ${owner.lastName || ""}`.trim() ||
        "Unknown";
      const typeStr =
        PropertyTypeLabel[p.propertyType as keyof typeof PropertyTypeLabel] ||
        "house";
      const transStr =
        TransactionTypeLabel[
          p.transactionType as keyof typeof TransactionTypeLabel
        ] || "rent";

      return {
        id: p._id.toString(),
        code:
          p.code ||
          `DEV-${p._id.toString().slice(-4).toUpperCase()}`,
        title: p.title,
        owner: {
          id: owner._id ? owner._id.toString() : "",
          name: ownerName,
        },
        type: typeStr,
        transaction: transStr,
        typeLabel: `${capitalize(typeStr)}-${capitalize(transStr)}`,
        location: `${p.location?.area ? p.location.area + ", " : ""}${p.location?.city || ""}`.trim(),
        price: p.price,
        priceUnit:
          p.priceUnit ||
          (p.transactionType === TransactionTypeEnum.RENT ? "month" : "total"),
        currency: p.currency || "EGP",
        status:
          PropertyStatusLabel[
            p.status as keyof typeof PropertyStatusLabel
          ] || "under_review",
        submittedAt: p.submittedAt || p.createdAt,
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async activateUser(userId: string) {
    const user = await this.userRepo.findOne({
      filter: { _id: new Types.ObjectId(userId) },
    });
    if (!user) throw new NotFoundException("User not found");

    if (user.status === "active") {
      throw new ConflictException("User is already active");
    }

    await this.userRepo.updateOne({
      filter: { _id: user._id },
      update: {
        status: "active",
        $unset: { suspendedAt: 1, suspensionReason: 1 },
      },
    });

    return {
      id: user._id.toString(),
      status: "active",
    };
  }

  async suspendUser(userId: string, dto: SuspendUserDto, currentAdminId: string) {
    if (userId === currentAdminId) {
      throw new ForbiddenException("Cannot suspend self");
    }

    const user = await this.userRepo.findOne({
      filter: { _id: new Types.ObjectId(userId) },
    });
    if (!user) throw new NotFoundException("User not found");

    const updateData: any = {
      status: "suspended",
      suspendedAt: new Date(),
      changedCredentialsTime: new Date(),
    };
    if (dto.reason) {
      updateData.suspensionReason = dto.reason;
    }

    await this.userRepo.updateOne({
      filter: { _id: user._id },
      update: updateData,
    });

    // Invalidate Redis sessions
    const tokenKeys = await this.redis.redisKeys(
      this.redis.redisBaseRevokeTokenKey(user._id),
    );
    if (tokenKeys.length) await this.redis.redisDelKeys(tokenKeys);

    return {
      id: user._id.toString(),
      status: "suspended",
    };
  }

  ////////////////////////////////////////////////////////////////////////////////
  // 5) NOTIFICATIONS
  ////////////////////////////////////////////////////////////////////////////////
  async getNotifications(query: NotificationsQueryDto) {
    const page = Math.max(1, parseInt(query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "20", 10)));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { deletedAt: { $exists: false } };
    if (query.unreadOnly === "true") {
      filter.isRead = false;
    }

    const [total, docs, unreadCount] = await Promise.all([
      this.notificationRepo
        .aggregate([{ $match: filter }, { $count: "count" }])
        .then((res) => res[0]?.count || 0),
      this.notificationRepo.find({
        filter,
        options: {
          sort: { createdAt: -1 },
          skip,
          limit,
        },
      }),
      this.notificationRepo
        .aggregate([
          { $match: { isRead: false, deletedAt: { $exists: false } } },
          { $count: "count" },
        ])
        .then((res) => res[0]?.count || 0),
    ]);

    const data = docs.map((n: any) => ({
      id: n._id.toString(),
      type: n.type,
      title: n.title,
      body: n.body,
      isRead: n.isRead,
      createdAt: n.createdAt,
      target: n.target,
    }));

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
      unreadCount,
    };
  }

  async getUnreadNotificationsCount() {
    const unreadCount = await this.notificationRepo
      .aggregate([
        { $match: { isRead: false, deletedAt: { $exists: false } } },
        { $count: "count" },
      ])
      .then((res) => res[0]?.count || 0);

    return { unreadCount };
  }

  async markNotificationRead(id: string) {
    const notification = await this.notificationRepo.findOne({
      filter: { _id: new Types.ObjectId(id) },
    });
    if (!notification) throw new NotFoundException("Notification not found");

    if (!notification.isRead) {
      notification.isRead = true;
      await notification.save();
    }

    const { unreadCount } = await this.getUnreadNotificationsCount();

    return {
      id: notification._id.toString(),
      isRead: true,
      unreadCount,
    };
  }

  async markAllNotificationsRead() {
    const result = await this.notificationRepo.updateMany({
      filter: { isRead: false, deletedAt: { $exists: false } },
      update: { isRead: true },
    });

    return {
      updated: result.modifiedCount || 0,
      unreadCount: 0,
    };
  }

  async clearNotifications() {
    await this.notificationRepo.updateMany({
      filter: { deletedAt: { $exists: false } },
      update: { deletedAt: new Date() },
    });
  }

  ////////////////////////////////////////////////////////////////////////////////
  // 6) REPORTS
  ////////////////////////////////////////////////////////////////////////////////
  async getReports(query: ReportsQueryDto) {
    const propFilter: Record<string, any> = { deletedAt: { $exists: false } };
    const userFilter: Record<string, any> = { deletedAt: { $exists: false } };

    if (query.from || query.to) {
      const dateRange: Record<string, any> = {};
      if (query.from) dateRange.$gte = new Date(query.from);
      if (query.to) dateRange.$lte = new Date(query.to);
      propFilter.createdAt = dateRange;
      userFilter.createdAt = dateRange;
    }

    const [propAgg, userAgg] = await Promise.all([
      this.propertyRepo.aggregate([
        { $match: propFilter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            sale: {
              $sum: {
                $cond: [
                  { $eq: ["$transactionType", TransactionTypeEnum.SALE] },
                  1,
                  0,
                ],
              },
            },
            rent: {
              $sum: {
                $cond: [
                  { $eq: ["$transactionType", TransactionTypeEnum.RENT] },
                  1,
                  0,
                ],
              },
            },
            published: {
              $sum: {
                $cond: [
                  { $eq: ["$status", PropertyStatusEnum.PUBLISHED] },
                  1,
                  0,
                ],
              },
            },
            pending: {
              $sum: {
                $cond: [
                  {
                    $in: [
                      "$status",
                      [
                        PropertyStatusEnum.UNDER_REVIEW,
                        PropertyStatusEnum.SUBMITTED,
                        PropertyStatusEnum.CHANGE_REQUIRED,
                      ],
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            rejected: {
              $sum: {
                $cond: [
                  { $eq: ["$status", PropertyStatusEnum.REJECTED] },
                  1,
                  0,
                ],
              },
            },
            inactive: {
              $sum: {
                $cond: [
                  { $eq: ["$status", PropertyStatusEnum.INACTIVE] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
      this.userRepo.aggregate([
        { $match: userFilter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            customers: {
              $sum: {
                $cond: [{ $eq: ["$role", RoleEnum.CUSTOMER] }, 1, 0],
              },
            },
            owners: {
              $sum: {
                $cond: [{ $eq: ["$role", RoleEnum.OWNER] }, 1, 0],
              },
            },
            agents: {
              $sum: {
                $cond: [{ $eq: ["$role", RoleEnum.AGENT] }, 1, 0],
              },
            },
          },
        },
      ]),
    ]);

    const p = propAgg[0] || {
      total: 0,
      sale: 0,
      rent: 0,
      published: 0,
      pending: 0,
      rejected: 0,
      inactive: 0,
    };

    const u = userAgg[0] || {
      total: 0,
      customers: 0,
      owners: 0,
      agents: 0,
    };

    return {
      range: {
        from: query.from || null,
        to: query.to || null,
      },
      transactions: {
        sale: p.sale,
        rent: p.rent,
        total: p.sale + p.rent,
      },
      listings: {
        total: p.total,
        published: p.published,
        pending: p.pending,
        rejected: p.rejected,
        inactive: p.inactive,
      },
      users: {
        customers: u.customers,
        owners: u.owners,
        agents: u.agents,
        total: u.customers + u.owners + u.agents,
      },
    };
  }
}

export default new AdminService();
