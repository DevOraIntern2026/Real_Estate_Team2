import { z } from "zod";

export const searchProperties = z.object({
  search: z.string().trim().optional(),
  transactionType: z.string().optional(),
  city: z.string().trim().optional(),
  area: z.string().trim().optional(),
  propertyType: z.string().optional(),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  minArea: z.string().optional(),
  maxArea: z.string().optional(),
  furnishing: z.string().optional(),
  amenities: z.union([z.string(), z.array(z.string())]).optional(),
  sort: z.enum(["newest", "oldest", "price_asc", "price_desc"]).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});