<template>
  <div class="container">
    <div class="flex flex-wrap justify-between items-center" style="margin-bottom: 2rem; gap: 1rem;">
      <h1 style="font-size: 1.5rem; font-weight: 700;">My Festivals</h1>
      <div class="flex gap-2">
        <button class="btn btn-outline" @click="goToCollections">
          <BookOpenIcon size="20" />
          <span class="hidden-xs">Collections</span>
        </button>
        <button class="btn btn-primary" @click="openCreateModal">
          <PlusIcon size="20" />
          <span class="hidden-xs">Create Festival</span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center text-muted" style="padding: 3rem;">
      Loading festivals...
    </div>

    <div v-else-if="error" class="text-center text-danger card">
      {{ error }}
    </div>

    <div v-else-if="festivals.length === 0" class="card text-center" style="padding: 4rem 2rem;">
      <div class="text-muted" style="margin-bottom: 1rem;">
        <CalendarIcon size="48" style="opacity: 0.5; margin: 0 auto;" />
      </div>
      <h3 style="margin-bottom: 0.5rem; font-size: 1.25rem;">No festivals yet</h3>
      <p class="text-muted" style="margin-bottom: 1.5rem;">Create your first festival to start tracking income and expenses.</p>
      <button class="btn btn-primary" @click="openCreateModal">
        <PlusIcon size="20" />
        Create Festival
      </button>
    </div>

    <div v-else class="grid grid-cols-2 gap-4" style="margin-bottom: 3rem;">
      <div 
        v-for="festival in festivals" 
        :key="festival.id" 
        class="card festival-card"
        @click="goToFestival(festival.id!)"
      >
        <div class="flex justify-between items-center" style="margin-bottom: 1rem;">
          <h3 class="festival-name">{{ festival.name }}</h3>
          <div class="festival-actions" @click.stop>
            <button class="btn-icon text-muted" @click.stop="openEditModal(festival)">
              <Edit2Icon size="16" />
            </button>
            <button class="btn-icon text-danger" @click.stop="confirmDelete(festival.id!, festival.name)">
              <Trash2Icon size="16" />
            </button>
          </div>
        </div>
        <div class="text-muted" style="font-size: 0.75rem;">
          Created: {{ formatDate(festival.createdAt) }}
        </div>
      </div>
    </div>

    <DataManagement @refresh="fetchFestivals" />

    <CreateFestivalModal 
      :is-open="isModalOpen" 
      :initial-name="editingFestival?.name"
      @close="closeModal" 
      @submit="handleFestivalSubmit" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Plus as PlusIcon, Calendar as CalendarIcon, Edit2 as Edit2Icon, Trash2 as Trash2Icon, BookOpen as BookOpenIcon } from 'lucide-vue-next';
import { useFestivals } from '@/composables/useFestivals';
import type { Festival } from '@/db/database';

import CreateFestivalModal from '@/components/CreateFestivalModal.vue';
import DataManagement from '@/components/DataManagement.vue';

const router = useRouter();
const { festivals, loading, error, fetchFestivals, createFestival, updateFestival, deleteFestival } = useFestivals();

const isModalOpen = ref(false);
const editingFestival = ref<Festival | null>(null);

onMounted(() => {
  fetchFestivals();
});

const formatDate = (ts: number) => {
  return new Date(ts).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

const goToFestival = (id: string) => {
  router.push(`/festival/${id}`);
};

const goToCollections = () => {
  router.push('/collections');
};

const openCreateModal = () => {
  editingFestival.value = null;
  isModalOpen.value = true;
};

const openEditModal = (festival: Festival) => {
  editingFestival.value = festival;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  editingFestival.value = null;
};

const handleFestivalSubmit = async (name: string) => {
  if (editingFestival.value) {
    await updateFestival(editingFestival.value.id!, name);
  } else {
    await createFestival(name);
  }
};

const confirmDelete = async (id: string, name: string) => {
  if (confirm(`Are you sure you want to delete "${name}"? This will also delete ALL transactions associated with it. This action cannot be undone.`)) {
    await deleteFestival(id);
  }
};
</script>

<style scoped>
.festival-card {
  cursor: pointer;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.festival-card:hover {
  border-color: var(--color-primary);
}

.festival-name {
  font-size: 1.125rem;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.festival-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0.5;
  transition: opacity var(--transition);
}

.festival-card:hover .festival-actions {
  opacity: 1;
}

@media (max-width: 480px) {
  .hidden-xs {
    display: none;
  }
}
</style>
