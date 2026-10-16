import { Router } from "express";
import propertyDetailsController from "./property-details.controller";

const router = Router();

router.get("/:id", propertyDetailsController.getById.bind(propertyDetailsController));

export default router;