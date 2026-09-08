import { db, type Festival } from '../db/database';
import { transactionRepository } from './transactionRepository';

function generateId() {
  return crypto.randomUUID();
}

export const festivalRepository = {
  async getAll(): Promise<Festival[]> {
    return await db.festivals.orderBy('updatedAt').reverse().toArray();
  },

  async getById(id: string): Promise<Festival | undefined> {
    return await db.festivals.get(id);
  },

  async create(data: Omit<Festival, 'id' | 'createdAt' | 'updatedAt'>): Promise<Festival> {
    const now = Date.now();
    const festival: Festival = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    await db.festivals.add(festival);
    return festival;
  },

  async update(id: string, data: Partial<Omit<Festival, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    await db.festivals.update(id, {
      ...data,
      updatedAt: Date.now(),
    });
  },

  async delete(id: string): Promise<void> {
    await db.transaction('rw', db.festivals, db.transactions, async () => {
      // Delete all transactions belonging to this festival
      const transactions = await db.transactions.where('festivalId').equals(id).toArray();
      const transactionIds = transactions.map(t => t.id).filter((t): t is string => !!t);
      await db.transactions.bulkDelete(transactionIds);
      
      // Delete the festival itself
      await db.festivals.delete(id);
    });
  }
};
