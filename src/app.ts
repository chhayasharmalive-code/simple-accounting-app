import express from "express";
import cors from "cors";
import { errorMiddleware } from "./interface/middlewares/error.middleware";

/**
 * Creates and configures the Express application.
 * Accepts the pre-aggregated apiRouter to support clean Dependency Injection.
 */
export function createApp(apiRouter: express.Router): express.Express {
  const app = express();

  // CORS support
  app.use(cors());

  /**
   * Conditional body parser:
   * Webhook routes require raw request buffers for signature verification.
   * Other API endpoints expect standard JSON parsing.
   */
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith("/api/webhooks")) {
      return next();
    }
    return express.json()(req, res, next);
  });

  // Simple service status check
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString()
    });
  });

  // Mount unified application routes
  app.use("/api", apiRouter);

  // Global error responder
  app.use(errorMiddleware);

  return app;
}
