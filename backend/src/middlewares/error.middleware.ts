import type { Request, Response, NextFunction } from "express";
import { BadRequestException } from "../common/exceptions";
import jwt from "jsonwebtoken";
export interface IError extends Error {
  statusCode?: number;
}
export const globalErrorHandler = (
  err: IError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err.name === "MulterError") {
    err.statusCode = 400;
  }
  if (err instanceof jwt.TokenExpiredError) {
    throw new BadRequestException("Invalid or expired token");
  }
  res.status(err.statusCode ?? 500).json({
    Error: err.message || "Internal server error",
    Stack: err.stack,
    cause: err.cause,
  });
};
