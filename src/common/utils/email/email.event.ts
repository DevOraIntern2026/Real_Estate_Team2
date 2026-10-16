import { EventEmitter } from "node:events";
import { internalServerError } from "../../exceptions";
import { EmailEnum } from "../../enums";

export const emailEmitter = new EventEmitter();
////// on sending an email for email confirmation
emailEmitter.on(EmailEnum.CONFIRM_EMAIL, async (emailFunction) => {
  try {
    await emailFunction();
  } catch (error) {
    throw new internalServerError("Failed to send verification mail to user");
  }
});
////// on sending an email for forgetting password

emailEmitter.on(EmailEnum.FORGOT_PASSWORD, async (emailFunction) => {
  try {
    await emailFunction();
  } catch (error) {
    throw new internalServerError("Failed to send verification mail to user");
  }
});
////// on sending an email for 2FA
emailEmitter.on(EmailEnum.TWO_STEP_VERIFICATION, async (emailFunction) => {
  try {
    await emailFunction();
  } catch (error) {
    throw new internalServerError("Failed to send verification mail to user");
  }
});
