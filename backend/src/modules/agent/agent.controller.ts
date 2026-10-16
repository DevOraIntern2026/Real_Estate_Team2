import { Router } from "express";
import { RoleEnum } from "../../common/enums";
import { successResponse } from "../../common/response";
import { authentication } from "../../middlewares/authentication.middleware";
import { authorization } from "../../middlewares/authorization.middleware";
import { validation } from "../../middlewares/validation.middleware";
import agentService from "./agent.service";
import * as validators from "./agent.validation";

const router = Router();

// Only agents (and admins) can access agent client management routes
router.use(authentication(), authorization([RoleEnum.AGENT, RoleEnum.ADMIN]));

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

export default router;
