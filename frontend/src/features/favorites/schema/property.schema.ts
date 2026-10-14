import { z } from 'zod';

/**
 * Enums follow POST /api/properties. The create request sends strings,
 * but the response returns numeric indexes (propertyType: 0, status: 0...).
 * `fromEnum` accepts either, so the same schema works for both.
 * NOTE: the index order below is an assumption — confirm with Backend 2/3.
 */
export const PROPERTY_TYPES = ['apartment', 'villa', 'house', 'townhouse', 'studio', 'duplex', 'land', 'office'] as const;
export const TRANSACTION_TYPES = ['sale', 'rent'] as const;
export const FURNISHING = ['furnished', 'semi_furnished', 'unfurnished'] as const;
export const PROPERTY_STATUS = ['draft', 'submitted', 'under_review', 'approved', 'published', 'inactive', 'sold', 'rented'] as const;

const fromEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess((v) => (typeof v === 'number' ? values[v] : v), z.enum(values));

export const PropertySchema = z.object({
  _id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  propertyType: fromEnum(PROPERTY_TYPES),
  transactionType: fromEnum(TRANSACTION_TYPES),
  price: z.number().positive(),
  currency: z.string().default('EGP'),
  area: z.number().positive(),
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().int().nonnegative(),
  floor: z.number().int().optional(),
  furnishing: fromEnum(FURNISHING),
  amenities: z.array(z.string()),
  location: z.object({
    address: z.string(),
    city: z.string(),
    area: z.string().optional(),
    state: z.string().optional(),
    country: z.string(),
  }),
  images: z.array(z.string()),
  imagePublicIds: z.array(z.string()),
  owner: z.string(),
  status: fromEnum(PROPERTY_STATUS),
  views: z.number().default(0),
  isFeatured: z.boolean().default(false),
  /** Not in the add-property docs — shown on the card in the design. Optional until backend provides it. */
  rating: z.number().min(0).max(5).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Property = z.infer<typeof PropertySchema>;
export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type TransactionType = (typeof TRANSACTION_TYPES)[number];
export type PropertyStatus = (typeof PROPERTY_STATUS)[number];
