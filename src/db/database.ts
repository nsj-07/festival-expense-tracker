import Dexie, { type Table } from 'dexie';

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
  date: string;
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

export class FestivalTrackerDB extends Dexie {
  festivals!: Table<Festival, string>;
  transactions!: Table<Transaction, string>;
  collections!: Table<Collection, string>;

  constructor() {
    super('FestivalTrackerDB');
    this.version(3).stores({
      festivals: 'id, name, createdAt, updatedAt',
      transactions: 'id, festivalId, type, date, title, amount, createdAt, updatedAt',
      collections: 'id, type, houseNumber, festivalId, createdAt, updatedAt'
    }).upgrade(tx => {
      // Migrate old collections if they exist
      return tx.table('collections').toCollection().modify(col => {
        if (!col.type) {
          col.type = 'collection';
        }
      });
    });
  }
}

export const db = new FestivalTrackerDB();
