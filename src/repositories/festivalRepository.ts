import { db } from '../db/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc, onSnapshot } from 'firebase/firestore';
import type { Festival } from '../db/database';

export const festivalRepository = {
  subscribeToAll(onUpdate: (festivals: Festival[]) => void): () => void {
    return onSnapshot(collection(db, 'festivals'), (snapshot) => {
      const festivals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Festival));
      festivals.sort((a, b) => b.createdAt - a.createdAt);
      onUpdate(festivals);
    }, (error) => {
      console.error("Error subscribing to festivals:", error);
    });
  },

  async getAll(): Promise<Festival[]> {
    const querySnapshot = await getDocs(collection(db, 'festivals'));
    const festivals = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Festival));
    return festivals.sort((a, b) => b.createdAt - a.createdAt);
  },

  async getById(id: string): Promise<Festival | undefined> {
    const docRef = doc(db, 'festivals', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Festival;
    }
    return undefined;
  },

  async create(data: Omit<Festival, 'id' | 'createdAt' | 'updatedAt'>): Promise<Festival> {
    const now = Date.now();
    const festival = { ...data, createdAt: now, updatedAt: now };
    const docRef = await addDoc(collection(db, 'festivals'), festival);
    return { ...festival, id: docRef.id };
  },

  async update(id: string, name: string): Promise<void> {
    const docRef = doc(db, 'festivals', id);
    await updateDoc(docRef, {
      name,
      updatedAt: Date.now()
    });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'festivals', id));
  }
};
