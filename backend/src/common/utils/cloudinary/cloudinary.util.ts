import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
  PORT,
} from "../../config/config";
import { BadRequestException } from "../../exceptions";

export const getCloudinaryConfig = () => {
  const cloud_name =
    process.env.CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME || "";
  const api_key = process.env.CLOUDINARY_API_KEY || CLOUDINARY_API_KEY || "";
  const api_secret =
    process.env.CLOUDINARY_API_SECRET || CLOUDINARY_API_SECRET || "";

  return { cloud_name, api_key, api_secret };
};

export const ensureCloudinaryConfigured = (): void => {
  const { cloud_name, api_key, api_secret } = getCloudinaryConfig();
  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true,
  });
};

ensureCloudinaryConfigured();

export const PROPERTY_IMAGES_FOLDER = "devora/real-estate/properties";

export const isCloudinaryConfigured = (): boolean => {
  const { cloud_name, api_key, api_secret } = getCloudinaryConfig();
  return Boolean(
    cloud_name &&
    api_key &&
    api_secret &&
    !api_secret.includes("<") &&
    api_secret.trim().length > 0,
  );
};

export const verifyCloudinaryConnection = async (): Promise<boolean> => {
  if (!isCloudinaryConfigured()) return false;
  try {
    ensureCloudinaryConfigured();
    const res = await cloudinary.api.ping();
    return res.status === "ok";
  } catch (error) {
    console.error("⚠️ Cloudinary ping check failed:", error);
    return false;
  }
};

export const saveBufferLocally = ({
  buffer,
  folder = PROPERTY_IMAGES_FOLDER,
  originalname,
  mimetype,
}: {
  buffer: Buffer;
  folder?: string | undefined;
  originalname?: string | undefined;
  mimetype?: string | undefined;
}): UploadApiResponse => {
  let ext = ".jpg";
  if (originalname && path.extname(originalname)) {
    ext = path.extname(originalname).toLowerCase();
  } else if (mimetype) {
    if (mimetype.includes("png")) ext = ".png";
    else if (mimetype.includes("webp")) ext = ".webp";
    else if (mimetype.includes("jpeg") || mimetype.includes("jpg"))
      ext = ".jpg";
  } else if (buffer && buffer.length > 4) {
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      ext = ".png";
    } else if (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46
    ) {
      ext = ".webp";
    }
  }

  const cleanFolder = folder.replace(/^[/\\]+|[/\\]+$/g, "");
  const uploadDir = path.resolve(process.cwd(), "uploads", cleanFolder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
  const fileName = `${uniqueSuffix}${ext}`;
  const filePath = path.join(uploadDir, fileName);

  fs.writeFileSync(filePath, buffer);

  const relativeFolder = cleanFolder.replace(/\\/g, "/");
  const relativeUrl = `/uploads/${relativeFolder}/${fileName}`;
  const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
  const fullUrl = `${baseUrl}${relativeUrl}`;
  const relativeId = `${relativeFolder}/${fileName}`;

  return {
    public_id: `local:${relativeId}`,
    secure_url: fullUrl,
    url: fullUrl,
};

// Streams a buffer straight to Cloudinary, with optional fallback only if ALLOW_LOCAL_UPLOADS=true
export const uploadBufferToCloudinary = async ({
  buffer,
  folder = PROPERTY_IMAGES_FOLDER,
  publicId,
  originalname,
  mimetype,
}: {
  buffer: Buffer;
  folder?: string | undefined;
  publicId?: string | undefined;
  originalname?: string | undefined;
  mimetype?: string | undefined;
}): Promise<UploadApiResponse> => {
  ensureCloudinaryConfigured();

  if (!isCloudinaryConfigured()) {
    if (process.env.ALLOW_LOCAL_UPLOADS === "true") {
      console.info(
        `ℹ️ Cloudinary credentials not configured or incomplete. Saving image locally to uploads/${folder}...`,
      );
      return saveBufferLocally({ buffer, folder, originalname, mimetype });
    }
    throw new BadRequestException(
      "Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing or incomplete. Please configure them in your environment.",
    );
  }

  try {
    return await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [{ width: 1600, height: 1200, crop: "limit" }],
          ...(publicId ? { public_id: publicId } : {}),
        },
        (error, result) => {
          if (error || !result) {
            return reject(
              error || new Error("Failed to upload image to Cloudinary"),
            );
          }
          return resolve(result);
        },
      );
      uploadStream.end(buffer);
    });
  } catch (error: any) {
    if (process.env.ALLOW_LOCAL_UPLOADS === "true") {
      console.warn(
        `⚠️ Cloudinary upload failed (${error?.message || "Unknown error"}). Falling back to local uploads/ storage.`,
      );
      return saveBufferLocally({ buffer, folder, originalname, mimetype });
    }
    throw new BadRequestException(
      `Failed to upload image to Cloudinary: ${error?.message || "Unknown error"}`,
    );
  }
};

export const uploadManyBuffersToCloudinary = async ({
  files,
  folder = PROPERTY_IMAGES_FOLDER,
}: {
  files: Express.Multer.File[];
  folder?: string | undefined;
}): Promise<UploadApiResponse[]> => {
  return Promise.all(
    files.map((file) =>
      uploadBufferToCloudinary({
        buffer: file.buffer,
        folder,
        originalname: file.originalname,
        mimetype: file.mimetype,
      }),
    ),
  );
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  if (!publicId) return;

  if (publicId.startsWith("local:")) {
    try {
      const relativePath = publicId.replace(/^local:/, "");
      const fullPath = path.resolve(process.cwd(), "uploads", relativePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.warn("⚠️ Failed to delete local image:", error);
    }
    return;
  }

  ensureCloudinaryConfigured();
  if (isCloudinaryConfigured()) {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    } catch (error) {
      console.warn("⚠️ Failed to delete image from Cloudinary:", error);
    }
  }
};

export const deleteManyFromCloudinary = async (
  publicIds: string[],
): Promise<void> => {
  if (!publicIds?.length) return;

  const localIds = publicIds.filter((id) => id.startsWith("local:"));
  const remoteIds = publicIds.filter((id) => !id.startsWith("local:"));

  for (const id of localIds) {
    await deleteFromCloudinary(id);
  }

  ensureCloudinaryConfigured();
  if (remoteIds.length && isCloudinaryConfigured()) {
    try {
      await cloudinary.api.delete_resources(remoteIds, {
        resource_type: "image",
      });
    } catch (error) {
      console.warn("⚠️ Failed to delete images from Cloudinary:", error);
    }
  }
};

export { cloudinary };
