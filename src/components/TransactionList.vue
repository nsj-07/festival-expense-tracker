<template>
  <div class="transaction-list-container">
    <div class="filters card">
      <div class="search-box">
        <SearchIcon class="search-icon" size="20" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search by title or description..." 
          class="form-control"
        />
      </div>
      
      <div class="filter-controls">
        <select v-model="filterType" class="form-control filter-select">
          <option value="all">All Types</option>
          <option value="income">Income Only</option>
          <option value="expense">Expense Only</option>
        </select>
        
        <select v-model="filterDate" class="form-control filter-select">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="text-center text-muted" style="padding: 2rem 0;">
      Loading transactions...
    </div>
    
    <div v-else-if="transactions.length === 0" class="empty-state card text-center">
      <div class="empty-icon text-muted" style="margin-bottom: 1rem;">
        <FileTextIcon size="48" style="opacity: 0.5; margin: 0 auto;" />
      </div>
      <h3>No transactions yet</h3>
      <p class="text-muted">Add your first income or expense to start tracking this festival.</p>
    </div>
    
    <div v-else-if="filteredTransactions.length === 0" class="empty-state card text-center">
      <p class="text-muted">No matching transactions found.</p>
    </div>
    
    <div v-else class="transactions">
      <TransitionGroup name="list" tag="div">
        <TransactionItem 
          v-for="tx in filteredTransactions" 
          :key="tx.id"
          :transaction="tx"
          :formatCurrency="formatCurrency"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search as SearchIcon, FileText as FileTextIcon } from 'lucide-vue-next';
import type { Transaction } from '@/db/database';
import TransactionItem from './TransactionItem.vue';

defineProps<{
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  loading: boolean;
  formatCurrency: (amount: number) => string;
}>();

const filterType = defineModel<'all' | 'income' | 'expense'>('filterType', { required: true });
const filterDate = defineModel<'newest' | 'oldest'>('filterDate', { required: true });
const searchQuery = defineModel<string>('searchQuery', { required: true });

defineEmits<{
  (e: 'edit', transaction: Transaction): void;
  (e: 'delete', id: string): void;
}>();
</script>

<style scoped>
.filters {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.search-box {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
}

.search-box input {
  padding-left: 2.5rem;
}

.filter-controls {
  display: flex;
  gap: 1rem;
}

.filter-select {
  flex: 1;
}

@media (max-width: 480px) {
  .filter-controls {
    flex-direction: column;
  }
}

.empty-state {
  padding: 3rem 1rem;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
