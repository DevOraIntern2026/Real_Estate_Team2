import { Router } from "express";
import { successResponse } from "../../common/response";
import { imageUpload } from "../../common/utils/multer";
import { authentication } from "../../middlewares/authentication.middleware";
import { validation } from "../../middlewares/validation.middleware";

import userService from "./user.service";
import { editProfile } from "./user.validation";

const router = Router();
router.use(authentication());

router.get(["/", "/me"], async (req, res) => {
  const data = await userService.getMe(req.user!._id.toString());
  successResponse({ res, message: "Profile fetched successfully", data });
});

router.patch("/", validation(editProfile), async (req, res) => {
  const data = await userService.updateMe(req.user!._id.toString(), req.body);
  successResponse({ res, message: "Profile updated successfully", data });
});

const avatarUploadHandler = async (req: any, res: any) => {
  const file = req.file as Express.Multer.File;
  const data = await userService.updatePhoto(req.user!._id.toString(), file);
  successResponse({ res, message: "Avatar uploaded successfully", data });
};

router.post("/avatar", imageUpload.single("avatar"), avatarUploadHandler);
router.post("/photo", imageUpload.single("file"), avatarUploadHandler);

const avatarDeleteHandler = async (req: any, res: any) => {
  const data = await userService.deletePhoto(req.user!._id.toString());
  successResponse({ res, message: "Avatar removed successfully", data });
};

router.delete("/avatar", avatarDeleteHandler);
router.delete("/photo", avatarDeleteHandler);

router.delete("/", async (req, res) => {
  const data = await userService.deleteMe(req.user!._id.toString());
  successResponse({ res, message: "Account deleted successfully", data });
});

export default router;
