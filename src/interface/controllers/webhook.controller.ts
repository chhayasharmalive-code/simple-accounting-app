import { Request, Response, NextFunction } from "express";
import { Webhook } from "svix";
import { ClerkSyncService } from "../../application/services/clerk-sync.service";
import { BadRequestError } from "../../core/error/custom-errors";

export class WebhookController {
  constructor(private readonly clerkSyncService: ClerkSyncService) {}

  /**
   * HTTP handler verifying Clerk webhook signature.
   * Dispatches events to synchronise our local database.
   */
  handleClerkWebhook = async (req: Request, res: Response, next: NextFunction) => {
    const secret = process.env.CLERK_WEBHOOK_SECRET;

    if (!secret || secret === "whsec_placeholder") {
      return next(new Error("CLERK_WEBHOOK_SECRET environment variable is missing or placeholder."));
    }

    const svixId = req.headers["svix-id"] as string;
    const svixTimestamp = req.headers["svix-timestamp"] as string;
    const svixSignature = req.headers["svix-signature"] as string;

    if (!svixId || !svixTimestamp || !svixSignature) {
      return next(new BadRequestError("Missing required Svix headers."));
    }

    // Capture payload depending on body-parser configuration
    const rawBody = req.body instanceof Buffer ? req.body.toString("utf8") : JSON.stringify(req.body);

    let event: any;

    try {
      const wh = new Webhook(secret);
      event = wh.verify(rawBody, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch (error) {
      return next(new BadRequestError("Invalid webhook signature."));
    }

    try {
      const { type, data } = event;

      switch (type) {
        case "user.created":
        case "user.updated":
          await this.clerkSyncService.handleUserCreatedOrUpdated(data);
          break;
        case "user.deleted":
          await this.clerkSyncService.handleUserDeleted(data);
          break;
        default:
          console.log(`[INFO] Clerk Webhook: Skipping unhandled event type "${type}"`);
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      return next(error);
    }
  };
}
