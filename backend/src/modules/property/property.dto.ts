import { z } from "zod";
import {
  createProperty,
  listProperties,
  myProperties,
  updateProperty,
  updatePropertyStatus,
} from "./property.validation";

export type CreatePropertyDto = z.infer<typeof createProperty.body>;
export type UpdatePropertyDto = z.infer<typeof updateProperty.body>;
export type ListPropertiesDto = z.infer<typeof listProperties.query>;
export type MyPropertiesDto = z.infer<typeof myProperties.query>;
export type UpdatePropertyStatusDto = z.infer<typeof updatePropertyStatus.body>;
