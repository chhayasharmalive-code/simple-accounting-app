import { IUserRepository } from "../../domain/repositories/user-repository.interface";

export class ClerkSyncService {
  constructor(private readonly userRepository: IUserRepository) {}

  async handleUserCreatedOrUpdated(payload: any): Promise<void> {
    const { id, email_addresses, first_name, last_name } = payload;
    const primaryEmail = email_addresses?.[0]?.email_address;

    if (!primaryEmail) {
      throw new Error("User missing primary email address");
    }

    const existingUser = await this.userRepository.findById(id);

    if (existingUser) {
      await this.userRepository.update(id, {
        email: primaryEmail,
        firstName: first_name || null,
        lastName: last_name || null,
      });
    } else {
      await this.userRepository.create({
        id,
        email: primaryEmail,
        firstName: first_name || null,
        lastName: last_name || null,
      });
    }
  }

  async handleUserDeleted(payload: any): Promise<void> {
    const { id } = payload;
    await this.userRepository.delete(id);
  }
}
