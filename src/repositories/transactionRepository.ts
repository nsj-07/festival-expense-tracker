import { db, type Transaction } from '../db/database';

function generateId() {
  return crypto.randomUUID();
}

export const transactionRepository = {
  async getAllByFestivalId(festivalId: string): Promise<Transaction[]> {
    return await db.transactions
      .where('festivalId')
      .equals(festivalId)
      .reverse()
      .sortBy('date');
  },

  async getById(id: string): Promise<Transaction | undefined> {
    return await db.transactions.get(id);
  },

  async create(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const now = Date.now();
    const transaction: Transaction = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    await db.transactions.add(transaction);
    
    // Update festival's updatedAt
    await db.festivals.update(data.festivalId, { updatedAt: now });
    
    return transaction;
  },

  async update(id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'festivalId'>>): Promise<void> {
    const transaction = await db.transactions.get(id);
    if (!transaction) return;

    const now = Date.now();
    await db.transactions.update(id, {
      ...data,
      updatedAt: now,
    });
    
    // Update festival's updatedAt
    await db.festivals.update(transaction.festivalId, { updatedAt: now });
  },

  async delete(id: string): Promise<void> {
    const transaction = await db.transactions.get(id);
    if (!transaction) return;

    await db.transactions.delete(id);
    
    // Update festival's updatedAt
    await db.festivals.update(transaction.festivalId, { updatedAt: Date.now() });
  }
};
