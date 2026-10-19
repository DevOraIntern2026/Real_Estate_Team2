import cors from "cors";
import type { Express, NextFunction, Request, Response } from "express";
import express from "express";
import { PORT } from "./common/config/config";
import { redisService } from "./common/services/redis";
import { setupSwagger } from "./common/swagger/swagger.config";
import { mongoDBConnection } from "./DB/db.connections";
import { globalErrorHandler } from "./middlewares";
import { adminRouter } from "./modules/admin";
import { agentRouter } from "./modules/agent";
import { aiRouter } from "./modules/ai";
import { authRouter, userRouter } from "./modules/auth";
import { categoryRouter } from "./modules/category";
import { customerRouter } from "./modules/customer";
import { dashboardRouter } from "./modules/dashboard";
import { inquiryRouter } from "./modules/inquiry";
import { notificationRouter } from "./modules/notification";
import { propertyRouter } from "./modules/property";
import { reportsRouter } from "./modules/reports";
import landingPageRoute from "./modules/landing-page/landing-page.route";
import searchPageRoute from "./modules/search-page/search-page.route";
import propertyDetailsRoute from "./modules/properity details/property-details.route";

import fs from "node:fs";
import path from "node:path";

export const bootstrap = async () => {
  const app: Express = express();
  //////////// DB connections
  await mongoDBConnection();
  await redisService.connect();
  //////////// global middlewares
  app.use(cors());
  app.use(express.json());

  // Ensure uploads directory exists and serve static files
  const uploadsPath = path.resolve(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  app.use("/uploads", express.static(uploadsPath));

  //////////// APIs (Supporting both /api/v1 and /api)
  const apiRouters: [string, any][] = [
    ["/auth", authRouter],
    ["/categories", categoryRouter],
    ["/properties", propertyRouter],
    ["/admin", adminRouter],
    ["/dashboard", dashboardRouter],
    ["/inquiries", inquiryRouter],
    ["/notifications", notificationRouter],
    ["/reports", reportsRouter],
    ["/agent", agentRouter],
    ["/customer", customerRouter],
    ["/user", userRouter],
    ["/ai", aiRouter],
  ];

  for (const [routePath, router] of apiRouters) {
    app.use(`/api/v1${routePath}`, router);
    app.use(`/api${routePath}`, router);
  }

  //////////// Landing page, search, and property details routes
  app.use("/api/v1/landingPage", landingPageRoute);
  app.use("/api/landingPage", landingPageRoute);
  app.use("/api/v1/search", searchPageRoute);
  app.use("/api/search", searchPageRoute);
  app.use("/api/v1/property-details", propertyDetailsRoute);
  app.use("/api/property-details", propertyDetailsRoute);

  //////////// Swagger API Documentation
  setupSwagger(app);

  ////////////// Invalid Routing
  app.use("/*dummy", (req, res, next) => {
    return res.status(404).json({ Error: "Invalid route" });
  });
  app.get("/", (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({ Success: "Landing page" });
  });
  ////////////// global error handling
  app.use(globalErrorHandler);
  ////////////// checking port connection

  app.listen(PORT, (_err) => {
    try {
      console.log(`app is running on port ${PORT}`);
      console.log(`📄 API Docs available at http://localhost:${PORT}/api-docs`);
    } catch (error) {
      console.error(error);
    }
  });
};
