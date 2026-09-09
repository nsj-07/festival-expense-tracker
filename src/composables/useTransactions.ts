import { ref, computed, onUnmounted } from 'vue';
import { type Transaction } from '../db/database';
import { transactionRepository } from '../repositories/transactionRepository';

export function useTransactions(festivalId: string) {
  const transactions = ref<Transaction[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const filterType = ref<'all' | 'income' | 'expense'>('all');
  const filterDate = ref<'newest' | 'oldest'>('newest');
  const searchQuery = ref('');
  let unsubscribe: (() => void) | null = null;

  const fetchTransactions = () => {
    loading.value = true;
    error.value = null;
    
    return new Promise<void>((resolve) => {
      if (unsubscribe) {
        unsubscribe();
      }
      
      let isFirstFetch = true;
      unsubscribe = transactionRepository.subscribeToFestivalTransactions(festivalId, (data) => {
        transactions.value = data;
        loading.value = false;
        
        if (isFirstFetch) {
          isFirstFetch = false;
          resolve();
        }
      });
    });
  };

  onUnmounted(() => {
    if (unsubscribe) unsubscribe();
  });

  const addTransaction = async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'festivalId'>) => {
    try {
      await transactionRepository.create({ ...data, festivalId });
      // Real-time listener handles UI update
    } catch (err: any) {
      console.error(err);
      throw new Error('Failed to add transaction.');
    }
  };

  const editTransaction = async (id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'festivalId'>>) => {
    try {
      await transactionRepository.update(id, data);
      // Real-time listener handles UI update
    } catch (err: any) {
      console.error(err);
      throw new Error('Failed to edit transaction.');
    }
  };

  const removeTransaction = async (id: string) => {
    try {
      await transactionRepository.delete(id);
      // Real-time listener handles UI update
    } catch (err: any) {
      console.error(err);
      throw new Error('Failed to delete transaction.');
    }
  };

  const filteredTransactions = computed(() => {
    let result = [...transactions.value];

    if (filterType.value !== 'all') {
      result = result.filter(t => t.type === filterType.value);
    }

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim();
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) || 
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      if (filterDate.value === 'newest') {
        return timeB - timeA;
      } else {
        return timeA - timeB;
      }
    });

    return result;
  });

  return {
    transactions,
    filteredTransactions,
    loading,
    error,
    filterType,
    filterDate,
    searchQuery,
    fetchTransactions,
    addTransaction,
    editTransaction,
    removeTransaction,
  };
}
