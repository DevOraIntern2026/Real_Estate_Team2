import { Router } from "express";
import { successResponse } from "../../common/response";
import landingPageService from "./landing-page.service";

const router = Router();

router.get("/", async (_req, res) => {
  const data = await landingPageService.getLandingPageData();
  successResponse({
    res,
    message: "Landing page data fetched successfully",
    data,
  });
});

export default router;