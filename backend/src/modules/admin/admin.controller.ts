import { Router } from "express";
import { RoleEnum } from "../../common/enums";
import { imageUpload } from "../../common/utils/multer";
import { authentication } from "../../middlewares/authentication.middleware";
import { authorization } from "../../middlewares/authorization.middleware";
import { validation } from "../../middlewares/validation.middleware";
import userService from "../user/user.service";
import { editProfile } from "../user/user.validation";
import adminService from "./admin.service";
import * as validators from "./admin.validation";

const router = Router();

// Apply admin authentication & authorization globally across all routes in this router
router.use(authentication(), authorization([RoleEnum.ADMIN]));

////////////////////////////////////////////////////////////////////////////////
// 1) OVERVIEW
////////////////////////////////////////////////////////////////////////////////
router.get(
  "/overview",
  validation(validators.overview),
  async (req, res, next) => {
    const data = await adminService.getOverview(req.query);
    return res.status(200).json(data);
  },
);

////////////////////////////////////////////////////////////////////////////////
// 2) LISTINGS
////////////////////////////////////////////////////////////////////////////////
router.get(
  "/listings",
  validation(validators.listings),
  async (req, res, next) => {
    const data = await adminService.getListings(req.query);
    return res.status(200).json(data);
  },
);

router.get("/listings/counts", async (req, res, next) => {
  const data = await adminService.getListingsCounts();
  return res.status(200).json(data);
});

router.get("/listings/filters", async (req, res, next) => {
  const data = await adminService.getListingsFilters();
  return res.status(200).json(data);
});

router.get("/listings/categories", async (req, res, next) => {
  const data = await adminService.getListingsCategories();
  return res.status(200).json(data);
});

router.get(
  "/listings/:id",
  validation(validators.paramId),
  async (req, res, next) => {
    const data = await adminService.getListingById(req.params.id as string);
    return res.status(200).json(data);
  },
);

router.patch(
  "/listings/:id",
  validation(validators.updateListing),
  async (req, res, next) => {
    const data = await adminService.updateListing(
      req.params.id as string,
      req.body,
      req.user!._id.toString(),
    );
    return res.status(200).json(data);
  },
);

router.post(
  "/listings/:id/approve",
  validation(validators.approveListing),
  async (req, res, next) => {
    const data = await adminService.approveListing(
      req.params.id as string,
      req.body,
      req.user!._id.toString(),
    );
    return res.status(200).json(data);
  },
);

router.post(
  "/listings/:id/reject",
  validation(validators.rejectListing),
  async (req, res, next) => {
    const data = await adminService.rejectListing(
      req.params.id as string,
      req.body,
      req.user!._id.toString(),
    );
    return res.status(200).json(data);
  },
);

router.post(
  "/listings/:id/request-changes",
  validation(validators.requestChanges),
  async (req, res, next) => {
    const data = await adminService.requestChanges(
      req.params.id as string,
      req.body,
      req.user!._id.toString(),
    );
    return res.status(200).json(data);
  },
);

router.post(
  "/listings/:id/deactivate",
  validation(validators.paramId),
  async (req, res, next) => {
    const data = await adminService.deactivateListing(
      req.params.id as string,
      req.user!._id.toString(),
    );
    return res.status(200).json(data);
  },
);

router.post(
  "/listings/:id/reactivate",
  validation(validators.paramId),
  async (req, res, next) => {
    const data = await adminService.reactivateListing(
      req.params.id as string,
      req.user!._id.toString(),
    );
    return res.status(200).json(data);
  },
);

////////////////////////////////////////////////////////////////////////////////
// 3) USERS
////////////////////////////////////////////////////////////////////////////////
router.get("/users", validation(validators.users), async (req, res, next) => {
  const data = await adminService.getUsers(req.query);
  return res.status(200).json(data);
});

router.get(
  "/users/:id",
  validation(validators.paramId),
  async (req, res, next) => {
    const data = await adminService.getUserById(req.params.id as string);
    return res.status(200).json(data);
  },
);

router.get(
  "/users/:id/listings",
  validation(validators.userListings),
  async (req, res, next) => {
    const data = await adminService.getUserListings(
      req.params.id as string,
      req.query,
    );
    return res.status(200).json(data);
  },
);

router.post(
  "/users/:id/activate",
  validation(validators.paramId),
  async (req, res, next) => {
    const data = await adminService.activateUser(req.params.id as string);
    return res.status(200).json(data);
  },
);

router.post(
  "/users/:id/suspend",
  validation(validators.suspendUser),
  async (req, res, next) => {
    const data = await adminService.suspendUser(
      req.params.id as string,
      req.body,
      req.user!._id.toString(),
    );
    return res.status(200).json(data);
  },
);

////////////////////////////////////////////////////////////////////////////////
// 4) NOTIFICATIONS
////////////////////////////////////////////////////////////////////////////////
router.get(
  "/notifications",
  validation(validators.notifications),
  async (req, res, next) => {
    const data = await adminService.getNotifications(req.query);
    return res.status(200).json(data);
  },
);

router.get("/notifications/unread-count", async (req, res, next) => {
  const data = await adminService.getUnreadNotificationsCount();
  return res.status(200).json(data);
});

router.patch(
  "/notifications/:id/read",
  validation(validators.paramId),
  async (req, res, next) => {
    const data = await adminService.markNotificationRead(
      req.params.id as string,
    );
    return res.status(200).json(data);
  },
);

router.patch("/notifications/read-all", async (req, res, next) => {
  const data = await adminService.markAllNotificationsRead();
  return res.status(200).json(data);
});

router.delete("/notifications", async (req, res, next) => {
  await adminService.clearNotifications();
  return res.status(204).send();
});

////////////////////////////////////////////////////////////////////////////////
// 5) REPORTS
////////////////////////////////////////////////////////////////////////////////
router.get(
  "/reports",
  validation(validators.reports),
  async (req, res, next) => {
    const data = await adminService.getReports(req.query);
    return res.status(200).json(data);
  },
);

////////////////////////////////////////////////////////////////////////////////
// 6) ADMIN PROFILE ALIASES (Matching spec Section 9)
////////////////////////////////////////////////////////////////////////////////
router.get(["/auth/me", "/profile"], async (req, res, next) => {
  const data = await userService.getMe(req.user!._id.toString());
  return res.status(200).json(data);
});

router.patch(
  ["/auth/me", "/profile"],
  validation(editProfile),
  async (req, res, next) => {
    const data = await userService.updateMe(req.user!._id.toString(), req.body);
    return res.status(200).json(data);
  },
);

router.post(
  ["/auth/me/photo", "/profile/photo"],
  imageUpload.single("file"),
  async (req, res, next) => {
    const data = await userService.updatePhoto(
      req.user!._id.toString(),
      req.file as Express.Multer.File,
    );
    return res.status(200).json(data);
  },
);

export default router;
