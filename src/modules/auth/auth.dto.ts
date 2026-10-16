import {
  confirmEmail,
  login,
  resendConfirmationEmail,
  signup,
} from "./auth.validation";
import z from "zod";

export type ConfirmEmailDto = z.infer<typeof confirmEmail.body>;
export type resendConfirmationEmailDto = z.infer<
  typeof resendConfirmationEmail.body
>;
export type LoginDto = z.infer<typeof login.body>;
export type SignupDto = z.infer<typeof signup.body>;
