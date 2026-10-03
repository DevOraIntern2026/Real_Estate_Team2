// import type { Response, Request, NextFunction } from "express";
import { Router } from "express";
import { IUser } from "../../common/interfaces";
import { successResponse } from "../../common/response";
import { validation } from "../../middlewares/validation.middleware";
import authService from "./auth.service";
import * as validators from "./auth.validation";

const router = Router();
////////////////// System auth
router.post(
  "/signup",
  validation(validators.signup),
  async (req, res, next) => {
    await authService.signup(req.body);
    successResponse<IUser>({
      message:
        "Account created successfully, a confirmation OTP was sent to your email",
      res,
      status: 201,
    });
  },
);
router.post("/login", validation(validators.login), async (req, res, next) => {
  const data = await authService.login(
    req.body,
    `${req.protocol}://${req.host}`,
  );
  successResponse({
    message: "Login success",
    res,
    data,
  });
});

router.patch(
  "/confirmEmail",
  validation(validators.confirmEmail),
  async (req, res, next) => {
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
  async (req, res, next) => {
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
  async (req, res, next) => {
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
  async (req, res, next) => {
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
    async (req, res, next) => {
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

export default router;
