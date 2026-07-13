import { z } from "zod";
import { TransactionType } from "../../domain/entities/transaction.entity";

export const CreateTransactionSchema = z.object({
  contactId: z.string().uuid("Invalid contact ID format"),
  amount: z.number().positive("Amount must be greater than zero"),
  type: z.nativeEnum(TransactionType),
  reference: z.string().max(255).optional().nullable()
});

export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>;
