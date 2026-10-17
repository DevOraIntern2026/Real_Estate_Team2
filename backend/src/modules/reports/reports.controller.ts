import { Router } from "express";
import { OWNER_OR_AGENT, RoleEnum } from "../../common/enums";
import { successResponse } from "../../common/response";
import { authentication } from "../../middlewares/authentication.middleware";
import { authorization } from "../../middlewares/authorization.middleware";
import reportsService from "./reports.service";

const router = Router();

router.use(authentication(), authorization([...OWNER_OR_AGENT, RoleEnum.ADMIN]));

router.get("/summary", async (req, res) => {
  const data = await reportsService.getSummary(
    { id: req.user._id.toString(), role: req.user.role },
    { from: req.query.from as string, to: req.query.to as string },
  );
  successResponse({ res, message: "Reports summary fetched successfully", data });
});

router.get("/", async (req, res) => {
  const data = await reportsService.getSummary(
    { id: req.user._id.toString(), role: req.user.role },
    { from: req.query.from as string, to: req.query.to as string },
  );
  successResponse({ res, message: "Reports summary fetched successfully", data });
});

export default router;
