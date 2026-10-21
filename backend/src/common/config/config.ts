import { config } from "dotenv";
import { resolve } from "node:path";

import fs from "node:fs";

const envPath = resolve(`.env.${process.env.NODE_ENV || "dev"}`);
if (fs.existsSync(envPath)) {
  config({ path: envPath });
} else {
  config();
}

export const PORT = process.env.PORT || "3000";
export const DB_URI = process.env.DB_URI || "";
export const ENCRYPTION_BYTE =
  process.env.ENCRYPTION_BYTE || "12345678901234567890123456789012";
export const IV_LENGTH = Number(process.env.IV_LENGTH) || 16;
export const SALT_ROUND = Number(process.env.SALT_ROUND) || 10;
export const DUMMY_HASH =
  (process.env.DUMMY_HASH as string) ||
  "$argon2id$v=19$m=65536,t=3,p=4$dummyhashdummyhash$dummyhashdummyhash";
export const ENCRYPTION_SECRET_KEY = Buffer.from(ENCRYPTION_BYTE);

export const GOOGLE_EMAIL = process.env.GOOGLE_EMAIL || "";
export const GOOGLE_APP_PASSWORD = process.env.GOOGLE_APP_PASSWORD || "";
export const REDIS_URL = String(
  process.env.REDIS_URL || "redis://localhost:6379",
);

export const CUSTOMER_TOKEN_SECRET_KEY =
  (process.env.CUSTOMER_TOKEN_SECRET_KEY as string) ||
  "customer_jwt_secret_dev";
export const OWNER_TOKEN_SECRET_KEY =
  (process.env.OWNER_TOKEN_SECRET_KEY as string) || "owner_jwt_secret_dev";
export const ADMIN_TOKEN_SECRET_KEY =
  (process.env.ADMIN_TOKEN_SECRET_KEY as string) || "admin_jwt_secret_dev";
export const AGENT_TOKEN_SECRET_KEY =
  (process.env.AGENT_TOKEN_SECRET_KEY as string) || "agent_jwt_secret_dev";

export const CUSTOMER_REFRESH_TOKEN_SECRET_KEY =
  (process.env.CUSTOMER_REFRESH_TOKEN_SECRET_KEY as string) ||
  "customer_refresh_secret_dev";
export const OWNER_REFRESH_TOKEN_SECRET_KEY =
  (process.env.OWNER_REFRESH_TOKEN_SECRET_KEY as string) ||
  "owner_refresh_secret_dev";
export const ADMIN_REFRESH_TOKEN_SECRET_KEY =
  (process.env.ADMIN_REFRESH_TOKEN_SECRET_KEY as string) ||
  "admin_refresh_secret_dev";
export const AGENT_REFRESH_TOKEN_SECRET_KEY =
  (process.env.AGENT_REFRESH_TOKEN_SECRET_KEY as string) ||
  "agent_refresh_secret_dev";

export const ACCESS_TOKEN_EXPIRATION_TIME =
  process.env.ACCESS_TOKEN_EXPIRATION_TIME || "1h";
export const REFRESH_TOKEN_EXPIRATION_TIME =
  process.env.REFRESH_TOKEN_EXPIRATION_TIME || "7d";
export const REFRESH_ROTATION_GRACE_SECONDS =
  process.env.REFRESH_ROTATION_GRACE_SECONDS || "30";
export const INVITE_SECRET = process.env.INVITE_SECRET || "invite_secret_dev";

// Google Signup & Login
export const WEB_CLIENT_ID = (process.env.WEB_CLIENT_ID as string) || "";

// Cloudinary
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "";
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "";

// AI Assistant Configuration
export const AI_PROVIDER = process.env.AI_PROVIDER || "gemini";
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
export const AI_MODEL = process.env.AI_MODEL || "gemini-1.5-flash";
export const AI_API_KEY =
  process.env.AI_API_KEY ||
  process.env.OPENROUTER_API_KEY ||
  process.env.OPENAI_API_KEY ||
  "";
export const AI_BASE_URL =
  process.env.AI_BASE_URL || "https://api.openai.com/v1";
export const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS) || 10000;
