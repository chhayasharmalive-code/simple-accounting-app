import { IContactRepository } from "../../domain/repositories/contact-repository.interface";
import { ITransactionRepository } from "../../domain/repositories/transaction-repository.interface";
import { Contact } from "../../domain/entities/contact.entity";
import { TransactionType } from "../../domain/entities/transaction.entity";
import { CreateContactDto, UpdateContactDto } from "../dtos/contact.dto";
import { ForbiddenError, NotFoundError } from "../../core/error/custom-errors";

export interface ContactWithBalance extends Contact {
  balance: number;
}

export class ContactService {
  constructor(
    private readonly contactRepository: IContactRepository,
    private readonly transactionRepository: ITransactionRepository
  ) {}

  /**
   * Creates a new contact for the logged in user.
   */
  async createContact(userId: string, dto: CreateContactDto): Promise<Contact> {
    return this.contactRepository.create({
      userId,
      name: dto.name,
      phone: dto.phone || null,
      avatar: dto.avatar || null,
    });
  }

  /**
   * Updates an existing contact owned by the user.
   */
  async updateContact(userId: string, contactId: string, dto: UpdateContactDto): Promise<Contact> {
    const contact = await this.contactRepository.findById(contactId);
    if (!contact) {
      throw new NotFoundError("Contact not found.");
    }

    if (contact.userId !== userId) {
      throw new ForbiddenError("Access denied: You do not own this contact.");
    }

    return this.contactRepository.update(contactId, {
      name: dto.name,
      phone: dto.phone,
      avatar: dto.avatar,
    });
  }

  /**
   * Deletes a contact owned by the user.
   */
  async deleteContact(userId: string, contactId: string): Promise<void> {
    const contact = await this.contactRepository.findById(contactId);
    if (!contact) {
      throw new NotFoundError("Contact not found.");
    }

    if (contact.userId !== userId) {
      throw new ForbiddenError("Access denied: You do not own this contact.");
    }

    await this.contactRepository.delete(contactId);
  }

  /**
   * Lists all contacts for the user along with their calculated net balance.
   */
  async getContactsWithBalances(userId: string): Promise<ContactWithBalance[]> {
    const contacts = await this.contactRepository.findByUserId(userId);

    const result = await Promise.all(
      contacts.map(async (contact) => {
        const txs = await this.transactionRepository.findManyByContactId(contact.id);
        const balance = txs.reduce((acc, tx) => {
          return tx.type === TransactionType.GIVEN ? acc + tx.amount : acc - tx.amount;
        }, 0);

        return {
          ...contact,
          balance,
        };
      })
    );

    return result;
  }

  /**
   * Gets details for a single contact with net balance.
   */
  async getContactWithBalance(userId: string, contactId: string): Promise<ContactWithBalance> {
    const contact = await this.contactRepository.findById(contactId);
    if (!contact) {
      throw new NotFoundError("Contact not found.");
    }

    if (contact.userId !== userId) {
      throw new ForbiddenError("Access denied: You do not own this contact.");
    }

    const txs = await this.transactionRepository.findManyByContactId(contactId);
    const balance = txs.reduce((acc, tx) => {
      return tx.type === TransactionType.GIVEN ? acc + tx.amount : acc - tx.amount;
    }, 0);

    return {
      ...contact,
      balance,
    };
  }
}
