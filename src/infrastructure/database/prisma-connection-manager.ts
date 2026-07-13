import { AsyncLocalStorage } from "async_hooks";
import { prisma } from "./prisma-client";
import { ITransactionManager } from "../../core/transaction/transaction.interface";

// Represents the Prisma client operations excluding connection-level helper methods
type PrismaTxClient = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export class PrismaConnectionManager implements ITransactionManager {
  private static readonly storage = new AsyncLocalStorage<PrismaTxClient>();

  /**
   * Retrieves the active database connection context.
   * If a transaction is currently active in the execution context, it returns the transaction client.
   * Otherwise, it falls back to the default PrismaClient.
   */
  public getClient(): PrismaTxClient {
    const tx = PrismaConnectionManager.storage.getStore();
    return tx || prisma;
  }

  /**
   * Runs an operation inside an ACID transaction.
   * Reuses the current transaction if one is already active in the AsyncLocalStorage hierarchy.
   */
  public async runInTransaction<T>(operation: () => Promise<T>): Promise<T> {
    const activeStore = PrismaConnectionManager.storage.getStore();

    if (activeStore) {
      // Re-use current active transaction
      return operation();
    }

    // Start a new transaction context
    return prisma.$transaction(async (tx) => {
      return PrismaConnectionManager.storage.run(tx, () => {
        return operation();
      });
    });
  }
}
