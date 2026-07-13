export interface User {
  id: string; // Clerk User ID
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
