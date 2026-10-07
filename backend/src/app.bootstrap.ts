import cors from "cors";
import type { Express, NextFunction, Request, Response } from "express";
import express from "express";
import { PORT } from "./common/config/config";
import { redisService } from "./common/services/redis";
import { mongoDBConnection } from "./DB/db.connections";
import { globalErrorHandler } from "./middlewares";
import { authRouter } from "./modules/auth";
import { categoryRouter } from "./modules/category";
import { propertyRouter } from "./modules/property";

// Takes a function following the common error-first callback style, i.e. taking an (err, value) => ... callback as the last argument, and returns a version that returns promises.
// const s3WriteStream = promisify(pipeline);
export const bootstrap = async () => {
  const app: Express = express();
  //////////// DB connections
  await mongoDBConnection();
  await redisService.connect();
  //////////// global middlewares
  app.use(cors(), express.json());

  //////////// APIs
  app.use("/api/auth", authRouter);
  app.use("/api/categories", categoryRouter);
  app.use("/api/properties", propertyRouter);

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
    } catch (error) {
      console.error(err);
    }
  });
};
