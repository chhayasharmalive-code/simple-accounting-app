export interface Contact {
  id: string;
  userId: string;
  name: string;
  phone?: string | null;
  avatar?: string | null;
  upiId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
