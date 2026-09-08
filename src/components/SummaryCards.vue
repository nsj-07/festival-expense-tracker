<template>
  <div class="summary-cards">
    <div class="summary-card income">
      <div class="summary-title">Total Income</div>
      <div class="summary-amount text-success">{{ formatCurrency(totalIncome) }}</div>
    </div>
    
    <div class="summary-card expense">
      <div class="summary-title">Total Expense</div>
      <div class="summary-amount text-danger">{{ formatCurrency(totalExpense) }}</div>
    </div>
    
    <div class="summary-card balance" :class="{ 'positive': availableBalance > 0, 'negative': availableBalance < 0, 'zero': availableBalance === 0 }">
      <div class="summary-title">Available Balance</div>
      <div class="summary-amount">{{ formatCurrency(availableBalance) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  totalIncome: number;
  totalExpense: number;
  availableBalance: number;
  formatCurrency: (amount: number) => string;
}>();
</script>

<style scoped>
.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

@media (max-width: 640px) {
  .summary-cards {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
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

.summary-title {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-amount {
  font-size: 1.5rem;
  font-weight: 700;
}

.balance.positive .summary-amount {
  color: var(--color-success);
}
.balance.negative .summary-amount {
  color: var(--color-danger);
}
.balance.zero .summary-amount {
  color: var(--color-text-main);
}

.income {
  border-bottom: 3px solid var(--color-success);
}
.expense {
  border-bottom: 3px solid var(--color-danger);
}
.balance {
  border-bottom: 3px solid var(--color-primary);
}
</style>
