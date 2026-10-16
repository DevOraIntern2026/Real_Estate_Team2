import { Request, Response } from "express";
import { successResponse } from "../../common/response";
import searchPageService from "./search-page.service";

class SearchPageController {
  async search(req: Request, res: Response): Promise<void> {
    const data = await searchPageService.search(req.query as any);
    successResponse({
      res,
      message: "Search results fetched successfully",
      data,
    });
  }
}

export default new SearchPageController();