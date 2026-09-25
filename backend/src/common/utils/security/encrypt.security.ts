import crypto from "crypto";
import { ENCRYPTION_SECRET_KEY, IV_LENGTH } from "../../config/config";
import { BadRequestException } from "../../exceptions";

export const encrypt = async (text: string): Promise<string> => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    ENCRYPTION_SECRET_KEY,
    iv,
  );
  let encryptedData = cipher.update(text, "utf-8", "hex");
  encryptedData += cipher.final("hex");
  return `${iv.toString("hex")}:${encryptedData}`;
};
export const decrypt = async (encryptedData: string): Promise<string> => {
  const [iv, encryptedTxt] = encryptedData.split(":");
  if (!iv || !encryptedTxt) {
    throw new BadRequestException("Invalid encryption parts");
  }
  const binaryLikeIv = Buffer.from(iv, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    ENCRYPTION_SECRET_KEY,
    binaryLikeIv,
  );
  let decryptedData = decipher.update(encryptedTxt, "hex", "utf-8");
  decryptedData += decipher.final("utf-8");
  return decryptedData;
};
