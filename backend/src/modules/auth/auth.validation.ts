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
