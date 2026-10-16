import type { NextFunction, Request, Response } from "express";

import { RoleEnum } from "../common/enums";
import {
  ForbiddenException,
  UnauthorizedException,
} from "../common/exceptions";

export const authorization = (accessRoles: RoleEnum[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedException("Authentication required"));
    }
    if (!accessRoles.includes(req.user.role)) {
      return next(new ForbiddenException("Access denied"));
    }

    next();
  };
};
