import { Router } from "express";
import express from "express";
import { WebhookController } from "../controllers/webhook.controller";

/**
 * Router factory configuring Clerk webhook endpoints.
 * Applies express.raw parsing exclusively for webhooks.
 */
export function createWebhookRouter(controller: WebhookController): Router {
  const router = Router();

  router.post(
    "/clerk",
    express.raw({ type: "application/json" }),
    controller.handleClerkWebhook
  );

  return router;
}
