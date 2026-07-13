import { Contact } from "../entities/contact.entity";

export interface IContactRepository {
  create(contact: Omit<Contact, "id" | "createdAt" | "updatedAt">): Promise<Contact>;
  update(
    id: string,
    data: Partial<Omit<Contact, "id" | "userId" | "createdAt" | "updatedAt">>
  ): Promise<Contact>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Contact | null>;
  findByUserId(userId: string): Promise<Contact[]>;
}
