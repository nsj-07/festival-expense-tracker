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

export class FestivalTrackerDB extends Dexie {
  festivals!: Table<Festival, string>;
  transactions!: Table<Transaction, string>;

  constructor() {
    super('FestivalTrackerDB');
    this.version(1).stores({
      festivals: 'id, name, createdAt, updatedAt',
      transactions: 'id, festivalId, type, date, title, amount, createdAt, updatedAt'
    });
  }
}

export const db = new FestivalTrackerDB();
