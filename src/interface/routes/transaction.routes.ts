import { Router } from "express";
import { TransactionController } from "../controllers/transaction.controller";
import { validateBody } from "../middlewares/validate.middleware";
import { CreateTransactionSchema } from "../../application/dtos/transaction.dto";

/**
 * Router factory configuring transaction endpoints.
 */
export function createTransactionRouter(
  controller: TransactionController,
  authMiddleware: any
): Router {
  const router = Router();

  router.use(authMiddleware);

  router.post("/", validateBody(CreateTransactionSchema), controller.createTransaction);
  router.get("/", controller.getTransactions);
  router.get("/contact/:contactId", controller.getTransactionHistoryByContact);

  return router;
}
