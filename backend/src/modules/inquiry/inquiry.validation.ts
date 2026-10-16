import { z } from "zod";
import { generalValidationFields } from "../../common/validation";

export const createInquiry = {
  body: z.strictObject({
    propertyId: generalValidationFields.id,
    customerName: z.string().min(2).max(100),
    customerEmail: z.string().email(),
    customerPhone: z.string().min(7).max(20),
    message: z.string().min(5).max(2000),
  }),
};

export const listInquiries = {
  query: z.strictObject({
    page: z.coerce.string().optional(),
    limit: z.coerce.string().optional(),
    status: z.enum(["new", "responded", "closed"]).optional(),
    propertyId: generalValidationFields.id.optional(),
    ownerId: generalValidationFields.id.optional(),
    q: z.string().optional(),
  }),
};

export const inquiryIdParam = {
  params: z.strictObject({
    id: generalValidationFields.id,
  }),
};

export const sendMessage = {
  params: z.strictObject({
    id: generalValidationFields.id,
  }),
  body: z.strictObject({
    text: z.string().min(1, { error: "Message text cannot be empty" }).max(2000),
  }),
};

export const updateInquiryStatus = {
  params: z.strictObject({
    id: generalValidationFields.id,
  }),
  body: z.strictObject({
    status: z.enum(["new", "responded", "closed"]),
  }),
};
