<template>
  <div class="collection-list-container">
    <div v-if="loading" class="text-center text-muted py-4">
      Loading collections...
    </div>
    
    <div v-else-if="collections.length === 0" class="text-center text-muted card" style="padding: 3rem 1rem;">
      <p>No collections recorded yet.</p>
    </div>
    
    <div v-else class="collection-list">
      <div 
        v-for="collection in collections" 
        :key="collection.id"
        class="card collection-item"
        :class="{ 'is-transfer': collection.type === 'transfer' }"
      >
        <div class="flex justify-between items-center">
          <div class="collection-info">
            <h4 class="house-number" v-if="collection.type === 'collection'">
              House {{ collection.houseNumber }}
            </h4>
            <h4 class="house-number" v-else>
              Transfer to Festival
            </h4>
            <span class="text-muted date-text">{{ formatDate(collection.createdAt) }}</span>
          </div>
          
          <div class="collection-actions flex items-center gap-4">
            <div class="amount" :class="collection.type === 'collection' ? 'text-success' : 'text-danger'">
              <span v-if="collection.type === 'collection'">+</span>
              <span v-else>-</span>
              {{ formatCurrency(collection.amount) }}
            </div>
            
            <button class="btn-icon text-danger" @click="confirmDelete(collection)" title="Delete">
              <Trash2Icon size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Trash2 as Trash2Icon } from 'lucide-vue-next';
import type { Collection } from '@/db/database';

defineProps<{
  collections: Collection[];
  loading: boolean;
  formatCurrency: (val: number) => string;
}>();

const emit = defineEmits<{
  (e: 'delete', id: string): void;
}>();

const formatDate = (ts: number) => {
  return new Date(ts).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

const confirmDelete = (collection: Collection) => {
  const label = collection.type === 'collection' ? `collection entry for ${collection.houseNumber}` : `transfer`;
  if (confirm(`Are you sure you want to delete this ${label}?`)) {
    if (collection.id) {
      emit('delete', collection.id);
    }
  }
};
</script>

<style scoped>
.collection-list {
  display: flex;
  flex-direction: column;
}

.collection-item {
  padding: 1rem 1.25rem;
  margin-bottom: 0.5rem;
  border-left: 4px solid var(--color-success);
}

.collection-item.is-transfer {
  border-left-color: var(--color-danger);
}

.house-number {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.date-text {
  font-size: 0.75rem;
}

.amount {
  font-size: 1.125rem;
  font-weight: 700;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

@media (max-width: 480px) {
  .hidden-xs {
    display: none;
  }
}
</style>
