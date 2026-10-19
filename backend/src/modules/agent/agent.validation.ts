import { z } from "zod";
import { generalValidationFields } from "../../common/validation";

export const addClient = {
  body: z.strictObject({
    clientId: generalValidationFields.id.optional(),
    email: z.string().email().optional(),
    name: z.string().min(2).max(100).optional(),
    phone: z.string().min(7).max(20).optional(),
    notes: z.string().max(500).optional(),
  }),
};

export const listClients = {
  query: z.strictObject({
    page: z.coerce.string().optional(),
    limit: z.coerce.string().optional(),
    status: z.enum(["active", "inactive"]).optional(),
    q: z.string().optional(),
  }),
};

export const clientIdParam = {
  params: z.strictObject({
    id: generalValidationFields.id,
  }),
};

export const listAgentInquiries = {
  query: z.strictObject({
    status: z.enum(["all", "new", "responded", "closed", "pending", "replied"]).optional(),
    search: z.string().optional(),
    page: z.coerce.string().optional(),
    limit: z.coerce.string().optional(),
  }),
};

export const agentInquiryIdParam = {
  params: z.strictObject({
    inquiry_id: generalValidationFields.id,
  }),
};

export const agentInquiryReply = {
  params: z.strictObject({
    inquiry_id: generalValidationFields.id,
  }),
  body: z
    .strictObject({
      text_content: z.string().min(1).max(2000).optional(),
      text: z.string().min(1).max(2000).optional(),
    })
    .refine((data) => Boolean(data.text_content || data.text), {
      message: "text_content or text is required",
    }),
};
