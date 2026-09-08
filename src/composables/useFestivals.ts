import { ref } from 'vue';
import { type Festival } from '../db/database';
import { festivalRepository } from '../repositories/festivalRepository';

export function useFestivals() {
  const festivals = ref<Festival[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchFestivals = async () => {
    loading.value = true;
    error.value = null;
    try {
      festivals.value = await festivalRepository.getAll();
    } catch (err: any) {
      console.error(err);
      error.value = 'Failed to load festivals.';
    } finally {
      loading.value = false;
    }
  };

  const createFestival = async (name: string) => {
    try {
      await festivalRepository.create({ name });
      await fetchFestivals();
    } catch (err: any) {
      console.error(err);
      throw new Error('Failed to create festival.');
    }
  };

  const updateFestival = async (id: string, name: string) => {
    try {
      await festivalRepository.update(id, { name });
      await fetchFestivals();
    } catch (err: any) {
      console.error(err);
      throw new Error('Failed to update festival.');
    }
  };

  const deleteFestival = async (id: string) => {
    try {
      await festivalRepository.delete(id);
      await fetchFestivals();
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
