import { NextFunction, Request, Response, Router } from "express";
import { RoleEnum } from "../../common/enums";
import { successResponse } from "../../common/response";
import { TokenService } from "../../common/services/jwt";
import { decrypt } from "../../common/utils/security";
import { authentication } from "../../middlewares/authentication.middleware";
import { authorization } from "../../middlewares/authorization.middleware";
import { validation } from "../../middlewares/validation.middleware";
import inquiryService from "../inquiry/inquiry.service";
import * as validators from "./customer.validation";

const router = Router();
const tokenService = new TokenService();

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
    // Treat invalid token on optional route as anonymous
  }
  next();
};

////////////////////////////////////////////////////////////// Endpoint A: Customer Inquiries List
router.get(
  "/inquiries",
  authentication(),
  authorization([RoleEnum.CUSTOMER, RoleEnum.ADMIN]),
  validation(validators.listCustomerInquiries),
  async (req, res) => {
    const data = await inquiryService.getCustomerInquiries(
      { id: req.user._id.toString(), email: req.user.email },
      req.query as any,
    );
    successResponse({
      res,
      message: "Customer inquiries fetched successfully",
      data,
    });
  },
);

////////////////////////////////////////////////////////////// Customer Submit Inquiry
router.post(
  "/inquiries",
  optionalAuthentication,
  validation(validators.createCustomerInquiry),
  async (req, res) => {
    const user = req.user as any;
    const customerId = user?._id?.toString();
    const customerName =
      req.body.customerName ||
      (user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Customer");
    const customerEmail = req.body.customerEmail || user?.email;

    let customerPhone = req.body.customerPhone;
    if (!customerPhone && user?.phone) {
      try {
        customerPhone = await decrypt(user.phone);
      } catch {
        customerPhone = user.phone;
      }
    }
    if (!customerPhone) customerPhone = "+201000000000";

    const data = await inquiryService.createInquiry({
      propertyId: req.body.propertyId,
      customerName,
      customerEmail,
      customerPhone,
      message: req.body.message,
      customerId,
    });

    successResponse({
      res,
      message: "Inquiry submitted successfully",
      data,
      status: 201,
    });
  },
);

////////////////////////////////////////////////////////////// Endpoint B: Customer Chat Feed
router.get(
  "/chats/:chat_id",
  authentication(),
  authorization([RoleEnum.CUSTOMER, RoleEnum.ADMIN]),
  validation(validators.chatIdParam),
  async (req, res) => {
    const data = await inquiryService.getCustomerChat(
      req.params.chat_id as string,
      { id: req.user._id.toString(), email: req.user.email },
    );
    successResponse({
      res,
      message: "Customer chat history fetched successfully",
      data,
    });
  },
);

////////////////////////////////////////////////////////////// Customer Send Message in Chat
router.post(
  "/chats/:chat_id/messages",
  authentication(),
  authorization([RoleEnum.CUSTOMER, RoleEnum.ADMIN]),
  validation(validators.sendCustomerMessage),
  async (req, res) => {
    const text = req.body.text || req.body.text_content;
    const customerName = `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim();
    const data = await inquiryService.sendCustomerMessage(
      req.params.chat_id as string,
      {
        id: req.user._id.toString(),
        email: req.user.email,
        name: customerName,
      },
      text,
    );
    successResponse({
      res,
      message: "Message sent successfully",
      data,
      status: 201,
    });
  },
);

////////////////////////////////////////////////////////////// Close Inquiry from Customer Side
router.patch(
  "/inquiries/:id/close",
  authentication(),
  authorization([RoleEnum.CUSTOMER, RoleEnum.ADMIN]),
  validation(validators.inquiryIdParam),
  async (req, res) => {
    const data = await inquiryService.closeInquiry(req.params.id as string, {
      id: req.user._id.toString(),
      role: req.user.role,
      email: req.user.email,
    });
    successResponse({
      res,
      message: "Inquiry closed successfully",
      data,
    });
  },
);

export default router;
