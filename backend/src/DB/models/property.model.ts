import { HydratedDocument, Model, model, models, Schema, Types } from "mongoose";
import { IProperty } from "../../common/interfaces";
import {
  FurnishingEnum,
  PropertyStatusEnum,
  PropertyTypeEnum,
  TransactionTypeEnum,
} from "../../common/enums";

const locationSchema = new Schema(
  {
    address: { type: String, required: true, maxLength: 200 },
    city: { type: String, required: true, maxLength: 60 },
    area: { type: String, required: true, maxLength: 60 },
    state: { type: String, maxLength: 60 },
    country: { type: String, required: true, maxLength: 60, default: "Egypt" },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { _id: false },
);

const propertySchema = new Schema<IProperty>(
  {
    title: { type: String, required: true, maxLength: 120, trim: true },
    slug: { type: String, maxLength: 160 },
    description: { type: String, required: true, maxLength: 3000 },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    propertyType: {
      type: Number,
      enum: PropertyTypeEnum,
      required: true,
    },
    transactionType: {
      type: Number,
      enum: TransactionTypeEnum,
      required: true,
    },
    // Business rule: price must be greater than zero
    price: { type: Number, required: true, min: [1, "Price must be greater than zero"] },
    currency: { type: String, default: "EGP", maxLength: 5 },
    area: { type: Number, required: true, min: 1 },
    bedrooms: { type: Number, min: 0 },
    bathrooms: { type: Number, min: 0 },
    floor: { type: Number },
    furnishing: { type: Number, enum: FurnishingEnum },
    amenities: { type: [String], default: [] },
    location: { type: locationSchema, required: true },
    images: { type: [String], default: [] },
    imagePublicIds: { type: [String], default: [], select: false },
    coverImage: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    agent: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: Number,
      enum: PropertyStatusEnum,
      default: PropertyStatusEnum.DRAFT,
    },
    rejectionReason: { type: String, maxLength: 300 },
    feedback: { type: String, maxLength: 1000 },
    views: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    publishedAt: { type: Date },
    submittedAt: { type: Date },
    code: { type: String, trim: true },
    priceUnit: { type: String, default: "month" },
    buildingAgeYears: { type: Number },
    facilities: { type: [String], default: [] },
    nearby: { type: [String], default: [] },
    paranoid: { type: Boolean, default: false },
    deletedAt: { type: Date },
    restoredAt: { type: Date },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    collection: "Properties",
  },
);

//////////////////////////// Indexes for search & filter performance
propertySchema.index({
  title: "text",
  description: "text",
  "location.city": "text",
  "location.area": "text",
  "location.address": "text",
});
propertySchema.index({ status: 1, transactionType: 1, propertyType: 1 });
propertySchema.index({ category: 1, status: 1 });
propertySchema.index({ owner: 1 });
propertySchema.index({ agent: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ code: 1 });
propertySchema.index({ "location.city": 1, "location.area": 1 });

propertySchema.pre(
  "save",
  async function (this: HydratedDocument<IProperty>) {
    if (!this.code) {
      this.code = `DEV-${(this._id as Types.ObjectId).toString().slice(-4).toUpperCase()}`;
    }
    if (!this.submittedAt) {
      this.submittedAt = this.createdAt || new Date();
    }
    if (this.isModified("title") || !this.slug) {
      this.slug =
        this.title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") +
        "-" +
        new Types.ObjectId().toString().slice(-6);
    }
    if (
      this.isModified("status") &&
      this.status === PropertyStatusEnum.PUBLISHED &&
      !this.publishedAt
    ) {
      this.publishedAt = new Date();
    }
    if (!this.coverImage && this.images && this.images.length && this.images[0]) {
      this.coverImage = this.images[0];
    }
  },
);

//////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////// Query middlewares (soft delete)
//////////////////////// Find
propertySchema.pre(["findOne", "find"], function () {
  const query = this.getFilter();
  if (query.paranoid === false) {
    this.setQuery({ ...query });
    return;
  }
  this.setQuery({ ...query, deletedAt: { $exists: false } });
});
//////////////////////// Update
propertySchema.pre(["updateOne", "findOneAndUpdate"], function () {
  const updateQuery = this.getUpdate() as HydratedDocument<IProperty>;
  if (updateQuery?.deletedAt) {
    this.setUpdate({ ...updateQuery, $unset: { restoredAt: 1 } });
  }
  if (updateQuery?.restoredAt) {
    this.setUpdate({ ...updateQuery, $unset: { deletedAt: 1 } });
    this.setQuery({ ...this.getQuery(), deletedAt: { $exists: true } });
  }
  const query = this.getFilter();
  if (query.paranoid === false) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ deletedAt: { $exists: false }, ...query });
  }
});
//////////////////////// Delete
propertySchema.pre(["deleteOne", "findOneAndDelete"], function () {
  const query = this.getFilter();
  if (query.force) {
    this.setQuery({ ...query });
  } else {
    this.setQuery({ deletedAt: { $exists: true }, ...query });
  }
});

export const propertyModel: Model<IProperty> =
  models.Property || model<IProperty>("Property", propertySchema);
