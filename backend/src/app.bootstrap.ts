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
import { dashboardRouter } from "./modules/dashboard";
import { inquiryRouter } from "./modules/inquiry";
import { notificationRouter } from "./modules/notification";
import { propertyRouter } from "./modules/property";
<<<<<<< HEAD
import landingPageRoute from "./modules/landing-page/landing-page.route";
import searchPageRoute from "./modules/search-page/search-page.route";
import propertyDetailsRoute from "./modules/properity details/property-details.route";
=======
import { reportsRouter } from "./modules/reports";

import fs from "node:fs";
import path from "node:path";
>>>>>>> d7af4f1fbbe40ed5c4edf5aa9858c94c21915cf3

export const bootstrap = async () => {
  const app: Express = express();
  //////////// DB connections
  await mongoDBConnection();
  await redisService.connect();
  //////////// global middlewares
  app.use(cors());
  app.use(express.json());

<<<<<<< HEAD
  //////////// APIs
  app.use("/api/auth", authRouter);
  app.use("/api/categories", categoryRouter);
  app.use("/api/properties", propertyRouter);
  app.use("/api/landingPage", landingPageRoute);
  app.use("/api/search", searchPageRoute);
  app.use("/api/property-details", propertyDetailsRoute);
=======
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
    ["/user", userRouter],
    ["/ai", aiRouter],
  ];

  for (const [path, router] of apiRouters) {
    app.use(`/api/v1${path}`, router);
    app.use(`/api${path}`, router);
  }

  //////////// Swagger API Documentation
  setupSwagger(app);

>>>>>>> d7af4f1fbbe40ed5c4edf5aa9858c94c21915cf3
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

  app.listen(PORT, (err) => {
    try {
      console.log(`app is running on port ${PORT}`);
      console.log(`📄 API Docs available at http://localhost:${PORT}/api-docs`);
    } catch (error) {
      console.error(err);
    }
  });
};
