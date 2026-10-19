import { Router } from "express";
import { OWNER_OR_AGENT, RoleEnum } from "../../common/enums";
import { successResponse } from "../../common/response";
import { authentication } from "../../middlewares/authentication.middleware";
import { authorization } from "../../middlewares/authorization.middleware";
import { validation } from "../../middlewares/validation.middleware";
import inquiryService from "../inquiry/inquiry.service";
import agentService from "./agent.service";
import * as validators from "./agent.validation";

const router = Router();

// Agents, Owners, and Admins can access agent client management & inquiry routes
router.use(authentication(), authorization([...OWNER_OR_AGENT, RoleEnum.ADMIN]));

router.get("/clients", validation(validators.listClients), async (req, res) => {
  const data = await agentService.listClients(
    req.user._id.toString(),
    req.query as any,
  );
  successResponse({ res, message: "Clients fetched successfully", data });
});

router.post("/clients", validation(validators.addClient), async (req, res) => {
  const data = await agentService.addClient(req.user._id.toString(), req.body);
  successResponse({
    res,
    message: "Client linked successfully",
    data,
    status: 201,
  });
});

router.get(
  "/clients/:id",
  validation(validators.clientIdParam),
  async (req, res) => {
    const data = await agentService.getClientDetails(
      req.user._id.toString(),
      req.params.id as string,
    );
    successResponse({ res, message: "Client details fetched successfully", data });
  },
);

////////////////////////////////////////////////////////////// Endpoint C: Fetch Agent Inquiries Dashboard
router.get(
  "/inquiries",
  validation(validators.listAgentInquiries),
  async (req, res) => {
    const data = await inquiryService.getAgentInquiriesDashboard(
      { id: req.user._id.toString(), role: req.user.role },
      req.query as any,
    );
    successResponse({
      res,
      message: "Agent inquiries fetched successfully",
      data,
    });
  },
);

////////////////////////////////////////////////////////////// Endpoint D: Specific Inquiry & Reply Hub
router.get(
  "/inquiries/:inquiry_id",
  validation(validators.agentInquiryIdParam),
  async (req, res) => {
    const data = await inquiryService.getAgentInquiryDetails(
      req.params.inquiry_id as string,
      { id: req.user._id.toString(), role: req.user.role },
    );
    successResponse({
      res,
      message: "Inquiry details fetched successfully",
      data,
    });
  },
);

////////////////////////////////////////////////////////////// Endpoint E: Agent Post Reply Action
router.post(
  "/inquiries/:inquiry_id/replies",
  validation(validators.agentInquiryReply),
  async (req, res) => {
    const text = req.body.text_content || req.body.text;
    const data = await inquiryService.agentReply(
      req.params.inquiry_id as string,
      {
        id: req.user._id.toString(),
        role: req.user.role,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
      },
      text,
    );
    successResponse({
      res,
      message: "Reply sent successfully",
      data,
      status: 201,
    });
  },
);

////////////////////////////////////////////////////////////// Close / Archive Inquiry
router.patch(
  "/inquiries/:inquiry_id/close",
  validation(validators.agentInquiryIdParam),
  async (req, res) => {
    const data = await inquiryService.closeInquiry(
      req.params.inquiry_id as string,
      { id: req.user._id.toString(), role: req.user.role },
    );
    successResponse({
      res,
      message: "Inquiry closed successfully",
      data,
    });
  },
);

export default router;
