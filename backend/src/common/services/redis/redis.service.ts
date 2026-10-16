import Redis from "ioredis";
import { REDIS_URL } from "../../config/config";
import { internalServerError, NotFoundException } from "../../exceptions";
import { EmailEnum } from "../../enums";
import { Types } from "mongoose";

export class RedisService {
  private readonly client: Redis;
  private isConnected: boolean = false;
  private hasReportedError: boolean = false;

  constructor() {
    /////// with ioredis the db is connected by default when taken an instance from
    this.client = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 3) {
          // Slow down reconnection attempts to avoid terminal flooding
          return 5000;
        }
        return Math.min(times * 1000, 3000);
      },
    });
    this.handleEvents();
  }
  public async connect() {
    if (this.isConnected) {
      console.log("Redis connected successfully");
    } else {
      console.log("Redis service initialized");
    }
  }
  private handleEvents() {
    this.client.on("error", (err: any) => {
      if (!this.hasReportedError) {
        console.error(`⚠️ Redis error: ${err?.message || err}. (Check if Redis server is running or update REDIS_URL in .env.dev)`);
        this.hasReportedError = true;
      }
    });
    this.client.on("ready", () => {
      this.isConnected = true;
      this.hasReportedError = false;
      console.log("Redis connected and ready to use");
    });
    this.client.on("close", () => {
      this.isConnected = false;
    });
  }
  /////////////////////////// redis operations
  async redisSet({
    key,
    value,
    ttl,
  }: {
    key: string;
    value: any;
    ttl?: number | undefined;
  }): Promise<string | null> {
    try {
      const data = typeof value === "string" ? value : JSON.stringify(value);
      return ttl
        ? await this.client.set(key, data, "EX", ttl)
        : await this.client.set(key, data);
    } catch (error) {
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
    ttl?: number | undefined;
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
  redisRevokeTokenKey({
    userId,
    jti,
  }: {
    userId: string | Types.ObjectId | undefined;
    jti: string | undefined;
  }): string {
    return `${this.redisBaseRevokeTokenKey(userId)}::${jti}`;
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
  }
}
export const redisService = new RedisService();
