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
<<<<<<< HEAD
  body: z.strictObject({
    username: generalValidationFields.username,
    email: generalValidationFields.email,
    role: generalValidationFields.role,
    password: generalValidationFields.password,
    phone: generalValidationFields.phone.optional(),
    // confirmPassword: generalValidationFields.confirmPassword,
    // gender: generalValidationFields.gender,
  }),
  // .refine(
  //   // for multiple logic we use superRefine instead
  //   (inputs) => {
  //     return inputs.password === inputs.confirmPassword;
  //   },
  //   { error: "Make sure that both passwords match" },
  // ),
=======
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
>>>>>>> origin/feature/Admin-Dashboard
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

export const roleValidation = {
  body: z.strictObject({
    idToken: z
      .string({ error: "missing idToken" })
      .nonempty({ error: "missing idToken" }),
    role: generalValidationFields.role,
  }),
};
