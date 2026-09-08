// This file now only holds interfaces. 
// Database logic has moved to firebase.ts and individual repositories.

export interface Festival {
  id?: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface Transaction {
  id?: string;
  festivalId: string;
  type: 'income' | 'expense';
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
  amount: number;
  createdAt: number;
  updatedAt: number;
}

export interface Collection {
  id?: string;
  type: 'collection' | 'transfer';
  amount: number;
  houseNumber?: string; // Only for 'collection'
  festivalId?: string;  // Only for 'transfer'
  transactionId?: string; // Link to the income transaction created
  createdAt: number;
  updatedAt: number;
}
