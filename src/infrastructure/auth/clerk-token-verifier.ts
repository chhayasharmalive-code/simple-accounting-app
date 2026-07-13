import { verifyToken } from "@clerk/backend";

export interface ClerkAuthPayload {
  userId: string;
  orgId?: string;
  orgRole?: string;
}

export class ClerkTokenVerifier {
  /**
   * Verifies the Clerk JWT token.
   * If valid, returns the authenticated claims (userId, orgId, orgRole).
   * Otherwise, throws an error.
   */
  public async verifyToken(token: string): Promise<ClerkAuthPayload> {
    try {
      const claims = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      return {
        userId: claims.sub,
        orgId: claims.org_id as string | undefined,
        orgRole: claims.org_role as string | undefined,
      };
    } catch (error) {
      throw new Error(`Invalid authentication token: ${(error as Error).message}`);
    }
  }
}
