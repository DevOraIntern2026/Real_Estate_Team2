import multer, { FileFilterCallback } from "multer";
import type { Request } from "express";
import { BadRequestException } from "../../exceptions";

const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new BadRequestException(
        "Only jpeg, jpg, png and webp images are allowed",
      ),
    );
  }
  cb(null, true);
};

// Memory storage: files are kept as buffers in RAM and streamed straight to
// Cloudinary, never written to local disk.
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per image
    files: 10, // up to 10 images per property
  },
});
