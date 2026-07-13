export enum TransactionType {
  GIVEN = "GIVEN", // User gave money to contact
  TAKEN = "TAKEN"  // User took money from contact
}

export interface Transaction {
  id: string;
  userId: string;
  contactId: string;
  amount: number;
  type: TransactionType;
  reference?: string | null;
  createdAt: Date;
}
