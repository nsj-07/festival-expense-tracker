<template>
  <div class="container has-bottom-bar">
    <div class="header-nav">
      <button class="btn btn-outline" @click="goBack" style="padding: 0.5rem;">
        <ArrowLeftIcon size="20" />
      </button>
      <div class="festival-header">
        <h1 class="festival-name">Collections Dashboard</h1>
        <span class="text-muted" style="font-size: 0.75rem;">Manage all house collections</span>
      </div>
    </div>

    <div v-if="loading" class="text-center text-muted" style="padding: 3rem;">
      Loading collections...
    </div>

    <div v-else>
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-title">Total Collected</div>
          <div class="summary-amount text-success">{{ formatCurrency(totalCollected) }}</div>
        </div>
        <div class="summary-card">
          <div class="summary-title">Transferred</div>
          <div class="summary-amount text-danger">{{ formatCurrency(totalTransferred) }}</div>
        </div>
        <div class="summary-card balance" :class="{ 'positive': availableBalance >= 0, 'negative': availableBalance < 0 }">
          <div class="summary-title">Available Balance</div>
          <div class="summary-amount">{{ formatCurrency(availableBalance) }}</div>
        </div>
      </div>

      <div class="flex gap-4 mobile-action-bar" style="margin-bottom: 2rem;">
        <button class="btn btn-primary flex-1" @click="isAddModalOpen = true">
          <PlusIcon size="18" /> Add Collection
        </button>
        <button 
          class="btn btn-outline flex-1" 
          @click="isTransferModalOpen = true"
          :disabled="availableBalance <= 0"
        >
          <ArrowRightIcon size="18" /> Transfer
        </button>
      </div>

      <div class="section-header">
        <h2 style="font-size: 1.25rem; font-weight: 600; margin: 0;">History</h2>
        <div class="header-actions">
          <button class="btn btn-outline btn-sm flex items-center gap-1" @click="exportToExcel">
            <DownloadIcon size="16" /> <span class="btn-text">Export</span>
          </button>
        </div>
      </div>
      
      <CollectionList 
        :collections="collections"
        :loading="loading"
        :format-currency="formatCurrency"
        @delete="deleteCollection"
      />
    </div>

    <AddCollectionModal 
      :is-open="isAddModalOpen"
      @close="isAddModalOpen = false"
      @submit="handleAddSubmit"
    />

    <TransferModal 
      :is-open="isTransferModalOpen"
      :available-balance="availableBalance"
      :format-currency="formatCurrency"
      @close="isTransferModalOpen = false"
      @submit="handleTransferSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft as ArrowLeftIcon, Plus as PlusIcon, ArrowRight as ArrowRightIcon, Download as DownloadIcon } from 'lucide-vue-next';
import { useCollections } from '@/composables/useCollections';
import { useFestivalSummary } from '@/composables/useFestivalSummary'; // Reusing formatCurrency

import CollectionList from '@/components/CollectionList.vue';
import AddCollectionModal from '@/components/AddCollectionModal.vue';
import TransferModal from '@/components/TransferModal.vue';

const router = useRouter();

const { 
  collections, 
  loading, 
  totalCollected,
  totalTransferred,
  availableBalance,
  fetchCollections, 
  addCollection, 
  transferToFestival,
  deleteCollection 
} = useCollections();

// Dummy composable just to get the currency formatter
const { formatCurrency } = useFestivalSummary(ref([]));

const isAddModalOpen = ref(false);
const isTransferModalOpen = ref(false);

onMounted(async () => {
  await fetchCollections();
});

const goBack = () => {
  router.push('/');
};

const handleAddSubmit = async (houseNumber: string, amount: number) => {
  await addCollection(houseNumber, amount);
};

const handleTransferSubmit = async (festivalId: string, amount: number) => {
  await transferToFestival(festivalId, amount);
};

const exportToExcel = () => {
  if (collections.value.length === 0) {
    alert("No collections to export.");
    return;
  }

  const headers = ['Date', 'Type', 'House Number', 'Festival ID (Transfer)', 'Amount'];
  const rows = collections.value.map(col => {
    return [
      `"${new Date(col.createdAt).toLocaleDateString('en-IN')}"`,
      col.type === 'collection' ? 'Collection' : 'Transfer',
      `"${col.houseNumber || ''}"`,
      `"${col.festivalId || ''}"`,
      col.amount
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Collections_Dashboard.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

/* Reusing summary cards CSS */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-card {
  background-color: var(--color-card-bg);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

@media (max-width: 640px) {
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }
  .summary-card {
    padding: 0.75rem;
  }
  .summary-card.balance {
    grid-column: span 2;
  }
}

.summary-title {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@media (max-width: 640px) {
  .summary-title {
    font-size: 0.75rem;
    margin-bottom: 0.25rem;
  }
  .btn-text {
    display: none;
  }
}

.summary-amount {
  font-size: 1.5rem;
  font-weight: 700;
}

@media (max-width: 640px) {
  .summary-amount {
    font-size: 1.25rem;
  }
}

.balance.positive .summary-amount {
  color: var(--color-success);
}

.balance.negative .summary-amount {
  color: var(--color-danger);
}
</style>
