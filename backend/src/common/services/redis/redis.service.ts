import Redis from "ioredis";
import { REDIS_URL } from "../../config/config";
import { internalServerError, NotFoundException } from "../../exceptions";
import { EmailEnum } from "../../enums";
import { Types } from "mongoose";

export class RedisService {
  private readonly client: Redis;
  constructor() {
    this.client = new Redis(REDIS_URL);
    this.handleEvents();
  }
  public async connect() {
    /////// with ioredis the db is connected by default when taken an instance from
    // await this.client.connect();
    console.log("Redis connected successfully");
  }
  private handleEvents() {
    this.client.on("error", (err) => console.error("Redis error:", err));
    this.client.on("ready", () => console.error("Redis is ready to use"));
  }

  ///////////////////////////JWT
  redisUsedRefreshKey({
    userId,
    jti,
  }: {
    userId: string | Types.ObjectId;
    jti: string;
  }) {
    return `refresh:used:${userId}:${jti}`;
  }
  redisRotationResultKey({
    userId,
    jti,
  }: {
    userId: string | Types.ObjectId;
    jti: string;
  }) {
    return `refresh:result:${userId}:${jti}`;
  }
  redisRevokedFamilyKey({
    userId,
    familyId,
  }: {
    userId: string | Types.ObjectId;
    familyId: string;
  }) {
    return `family:revoked:${userId}:${familyId}`;
  }
  async redisSetNX({
    key,
    value,
    ttl,
  }: {
    key: string;
    value: string;
    ttl: number;
  }): Promise<boolean> {
    if (!Number.isFinite(ttl) || ttl <= 0) {
      throw new internalServerError(`Invalid TTL for redis key "${key}"`);
    }
    try {
      return (await this.client.set(key, value, "EX", ttl, "NX")) === "OK";
    } catch (error) {
      console.error("redisSetNX failed:", error);
      throw new internalServerError(
        "Something went wrong with setting the value within redis",
      );
    }
  }
  /////////////////////////// redis operations
  async redisSet({
    key,
    value,
    ttl,
  }: {
    key: string;
    value: any;
    ttl?: number;
  }): Promise<string | null> {
    if (ttl !== undefined && (!Number.isFinite(ttl) || ttl <= 0)) {
      throw new internalServerError(`Invalid TTL for redis key "${key}"`);
    }
    try {
      const data = typeof value === "string" ? value : JSON.stringify(value);
      return ttl !== undefined
        ? await this.client.set(key, data, "EX", ttl)
        : await this.client.set(key, data);
    } catch (error) {
      console.error("redisSet failed:", error);
      throw new internalServerError(
        "Something went wrong with setting the value within redis",
      );
    }
  }
  async redisUpdate({
    key,
    value,
    ttl,
  }: {
    key: string;
    value: string | object;
    ttl: number;
  }): Promise<string | number | null> {
    try {
      // key has to exist before assigning it a different value
      if (!(await this.client.exists(key))) {
        return 0;
      }
      return await this.redisSet({ key, value, ttl });
    } catch (error) {
      throw new internalServerError(
        "Something went wrong with updating the value within redis",
      );
    }
  }
  async redisGet(key: string): Promise<string | null> {
    try {
      try {
        const opResult = await this.client.get(key);
        if (!opResult) {
          return null;
        }
        return JSON.parse(opResult);
      } catch (error) {
        return await this.client.get(key);
      }
    } catch (error) {
      throw new internalServerError(
        "Something went wrong with getting the value within redis",
      );
    }
  }
  async redisGetTtl(key: string): Promise<number> {
    try {
      if (!(await this.client.ttl(key))) {
        throw new NotFoundException(
          "The value you are trying to have a ttl enabled",
        );
      }
      return this.client.ttl(key);
    } catch (error) {
      throw new internalServerError(
        "Something went wrong with getting the ttl value within redis",
      );
    }
  }
  async redisCheckKey(key: string): Promise<number> {
    try {
      return await this.client.exists(key);
    } catch (error) {
      throw new internalServerError("Key doesn't exist");
    }
  }
  async redisAddTtl({
    key,
    ttl,
  }: {
    key: string;
    ttl: string | number;
  }): Promise<number> {
    try {
      return await this.client.expire(key, ttl);
    } catch (error) {
      throw new internalServerError("Failed to add ttl to the key");
    }
  }
  async redisMGet(keys: string[]): Promise<(string | null)[] | number> {
    try {
      if (!keys.length) {
        return 0;
      }
      return await this.client.mget(...keys);
    } catch (error) {
      throw new internalServerError("Failed to get all of the specified keys");
    }
  }
  async redisKeys(prefix: string): Promise<string[]> {
    try {
      return await this.client.keys(`${prefix}*`);
    } catch (error) {
      throw new internalServerError("Failed to get keys");
    }
  }
  async redisDelKeys(keys: string[]): Promise<number> {
    try {
      if (!keys.length) return 0;
      return await this.client.del(keys);
    } catch (error) {
      throw new internalServerError("Failed to delete keys");
    }
  }
  async redisIncrKey(key: string): Promise<number> {
    try {
      if (!(await this.client.exists(key))) return 0;
      return await this.client.incr(key);
    } catch (error) {
      throw new internalServerError("Failed to increment keys");
    }
  }

  ///////////////////////// Redis keys
  redisBaseRevokeTokenKey(userId: string | Types.ObjectId | undefined): string {
    if (!userId) {
      throw new internalServerError("No user Id found");
    }

    return `RevokeToken::${userId.toString()}`;
  }

  otpKey(
    email: string,
    { type = EmailEnum.CONFIRM_EMAIL }: { type?: EmailEnum } = {},
  ): string {
    return `OTP::User::${email}::${type}`;
  }
  maxOtpRequestsKey(
    email: string,
    { type = EmailEnum.CONFIRM_EMAIL }: { type?: EmailEnum } = {},
  ): string {
    return `${this.otpKey(email, { type })}::Request`;
  }
  otpBlockKey(
    email: string,
    { type = EmailEnum.CONFIRM_EMAIL }: { type?: EmailEnum } = {},
  ): string {
    return `${this.otpKey(email, { type })}::Block::Request`;
  }

  generalLoginAttemptBlock(): string {
    return `OTP::Block::Request`;
  }

  otp2FAVerification(email: string): string {
    return `OTP::Verification::Token::${email}`;
  }
  unverifiedAccountDuration(email: string): string {
    return `User::AccountTTL::${email}`;
  } //////////////////////////////////////////////////////
  /////////////////////////// Storing FCM Tokens
  //////////////////////////////////////////////////////
  FCM_key(userId: Types.ObjectId | string) {
    return `user:FCM:${userId}`;
  }
  async addFCM(userId: string | Types.ObjectId, FCMToken: string) {
    return await this.client.sadd(this.FCM_key(userId), FCMToken);
  }

  async removeFCM(userId: string | Types.ObjectId, FCMToken: string) {
    return await this.client.srem(this.FCM_key(userId), FCMToken);
  }

  async getFCMs(userId: string | Types.ObjectId) {
    return await this.client.smembers(this.FCM_key(userId));
  }

  async hasFCMs(userId: string | Types.ObjectId) {
    return await this.client.scard(this.FCM_key(userId));
  }

  async removeFCMUser(userId: string | Types.ObjectId) {
    return await this.client.del(this.FCM_key(userId));
  }
  //////////////////////////////////////////////////////
  ////////////////////////////// socketIo
  //////////////////////////////////////////////////////
  socketKey(userId: string | Types.ObjectId) {
    return `user:sockets:${userId.toString()}`;
  }
  async addSocket(userId: string | Types.ObjectId, socketId: string) {
    return await this.client.sadd(this.socketKey(userId), socketId);
  }

  async removeSocket(userId: string | Types.ObjectId, socketId: string) {
    return await this.client.srem(this.socketKey(userId), socketId);
  }

  async getSockets(userId: string | Types.ObjectId) {
    return await this.client.smembers(this.socketKey(userId));
  }

  async hasSockets(userId: string | Types.ObjectId) {
    return await this.client.scard(this.socketKey(userId));
  }

  async removeUserSockets(userId: string | Types.ObjectId) {
    return await this.client.del(this.socketKey(userId));
  }
}
export const redisService = new RedisService();
