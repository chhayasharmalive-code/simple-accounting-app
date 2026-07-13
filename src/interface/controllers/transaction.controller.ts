import { Response, NextFunction } from "express";
import { TransactionService } from "../../application/services/transaction.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  /**
   * Records a new transaction (GIVEN or TAKEN amount).
   */
  createTransaction = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth!.userId;
      const transaction = await this.transactionService.createTransaction(userId, req.body);

      return res.status(201).json({
        status: "success",
        data: transaction,
      });
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Retrieves transaction ledger history associated with a specific contact.
   */
  getTransactionHistoryByContact = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth!.userId;
      const { contactId } = req.params;
      const history = await this.transactionService.getTransactionsByContact(userId, contactId);

      return res.status(200).json({
        status: "success",
        data: history,
      });
    } catch (error) {
      return next(error);
    }
  };

  /**
   * Retrieves all transactions logged by the active user.
   */
  getTransactions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.auth!.userId;
      const transactions = await this.transactionService.getTransactionsByUser(userId);

      return res.status(200).json({
        status: "success",
        data: transactions,
      });
    } catch (error) {
      return next(error);
    }
  };
}
