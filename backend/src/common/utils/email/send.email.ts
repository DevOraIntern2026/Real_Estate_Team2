import nodemailer from "nodemailer";
import { GOOGLE_APP_PASSWORD, GOOGLE_EMAIL } from "../../config/config";
import Mail from "nodemailer/lib/mailer";
import { BadRequestException } from "../../exceptions";

export const generateOTP = () => {
  return Math.floor(Math.random() * 900000 + 100000);
};
export const sendEmail = async ({
  to,
  cc,
  bcc,
  subject,
  html,
  text,
  attachments = [],
}: Mail.Options): Promise<void> => {
  if (!to && !cc && !bcc) {
    throw new BadRequestException("Invalid recipient");
  }

  if (!GOOGLE_EMAIL || !GOOGLE_APP_PASSWORD) {
    console.warn(
      `⚠️ [EMAIL] GOOGLE_EMAIL or GOOGLE_APP_PASSWORD is not configured in .env.dev. Skipping SMTP sending.`,
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GOOGLE_EMAIL,
      pass: GOOGLE_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"DevOra Real Estate" <${GOOGLE_EMAIL}>`,
    to,
    cc,
    bcc,
    subject,
    text,
    html,
    attachments,
  });
};
