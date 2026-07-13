import { IContactRepository } from "../../domain/repositories/contact-repository.interface";
import { Contact } from "../../domain/entities/contact.entity";
import { PrismaConnectionManager } from "../database/prisma-connection-manager";

export class PrismaContactRepository implements IContactRepository {
  constructor(private readonly connectionManager: PrismaConnectionManager) {}

  private get db() {
    return this.connectionManager.getClient();
  }

  async create(contact: Omit<Contact, "id" | "createdAt" | "updatedAt">): Promise<Contact> {
    return this.db.contact.create({
      data: {
        userId: contact.userId,
        name: contact.name,
        phone: contact.phone || null,
        avatar: contact.avatar || null,
        upiId: contact.upiId || null,
      },
    });
  }

  async update(
    id: string,
    data: Partial<Omit<Contact, "id" | "userId" | "createdAt" | "updatedAt">>
  ): Promise<Contact> {
    return this.db.contact.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.contact.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<Contact | null> {
    return this.db.contact.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<Contact[]> {
    return this.db.contact.findMany({
      where: { userId },
      orderBy: {
        name: "asc",
      },
    });
  }
}
