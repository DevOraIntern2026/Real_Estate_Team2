import { Request, Response, NextFunction } from "express";
import { ZodError, ZodType } from "zod";
import { BadRequestException } from "../common/exceptions";

type keyRequestType = "body" | "query" | "params";
type schemaType = Partial<Record<keyRequestType, ZodType>>;
type issuesType = Array<{
  key: keyRequestType;
  issues: Array<{ message: string; path: Array<any> }>;
}>;

export const validation = (input: schemaType | ZodType) => {
  // If a bare Zod schema is passed, treat it as { body: schema }
  const schema: schemaType =
    typeof (input as any)?.safeParse === "function"
      ? { body: input as ZodType }
      : (input as schemaType);

  return (req: Request, _res: Response, next: NextFunction) => {
    const issues: issuesType = [];

    if (req.file) (req as any).body.file = req.file;
    if (req.files) (req as any).body.files = req.files;

    for (const key of Object.keys(schema) as keyRequestType[]) {
      const current = schema[key];
      if (!current) continue;

      const result = current.safeParse(req[key]);

      if (!result.success) {
        const error = result.error as ZodError;
        issues.push({
          key,
          issues: error.issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
          })),
        });
        continue;
      }

      // ---- write parsed/coerced values back onto req ----
      if (key === "query") {
        // Express 5: req.query is getter-only → redefine it
        Object.defineProperty(req, "query", {
          value: result.data,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      } else if (key === "body") {
        // safe to reassign in Express 5
        (req as any).body = result.data;
      } else if (key === "params") {
        // params is also getter-only in Express 5
        Object.defineProperty(req, "params", {
          value: result.data,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      } else {
        (req as any)[key] = result.data;
      }
    }

    if (issues.length) {
      return next(new BadRequestException("Validation error", { issues }));
    }

    next();
  };
};