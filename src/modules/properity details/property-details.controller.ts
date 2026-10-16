import { Request, Response } from "express";
import { successResponse } from "../../common/response";
import { NotFoundException } from "../../common/exceptions";
import propertyDetailsService from "./property-details.service";

class PropertyDetailsController {
  async getById(req: Request, res: Response): Promise<void> {
    const data = await propertyDetailsService.getById(req.params.id as string);
    if (!data) throw new NotFoundException("Property not found");

    successResponse({
      res,
      message: "Property details fetched successfully",
      data,
    });
  }
}

export default new PropertyDetailsController();