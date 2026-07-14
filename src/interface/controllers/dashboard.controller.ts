import { Response, NextFunction } from "express";
import { DashboardService } from "../../application/services/dashboard.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Fetches unified dashboard stats: KPIs, graph data, and recent activities.
   */
  getDashboardStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth!.userId;
      const stats = await this.dashboardService.getDashboardData(userId);

      return res.status(200).json({
        status: "success",
        data: stats,
      });
    } catch (error) {
      return next(error);
    }
  };
}
