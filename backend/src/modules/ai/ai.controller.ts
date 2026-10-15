import { NextFunction, Request, Response, Router } from "express";
import { successResponse } from "../../common/response";
import { validation } from "../../middlewares/validation.middleware";
import { aiService } from "./ai.service";
import { recommendPropertyValidation } from "./ai.validation";

const router = Router();

// In-memory sliding window rate limiter for the AI endpoint (30 requests/minute per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;

const aiRateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || req.socket.remoteAddress || "anonymous";
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    res.status(429).json({
      Error: "Too many requests to AI Assistant. Please wait a minute before trying again.",
      cause: { code: "RATE_LIMIT_EXCEEDED" },
    });
    return;
  }

  record.count += 1;
  next();
};

// Periodic cleanup of expired rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref();

/**
 * POST /api/ai/recommend
 * Natural language property search and recommendation.
 * Public endpoint matching DEVORA public search conventions.
 */
router.post(
  "/recommend",
  aiRateLimiter,
  validation(recommendPropertyValidation),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { message } = req.body;
      const testSimulation =
        process.env.NODE_ENV !== "prod"
          ? (req.headers["x-test-simulation"] as string | undefined)
          : undefined;
      const data = await aiService.getRecommendations(message, { testSimulation });

      let responseMessage = "Recommendations fetched successfully";
      if (data.needsClarification) {
        responseMessage = "Clarification required";
      } else if (data.unsupportedAction) {
        responseMessage = "Action not supported via AI assistant";
      }

      successResponse({
        res,
        message: responseMessage,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
