import { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../../core/error/custom-errors";

/**
 * Global Express error handling middleware.
 * Maps custom AppErrors to HTTP responses and hides system traces in production.
 */
export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  // 1. Custom operational app errors
  if (err instanceof AppError) {
    const payload: any = {
      status: "error",
      message: err.message,
    };

    if (err instanceof ValidationError) {
      payload.errors = err.errors;
    }

    return res.status(err.statusCode).json(payload);
  }

  // 2. Express JSON parsing errors
  if ("status" in err && (err as any).status === 400 && "body" in err) {
    return res.status(400).json({
      status: "error",
      message: "Invalid JSON payload structure.",
    });
  }

  // 3. Fallback for unhandled internal failures
  console.error("[CRITICAL] Unhandled Exception:", err);

  const isDev = process.env.NODE_ENV === "development";

  return res.status(500).json({
    status: "error",
    message: isDev ? err.message : "An unexpected server error occurred.",
    stack: isDev ? err.stack : undefined,
  });
}
