<template>
  <div class="container">
    <div class="header-nav">
      <button class="btn btn-outline" @click="goBack" style="padding: 0.5rem;">
        <ArrowLeftIcon size="20" />
      </button>
      <div v-if="festival" class="festival-header">
        <h1 class="festival-name">{{ festival.name }}</h1>
        <span class="text-muted" style="font-size: 0.75rem;">Last updated: {{ formatDate(festival.updatedAt) }}</span>
      </div>
    </div>

    <div v-if="loading" class="text-center text-muted" style="padding: 3rem;">
      Loading festival data...
    </div>

    <div v-else-if="!festival" class="card text-center text-danger">
      Festival not found.
    </div>

    <div v-else>
      <SummaryCards 
        :total-income="totalIncome" 
        :total-expense="totalExpense" 
        :available-balance="availableBalance"
        :format-currency="formatCurrency" 
      />

      <div class="flex gap-4" style="margin-bottom: 2rem;">
        <button class="btn btn-success flex-1" @click="openTransactionModal('income')">
          <PlusIcon size="18" /> Income
        </button>
        <button class="btn btn-danger flex-1" @click="openTransactionModal('expense')">
          <MinusIcon size="18" /> Expense
        </button>
      </div>

      <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Transactions</h2>
      
      <TransactionList 
        :transactions="transactions"
        :filtered-transactions="filteredTransactions"
        :loading="loadingTransactions"
        v-model:filter-type="filterType"
        v-model:filter-date="filterDate"
        v-model:search-query="searchQuery"
        :format-currency="formatCurrency"
        @edit="editTx"
        @delete="removeTransaction"
      />
    </div>

    <TransactionFormModal 
      :is-open="isTxModalOpen"
      :type="txModalType"
      :initial-data="editingTx"
      @close="closeTxModal"
      @submit="handleTxSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft as ArrowLeftIcon, Plus as PlusIcon, Minus as MinusIcon } from 'lucide-vue-next';
import { festivalRepository } from '@/repositories/festivalRepository';
import { useTransactions } from '@/composables/useTransactions';
import { useFestivalSummary } from '@/composables/useFestivalSummary';
import type { Festival, Transaction } from '@/db/database';

import SummaryCards from '@/components/SummaryCards.vue';
import TransactionList from '@/components/TransactionList.vue';
import TransactionFormModal from '@/components/TransactionFormModal.vue';

const route = useRoute();
const router = useRouter();
const festivalId = route.params.festivalId as string;

const festival = ref<Festival | null>(null);
const loading = ref(true);

const { 
  transactions, 
  filteredTransactions, 
  loading: loadingTransactions,
  filterType, 
  filterDate, 
  searchQuery,
  fetchTransactions, 
  addTransaction, 
  editTransaction, 
  removeTransaction 
} = useTransactions(festivalId);

const { totalIncome, totalExpense, availableBalance, formatCurrency } = useFestivalSummary(transactions);

onMounted(async () => {
  try {
    festival.value = await festivalRepository.getById(festivalId) || null;
    if (festival.value) {
      await fetchTransactions();
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});

const formatDate = (ts: number) => {
  return new Date(ts).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const goBack = () => {
  router.push('/');
};

// Transaction Modal State
const isTxModalOpen = ref(false);
const txModalType = ref<'income' | 'expense'>('expense');
const editingTx = ref<Transaction | undefined>(undefined);

const openTransactionModal = (type: 'income' | 'expense') => {
  txModalType.value = type;
  editingTx.value = undefined;
  isTxModalOpen.value = true;
};

const editTx = (tx: Transaction) => {
  txModalType.value = tx.type;
  editingTx.value = tx;
  isTxModalOpen.value = true;
};

const closeTxModal = () => {
  isTxModalOpen.value = false;
  editingTx.value = undefined;
};

const handleTxSubmit = async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'festivalId'>) => {
  if (editingTx.value?.id) {
    await editTransaction(editingTx.value.id, data);
  } else {
    await addTransaction(data);
  }
  // Refresh festival data to update timestamp
  festival.value = await festivalRepository.getById(festivalId) || null;
};
</script>

<style scoped>
.header-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.festival-header {
  display: flex;
  flex-direction: column;
}

.festival-name {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
}

.btn-success {
  background-color: var(--color-success);
  color: white;
}

.btn-success:hover {
  background-color: #059669; /* darker success */
}
</style>
