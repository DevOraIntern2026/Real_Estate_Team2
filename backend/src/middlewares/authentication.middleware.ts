import type { NextFunction, Request, Response } from "express";
import { TokenType } from "../common/enums";
import { UnauthorizedException } from "../common/exceptions";
import { TokenService } from "../common/services";

const tokenService = new TokenService();

export const authentication = (tokenType: TokenType = TokenType.ACCESS) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const [scheme, token, ...extra] = (req.headers.authorization ?? "").split(
      " ",
    );

    if (scheme?.toLowerCase() !== "bearer" || !token || extra.length) {
      throw new UnauthorizedException(
        "Missing or malformed authorization header",
      );
    }

    const { decodedToken, userAccount } = await tokenService.decodeToken({
      token,
      tokenType,
    });
    req.user = userAccount;
    req.decoded = decodedToken;
    next();
  };
};
