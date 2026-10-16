import { Router } from "express";
import { successResponse } from "../../common/response";
import { authentication } from "../../middlewares/authentication.middleware";
import { validation } from "../../middlewares/validation.middleware";
import notificationService from "./notification.service";
import * as validators from "./notification.validation";

const router = Router();

router.use(authentication());

router.get("/", validation(validators.listNotifications), async (req, res) => {
  const data = await notificationService.list(
    req.user._id.toString(),
    req.query as any,
  );
  successResponse({ res, message: "Notifications fetched successfully", data });
});

router.get("/unread-count", async (req, res) => {
  const data = await notificationService.getUnreadCount(req.user._id.toString());
  successResponse({ res, message: "Unread notifications count fetched successfully", data });
});

router.patch("/read-all", async (req, res) => {
  const data = await notificationService.markAllAsRead(req.user._id.toString());
  successResponse({ res, message: "All notifications marked as read", data });
});

router.patch(
  "/:id/read",
  validation(validators.notificationIdParam),
  async (req, res) => {
    const data = await notificationService.markAsRead(
      req.params.id as string,
      req.user._id.toString(),
    );
    successResponse({ res, message: "Notification marked as read", data });
  },
);

router.delete(
  "/:id",
  validation(validators.notificationIdParam),
  async (req, res) => {
    await notificationService.remove(
      req.params.id as string,
      req.user._id.toString(),
    );
    successResponse({ res, message: "Notification deleted successfully" });
  },
);

export default router;
