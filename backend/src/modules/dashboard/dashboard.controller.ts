import { Router } from "express";
import { OWNER_OR_AGENT, RoleEnum } from "../../common/enums";
import { successResponse } from "../../common/response";
import { authentication } from "../../middlewares/authentication.middleware";
import { authorization } from "../../middlewares/authorization.middleware";
import dashboardService from "./dashboard.service";

const router = Router();

router.use(authentication(), authorization([...OWNER_OR_AGENT, RoleEnum.ADMIN]));

router.get("/summary", async (req, res) => {
  const data = await dashboardService.getSummary({
    id: req.user._id.toString(),
    role: req.user.role,
  });
  successResponse({ res, message: "Dashboard summary fetched successfully", data });
});

router.get("/recent-properties", async (req, res) => {
  const limit = req.query.limit ? Math.min(Number(req.query.limit), 20) : 3;
  const data = await dashboardService.getRecentProperties(
    { id: req.user._id.toString(), role: req.user.role },
    limit,
  );
  successResponse({ res, message: "Recent properties fetched successfully", data });
});

router.get("/recent-inquiries", async (req, res) => {
  const limit = req.query.limit ? Math.min(Number(req.query.limit), 20) : 3;
  const data = await dashboardService.getRecentInquiries(
    { id: req.user._id.toString(), role: req.user.role },
    limit,
  );
  successResponse({ res, message: "Recent inquiries fetched successfully", data });
});

router.get("/recent-notifications", async (req, res) => {
  const limit = req.query.limit ? Math.min(Number(req.query.limit), 20) : 3;
  const data = await dashboardService.getRecentNotifications(
    { id: req.user._id.toString(), role: req.user.role },
    limit,
  );
  successResponse({ res, message: "Recent notifications fetched successfully", data });
});

router.get("/", async (req, res) => {
  const data = await dashboardService.getDashboard({
    id: req.user._id.toString(),
    role: req.user.role,
  });
  successResponse({ res, message: "Dashboard data fetched successfully", data });
});

export default router;
