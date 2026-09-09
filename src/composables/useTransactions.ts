import { ref, computed, onUnmounted } from 'vue';
import { type Transaction } from '../db/database';
import { transactionRepository } from '../repositories/transactionRepository';

// Global cache mapped by festivalId
const transactionsCache = ref<Record<string, Transaction[]>>({});
const loadingStates = ref<Record<string, boolean>>({});
const errorStates = ref<Record<string, string | null>>({});
const activeSubscriptions: Record<string, () => void> = {};

export function useTransactions(festivalId: string) {
  // Ensure basic refs exist for this festival
  if (!transactionsCache.value[festivalId]) {
    transactionsCache.value[festivalId] = [];
    loadingStates.value[festivalId] = false;
    errorStates.value[festivalId] = null;
  }

  // Map global state to component-friendly computed properties
  const transactions = computed(() => transactionsCache.value[festivalId] || []);
  const loading = computed({
    get: () => loadingStates.value[festivalId] || false,
    set: (val) => { loadingStates.value[festivalId] = val; }
  });
  const error = computed({
    get: () => errorStates.value[festivalId] || null,
    set: (val) => { errorStates.value[festivalId] = val; }
  });

  // Component-local filters (we don't want these shared across all views)
  const filterType = ref<'all' | 'income' | 'expense'>('all');
  const filterDate = ref<'newest' | 'oldest'>('newest');
  const searchQuery = ref('');

  const fetchTransactions = () => {
    // If we are already subscribed to this festival, just resolve immediately
    if (activeSubscriptions[festivalId]) {
      return Promise.resolve();
    }
    
    loadingStates.value[festivalId] = true;
    errorStates.value[festivalId] = null;
    
    return new Promise<void>((resolve) => {
      let isFirstFetch = true;
      activeSubscriptions[festivalId] = transactionRepository.subscribeToFestivalTransactions(festivalId, (data) => {
        transactionsCache.value[festivalId] = data;
        loadingStates.value[festivalId] = false;
        
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
