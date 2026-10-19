import { z } from "zod";
import { generalValidationFields } from "../../common/validation";

export const listCustomerInquiries = {
  query: z.strictObject({
    status: z.enum(["all", "pending", "replied", "closed", "new", "responded"]).optional(),
    search: z.string().optional(),
    sort_by: z.enum(["newest", "oldest", "price_high", "price_low"]).optional(),
    page: z.coerce.string().optional(),
    limit: z.coerce.string().optional(),
  }),
};

export const createCustomerInquiry = {
  body: z.strictObject({
    propertyId: generalValidationFields.id,
    message: z.string().min(5).max(2000),
    customerName: z.string().min(2).max(100).optional(),
    customerEmail: z.string().email().optional(),
    customerPhone: z.string().min(7).max(50).optional(),
  }),
};

export const chatIdParam = {
  params: z.strictObject({
    chat_id: generalValidationFields.id,
  }),
};

export const sendCustomerMessage = {
  params: z.strictObject({
    chat_id: generalValidationFields.id,
  }),
  body: z
    .strictObject({
      text: z.string().min(1).max(2000).optional(),
      text_content: z.string().min(1).max(2000).optional(),
    })
    .refine((data) => Boolean(data.text || data.text_content), {
      message: "Message text or text_content is required",
    }),
};

export const inquiryIdParam = {
  params: z.strictObject({
    id: generalValidationFields.id,
  }),
};
