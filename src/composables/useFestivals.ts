import { ref, onUnmounted } from 'vue';
import { type Festival } from '../db/database';
import { festivalRepository } from '../repositories/festivalRepository';

// Global state
const festivals = ref<Festival[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
let unsubscribe: (() => void) | null = null;
let isInitialized = false;

export function useFestivals() {
  const fetchFestivals = () => {
    if (isInitialized) return Promise.resolve();
    
    loading.value = true;
    error.value = null;
    isInitialized = true;
    
    return new Promise<void>((resolve) => {
      let isFirstFetch = true;
      unsubscribe = festivalRepository.subscribeToAll((data) => {
        festivals.value = data;
        loading.value = false;
        
        if (isFirstFetch) {
          isFirstFetch = false;
          resolve();
        }
      });
    });
  };

  onUnmounted(() => {
    // Intentionally omitted: we don't want to unsubscribe when a single component unmounts,
    // because other components might still be using the global listener.
  });

  const createFestival = async (name: string) => {
    try {
      await festivalRepository.create({ name });
      // Real-time listener handles UI update
    } catch (err: any) {
      console.error(err);
      throw new Error('Failed to create festival.');
    }
  };

  const updateFestival = async (id: string, name: string) => {
    try {
      await festivalRepository.update(id, { name });
      // Real-time listener handles UI update
    } catch (err: any) {
      console.error(err);
      throw new Error('Failed to update festival.');
    }
  };

  const deleteFestival = async (id: string) => {
    try {
      await festivalRepository.delete(id);
      // Real-time listener handles UI update
    } catch (err: any) {
      console.error(err);
      throw new Error('Failed to delete festival.');
    }
  };

  return {
    festivals,
    loading,
    error,
    fetchFestivals,
    createFestival,
    updateFestival,
    deleteFestival,
  };
}
