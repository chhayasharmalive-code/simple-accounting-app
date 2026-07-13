import { IUserRepository } from "../../domain/repositories/user-repository.interface";
import { User } from "../../domain/entities/user.entity";
import { PrismaConnectionManager } from "../database/prisma-connection-manager";

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly connectionManager: PrismaConnectionManager) {}

  private get db() {
    return this.connectionManager.getClient();
  }

  async create(user: Omit<User, "createdAt" | "updatedAt">): Promise<User> {
    return this.db.user.create({
      data: user,
    });
  }

  async update(id: string, data: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>): Promise<User> {
    return this.db.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.user.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { email },
    });
  }
}
