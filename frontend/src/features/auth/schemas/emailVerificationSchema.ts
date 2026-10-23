import { z } from 'zod'

export const emailVerificationSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Enter a valid email address.'),
  otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit verification code.'),
})

export type EmailVerificationFormValues = z.infer<
  typeof emailVerificationSchema
>
