import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from "../../config/config";
import { internalServerError } from "../../exceptions";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME as string,
  api_key: CLOUDINARY_API_KEY as string,
  api_secret: CLOUDINARY_API_SECRET as string,
  secure: true,
});

export const PROPERTY_IMAGES_FOLDER = "devora/real-estate/properties";

// Streams a buffer (from multer memory storage) straight to Cloudinary,
// so images never touch the server's disk.
export const uploadBufferToCloudinary = ({
  buffer,
  folder = PROPERTY_IMAGES_FOLDER,
  publicId,
}: {
  buffer: Buffer;
  folder?: string;
  publicId?: string;
}): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
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
            new internalServerError(
              "Failed to upload image to Cloudinary",
              error,
            ),
          );
        }
        return resolve(result);
      },
    );
    uploadStream.end(buffer);
  });
};

export const uploadManyBuffersToCloudinary = async ({
  files,
  folder = PROPERTY_IMAGES_FOLDER,
}: {
  files: Express.Multer.File[];
  folder?: string;
}): Promise<UploadApiResponse[]> => {
  return Promise.all(
    files.map((file) =>
      uploadBufferToCloudinary({ buffer: file.buffer, folder }),
    ),
  );
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    throw new internalServerError(
      "Failed to delete image from Cloudinary",
      error,
    );
  }
};

export const deleteManyFromCloudinary = async (
  publicIds: string[],
): Promise<void> => {
  if (!publicIds.length) return;
  try {
    await cloudinary.api.delete_resources(publicIds, {
      resource_type: "image",
    });
  } catch (error) {
    throw new internalServerError(
      "Failed to delete images from Cloudinary",
      error,
    );
  }
};

export { cloudinary };
