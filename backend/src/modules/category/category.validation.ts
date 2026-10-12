import { z } from "zod";
import { generalValidationFields } from "../../common/validation";

export const createCategory = {
  body: z.strictObject({
    name: z
      .string({ error: "Category name is required" })
      .min(2, { error: "Minimum characters are 2" })
      .max(50, { error: "Max characters are 50" }),
    description: z.string().max(300).optional(),
    icon: z.string().optional(),
    image: z.string().optional(),
  }),
};

export const updateCategory = {
  params: z.strictObject({
    id: generalValidationFields.id,
  }),
  body: createCategory.body
    .safeExtend({
      isActive: z.coerce.boolean().optional(),
    })
    .partial()
    .refine((body) => Object.keys(body).length > 0, {
      error: "At least one field must be provided to update",
    }),
};

export const categoryIdParam = {
  params: z.strictObject({
    id: generalValidationFields.id,
  }),
};

export const listCategories = {
  query: z.strictObject({
    page: z.coerce.string().optional(),
    limit: z.coerce.string().optional(),
    search: z.string().optional(),
    isActive: z.coerce.boolean().optional(),
  }),
};
