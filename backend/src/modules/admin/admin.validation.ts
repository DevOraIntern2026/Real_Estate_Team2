import { z } from "zod";
import { generalValidationFields } from "../../common/validation";

export const paramId = {
  params: z.strictObject({
    id: generalValidationFields.id,
  }),
};

export const overview = {
  query: z.object({
    pendingLimit: z.coerce.string().optional(),
    notificationsLimit: z.coerce.string().optional(),
  }),
};

export const listings = {
  query: z.object({
    status: z.string().optional(),
    transaction: z.enum(["sale", "rent"]).optional(),
    type: z.string().optional(),
    location: z.string().optional(),
    q: z.string().optional(),
    sort: z.string().optional(),
    page: z.coerce.string().optional(),
    limit: z.coerce.string().optional(),
  }),
};

export const approveListing = {
  params: z.strictObject({
    id: generalValidationFields.id,
  }),
  body: z.strictObject({
    propertyType: z.string().min(1, { error: "Property type is required" }),
    category: z.string().min(1, { error: "Category is required" }),
  }),
};

export const rejectListing = {
  params: z.strictObject({
    id: generalValidationFields.id,
  }),
  body: z.strictObject({
    reason: z.string().min(1, { error: "Rejection reason is required" }),
    feedback: z.string().max(1000).optional(),
  }),
};

export const requestChanges = {
  params: z.strictObject({
    id: generalValidationFields.id,
  }),
  body: z.strictObject({
    feedback: z.string().min(1, { error: "Feedback is required" }).max(1000),
  }),
};

export const updateListing = {
  params: z.strictObject({
    id: generalValidationFields.id,
  }),
  body: z.object({
    title: z.string().max(120).optional(),
    description: z.string().max(3000).optional(),
    price: z.number().min(1).optional(),
    priceUnit: z.string().optional(),
    propertyType: z.string().optional(),
    transactionType: z.enum(["sale", "rent"]).optional(),
    category: generalValidationFields.id.optional(),
    facilities: z.array(z.string()).optional(),
    nearby: z.array(z.string()).optional(),
    details: z
      .object({
        bedrooms: z.number().optional(),
        bathrooms: z.number().optional(),
        floor: z.number().optional(),
        buildingAgeYears: z.number().optional(),
        areaSqm: z.number().optional(),
        furnishing: z.string().optional(),
      })
      .optional(),
    location: z
      .object({
        city: z.string().optional(),
        area: z.string().optional(),
        address: z.string().optional(),
        landmark: z.string().optional(),
        lat: z.number().optional(),
        lng: z.number().optional(),
      })
      .optional(),
  }),
};

export const users = {
  query: z.object({
    role: z.enum(["admin", "customer", "owner", "agent"]).optional(),
    status: z.enum(["active", "suspended"]).optional(),
    q: z.string().optional(),
    sort: z.string().optional(),
    page: z.coerce.string().optional(),
    limit: z.coerce.string().optional(),
  }),
};

export const userListings = {
  params: z.strictObject({
    id: generalValidationFields.id,
  }),
  query: z.object({
    page: z.coerce.string().optional(),
    limit: z.coerce.string().optional(),
  }),
};

export const suspendUser = {
  params: z.strictObject({
    id: generalValidationFields.id,
  }),
  body: z.strictObject({
    reason: z.string().max(500).optional(),
  }),
};

export const notifications = {
  query: z.object({
    page: z.coerce.string().optional(),
    limit: z.coerce.string().optional(),
    unreadOnly: z.coerce.string().optional(),
  }),
};

export const reports = {
  query: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }),
};
