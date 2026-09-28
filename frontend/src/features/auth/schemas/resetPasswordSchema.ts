import { z } from 'zod'

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, 'New password is required.')
      .min(8, 'Password must be at least 8 characters.')
      .max(128, 'Password must be less than 128 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
