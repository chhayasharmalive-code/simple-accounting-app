import { Transaction } from "../entities/transaction.entity";

export interface ITransactionRepository {
  create(transaction: Omit<Transaction, "id" | "createdAt">): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  findManyByContactId(contactId: string): Promise<Transaction[]>;
  findManyByUserId(userId: string): Promise<Transaction[]>;
}
