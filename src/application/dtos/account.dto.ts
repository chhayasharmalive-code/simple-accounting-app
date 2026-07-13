import { z } from "zod";

export const CreateAccountSchema = z.object({
  currency: z.string().min(3).max(3).toUpperCase().default("USD")
});

export type CreateAccountDto = z.infer<typeof CreateAccountSchema>;
