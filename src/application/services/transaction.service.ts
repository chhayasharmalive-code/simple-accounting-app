import { ITransactionRepository } from "../../domain/repositories/transaction-repository.interface";
import { IContactRepository } from "../../domain/repositories/contact-repository.interface";
import { ITransactionManager } from "../../core/transaction/transaction.interface";
import { Transaction } from "../../domain/entities/transaction.entity";
import { CreateTransactionDto } from "../dtos/transaction.dto";
import { ForbiddenError, NotFoundError } from "../../core/error/custom-errors";

export class TransactionService {
  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly contactRepository: IContactRepository,
    private readonly transactionManager: ITransactionManager
  ) {}

  /**
   * Records a GIVEN or TAKEN transaction between the user and a contact.
   */
  async createTransaction(userId: string, dto: CreateTransactionDto): Promise<Transaction> {
    const contact = await this.contactRepository.findById(dto.contactId);
    if (!contact) {
      throw new NotFoundError("Contact not found.");
    }

    // Access control: User can only log transactions against contacts they created
    if (contact.userId !== userId) {
      throw new ForbiddenError("Access denied: You do not own this contact.");
    }

    return this.transactionManager.runInTransaction(async () => {
      return this.transactionRepository.create({
        userId,
        contactId: dto.contactId,
        amount: dto.amount,
        type: dto.type,
        reference: dto.reference || null,
      });
    });
  }

  /**
   * Returns all transactions associated with a contact, verifying ownership.
   */
  async getTransactionsByContact(userId: string, contactId: string): Promise<Transaction[]> {
    const contact = await this.contactRepository.findById(contactId);
    if (!contact) {
      throw new NotFoundError("Contact not found.");
    }

    if (contact.userId !== userId) {
      throw new ForbiddenError("Access denied: You do not own this contact.");
    }

    return this.transactionRepository.findManyByContactId(contactId);
  }

  /**
   * Returns all transactions recorded by the user.
   */
  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return this.transactionRepository.findManyByUserId(userId);
  }
}
