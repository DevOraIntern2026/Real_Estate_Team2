import { Router } from "express";
import { successResponse } from "../../common/response";
import { imageUpload } from "../../common/utils/multer";
import { authentication } from "../../middlewares/authentication.middleware";
import { validation } from "../../middlewares/validation.middleware";
import authService from "./auth.service";
import * as validators from "./auth.validation";

const router = Router();
router.use(authentication());

router.get("/", async (req, res) => {
  const data = await authService.getMe(req.user!._id.toString());
  successResponse({ res, message: "Profile fetched successfully", data });
});

router.patch("/", validation(validators.editProfile), async (req, res) => {
  const data = await authService.updateMe(req.user!._id.toString(), req.body);
  successResponse({ res, message: "Profile updated successfully", data });
});

const avatarUploadHandler = async (req: any, res: any) => {
  const file = req.file as Express.Multer.File;
  const data = await authService.updatePhoto(req.user!._id.toString(), file);
  successResponse({ res, message: "Avatar uploaded successfully", data });
};

router.post("/avatar", imageUpload.single("avatar"), avatarUploadHandler);
router.post("/photo", imageUpload.single("file"), avatarUploadHandler);

const avatarDeleteHandler = async (req: any, res: any) => {
  const data = await authService.deletePhoto(req.user!._id.toString());
  successResponse({ res, message: "Avatar removed successfully", data });
};

router.delete("/avatar", avatarDeleteHandler);
router.delete("/photo", avatarDeleteHandler);

const changePasswordHandler = async (req: any, res: any) => {
  const data = await authService.changePassword(req.user!._id.toString(), req.body);
  successResponse({ res, message: "Password updated successfully", data });
};

router.put("/password", validation(validators.changePassword), changePasswordHandler);
router.post("/password", validation(validators.changePassword), changePasswordHandler);

router.delete("/", async (req, res) => {
  const data = await authService.deleteMe(req.user!._id.toString());
  successResponse({ res, message: "Account deleted successfully", data });
});

router.post("/logout", async (req, res) => {
  await authService.logout(req.decoded, req.body?.refreshToken);
  return res.status(204).send();
});

export default router;
