import { JwtPayload } from "jsonwebtoken";
import { HydratedDocument } from "mongoose";
import { IUser } from "../interfaces";

declare global {
  namespace Express {
    interface Request {
      user: HydratedDocument<IUser>;
      decoded: JwtPayload;
    }
  }
}

export interface IAuthenticatedUser {
  user: HydratedDocument<IUser>;
  decoded: JwtPayload;
}
