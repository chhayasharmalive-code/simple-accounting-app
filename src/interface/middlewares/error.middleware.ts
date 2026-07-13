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

  // 3. Prisma Database errors
  if (err.name === "PrismaClientKnownRequestError" || "code" in err) {
    const prismaError = err as any;
    const code = prismaError.code;

    // P2003: Foreign Key Constraint failed (e.g., user profile doesn't exist in local database)
    if (code === "P2003") {
      return res.status(400).json({
        status: "error",
        message: "Database constraint failed: The referenced record does not exist. If you just logged in, your user profile might not have been synchronized from Clerk yet. Please verify your Clerk Webhook configuration and secret key.",
      });
    }

    // P2002: Unique Constraint failed
    if (code === "P2002") {
      return res.status(409).json({
        status: "error",
        message: "Database constraint failed: A record with this unique identifier already exists.",
      });
    }

    // P2025: Record not found
    if (code === "P2025") {
      return res.status(404).json({
        status: "error",
        message: "Database constraint failed: The requested record was not found.",
      });
    }
  }

  // 4. Fallback for unhandled internal failures
  console.error("[CRITICAL] Unhandled Exception:", err);

  const isDev = process.env.NODE_ENV === "development";

  return res.status(500).json({
    status: "error",
    message: isDev ? err.message : "An unexpected server error occurred.",
    stack: isDev ? err.stack : undefined,
  });
}
