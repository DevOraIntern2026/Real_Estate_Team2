import { z } from 'zod'

export const signUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Full name is required.')
    .min(2, 'Full name must be at least 2 characters.')
    .max(100, 'Full name must be less than 100 characters.'),

  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Enter a valid email address.')
    .max(254, 'Email address is too long.'),

  password: z
    .string()
    .min(1, 'Password is required.')
    .min(8, 'Password must be at least 8 characters.')
    .max(128, 'Password must be less than 128 characters.'),

  role: z.enum(['customer', 'owner'], {
    error: 'Role is required.',
  }),

  termsAccepted: z.boolean().refine((accepted) => accepted, {
    message: 'You must accept the terms and privacy policy.',
  }),
})

export type SignUpFormValues = z.infer<typeof signUpSchema>
