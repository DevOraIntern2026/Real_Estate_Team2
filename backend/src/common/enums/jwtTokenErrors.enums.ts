import { UnauthorizedException } from "../exceptions";

export enum AuthErrorCode {
  TOKEN_EXPIRED = "Token expired",
  TOKEN_INVALID = "Invalid token",
  SESSION_REVOKED = "Session revoked",
  REFRESH_REUSED = "Used refresh token",
  ROTATION_IN_PROGRESS = "Rotation in progress",
}

export const authError = (message: string, code: AuthErrorCode) =>
  new UnauthorizedException({ message }, code);
