import { z } from "zod";
import { generalValidationFields } from "../../common/validation";
import {
  FurnishingMap,
  PropertyStatusMap,
  PropertyTypeMap,
  TransactionTypeMap,
} from "../../common/enums";

const locationSchema = z.strictObject({
  address: z.string().min(3).max(200),
  city: z.string().min(2).max(60),
  area: z.string().min(2).max(60),
  state: z.string().max(60).optional(),
  country: z.string().min(2).max(60).default("Egypt"),
  coordinates: z
    .strictObject({
      lat: z.coerce.number().min(-90).max(90),
      lng: z.coerce.number().min(-180).max(180),
    })
    .optional(),
});

export const createProperty = {
  body: z.strictObject({
    title: z.string().min(5, { error: "Title must be at least 5 characters" }).max(120),
    description: z
      .string()
      .min(20, { error: "Description must be at least 20 characters" })
      .max(3000),
    category: generalValidationFields.id,
    propertyType: z.enum(Object.keys(PropertyTypeMap) as [string, ...string[]], {
      error: `propertyType must be one of ${Object.keys(PropertyTypeMap).join(", ")}`,
    }),
    transactionType: z.enum(
      Object.keys(TransactionTypeMap) as [string, ...string[]],
      { error: "transactionType must be either sale or rent" },
    ),
    // Business rule: price must be greater than zero
    price: z.coerce.number().positive({ error: "Price must be greater than zero" }),
    currency: z.string().max(5).optional(),
    area: z.coerce.number().positive({ error: "Area must be greater than zero" }),
    bedrooms: z.coerce.number().int().min(0).optional(),
    bathrooms: z.coerce.number().int().min(0).optional(),
    floor: z.coerce.number().int().optional(),
    furnishing: z
      .enum(Object.keys(FurnishingMap) as [string, ...string[]])
      .optional(),
    amenities: z.array(z.string().max(40)).max(30).optional(),
    location: locationSchema,
  }),
};

export const updateProperty = {
  params: z.strictObject({ id: generalValidationFields.id }),
  body: createProperty.body
    .partial()
    .refine((body) => Object.keys(body).length > 0, {
      error: "At least one field must be provided to update",
    }),
};

export const propertyIdParam = {
  params: z.strictObject({ id: generalValidationFields.id }),
};

export const listProperties = {
  query: z.strictObject({
    page: z.coerce.string().optional(),
    limit: z.coerce.string().optional(),
    search: z.string().optional(),
    category: generalValidationFields.id.optional(),
    propertyType: z
      .enum(Object.keys(PropertyTypeMap) as [string, ...string[]])
      .optional(),
    transactionType: z
      .enum(Object.keys(TransactionTypeMap) as [string, ...string[]])
      .optional(),
    furnishing: z
      .enum(Object.keys(FurnishingMap) as [string, ...string[]])
      .optional(),
    city: z.string().optional(),
    area: z.string().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    minArea: z.coerce.number().nonnegative().optional(),
    maxArea: z.coerce.number().positive().optional(),
    bedrooms: z.coerce.number().int().min(0).optional(),
    bathrooms: z.coerce.number().int().min(0).optional(),
    isFeatured: z.coerce.boolean().optional(),
    sort: z
      .enum(["newest", "oldest", "price_asc", "price_desc", "most_viewed"])
      .optional(),
  }),
};

export const myProperties = {
  query: z.strictObject({
    page: z.coerce.string().optional(),
    limit: z.coerce.string().optional(),
    status: z
      .enum(Object.keys(PropertyStatusMap) as [string, ...string[]])
      .optional(),
  }),
};

export const updatePropertyStatus = {
  params: z.strictObject({ id: generalValidationFields.id }),
  body: z.strictObject({
    status: z.enum(["approved", "published", "rejected", "inactive", "sold", "rented"], {
      error: "Invalid status transition",
    }),
    rejectionReason: z.string().max(300).optional(),
  }),
};

export const deletePropertyImage = {
  params: z.strictObject({ id: generalValidationFields.id }),
  body: z.strictObject({
    imageUrl: z.url({ error: "A valid imageUrl is required" }),
  }),
};
