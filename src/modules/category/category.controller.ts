import { Router } from "express";
import { RoleEnum } from "../../common/enums";
import { successResponse } from "../../common/response";
import { authentication } from "../../middlewares/authentication.middleware";
import { authorization } from "../../middlewares/authorization.middleware";
import { validation } from "../../middlewares/validation.middleware";
import categoryService from "./category.service";
import * as validators from "./category.validation";

const router = Router();

// Public: anyone browsing properties needs the category list to build filters
router.get(
  "/",
  validation(validators.listCategories),
  async (req, res) => {
    const data = await categoryService.list(req.query as any);
    successResponse({ res, message: "Categories fetched successfully", data });
  },
);

router.get(
  "/:id",
  validation(validators.categoryIdParam),
  async (req, res) => {
    const data = await categoryService.getById(req.params.id as string);
    successResponse({ res, message: "Category fetched successfully", data });
  },
);

// Admin only: categories are shared platform taxonomy, not user content
router.post(
  "/",
  authentication(),
  authorization([RoleEnum.ADMIN]),
  validation(validators.createCategory),
  async (req, res) => {
    const data = await categoryService.create(req.body);
    successResponse({
      res,
      message: "Category created successfully",
      data,
      status: 201,
    });
  },
);

router.patch(
  "/:id",
  authentication(),
  authorization([RoleEnum.ADMIN]),
  validation(validators.updateCategory),
  async (req, res) => {
    const data = await categoryService.update(req.params.id as string, req.body);
    successResponse({ res, message: "Category updated successfully", data });
  },
);

router.delete(
  "/:id",
  authentication(),
  authorization([RoleEnum.ADMIN]),
  validation(validators.categoryIdParam),
  async (req, res) => {
    await categoryService.remove(req.params.id as string);
    successResponse({ res, message: "Category deleted successfully" });
  },
);

export default router;
