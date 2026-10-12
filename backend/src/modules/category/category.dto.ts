import { z } from "zod";
import {
  createCategory,
  listCategories,
  updateCategory,
} from "./category.validation";

export type CreateCategoryDto = z.infer<typeof createCategory.body>;
export type UpdateCategoryDto = z.infer<typeof updateCategory.body>;
export type ListCategoriesDto = z.infer<typeof listCategories.query>;
