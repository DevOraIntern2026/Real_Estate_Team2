import type { Response } from "express";

export const successResponse = <T = any>({
  res,
  message = "Success",
  data,
  status = 200,
}: {
  res: Response;
  message?: string;
  data?: T;
  status?: number;
}) => {
  return res.status(status).json({ message, data });
};
