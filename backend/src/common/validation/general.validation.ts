import { isValidObjectId } from "mongoose";
import { z } from "zod";
export const generalValidationFields = {
  id: z.string().refine((id) => {
    return isValidObjectId(id);
  }, "Invalid ID"),
  username: z.coerce
    .string({ error: "Make sure to include a valid username" })
    .min(2, { error: "Minimum characters are 2" })
    .max(25, { error: "max characters are 25" }),
  email: z.email({ error: "Make sure to include a valid email address" }),
  password: z
    .string()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,16}$/, {
      error: "Make sure to follow the indicated password pattern",
    }),
  role: z.enum(["1", "2"]).pipe(z.coerce.number()),
  phone: z
    .string("Phone number is required")
    .regex(/^(00201|\+201|01)(0|1|2|5)\d{8}$/, {
      error: "Make sure to enter a valid phone number",
    }),
  // confirmPassword: z.coerce.string(),
  // gender: z
  //   .enum(["male", "female"], {
  //     error: "Gender must be either male or female",
  //   })
  //   .default("male")
  //   .optional(),
  otp: z.string("OTP code is required").regex(/^\d{6}$/, {
    error: "Make sure to enter a valid OTP code",
  }),
  file: function (mimeType: string[]) {
    return z
      .strictObject({
        fieldname: z.string(),
        originalname: z.string(),
        encoding: z.string(),
        mimetype: z.enum(mimeType),
        buffer: z.any().optional(),
        path: z.string().optional(),
        size: z.number(),
      })
      .superRefine((args, ctx) => {
        if (!args.path && !args.buffer) {
          ctx.addIssue({
            code: "custom",
            path: ["buffer"],
            message:
              "Either a path or a buffer is needed in order to upload an attachment",
          });
        }
      });
  },
};

export const paginationValidationSchema = {
  query: z.strictObject({
    page: z.coerce.string().optional(),
    limit: z.coerce.string().optional(),
    search: z.string().optional(),
  }),
};

export type PaginateDTO = z.infer<typeof paginationValidationSchema.query>;
