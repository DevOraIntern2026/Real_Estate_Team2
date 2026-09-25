import type { JwtPayload, SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { HydratedDocument, Types } from "mongoose";
import { randomUUID } from "node:crypto";
import {
  ACCESS_TOKEN_EXPIRATION_TIME,
  REFRESH_TOKEN_EXPIRATION_TIME,
  ADMIN_REFRESH_TOKEN_SECRET_KEY,
  ADMIN_TOKEN_SECRET_KEY,
  CUSTOMER_REFRESH_TOKEN_SECRET_KEY,
  CUSTOMER_TOKEN_SECRET_KEY,
  OWNER_TOKEN_SECRET_KEY,
  OWNER_REFRESH_TOKEN_SECRET_KEY,
} from "../../config/config";
import { AudienceEnum, RoleEnum } from "../../enums";
import { UnauthorizedException } from "../../exceptions";
import { IUser } from "../../interfaces";
import { redisService, RedisService } from "../redis";
import { UserRepo } from "./../../../DB/repo/user.repo";
import { TokenType } from "./../../enums/token.enums";

type SignaturesType = {
  accessSignature: string | undefined;
  refreshSignature: string | undefined;
};

export class TokenService {
  private readonly userRepo: UserRepo;
  private readonly redisRepo: RedisService;

  constructor() {
    this.userRepo = new UserRepo();
    this.redisRepo = redisService;
  }

  //////////////////////// Core functionality

  // No default secret: a missing one must fail loudly, never fall back to another key
  sign({
    payload,
    secretOrPrivateKey,
    options,
  }: {
    payload: object;
    secretOrPrivateKey: string | undefined;
    options?: SignOptions;
  }): string {
    if (!secretOrPrivateKey) throw new Error("Missing JWT signing secret");
    return jwt.sign(payload, secretOrPrivateKey, options);
  }

  verify({
    token,
    secretOrPrivateKey,
  }: {
    token: string;
    secretOrPrivateKey: string | undefined;
  }): JwtPayload {
    // Config error -> plain Error (500), not a 401 that hides the misconfiguration
    if (!secretOrPrivateKey) throw new Error("Missing JWT verification secret");
    try {
      return jwt.verify(token, secretOrPrivateKey, {
        algorithms: ["HS256"],
      }) as JwtPayload;
    } catch (err) {
      throw new UnauthorizedException(
        err instanceof jwt.TokenExpiredError
          ? "Token expired"
          : "Invalid token",
      );
    }
  }

  ///////////////////// JWT helper functions

  // role -> secrets + audience
  async getTokenSignature(role: RoleEnum | undefined): Promise<{
    signatures: SignaturesType;
    audience: AudienceEnum;
  }> {
    switch (role) {
      case RoleEnum.ADMIN:
        return {
          signatures: {
            accessSignature: ADMIN_TOKEN_SECRET_KEY,
            refreshSignature: ADMIN_REFRESH_TOKEN_SECRET_KEY,
          },
          audience: AudienceEnum.ADMIN,
        };
      case RoleEnum.OWNER:
        return {
          signatures: {
            accessSignature: OWNER_TOKEN_SECRET_KEY,
            refreshSignature: OWNER_REFRESH_TOKEN_SECRET_KEY,
          },
          audience: AudienceEnum.OWNER,
        };
      default: // CUSTOMER (least privilege)
        return {
          signatures: {
            accessSignature: CUSTOMER_TOKEN_SECRET_KEY,
            refreshSignature: CUSTOMER_REFRESH_TOKEN_SECRET_KEY,
          },
          audience: AudienceEnum.USER,
        };
    }
  }

  // audience -> role. The two enums have DIFFERENT numeric orders, so this
  // mapping must be explicit. Unknown audiences are rejected.
  private roleFromAudience(aud: number): RoleEnum {
    switch (aud) {
      case AudienceEnum.ADMIN:
        return RoleEnum.ADMIN;
      case AudienceEnum.OWNER:
        return RoleEnum.OWNER;
      case AudienceEnum.USER:
        return RoleEnum.CUSTOMER;
      default:
        throw new UnauthorizedException("Invalid token audience");
    }
  }

  async createLoginTokens(
    user: HydratedDocument<IUser>,
    issuer: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { signatures, audience } = await this.getTokenSignature(user.role);
    const jti = randomUUID(); // shared, so revoking one revokes the pair
    const sub = user._id.toString();

    const accessToken = this.sign({
      payload: { sub },
      secretOrPrivateKey: signatures.accessSignature,
      options: {
        issuer,
        audience: [String(TokenType.ACCESS), String(audience)],
        expiresIn: Number(ACCESS_TOKEN_EXPIRATION_TIME),
        jwtid: jti,
      },
    });
    const refreshToken = this.sign({
      payload: { sub },
      secretOrPrivateKey: signatures.refreshSignature,
      options: {
        issuer,
        audience: [String(TokenType.REFRESH), String(audience)],
        expiresIn: Number(REFRESH_TOKEN_EXPIRATION_TIME),
        jwtid: jti,
      },
    });
    return { accessToken, refreshToken };
  }

  async decodeToken({
    token,
    tokenType = TokenType.ACCESS,
  }: {
    token: string;
    tokenType?: TokenType;
  }): Promise<{
    userAccount: HydratedDocument<IUser>;
    decodedToken: JwtPayload;
  }> {
    // 1. Read (unverified) audience only to choose which secrets to verify with
    const decoded = jwt.decode(token) as JwtPayload | null;
    if (!decoded || !Array.isArray(decoded.aud) || decoded.aud.length < 2) {
      throw new UnauthorizedException("Invalid token");
    }
    const numTokenType = Number(decoded.aud[0]);
    const numAudience = Number(decoded.aud[1]);

    if (numTokenType !== tokenType) {
      throw new UnauthorizedException("Invalid token type");
    }

    // 2. Verify the signature FIRST, with the secret for that audience + token type
    const { signatures } = await this.getTokenSignature(
      this.roleFromAudience(numAudience),
    );
    const verified = this.verify({
      token,
      secretOrPrivateKey:
        tokenType === TokenType.REFRESH
          ? signatures.refreshSignature
          : signatures.accessSignature,
    });

    // 3. Revocation check, using verified claims
    if (
      verified.jti &&
      (await this.redisRepo.redisGet(
        this.redisRepo.redisRevokeTokenKey({
          userId: verified.sub,
          jti: verified.jti,
        }),
      ))
    ) {
      throw new UnauthorizedException("Invalid login token");
    }

    // 4. Load the user; the role always comes from the database
    const userAccount = await this.userRepo.findOne({
      filter: { _id: verified.sub },
    });
    if (!userAccount) {
      throw new UnauthorizedException("Not registered account");
    }

    // 5. The token's audience must match the user's CURRENT role.
    //    Stops forged tokens (e.g. a leaked customer secret + an admin's id)
    //    and invalidates old tokens after a promotion or demotion.
    const { audience: expectedAudience } = await this.getTokenSignature(
      userAccount.role,
    );
    if (numAudience !== expectedAudience) {
      throw new UnauthorizedException("Invalid login session");
    }

    // 6. Tokens issued before a credentials change are invalid
    if (
      userAccount.changedCredentialsTime &&
      userAccount.changedCredentialsTime.getTime() >= (verified.iat ?? 0) * 1000
    ) {
      throw new UnauthorizedException("Invalid login session");
    }

    return { userAccount, decodedToken: verified };
  }

  //////////////////////// Sessions: logout and refresh

  async createRevokeToken({
    userId,
    jti,
    ttl,
  }: {
    userId: string | Types.ObjectId | undefined;
    jti: string | undefined;
    ttl: number; // seconds, if your redisSet uses seconds
  }): Promise<void> {
    await this.redisRepo.redisSet({
      key: this.redisRepo.redisRevokeTokenKey({ userId, jti }),
      value: jti,
      ttl,
    });
  }

  // Access and refresh tokens share a jti, so this kills both. The TTL is the
  // REFRESH lifetime; a shorter one would let the refresh token work again.
  async revokeSession(decoded: JwtPayload): Promise<void> {
    await this.createRevokeToken({
      userId: decoded.sub,
      jti: decoded.jti,
      ttl: Number(REFRESH_TOKEN_EXPIRATION_TIME),
    });
  }

  // Rotate: the old pair is revoked, a fresh pair is issued
  async refresh(
    refreshToken: string,
    issuer: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { userAccount, decodedToken } = await this.decodeToken({
      token: refreshToken,
      tokenType: TokenType.REFRESH,
    });
    await this.revokeSession(decodedToken);
    return this.createLoginTokens(userAccount, issuer);
  }
}
