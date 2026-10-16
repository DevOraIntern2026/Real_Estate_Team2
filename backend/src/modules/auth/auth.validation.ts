import { z } from "zod";
import { generalValidationFields } from "../../common/validation";

export const resendConfirmationEmail = {
  body: z.strictObject({
    email: generalValidationFields.email,
  }),
};

export const login = {
  body: z.strictObject({
    email: z.email({
      error: "Email is required",
    }),
    password: z.string({
      error: "Password is required",
    }),
  }),
};
export const signup = {
  body: z
    .strictObject({
      username: generalValidationFields.username,
      email: generalValidationFields.email,
      password: generalValidationFields.password,
      phone: generalValidationFields.phone.optional(),
      confirmPassword: generalValidationFields.confirmPassword,
      gender: generalValidationFields.gender,
      // Public signup can only self-select these three roles; ADMIN accounts
      // are never created through this endpoint.
      role: z
        .enum(["customer", "owner", "agent"], {
          error: "Role must be one of customer, owner or agent",
        })
        .default("customer"),
    })
    .refine(
      // for multiple logic we use superRefine instead
      (inputs) => {
        return inputs.password === inputs.confirmPassword;
      },
      { error: "Make sure that both passwords match" },
    ),
};

export const confirmEmail = {
  body: resendConfirmationEmail.body.safeExtend({
    otp: generalValidationFields.otp,
  }),
};
export const gmailTokenAndIss = {
  body: z.strictObject({
    idToken: z.string({
      error: "Gmail id token is required",
    }),
    issuer: z.string({
      error: "Issuer is missing",
    }),
  }),
};

export const verifyPasswordReset = {
  body: confirmEmail.body.safeExtend({
    newPassword: generalValidationFields.password,
  }),
};

export const editProfile = {
  body: z.strictObject({
    name: z.string().min(2).max(100).optional(),
    email: generalValidationFields.email.optional(),
    phone: generalValidationFields.phone.optional(),
    location: z.string().max(200).optional(),
    bio: z.string().max(1000).optional(),
    licenseNumber: z.string().max(50).optional(),
    agencyName: z.string().max(100).optional(),
  }),
};

export const changePassword = {
  body: z
    .strictObject({
      currentPassword: z.string().min(1, { error: "Current password is required" }),
      newPassword: z
        .string()
        .min(8, { error: "Password must be at least 8 characters long" })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,30}$/, {
          error:
            "Password must contain uppercase, lowercase, number and special character",
        }),
      confirmPassword: z.string().min(1, { error: "Confirm password is required" }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      error: "New password and confirm password do not match",
      path: ["confirmPassword"],
    }),
};

export const logout = {
  body: z.object({
    refreshToken: z.string().optional(),
  }).optional(),
};

export const refreshToken = {
  body: z.strictObject({
    refreshToken: z.string({ error: "Refresh token is required" }),
  }),
};
