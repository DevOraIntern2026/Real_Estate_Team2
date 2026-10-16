import { HydratedDocument, Types } from "mongoose";
import { PropertyRepo } from "../../DB/repo/property.repo";
import { CategoryRepo } from "../../DB/repo/category.repo";
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
  approved: [PropertyStatusEnum.SUBMITTED, PropertyStatusEnum.UNDER_REVIEW],
  published: [
    PropertyStatusEnum.SUBMITTED,
    PropertyStatusEnum.UNDER_REVIEW,
    PropertyStatusEnum.APPROVED,
  ],
  rejected: [PropertyStatusEnum.SUBMITTED, PropertyStatusEnum.UNDER_REVIEW],
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
];

class PropertyService {
  private readonly propertyRepo: PropertyRepo;
  private readonly categoryRepo: CategoryRepo;

  constructor() {
    this.propertyRepo = new PropertyRepo();
    this.categoryRepo = new CategoryRepo();
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

  private isOwnerOrAdmin(
    property: HydratedDocument<IProperty>,
    userId: string,
    role: RoleEnum,
  ): boolean {
    return role === RoleEnum.ADMIN || property.owner.toString() === userId;
  }

  async AllProperties(dto: ListPropertiesDto): Promise<IPaginate<IProperty>> {
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

  // ---- coerce query strings → typed values ----
  const toNum = (v: unknown): number | undefined => {
    if (v === undefined || v === null || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  const toBool = (v: unknown): boolean | undefined => {
    if (v === undefined || v === null || v === "") return undefined;
    if (typeof v === "boolean") return v;
    const s = String(v).toLowerCase();
    if (s === "true" || s === "1") return true;
    if (s === "false" || s === "0") return false;
    return undefined;
  };

  const pageNum  = toNum(page)  ?? 1;
  const limitNum = toNum(limit) ?? 12;

  const minP   = toNum(minPrice);
  const maxP   = toNum(maxPrice);
  const minA   = toNum(minArea);
  const maxA   = toNum(maxArea);
  const beds   = toNum(bedrooms);
  const baths  = toNum(bathrooms);
  const featured = toBool(isFeatured);

  // ---- build filter: no status restriction, returns everything ----
  const filter: Record<string, any> = {};

  if (search) {
    // If you have a text index, use $text; otherwise regex fallback
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (category) filter.category = new Types.ObjectId(category);

  if (propertyType)
    filter.propertyType =
      PropertyTypeMap[propertyType as keyof typeof PropertyTypeMap];

  if (transactionType)
    filter.transactionType =
      TransactionTypeMap[transactionType as keyof typeof TransactionTypeMap];

  if (furnishing)
    filter.furnishing = FurnishingMap[furnishing as keyof typeof FurnishingMap];

  // location strings
  if (city) filter["location.city"] = new RegExp(city, "i");
  if (area) filter["location.area"] = new RegExp(area, "i");

  // boolean
  if (featured !== undefined) filter.isFeatured = featured;

  // numeric comparisons
  if (beds !== undefined)  filter.bedrooms  = { $gte: beds };
  if (baths !== undefined) filter.bathrooms = { $gte: baths };

  if (minP !== undefined || maxP !== undefined) {
    filter.price = {};
    if (minP !== undefined) filter.price.$gte = minP;
    if (maxP !== undefined) filter.price.$lte = maxP;
  }

  // NOTE: `area` (numeric size) is separate from `location.area` (neighborhood)
  if (minA !== undefined || maxA !== undefined) {
    filter.area = {};
    if (minA !== undefined) filter.area.$gte = minA;
    if (maxA !== undefined) filter.area.$lte = maxA;
  }

  // ---- paginate ----
  return this.propertyRepo.paginate({
    filter,
    page: String(pageNum),
    limit: String(limitNum),
    options: {
      sort: SORT_MAP[sort || "newest"],
      populate: [
        { path: "category", select: "name slug icon" },
        { path: "owner", select: "username email phone role" },
      ],
    },
  });
}

  ////////////////////////////////////////////////////////////// create
  async create(ownerId: string, dto: CreatePropertyDto): Promise<IProperty> {
    const category = await this.categoryRepo.findOne({
      filter: { _id: new Types.ObjectId(dto.category), isActive: true },
      projection: "_id",
      options: { lean: true },
    });
    if (!category) {
      throw new BadRequestException("Invalid or inactive category");
    }

    const data = this.mapEnumFields(dto);
    return this.propertyRepo.createOne({
      data: {
        ...data,
        owner: new Types.ObjectId(ownerId),
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

  ////////////////////////////////////////////////////////////// details
  async getById(
    id: string,
    viewer?: { id: string; role: RoleEnum },
  ): Promise<IProperty> {
    const property = await this.propertyRepo.findOne({
      filter: { _id: new Types.ObjectId(id) },
      options: {
        populate: [
          { path: "category", select: "name slug icon" },
          { path: "owner", select: "username email phone role" },
        ],
      },
    });
    if (!property) throw new NotFoundException("Property not found");

    const isPublic = PUBLIC_PROPERTY_STATUSES.includes(property.status);
    const canSeePrivate = viewer && this.isOwnerOrAdmin(property, viewer.id, viewer.role);
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
    return property;
  }

  ////////////////////////////////////////////////////////////// owner's own listings
  async myProperties(
    ownerId: string,
    { page, limit, status }: MyPropertiesDto,
  ): Promise<IPaginate<IProperty>> {
    const filter: Record<string, any> = { owner: new Types.ObjectId(ownerId) };
    if (status) filter.status = PropertyStatusMap[status as keyof typeof PropertyStatusMap];

    return this.propertyRepo.paginate({
      filter,
      page: page || "1",
      limit: limit || "12",
      options: {
        sort: { createdAt: -1 },
        populate: [{ path: "category", select: "name slug icon" }],
      },
    });
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
    if (!this.isOwnerOrAdmin(property, requester.id, requester.role)) {
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
  async submit(id: string, ownerId: string): Promise<IProperty> {
    const property = await this.propertyRepo.findOne({
      filter: { _id: new Types.ObjectId(id) },
    });
    if (!property) throw new NotFoundException("Property not found");
    if (property.owner.toString() !== ownerId) {
      throw new ForbiddenException("You can only manage your own listings");
    }
    if (!OWNER_EDITABLE_STATUSES.includes(property.status)) {
      throw new BadRequestException(
        "Only draft or rejected listings can be submitted for review",
      );
    }
    const updated = await this.propertyRepo.findOneAndUpdate({
      filter: { _id: property._id },
      update: { status: PropertyStatusEnum.SUBMITTED, $unset: { rejectionReason: 1 } },
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
    return updated as IProperty;
  }

  ////////////////////////////////////////////////////////////// delete (soft)
  async remove(id: string, requester: { id: string; role: RoleEnum }): Promise<void> {
    const property = await this.propertyRepo.findOne({
      filter: { _id: new Types.ObjectId(id) },
      projection: "+imagePublicIds",
    });
    if (!property) throw new NotFoundException("Property not found");
    if (!this.isOwnerOrAdmin(property, requester.id, requester.role)) {
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
    if (!this.isOwnerOrAdmin(property, requester.id, requester.role)) {
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
    if (!this.isOwnerOrAdmin(property, requester.id, requester.role)) {
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

  ////////////////////////////////////////////////////////////// filter metadata for UI
  async getFilterMeta() {
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
    };
  }
}

export default new PropertyService();
