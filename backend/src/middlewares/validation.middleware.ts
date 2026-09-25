import { Request, Response, NextFunction } from "express";
import { ZodError, ZodType } from "zod";
import { BadRequestException } from "../common/exceptions";

type schemaType = Partial<Record<keyRequestType, ZodType>>;
type keyRequestType = keyof Request;
type issuesType = Array<{
  key: keyRequestType;
  issues: Array<{
    message: string;
    path: Array<symbol | number | string | null | undefined>;
  }>;
}>;

export const validation = (schema: schemaType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    let issues: issuesType = [];
    if (req.file) {
      req.body.file = req.file;
    }
    if (req.files) {
      req.body.files = req.files;
    }
    for (const key of Object.keys(schema) as keyRequestType[]) {
      if (!schema[key]) continue;
      const validationResult = schema[key].safeParse(req[key]);
      if (!validationResult.success) {
        const error = validationResult.error as ZodError;
        issues.push({
          key,
          issues: error.issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
          })),
        });
      }
    }
    if (issues.length) {
      return next(new BadRequestException("Validation error", { issues }));
    }
    next();
  };
};
