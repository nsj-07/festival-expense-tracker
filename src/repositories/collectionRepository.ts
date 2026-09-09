import { db } from '../db/firebase';
import { collection, getDocs, addDoc, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import type { Collection } from '../db/database';

export const collectionRepository = {
  subscribeToAll(onUpdate: (collections: Collection[]) => void): () => void {
    return onSnapshot(collection(db, 'collections'), (snapshot) => {
      const collections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Collection));
      collections.sort((a, b) => b.createdAt - a.createdAt);
      onUpdate(collections);
    }, (error) => {
      console.error("Error subscribing to collections:", error);
    });
  },

  async getAll(): Promise<Collection[]> {
    const querySnapshot = await getDocs(collection(db, 'collections'));
    const collections = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Collection));
    return collections.sort((a, b) => b.createdAt - a.createdAt);
  },

  async create(data: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>): Promise<Collection> {
    const now = Date.now();
    const collectionData = { ...data, createdAt: now, updatedAt: now };
    const docRef = await addDoc(collection(db, 'collections'), collectionData);
    return { ...collectionData, id: docRef.id };
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'collections', id));
  }
};
