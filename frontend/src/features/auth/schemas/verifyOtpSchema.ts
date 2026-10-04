import { z } from 'zod'

export const verifyOtpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit verification code.'),
})

export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>
