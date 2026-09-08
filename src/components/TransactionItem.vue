<template>
  <div class="transaction-item card">
    <div class="tx-main">
      <div class="tx-icon" :class="transaction.type">
        <ArrowDownIcon v-if="transaction.type === 'income'" size="20" />
        <ArrowUpIcon v-else size="20" />
      </div>
      <div class="tx-details">
        <div class="tx-title">{{ transaction.title }}</div>
        <div class="tx-date">{{ formatDate(transaction.date) }}</div>
        <div v-if="transaction.description" class="tx-desc">{{ transaction.description }}</div>
      </div>
    </div>
    
    <div class="tx-right">
      <div class="tx-amount" :class="transaction.type === 'income' ? 'text-success' : 'text-danger'">
        {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
      </div>
      <div class="tx-actions">
        <button class="btn-icon text-muted" @click="$emit('edit', transaction)">
          <Edit2Icon size="16" />
        </button>
        <button class="btn-icon text-danger" @click="confirmDelete">
          <Trash2Icon size="16" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowDown as ArrowDownIcon, ArrowUp as ArrowUpIcon, Edit2 as Edit2Icon, Trash2 as Trash2Icon } from 'lucide-vue-next';
import type { Transaction } from '@/db/database';

const props = defineProps<{
  transaction: Transaction;
  formatCurrency: (amount: number) => string;
}>();

const emit = defineEmits<{
  (e: 'edit', transaction: Transaction): void;
  (e: 'delete', id: string): void;
}>();

const formatDate = (dateStr: string) => {
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
  return new Date(dateStr).toLocaleDateString('en-IN', options);
};

const confirmDelete = () => {
  if (confirm('Are you sure you want to delete this transaction?')) {
    emit('delete', props.transaction.id as string);
  }
};
</script>

<style scoped>
.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: var(--radius-md);
  border-left: 4px solid var(--color-border);
}

.transaction-item:hover {
  transform: translateY(-1px);
}

.transaction-item .tx-icon.income {
  color: var(--color-success);
  background-color: rgba(16, 185, 129, 0.1);
}

.transaction-item .tx-icon.expense {
  color: var(--color-danger);
  background-color: rgba(239, 68, 68, 0.1);
}

.tx-main {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex: 1;
}

.tx-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.tx-details {
  display: flex;
  flex-direction: column;
}

.tx-title {
  font-weight: 600;
  font-size: 1rem;
}

.tx-date {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.tx-desc {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-top: 0.25rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tx-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.tx-amount {
  font-weight: 700;
  font-size: 1.125rem;
  white-space: nowrap;
}

.tx-actions {
  display: flex;
  gap: 0.25rem;
}

@media (max-width: 480px) {
  .transaction-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  .tx-right {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .tx-amount {
    font-size: 1.25rem;
  }
}
</style>
