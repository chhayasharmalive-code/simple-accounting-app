import { User } from "../entities/user.entity";

export interface IUserRepository {
  create(user: Omit<User, "createdAt" | "updatedAt">): Promise<User>;
  update(id: string, data: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>): Promise<User>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}
