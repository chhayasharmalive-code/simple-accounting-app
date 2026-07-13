import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "../../core/error/custom-errors";

/**
 * Middleware wrapper that validates the incoming request body against a Zod schema.
 * Replaces req.body with the parsed/validated result (carrying defaults, coercions, etc.).
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format error paths and messages cleanly
        const formatted = error.errors.reduce((acc: Record<string, string>, issue) => {
          const pathName = issue.path.join(".");
          acc[pathName] = issue.message;
          return acc;
        }, {});

        return next(new ValidationError("Request validation failed.", formatted));
      }
      next(error);
    }
  };
}
