import z from "zod";
import { generalValidationFields } from "../../common/validation";

export const editProfile = {
  body: z.strictObject({
    name: z.string().min(2).max(100).optional(),
    email: generalValidationFields.email.optional(),
    phone: generalValidationFields.phone.optional(),
    location: z.string().max(200).optional(),
    bio: z.string().max(1000).optional(),
    licenseNumber: z.string().max(50).optional(),
    agencyName: z.string().max(100).optional(),
  }),
};
