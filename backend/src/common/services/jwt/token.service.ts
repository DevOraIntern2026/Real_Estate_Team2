import type { JwtPayload, SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { HydratedDocument, Types } from "mongoose";
import { randomUUID } from "node:crypto";
import { UserRepo } from "../../../DB/repo";
import {
  ACCESS_TOKEN_EXPIRATION_TIME,
  ADMIN_REFRESH_TOKEN_SECRET_KEY,
  ADMIN_TOKEN_SECRET_KEY,
  CUSTOMER_REFRESH_TOKEN_SECRET_KEY,
  CUSTOMER_TOKEN_SECRET_KEY,
  OWNER_REFRESH_TOKEN_SECRET_KEY,
<<<<<<< HEAD
  OWNER_TOKEN_SECRET_KEY,
  REFRESH_ROTATION_GRACE_SECONDS,
  REFRESH_TOKEN_EXPIRATION_TIME,
=======
  AGENT_TOKEN_SECRET_KEY,
  AGENT_REFRESH_TOKEN_SECRET_KEY,
>>>>>>> origin/feature/Admin-Dashboard
} from "../../config/config";
import { AudienceEnum, RoleEnum } from "../../enums";
import { authError, AuthErrorCode } from "../../enums/";
import { BadRequestException, ConflictException } from "../../exceptions";
import { IAuthTokenPayload, IJwtTokenPair, IUser } from "../../interfaces";
import { redisService, RedisService } from "../redis";
import { TokenType } from "./../../enums/token.enums";
type SignaturesType = {
  accessSignature: string | undefined;
  refreshSignature: string | undefined;
};

const ACCESS_TTL = Number(ACCESS_TOKEN_EXPIRATION_TIME);
const REFRESH_TTL = Number(REFRESH_TOKEN_EXPIRATION_TIME);
const ROTATION_GRACE = Number(REFRESH_ROTATION_GRACE_SECONDS ?? 10);
for (const [name, value] of Object.entries({
  ACCESS_TTL,
  REFRESH_TTL,
  ROTATION_GRACE,
})) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive number of seconds`);
  }
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class TokenService {
  private readonly userRepo: UserRepo;
  private readonly redisRepo: RedisService;

  constructor() {
    this.userRepo = new UserRepo();
    this.redisRepo = redisService;
  }
  //////////////////////// Core functionality
  sign({
    payload,
    secretOrPrivateKey = CUSTOMER_TOKEN_SECRET_KEY,
    options,
  }: {
    payload: object;
    secretOrPrivateKey?: string | undefined;
    options?: SignOptions;
  }): string {
    return jwt.sign(payload, secretOrPrivateKey as string, options);
  }
  verify({
    token,
    secretOrPrivateKey = CUSTOMER_TOKEN_SECRET_KEY,
    ignoreExpiration = false,
  }: {
    token: string;
    ignoreExpiration?: boolean;

    secretOrPrivateKey: string | undefined;
  }): IAuthTokenPayload {
    try {
      return jwt.verify(token, secretOrPrivateKey as string, {
        ignoreExpiration,
      }) as IAuthTokenPayload;
    } catch (err: any) {
      if (err?.name === "TokenExpiredError") {
        throw authError("Token expired", AuthErrorCode.TOKEN_EXPIRED);
      }
      throw authError("Invalid token", AuthErrorCode.TOKEN_INVALID);
    }
  }
  ///////////////////// JWT helper functions

  async getTokenSignature(role: RoleEnum | string | undefined): Promise<{
    signatures: SignaturesType;
    audience: AudienceEnum | string;
  }> {
    let signatures: SignaturesType;
    let audience = AudienceEnum.USER;
    switch (role) {
      case RoleEnum.ADMIN:
        signatures = {
          accessSignature: ADMIN_TOKEN_SECRET_KEY,
          refreshSignature: ADMIN_REFRESH_TOKEN_SECRET_KEY,
        };

        audience = AudienceEnum.ADMIN;
        break;
      case RoleEnum.OWNER:
        signatures = {
          accessSignature: OWNER_TOKEN_SECRET_KEY,
          refreshSignature: OWNER_REFRESH_TOKEN_SECRET_KEY,
        };
<<<<<<< HEAD

        audience = AudienceEnum.OWNER;
        break;
      default:
        signatures = {
          accessSignature: CUSTOMER_TOKEN_SECRET_KEY,
          refreshSignature: CUSTOMER_REFRESH_TOKEN_SECRET_KEY,
=======
      case RoleEnum.AGENT:
        return {
          signatures: {
            accessSignature: AGENT_TOKEN_SECRET_KEY,
            refreshSignature: AGENT_REFRESH_TOKEN_SECRET_KEY,
          },
          audience: AudienceEnum.AGENT,
        };
      default: // CUSTOMER (least privilege)
        return {
          signatures: {
            accessSignature: CUSTOMER_TOKEN_SECRET_KEY,
            refreshSignature: CUSTOMER_REFRESH_TOKEN_SECRET_KEY,
          },
          audience: AudienceEnum.USER,
>>>>>>> origin/feature/Admin-Dashboard
        };
        audience = AudienceEnum.USER;
        break;
    }
    return { signatures, audience };
  }

<<<<<<< HEAD
  private getSecret(
    tokenType: TokenType,
    audience: number,
  ): string | undefined {
    const isSystem = audience === Number(AudienceEnum.ADMIN);
    if (tokenType === TokenType.REFRESH) {
      return isSystem
        ? ADMIN_REFRESH_TOKEN_SECRET_KEY
        : CUSTOMER_REFRESH_TOKEN_SECRET_KEY;
=======
  // audience -> role. The two enums have DIFFERENT numeric orders, so this
  // mapping must be explicit. Unknown audiences are rejected.
  private roleFromAudience(aud: number): RoleEnum {
    switch (aud) {
      case AudienceEnum.ADMIN:
        return RoleEnum.ADMIN;
      case AudienceEnum.OWNER:
        return RoleEnum.OWNER;
      case AudienceEnum.AGENT:
        return RoleEnum.AGENT;
      case AudienceEnum.USER:
        return RoleEnum.CUSTOMER;
      default:
        throw new UnauthorizedException("Invalid token audience");
>>>>>>> origin/feature/Admin-Dashboard
    }
    return isSystem ? ADMIN_TOKEN_SECRET_KEY : CUSTOMER_TOKEN_SECRET_KEY;
  }

  async createLoginTokens(
    user: IUser,
    issuer: string,
    familyId: string = randomUUID(),
  ): Promise<IJwtTokenPair> {
    const { signatures, audience } = await this.getTokenSignature(user.role);

    const jtId = randomUUID();
    const payload = {
      sub: user,
      familyId,
      ver: user.tokenVersion ?? 0,
    };

    const accessToken = this.sign({
      payload,
      secretOrPrivateKey: signatures.accessSignature,
      options: {
        issuer,
        audience: [
          TokenType.ACCESS as unknown as string,
          audience as unknown as string,
        ],
        expiresIn: ACCESS_TTL,
        jwtid: jtId,
      },
    });
    const refreshToken = this.sign({
      payload,
      secretOrPrivateKey: signatures.refreshSignature,
      options: {
        issuer,
        audience: [
          TokenType.REFRESH as unknown as string,
          audience as unknown as string,
        ],
        expiresIn: REFRESH_TTL,
        jwtid: jtId,
      },
    });
    return { accessToken, refreshToken };
  }

  async decodeToken({
    token,
    tokenType = TokenType.ACCESS,
  }: {
    token: string;
    tokenType?: TokenType | undefined;
  }): Promise<{
    userAccount: HydratedDocument<IUser>;
    decodedToken: IAuthTokenPayload;
  }> {
    const unverified = jwt.decode(token) as JwtPayload | null;
    // Array.isArray: a string `aud` would otherwise pass the length check.
    if (!Array.isArray(unverified?.aud) || unverified.aud.length < 2) {
      throw new BadRequestException("Failed to decode token without audience");
    }
    const [typeRaw, audienceRaw] = unverified.aud;
    if (Number(typeRaw) !== tokenType) {
      throw new BadRequestException("Invalid token type");
    }

    const decodedToken = this.verify({
      token,
      secretOrPrivateKey: this.getSecret(tokenType, Number(audienceRaw)),
    });

    // Tokens issued before this rollout have no familyId: force re-login.
    if (!decodedToken.sub || !decodedToken.familyId) {
      throw authError("Please sign in again", AuthErrorCode.TOKEN_INVALID);
    }

    const userAccount = await this.userRepo.findOne({
      filter: { _id: decodedToken.sub },
    });
    if (!userAccount) {
      throw authError("Not registered account", AuthErrorCode.TOKEN_INVALID);
    }

    await this.assertTokenActive(decodedToken, userAccount);
    return { userAccount, decodedToken };
  }
  ///////////////////////////// session revoked (single-device logout / reuse detection) & token older than the last "logout all" / password change
  async assertTokenActive(
    payload: IAuthTokenPayload,
    user: HydratedDocument<IUser>,
  ) {
    if (await this.isFamilyRevoked(payload.sub, payload.familyId)) {
      throw authError("Session was signed out", AuthErrorCode.SESSION_REVOKED);
    }
    if ((payload.ver ?? 0) < (user.tokenVersion ?? 0)) {
      throw authError("Signed out everywhere", AuthErrorCode.SESSION_REVOKED);
    }
  }
  async revokeFamily(userId: string | Types.ObjectId, familyId: string) {
    await this.redisRepo.redisSet({
      key: this.redisRepo.redisRevokedFamilyKey({ userId, familyId }),
      value: "1",
      ttl: REFRESH_TTL, // longest any token in the family can live
    });
  }
  ///////////////////// Revocation

  private async isFamilyRevoked(
    userId: string | Types.ObjectId,
    familyId: string,
  ) {
    const isRevoked = await this.redisRepo.redisGet(
      this.redisRepo.redisRevokedFamilyKey({ userId, familyId }),
    );
    return isRevoked !== null && isRevoked !== undefined;
  }
  ///////////////////// single-device logout that works even if the token already expired & never throws: logging out a dead session is a success.
  async revokeSessionByToken(token: string): Promise<void> {
    const unverified = jwt.decode(token) as JwtPayload | null;
    if (!Array.isArray(unverified?.aud) || unverified.aud.length < 2) return;
    try {
      const payload = this.verify({
        token,
        secretOrPrivateKey: this.getSecret(
          Number(unverified.aud[0]) as TokenType,
          Number(unverified.aud[1]),
        ),
        ignoreExpiration: true,
      });
      if (payload.sub && payload.familyId) {
        await this.revokeFamily(payload.sub, payload.familyId);
      }
    } catch {
      // nothing to revoke
    }
  }
  async rotate(
    user: HydratedDocument<IUser>,
    { sub, jti, exp, familyId }: IAuthTokenPayload,
    issuer: string,
  ): Promise<IJwtTokenPair> {
    const ttl = exp - Math.floor(Date.now() / 1000);
    if (ttl <= 0) {
      throw authError("Refresh token expired", AuthErrorCode.TOKEN_EXPIRED);
    }

    const usedKey = this.redisRepo.redisUsedRefreshKey({ userId: sub, jti });
    const resultKey = this.redisRepo.redisRotationResultKey({
      userId: sub,
      jti,
    });

    // Atomic check-and-claim: exactly one concurrent request wins.
    const claimed = await this.redisRepo.redisSetNX({
      key: usedKey,
      value: String(Date.now()),
      ttl,
    });

    if (claimed) {
      try {
        const tokens = await this.createLoginTokens(user, issuer, familyId);
        await this.redisRepo.redisSet({
          key: resultKey,
          value: JSON.stringify(tokens),
          ttl: ROTATION_GRACE,
        });
        return tokens;
      } catch (err) {
        await this.redisRepo.redisDelKeys([usedKey]);
        throw err;
      }
    }

    const usedAtRaw = await this.redisRepo.redisGet(usedKey);
    if (usedAtRaw === null || usedAtRaw === undefined) {
      throw new ConflictException("Refresh in progress, retry shortly"); // winner rolled back between our two calls
    }

    if (Date.now() - Number(usedAtRaw) > ROTATION_GRACE * 1000) {
      await this.revokeFamily(sub, familyId);
      throw authError(
        "Session ended for your security. Please sign in again.",
        AuthErrorCode.REFRESH_REUSED,
      );
    }

    // Inside the grace window: return the winner's result (wait up to ~2s).
    for (let i = 0; i < 20; i++) {
      const cached = await this.redisRepo.redisGet(resultKey);
      if (cached) {
        return (
          typeof cached === "string" ? JSON.parse(cached) : cached
        ) as IJwtTokenPair;
      }
      await sleep(100);
    }
    throw new ConflictException("Refresh in progress, retry shortly");
  }
}
