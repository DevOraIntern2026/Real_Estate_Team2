import { z } from 'zod'

export const verifyOtpSchema = z.object({
  code: z.string().regex(/^\d{4}$/, 'Enter the 4-digit verification code.'),
})

export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>
