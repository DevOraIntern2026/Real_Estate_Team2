import { Request, Response } from "express";
import { successResponse } from "../../common/response";
import landingPageService from "./landing-page.service";

class LandingPageController {
  /**
   * GET /api/landingPage
   * Public — returns all landing page sections in one payload.
   */
  getLandingPage = async (_req: Request, res: Response): Promise<void> => {
    const data = await landingPageService.getLandingPageData();

    successResponse({
      res,
      message: "Landing page data fetched successfully",
      data,
    });
  };

  /**
   * GET /api/landingPage/debug
   * Temporary helper — inspect what is really in the DB.
   * Remove before going to production.
   */
  debug = async (_req: Request, res: Response): Promise<void> => {
    const data = await landingPageService.debugData();

    successResponse({
      res,
      message: "Landing page debug info fetched successfully",
      data,
    });
  };
}

export default new LandingPageController();