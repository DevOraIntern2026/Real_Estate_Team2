// import type { Response, Request, NextFunction } from "express";
import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { TokenType } from "../../common/enums";
import { IAuthTokenPayload, IUser } from "../../common/interfaces";
import { successResponse } from "../../common/response";
import { authentication } from "../../middlewares/authentication.middleware";
import { validation } from "../../middlewares/validation.middleware";
import authService from "./auth.service";
import * as validators from "./auth.validation";
import userService from "../user/user.service";
const router = Router();
////////////////// System auth
router.post(
  "/signup",
  validation(validators.signup),
  async (req: Request, res: Response, next: NextFunction) => {
    await authService.signup(req.body);
    successResponse<IUser>({
      message:
        "Account created successfully, a confirmation OTP was sent to your email",
      res,
      status: 201,
    });
  },
);
router.post(
  "/login",
  validation(validators.login),
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await authService.login(
      req.body,
      `${req.protocol}://${req.host}`,
    );
    successResponse({
      message: "Login success",
      res,
      data,
    });
  },
);

router.get(
  "/me",
  authentication(),
  async (req: Request, res: Response, _next: NextFunction) => {
    const data = await userService.getMe(req.user!._id.toString());
    return successResponse({
      res,
      message: "Profile fetched successfully",
      data,
    });
  },
);

router.patch(
  "/confirmEmail",
  validation(validators.confirmEmail),
  async (req: Request, res: Response, next: NextFunction) => {
    await authService.confirmEmail(req.body);
    return successResponse({
      res,
      message: "Account confirmation completed",
      status: 201,
    });
  },
);
router.patch(
  "/resendConfirmationEmail",
  validation(validators.resendConfirmationEmail),
  async (req: Request, res: Response, next: NextFunction) => {
    await authService.resendConfirmationEmail(req.body);
    return successResponse({
      res,
      message: "OTP resent successfully",
      status: 201,
    });
  },
);

/////////////////// Forgot password
router.post(
  "/forgotPassword",
  validation(validators.resendConfirmationEmail),
  async (req: Request, res: Response, next: NextFunction) => {
    await authService.reqForgetPasswordOTP(req.body);
    successResponse({
      message: "An otp was sent to reset your password",
      res,
    });
  },
);
router.post(
  "/verify/forgotPassword",
  validation(validators.verifyPasswordReset),
  async (req: Request, res: Response, next: NextFunction) => {
    await authService.changeForgottenPassword(req.body);
    successResponse({
      message: "Your password was reset successfully",
      res,
    });
  },
  ////////////////// Google auth
  router.post(
    "/signup/gmail",
    validation(validators.roleValidation),
    async (req: Request, res: Response, next: NextFunction) => {
      const account = await authService.signupWithGmail(
        req.body.idToken,
        req.body.role,
        `${req.protocol}://${req.host}`,
      );
      successResponse({
        message: "Account created successfully",
        res,
        data: account,
      });
    },
  ),
);
router.post(
  "/logout",
  authentication(),
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await authService.logout(
      req.body,
      req.user,
      req.decoded as IAuthTokenPayload,
    );
    return successResponse({
      res,
      data,
      message:
        req.body.flag === 0
          ? "Logged out from all devices successfully"
          : "Logged out from one device successfully",
    });
  },
);
router.post(
  "/rotateToken",
  authentication(TokenType.REFRESH),
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await authService.rotateToken(
      req.user,
      req.decoded as IAuthTokenPayload,
      `${req.protocol}://${req.host}`,
    );
    return successResponse({
      res,
      message: "Token rotation done",
      data,
    });
  },
);
export default router;
