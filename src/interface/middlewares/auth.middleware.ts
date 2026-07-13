import { Request, Response, NextFunction } from "express";
import { ClerkTokenVerifier } from "../../infrastructure/auth/clerk-token-verifier";
import { UnauthorizedError } from "../../core/error/custom-errors";

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    orgId?: string;
    orgRole?: string;
  };
}

/**
 * Middleware factory that creates an Express authentication guard
 * utilizing the injected ClerkTokenVerifier.
 */
export function createAuthMiddleware(verifier: ClerkTokenVerifier) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new UnauthorizedError("Authentication token is missing or malformed."));
    }

    const token = authHeader.split(" ")[1];

    try {
      const payload = await verifier.verifyToken(token);
      req.auth = payload;
      next();
    } catch (error) {
      next(new UnauthorizedError((error as Error).message));
    }
  };
}
