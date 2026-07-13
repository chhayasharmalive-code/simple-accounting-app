import { ITransactionRepository } from "../../domain/repositories/transaction-repository.interface";
import { Transaction, TransactionType } from "../../domain/entities/transaction.entity";
import { PrismaConnectionManager } from "../database/prisma-connection-manager";
import { Transaction as PrismaTransaction } from "@prisma/client";

export class PrismaTransactionRepository implements ITransactionRepository {
  constructor(private readonly connectionManager: PrismaConnectionManager) {}

  private get db() {
    return this.connectionManager.getClient();
  }

  private mapTransaction(prismaTx: PrismaTransaction): Transaction {
    return {
      id: prismaTx.id,
      userId: prismaTx.userId,
      contactId: prismaTx.contactId,
      amount: Number(prismaTx.amount),
      type: prismaTx.type as TransactionType,
      reference: prismaTx.reference,
      createdAt: prismaTx.createdAt,
    };
  }

  async create(tx: Omit<Transaction, "id" | "createdAt">): Promise<Transaction> {
    const created = await this.db.transaction.create({
      data: {
        userId: tx.userId,
        contactId: tx.contactId,
        amount: tx.amount,
        type: tx.type,
        reference: tx.reference || null,
      },
    });
    return this.mapTransaction(created);
  }

  async findById(id: string): Promise<Transaction | null> {
    const tx = await this.db.transaction.findUnique({
      where: { id },
    });
    return tx ? this.mapTransaction(tx) : null;
  }

  async findManyByContactId(contactId: string): Promise<Transaction[]> {
    const txs = await this.db.transaction.findMany({
      where: { contactId },
      orderBy: {
        createdAt: "desc"
      }
    });
    return txs.map((tx) => this.mapTransaction(tx));
  }

  async findManyByUserId(userId: string): Promise<Transaction[]> {
    const txs = await this.db.transaction.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc"
      }
    });
    return txs.map((tx) => this.mapTransaction(tx));
  }
}
