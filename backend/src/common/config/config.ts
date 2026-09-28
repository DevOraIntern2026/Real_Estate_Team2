import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(`.env.${process.env.NODE_ENV || "dev"}`) });

export const PORT = process.env.PORT;
export const DB_URI = process.env.DB_URI;
export const ENCRYPTION_BYTE = process.env.ENCRYPTION_BYTE;
export const IV_LENGTH = Number(process.env.IV_LENGTH);
export const DUMMY_HASH = process.env.DUMMY_HASH as string;
export const ENCRYPTION_SECRET_KEY = Buffer.from(ENCRYPTION_BYTE as string);
export const GOOGLE_EMAIL = process.env.GOOGLE_EMAIL;
export const GOOGLE_APP_PASSWORD = process.env.GOOGLE_APP_PASSWORD;
export const REDIS_URL = String(process.env.REDIS_URL);
export const CUSTOMER_TOKEN_SECRET_KEY = process.env
  .CUSTOMER_TOKEN_SECRET_KEY as string;
export const OWNER_TOKEN_SECRET_KEY = process.env
  .OWNER_TOKEN_SECRET_KEY as string;
export const ADMIN_TOKEN_SECRET_KEY = process.env
  .ADMIN_TOKEN_SECRET_KEY as string;
export const CUSTOMER_REFRESH_TOKEN_SECRET_KEY = process.env
  .CUSTOMER_REFRESH_TOKEN_SECRET_KEY as string;
export const OWNER_REFRESH_TOKEN_SECRET_KEY = process.env
  .OWNER_REFRESH_TOKEN_SECRET_KEY as string;
export const ADMIN_REFRESH_TOKEN_SECRET_KEY = process.env
  .ADMIN_REFRESH_TOKEN_SECRET_KEY as string;

export const ACCESS_TOKEN_EXPIRATION_TIME =
  process.env.ACCESS_TOKEN_EXPIRATION_TIME;
export const REFRESH_TOKEN_EXPIRATION_TIME =
  process.env.REFRESH_TOKEN_EXPIRATION_TIME;
export const INVITE_SECRET = process.env["INVITE_SECRET"];

// google Signup&Login
export const WEB_CLIENT_ID = process.env.WEB_CLIENT_ID as string;
