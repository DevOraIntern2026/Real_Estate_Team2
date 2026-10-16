import { NextFunction, Request, Response, Router } from "express";
import { OWNER_OR_AGENT, RoleEnum } from "../../common/enums";
import { successResponse } from "../../common/response";
import { TokenService } from "../../common/services/jwt";
import { imageUpload } from "../../common/utils/multer";
import { authentication } from "../../middlewares/authentication.middleware";
import { authorization } from "../../middlewares/authorization.middleware";
import { validation } from "../../middlewares/validation.middleware";
import propertyService from "./property.service";
import * as validators from "./property.validation";

const router = Router();
const tokenService = new TokenService();

// Public routes stay public, but if a valid token IS present we attach the
// user so the service can decide whether to show a non-public listing to its
// owner/an admin and whether to count a view.
const optionalAuthentication = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();
  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return next();
  try {
    const { decodedToken, userAccount } = await tokenService.decodeToken({ token });
    req.user = userAccount;
    req.decoded = decodedToken;
  } catch {
    // invalid/expired token on a public route: just treat the request as anonymous
  }
  next();
};

////////////////////////////////////////////////////////////// Public: search & filter
router.get("/", validation(validators.listProperties), async (req, res) => {
  const data = await propertyService.AllProperties(req.query as any);
  successResponse({ res, message: "Properties fetched successfully", data });
});

// Filter metadata for building the search UI (categories, price range, cities...)
router.get("/meta/filters", async (_req, res) => {
  const data = await propertyService.getFilterMeta();
  successResponse({ res, message: "Filter metadata fetched successfully", data });
});

////////////////////////////////////////////////////////////// Owner/Agent: my listings
router.get(
  "/my",
  authentication(),
  authorization([...OWNER_OR_AGENT, RoleEnum.ADMIN]),
  validation(validators.myProperties),
  async (req, res) => {
    const data = await propertyService.myProperties(
      req.user._id.toString(),
      req.query as any,
    );
    successResponse({ res, message: "Your properties fetched successfully", data });
  },
);

////////////////////////////////////////////////////////////// Public: details (+ optional viewer)
router.get(
  "/:id",
  optionalAuthentication,
  validation(validators.propertyIdParam),
  async (req, res) => {
    const viewer = req.user
      ? { id: req.user._id.toString(), role: req.user.role }
      : undefined;
    const data = await propertyService.getById(req.params.id as string, viewer);
    successResponse({ res, message: "Property fetched successfully", data });
  },
);

////////////////////////////////////////////////////////////// Owner/Agent: create
router.post(
  "/",
  authentication(),
  authorization(OWNER_OR_AGENT),
  validation(validators.createProperty),
  async (req, res) => {
    const data = await propertyService.create(req.user._id.toString(), req.body);
    successResponse({
      res,
      message: "Property created as draft successfully",
      data,
      status: 201,
    });
  },
);

////////////////////////////////////////////////////////////// Owner/Agent/Admin: update
router.patch(
  "/:id",
  authentication(),
  validation(validators.updateProperty),
  async (req, res) => {
    const data = await propertyService.update(
      req.params.id as string,
      { id: req.user._id.toString(), role: req.user.role },
      req.body,
    );
    successResponse({ res, message: "Property updated successfully", data });
  },
);

////////////////////////////////////////////////////////////// Owner: submit for review
router.patch(
  "/:id/submit",
  authentication(),
  authorization(OWNER_OR_AGENT),
  validation(validators.propertyIdParam),
  async (req, res) => {
    const data = await propertyService.submit(
      req.params.id as string,
      req.user._id.toString(),
    );
    successResponse({ res, message: "Property submitted for review", data });
  },
);

////////////////////////////////////////////////////////////// Admin: approval workflow
router.patch(
  "/:id/status",
  authentication(),
  authorization([RoleEnum.ADMIN]),
  validation(validators.updatePropertyStatus),
  async (req, res) => {
    const data = await propertyService.updateStatus(req.params.id as string, req.body);
    successResponse({ res, message: "Property status updated successfully", data });
  },
);

////////////////////////////////////////////////////////////// Owner/Agent/Admin: delete
router.delete(
  "/:id",
  authentication(),
  validation(validators.propertyIdParam),
  async (req, res) => {
    await propertyService.remove(req.params.id as string, {
      id: req.user._id.toString(),
      role: req.user.role,
    });
    successResponse({ res, message: "Property deleted successfully" });
  },
);

////////////////////////////////////////////////////////////// Images
router.post(
  "/:id/images",
  authentication(),
  imageUpload.array("images", 10),
  validation(validators.propertyIdParam),
  async (req, res) => {
    const data = await propertyService.addImages(
      req.params.id as string,
      { id: req.user._id.toString(), role: req.user.role },
      (req.files as Express.Multer.File[]) || [],
    );
    successResponse({ res, message: "Images uploaded successfully", data });
  },
);

router.delete(
  "/:id/images",
  authentication(),
  validation(validators.deletePropertyImage),
  async (req, res) => {
    const data = await propertyService.removeImage(
      req.params.id as string,
      { id: req.user._id.toString(), role: req.user.role },
      req.body.imageUrl,
    );
    successResponse({ res, message: "Image removed successfully", data });
  },
);

export default router;
