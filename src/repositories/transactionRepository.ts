import { db } from '../db/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore';
import type { Transaction } from '../db/database';

export const transactionRepository = {
  subscribeToFestivalTransactions(festivalId: string, onUpdate: (transactions: Transaction[]) => void): () => void {
    const q = query(collection(db, 'transactions'), where('festivalId', '==', festivalId));
    return onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      
      transactions.sort((a, b) => {
        if (a.date === b.date) {
          return b.createdAt - a.createdAt;
        }
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      
      onUpdate(transactions);
    }, (error) => {
      console.error("Error subscribing to transactions:", error);
    });
  },

  async getAllByFestivalId(festivalId: string): Promise<Transaction[]> {
    const q = query(collection(db, 'transactions'), where('festivalId', '==', festivalId));
    const querySnapshot = await getDocs(q);
    const transactions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
    
    // Sort descending by date, then by created at
    return transactions.sort((a, b) => {
      if (a.date === b.date) {
        return b.createdAt - a.createdAt;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  },

  async create(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const now = Date.now();
    const transaction = { ...data, createdAt: now, updatedAt: now };
    const docRef = await addDoc(collection(db, 'transactions'), transaction);
    return { ...transaction, id: docRef.id };
  },

  async update(id: string, data: Partial<Omit<Transaction, 'id' | 'festivalId' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const docRef = doc(db, 'transactions', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Date.now()
    });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'transactions', id));
  },
  
  async deleteAllByFestivalId(festivalId: string): Promise<void> {
    const q = query(collection(db, 'transactions'), where('festivalId', '==', festivalId));
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(document => deleteDoc(doc(db, 'transactions', document.id)));
    await Promise.all(deletePromises);
  }
};
