import { z } from 'zod';

export const inquiryStatusSchema = z.enum(['pending', 'replied', 'closed']);
export type InquiryStatus = z.infer<typeof inquiryStatusSchema>;

// Property fields mirror the POST /api/properties response
// (title, slug, location, price, currency, transactionType, images).
export const inquirySchema = z.object({
  _id: z.string(),
  status: inquiryStatusSchema,
  createdAt: z.string(),
  property: z.object({
    _id: z.string(),
    slug: z.string(),
    title: z.string(),
    price: z.number().positive(),
    currency: z.string(),
    transactionType: z.enum(['sale', 'rent']),
    images: z.array(z.string()),
    location: z.object({ city: z.string(), country: z.string() }),
  }),
  // Inquiry endpoints are not documented yet — `owner` shape is an assumption.
  owner: z.object({
    _id: z.string(),
    name: z.string(),
    title: z.string(),
    avatar: z.string().optional(),
  }),
});

export type Inquiry = z.infer<typeof inquirySchema>;
export type InquiryFilter = 'all' | InquiryStatus;
export type InquirySort = 'newest' | 'oldest' | 'price_high' | 'price_low';

export interface InquiryQuery {
  status: InquiryFilter;
  search: string;
  sort: InquirySort;
  page: number;
  limit: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
