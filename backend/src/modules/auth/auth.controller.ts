// import type { Response, Request, NextFunction } from "express";
import { Router } from "express";
import { IUser } from "../../common/interfaces";
import { successResponse } from "../../common/response";
import { imageUpload } from "../../common/utils/multer";
import { authentication } from "../../middlewares/authentication.middleware";
import { validation } from "../../middlewares/validation.middleware";
import authService from "./auth.service";
import * as validators from "./auth.validation";

const router = Router();
////////////////// System auth
router.post(
  "/signup",
  validation(validators.signup),
  async (req, res, next) => {
    const data = await authService.signup(req.body);
    successResponse<IUser>({
      message:
        "Account created successfully, a confirmation OTP was sent to your email",
      res,
      data,
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
);

/////////////////// Profile & Session Management (Admin / Users)
router.get("/me", authentication(), async (req, res, next) => {
  const data = await authService.getMe(req.user!._id.toString());
  return res.status(200).json(data);
});

router.patch(
  "/me",
  authentication(),
  validation(validators.editProfile),
  async (req, res, next) => {
    const data = await authService.updateMe(req.user!._id.toString(), req.body);
    return res.status(200).json(data);
  },
);

router.post(
  "/me/photo",
  authentication(),
  imageUpload.single("file"),
  async (req, res, next) => {
    const data = await authService.updatePhoto(
      req.user!._id.toString(),
      req.file as Express.Multer.File,
    );
    return res.status(200).json(data);
  },
);

router.post(
  "/change-password",
  authentication(),
  validation(validators.changePassword),
  async (req, res, next) => {
    const result = await authService.changePassword(
      req.user!._id.toString(),
      req.body,
    );
    return res.status(200).json(result);
  },
);

router.post(
  "/logout",
  authentication(),
  validation(validators.logout),
  async (req, res, next) => {
    await authService.logout(req.decoded, req.body?.refreshToken);
    return res.status(204).send();
  },
);

router.post(
  "/refresh",
  validation(validators.refreshToken),
  async (req, res, next) => {
    const data = await authService.refreshToken(
      req.body.refreshToken,
      `${req.protocol}://${req.host}`,
    );
    successResponse({
      message: "Token refreshed successfully",
      res,
      data,
    });
  },
);

export default router;
