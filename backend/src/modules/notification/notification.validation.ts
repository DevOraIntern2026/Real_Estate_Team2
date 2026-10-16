import { z } from "zod";
import { generalValidationFields } from "../../common/validation";

export const listNotifications = {
  query: z.strictObject({
    page: z.coerce.string().optional(),
    limit: z.coerce.string().optional(),
    isRead: z.coerce.boolean().optional(),
  }),
};

export const notificationIdParam = {
  params: z.strictObject({
    id: generalValidationFields.id,
  }),
};
