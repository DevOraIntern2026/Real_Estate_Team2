import { JwtPayload } from "jsonwebtoken";

export interface IAuthTokenPayload extends JwtPayload {
  sub: string;
  jti: string;
  iat: number;
  exp: number;
  familyId: string; // one login session (one device); survives rotation
  type: "access" | "refresh";
  ver?: number; // user.tokenVersion at issue time
}

export interface IJwtTokenPair {
  accessToken: string;
  refreshToken: string;
}
