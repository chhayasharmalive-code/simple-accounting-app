import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";

/**
 * Router factory configuring user dashboard/analytics endpoint.
 */
export function createDashboardRouter(
  controller: DashboardController,
  authMiddleware: any
): Router {
  const router = Router();

  router.use(authMiddleware);

  router.get("/", controller.getDashboardStats);

  return router;
}
