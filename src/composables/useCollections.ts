import { ref, computed, onUnmounted } from 'vue';
import { type Collection, type Transaction } from '../db/database';
import { collectionRepository } from '../repositories/collectionRepository';
import { transactionRepository } from '../repositories/transactionRepository';
import { festivalRepository } from '../repositories/festivalRepository';

// Generate predefined house numbers based on the user rules
export const predefinedHouseNumbers: string[] = (() => {
  const houses: string[] = [];
  
  // Block A: 104, then 201-204 to 701-704
  houses.push('A-104');
  for (let floor = 2; floor <= 7; floor++) {
    for (let flat = 1; flat <= 4; flat++) {
      houses.push(`A-${floor}0${flat}`);
    }
  }

  // Block B: 201-202 to 701-702
  for (let floor = 2; floor <= 7; floor++) {
    for (let flat = 1; flat <= 2; flat++) {
      houses.push(`B-${floor}0${flat}`);
    }
  }

  // Block C: 101-102, then 201-204 to 701-704
  houses.push('C-101', 'C-102');
  for (let floor = 2; floor <= 7; floor++) {
    for (let flat = 1; flat <= 4; flat++) {
      houses.push(`C-${floor}0${flat}`);
    }
  }

  return houses;
})();

// Global state
const collections = ref<Collection[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
let unsubscribe: (() => void) | null = null;
let isInitialized = false;

// Compute balances globally
const totalCollected = computed(() => {
  return collections.value
    .filter(c => c.type === 'collection')
    .reduce((sum, c) => sum + c.amount, 0);
});

const totalTransferred = computed(() => {
  return collections.value
    .filter(c => c.type === 'transfer')
    .reduce((sum, c) => sum + c.amount, 0);
});

const availableBalance = computed(() => {
  return totalCollected.value - totalTransferred.value;
});

export function useCollections() {
  const fetchCollections = () => {
    if (isInitialized) return Promise.resolve();
    
    loading.value = true;
    error.value = null;
    isInitialized = true;
    
    return new Promise<void>((resolve) => {
      let isFirstFetch = true;
      unsubscribe = collectionRepository.subscribeToAll((data) => {
        collections.value = data;
        loading.value = false;
        
        if (isFirstFetch) {
          isFirstFetch = false;
          resolve();
        }
      });
    });
  };

  onUnmounted(() => {
    // Intentionally omitted
  });

  const addCollection = async (houseNumber: string, amount: number) => {
    try {
      await collectionRepository.create({
        type: 'collection',
        houseNumber,
        amount
      });
      // Real-time listener handles UI update
    } catch (err: any) {
      console.error(err);
      throw new Error('Failed to add collection.');
    }
  };

  const transferToFestival = async (festivalId: string, amount: number, title?: string, description?: string) => {
    try {
      // 1. Create the income transaction in the festival
      const txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
        festivalId,
        type: 'income',
        date: new Date().toISOString().split('T')[0],
        title: title || 'Fund Transfer from Collections',
        description,
        amount
      };
      
      const newTx = await transactionRepository.create(txData);
      
      // 2. Create the transfer record in collections
      await collectionRepository.create({
        type: 'transfer',
        amount,
        festivalId,
        transactionId: newTx.id
      });
      
      // 3. Touch the festival to update its updatedAt timestamp
      const fest = await festivalRepository.getById(festivalId);
      if (fest) {
        await festivalRepository.update(festivalId, fest.name);
      }
      
      // Real-time listener handles UI update
    } catch (err: any) {
      console.error(err);
      throw new Error('Failed to transfer to festival.');
    }
  };

  const deleteCollection = async (id: string) => {
    try {
      const collection = collections.value.find(c => c.id === id);
      await collectionRepository.delete(id);
      
      // Cascading delete the associated transaction if it's a transfer
      if (collection && collection.type === 'transfer' && collection.transactionId) {
        await transactionRepository.delete(collection.transactionId);
        
        // Also update festival timestamp
        if (collection.festivalId) {
          const fest = await festivalRepository.getById(collection.festivalId);
          if (fest) {
            await festivalRepository.update(collection.festivalId, fest.name);
          }
        }
      }
      
      // Real-time listener handles UI update
    } catch (err: any) {
      console.error(err);
      throw new Error('Failed to delete collection entry.');
    }
  };

  return {
    collections,
    loading,
    error,
    totalCollected,
    totalTransferred,
    availableBalance,
    fetchCollections,
    addCollection,
    transferToFestival,
    deleteCollection
  };
}
