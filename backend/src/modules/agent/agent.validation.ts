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
