import { ref, computed } from 'vue';
import { type Collection } from '../db/database';
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

export function useCollections() {
  const collections = ref<Collection[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Compute balances
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

  const fetchCollections = async () => {
    loading.value = true;
    error.value = null;
    try {
      collections.value = await collectionRepository.getAll();
    } catch (err: any) {
      console.error(err);
      error.value = 'Failed to load collections.';
    } finally {
      loading.value = false;
    }
  };

  const addCollection = async (houseNumber: string, amount: number) => {
    try {
      await collectionRepository.create({
        type: 'collection',
        houseNumber,
        amount
      });
      await fetchCollections();
    } catch (err: any) {
      console.error(err);
      throw new Error('Failed to add collection.');
    }
  };

  const transferToFestival = async (festivalId: string, amount: number) => {
    if (amount > availableBalance.value) {
      throw new Error('Insufficient collection balance to transfer this amount.');
    }

    try {
      // 1. Create a transaction (Income) in the festival
      const dateStr = new Date().toISOString().split('T')[0];
      const tx = await transactionRepository.create({
        festivalId,
        type: 'income',
        date: dateStr,
        title: `Fund Transfer from Collections`,
        description: 'Auto-added from Collection module transfer',
        amount: amount
      });

      // 2. Create a transfer record in collections, linked to this transaction
      await collectionRepository.create({
        type: 'transfer',
        festivalId,
        amount,
        transactionId: tx.id
      });

      // Update the festival timestamp
      const fest = await festivalRepository.getById(festivalId);
      if (fest) {
        await festivalRepository.update(festivalId, fest.name); // Updates timestamp
      }

      await fetchCollections();
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
      
      await fetchCollections();
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
