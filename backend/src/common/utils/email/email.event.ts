import { EventEmitter } from "node:events";
import { EmailEnum } from "../../enums";

export const emailEmitter = new EventEmitter();
////// on sending an email for email confirmation
emailEmitter.on(EmailEnum.CONFIRM_EMAIL, async (emailFunction) => {
  try {
    await emailFunction();
  } catch (error) {
    console.error("❌ Failed to send confirmation email:", error);
  }
});
////// on sending an email for forgetting password

emailEmitter.on(EmailEnum.FORGOT_PASSWORD, async (emailFunction) => {
  try {
    await emailFunction();
  } catch (error) {
    console.error("❌ Failed to send forgot password email:", error);
  }
});
////// on sending an email for 2FA
emailEmitter.on(EmailEnum.TWO_STEP_VERIFICATION, async (emailFunction) => {
  try {
    await emailFunction();
  } catch (error) {
    console.error("❌ Failed to send 2FA email:", error);
  }
});
