import { ref, onUnmounted } from 'vue';
import { type Festival } from '../db/database';
import { festivalRepository } from '../repositories/festivalRepository';

export function useFestivals() {
  const festivals = ref<Festival[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  let unsubscribe: (() => void) | null = null;

  const fetchFestivals = () => {
    loading.value = true;
    error.value = null;
    
    return new Promise<void>((resolve) => {
      if (unsubscribe) {
        unsubscribe();
      }
      
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
    if (unsubscribe) unsubscribe();
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
