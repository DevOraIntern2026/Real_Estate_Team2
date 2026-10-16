export enum EmailEnum {
  CONFIRM_EMAIL = "Email_confirmation",
  FORGOT_PASSWORD = "Forgot_password",
  TWO_STEP_VERIFICATION = "TFA_verification",
}

export const EmailConfig = {
  Email_confirmation: { title: "Email confirmation" },
  Forgot_password: { title: "Forgot password" },
  TFA_verification: { title: "2FA verification" },
};
