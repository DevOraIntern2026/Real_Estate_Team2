import { Router } from "express";
import { validation } from "../../middlewares/validation.middleware";
import searchPageController from "./search-page.controller";
import * as validators from "./search-page.validation";

const router = Router();

router.get(
  "/",
  validation({ query: validators.searchProperties }),
  searchPageController.search.bind(searchPageController),
);

export default router;