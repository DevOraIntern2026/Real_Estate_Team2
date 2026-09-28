import { DUMMY_HASH } from "../../common/config/config";
import { EmailConfig, EmailEnum, ProviderEnums } from "../../common/enums";

import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from "../../common/exceptions";
import { TokenService } from "../../common/services/jwt";
import { redisService, RedisService } from "../../common/services/redis";
import { emailEmitter, generateOTP, sendEmail } from "../../common/utils/email";
import {
  compareHash,
  decrypt,
  generateHash,
} from "../../common/utils/security";
import { UserRepo } from "../../DB/repo/user.repo";
import {
  ConfirmEmailDto,
  LoginDto,
  resendConfirmationEmailDto,
  SignupDto,
} from "./auth.dto";

class AuthService {
  private readonly userRepo: UserRepo;
  private readonly redis: RedisService;
  private readonly tokenService: TokenService;

  constructor() {
    this.userRepo = new UserRepo();
    this.redis = redisService;
    this.tokenService = new TokenService();
  }
  async signup({
    username,
    email,
    password,
    role = 2,
    phone,
  }: SignupDto): Promise<null> {
    const checkExistingUser = await this.userRepo.findOne({
      filter: { email },
      projection: "email",
      options: { lean: true },
    });

    if (checkExistingUser) {
      throw new ConflictException("This email already exists");
    }
    if (role < 1 || role > 2) {
      throw new BadRequestException("Invalid role input");
    }
    const user =
      (await this.userRepo.createOne({
        data: {
          username,
          email,
          role,
          password: password,
          phone: phone ? phone : null,
        },
      })) || [];

    if (!user) {
      throw new BadRequestException("Failed to create account");
    }
    emailEmitter.emit(EmailEnum.CONFIRM_EMAIL, async () => {
      await this.generateAndSendConfirmationOtp(email, {
        subject: EmailEnum.CONFIRM_EMAIL,
        title: "Email verification",
      });
    });

    return null;
  }
  async login(
    { email, password }: LoginDto,
    issuer: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepo.findOne({
      filter: {
        email,
        provider: ProviderEnums.SYSTEM,
        confirmedAt: { $exists: true },
        paranoid: false,
      },
    });

    if (!(await compareHash(user?.password ?? DUMMY_HASH, password))) {
      throw new UnauthorizedException("Invalid login credentials");
    }
    if (!user) {
      throw new NotFoundException(
        "Please make sure to verify your account before login",
      );
    }
    user.phone ? (user.phone = await decrypt(user.phone as string)) : null;

    //////////////////////////////////////////// using a secret key based on the user's role (admin | user)
    return this.tokenService.createLoginTokens(user, issuer);
  }
  private async generateAndSendConfirmationOtp(
    email: string,
    {
      subject = EmailEnum.CONFIRM_EMAIL,
      title = "Email verification",
    }: { subject?: EmailEnum; title?: string } = {},
  ) {
    /////////////// checking if there is a blocked timer
    const blockKey = this.redis.otpBlockKey(email, { type: subject });
    const maxRequests = this.redis.maxOtpRequestsKey(email, {
      type: subject,
    });
    const [remainingBlockTime, checkMaxOtpRequests, maxRequestsTtl] =
      await Promise.all([
        this.redis.redisGetTtl(blockKey),
        Number(this.redis.redisGet(maxRequests) || 0),
        this.redis.redisGetTtl(this.redis.maxOtpRequestsKey(email)),
      ]);

    if (remainingBlockTime > 0) {
      throw new ConflictException(
        `You have been blocked from requesting newer OTPs try again after ${remainingBlockTime} ${remainingBlockTime > 1 ? `seconds` : `second`}`,
      );
    }

    /////////////// handling max attempts for OTP requests

    if (checkMaxOtpRequests >= 3) {
      await this.redis.redisSet({
        key: blockKey,
        value: 1,
        ttl: 7 * 60,
      });
      throw new ConflictException(
        `You have reached the maximum amount of requests for the OTP try again after ${maxRequestsTtl} ${maxRequestsTtl > 1 ? `second` : `seconds`}`,
      );
    }
    const generatedOtp = generateOTP();
    await this.redis.redisSet({
      key: this.redis.otpKey(email, { type: subject }),
      value: await generateHash(`${generatedOtp}`),
      // available OTP for 2 minutes
      ttl: 120,
    });
    checkMaxOtpRequests > 0
      ? await this.redis.redisIncrKey(maxRequests)
      : await this.redis.redisSet({ key: maxRequests, value: 1, ttl: 300 });

    await sendEmail({
      to: email,
      subject: EmailConfig[subject].title,
      html: `<span>The confirmation code for your account is</span><h2>${generatedOtp}</h2>`,
    });

    return;
  }
  public async confirmEmail({ email, otp }: ConfirmEmailDto) {
    const existingAcc = await this.userRepo.findOne({
      filter: {
        email,
        confirmedAt: { $exists: false },
        provider: ProviderEnums.SYSTEM,
      },
      options: { lean: true },
    });
    if (!existingAcc) {
      throw new NotFoundException(
        "This account is either already verified or doesn't exist",
      );
    }

    const hashedOtp = await this.redis.redisGet(
      this.redis.otpKey(email, { type: EmailEnum.CONFIRM_EMAIL }),
    );

    if (!hashedOtp) {
      throw new NotFoundException("Expired OTP");
    }

    if (!(await compareHash(`${hashedOtp}`, `${otp}`))) {
      throw new BadRequestException("Invalid OTP");
    }

    await this.userRepo.updateOne({
      filter: { email },
      update: { confirmedAt: new Date() },
    });
    await this.redis.redisDelKeys(
      await this.redis.redisKeys(
        this.redis.otpKey(email, { type: EmailEnum.CONFIRM_EMAIL }),
      ),
    );
    return;
  }

  async resendConfirmationEmail({ email }: resendConfirmationEmailDto) {
    const account = await this.userRepo.findOne({
      filter: {
        email,
        confirmedAt: { $exists: false },
        provider: ProviderEnums.SYSTEM,
      },
    });

    if (!account) {
      throw new NotFoundException(
        "Account is either already verified or not found",
      );
    }
    const otpTtl = await this.redis.redisGetTtl(
      this.redis.otpKey(email, { type: EmailEnum.CONFIRM_EMAIL }),
    );

    if (otpTtl > 0) {
      throw new ConflictException(
        `Can't send a new OTP while the older OTP is still valid try again after ${otpTtl} ${otpTtl > 1 ? `seconds` : `second`}.`,
      );
    }
    emailEmitter.emit(EmailEnum.CONFIRM_EMAIL, async () => {
      await this.generateAndSendConfirmationOtp(email);
    });
    return;
  }

  /////////////// Forget & update password
  async reqForgetPasswordOTP({ email }: { email: string }) {
    const checkExistingOTP = await this.redis.redisGetTtl(
      this.redis.otpKey(email, { type: EmailEnum.FORGOT_PASSWORD }),
    );

    if (checkExistingOTP > 0) {
      throw new ConflictException(
        "Can't request a new OTP while the older one is still valid",
      );
    }
    const userAccount = await this.userRepo.findOne({
      filter: {
        email,
        confirmedAt: { $exists: true },
        provider: ProviderEnums.SYSTEM,
      },
    });
    if (!userAccount) {
      throw new NotFoundException("Make sure to enter an existing account");
    }

    emailEmitter.emit(EmailEnum.CONFIRM_EMAIL, async () => {
      await this.generateAndSendConfirmationOtp(email, {
        subject: EmailEnum.FORGOT_PASSWORD,
        title: "Reset Password",
      });
    });
  }
  async verifyForgetPasswordOTP({
    email,
    otp,
  }: {
    email: string;
    otp: string;
  }) {
    const hashedOTP = await this.redis.redisGet(
      this.redis.otpKey(email, { type: EmailEnum.FORGOT_PASSWORD }),
    );
    if (!hashedOTP) {
      throw new NotFoundException("No OTP found for this account");
    }
    if (!(await compareHash(hashedOTP, otp))) {
      throw new NotFoundException("The OTP you entered is invalid");
    }
  }
  async changeForgottenPassword({
    email,
    otp,
    newPassword,
  }: {
    email: string;
    otp: string;
    newPassword: string;
  }) {
    await this.verifyForgetPasswordOTP({ email, otp });
    const userAccount = await this.userRepo.findOneAndUpdate({
      filter: {
        email,
        confirmedAt: { $exists: true },
        provider: ProviderEnums.SYSTEM,
      },
      update: {
        password: await generateHash(newPassword),
        changedCredentialsTime: new Date(),
      },
    });
    if (!userAccount) {
      throw new NotFoundException("Account doesn't exist");
    }
    const allOtpKeys = await this.redis.redisKeys(
      this.redis.otpKey(email, { type: EmailEnum.FORGOT_PASSWORD }),
    );
    const tokenKeys = await this.redis.redisKeys(
      this.redis.redisBaseRevokeTokenKey(userAccount._id),
    );
    await this.redis.redisDelKeys([...allOtpKeys, ...tokenKeys]);
  }
}

// single tone design pattern instead of taking an instance on each use we export the instance itself
export default new AuthService();

//       { email, confirmEmail: { $exists: true }, provider: providerEnum.system },
//
