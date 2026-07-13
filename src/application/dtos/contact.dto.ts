import { z } from "zod";

export const CreateContactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  phone: z.string().max(20).optional().nullable(),
  avatar: z.string().optional().nullable(), // supports Base64 data-uri or cloud URL
  upiId: z.string().max(100).optional().nullable()
});

export type CreateContactDto = z.infer<typeof CreateContactSchema>;

export const UpdateContactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  avatar: z.string().optional().nullable(),
  upiId: z.string().max(100).optional().nullable()
});

export type UpdateContactDto = z.infer<typeof UpdateContactSchema>;
