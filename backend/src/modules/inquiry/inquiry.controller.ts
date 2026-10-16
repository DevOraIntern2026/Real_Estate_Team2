import { Router } from "express";
import { OWNER_OR_AGENT, RoleEnum } from "../../common/enums";
import { successResponse } from "../../common/response";
import { authentication } from "../../middlewares/authentication.middleware";
import { authorization } from "../../middlewares/authorization.middleware";
import { validation } from "../../middlewares/validation.middleware";
import inquiryService from "./inquiry.service";
import * as validators from "./inquiry.validation";

const router = Router();

////////////////////////////////////////////////////////////// Public inquiry creation
router.post("/", validation(validators.createInquiry), async (req, res) => {
  const customerId = (req as any).user?._id?.toString();
  const data = await inquiryService.createInquiry({
    ...req.body,
    customerId,
  });
  successResponse({
    res,
    message: "Inquiry submitted successfully",
    data,
    status: 201,
  });
});

////////////////////////////////////////////////////////////// Protected routes
router.use(authentication(), authorization([...OWNER_OR_AGENT, RoleEnum.ADMIN]));

router.get("/", validation(validators.listInquiries), async (req, res) => {
  const data = await inquiryService.listInquiries(
    { id: req.user._id.toString(), role: req.user.role },
    req.query as any,
  );
  successResponse({ res, message: "Inquiries fetched successfully", data });
});

router.get("/:id", validation(validators.inquiryIdParam), async (req, res) => {
  const data = await inquiryService.getById(req.params.id as string, {
    id: req.user._id.toString(),
    role: req.user.role,
  });
  successResponse({ res, message: "Inquiry details fetched successfully", data });
});

router.get(
  "/:id/messages",
  validation(validators.inquiryIdParam),
  async (req, res) => {
    const data = await inquiryService.getMessages(req.params.id as string, {
      id: req.user._id.toString(),
      role: req.user.role,
    });
    successResponse({ res, message: "Messages fetched successfully", data });
  },
);

router.post(
  "/:id/messages",
  validation(validators.sendMessage),
  async (req, res) => {
    const data = await inquiryService.sendMessage(
      req.params.id as string,
      { id: req.user._id.toString(), role: req.user.role },
      req.body.text,
    );
    successResponse({
      res,
      message: "Message sent successfully",
      data,
      status: 201,
    });
  },
);

router.patch(
  "/:id/status",
  validation(validators.updateInquiryStatus),
  async (req, res) => {
    const data = await inquiryService.updateStatus(
      req.params.id as string,
      { id: req.user._id.toString(), role: req.user.role },
      req.body.status,
    );
    successResponse({ res, message: "Inquiry status updated successfully", data });
  },
);

export default router;
