import { Router } from "express";

interface ApiRouterProps {
  webhookRouter: Router;
  contactRouter: Router;
  transactionRouter: Router;
  dashboardRouter: Router;
}

/**
 * Combines all specific feature routes into a single root API router.
 */
export function createApiRouter(props: ApiRouterProps): Router {
  const router = Router();

  router.use("/webhooks", props.webhookRouter);
  router.use("/contacts", props.contactRouter);
  router.use("/transactions", props.transactionRouter);
  router.use("/dashboard", props.dashboardRouter);

  return router;
}
