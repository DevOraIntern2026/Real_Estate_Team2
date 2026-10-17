import { z } from 'zod';

export const profileSchema = z.object({
  firstName: z.string().trim().min(2, 'First name is required'),
  lastName: z.string().trim().min(2, 'Last name is required'),
  email: z.string().trim().email('Enter a valid email'),
  phone: z.string().trim().regex(/^[0-9 ]{8,15}$/, 'Enter a valid phone number'),
  gender: z.enum(['male', 'female']).optional(),
  country: z.string().optional(),
  address: z.string().trim().min(3, 'Address is required'),
  zipCode: z.string().trim().min(3, 'Zip code is required'),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
