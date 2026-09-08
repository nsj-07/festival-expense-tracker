import { db, type Collection } from '../db/database';

function generateId() {
  return crypto.randomUUID();
}

export const collectionRepository = {
  async getAll(): Promise<Collection[]> {
    return await db.collections
      .reverse()
      .sortBy('createdAt');
  },

  async create(data: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>): Promise<Collection> {
    const now = Date.now();
    const collection: Collection = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    await db.collections.add(collection);
    return collection;
  },

  async delete(id: string): Promise<void> {
    await db.collections.delete(id);
  }
};
