import { z } from 'zod'

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, 'New password is required.')
      .min(8, 'Password must be at least 8 characters.')
      .max(16, 'Password must be at most 16 characters.')
      .regex(/[a-z]/, 'Password must include a lowercase letter.')
      .regex(/[A-Z]/, 'Password must include an uppercase letter.')
      .regex(/\d/, 'Password must include a number.')
      .regex(/\W/, 'Password must include a symbol.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
