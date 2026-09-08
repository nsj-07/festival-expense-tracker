import { computed, type Ref } from 'vue';
import { type Transaction } from '../db/database';

export function useFestivalSummary(transactions: Ref<Transaction[]>) {
  const totalIncome = computed(() => {
    return transactions.value
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  });

  const totalExpense = computed(() => {
    return transactions.value
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  });

  const availableBalance = computed(() => {
    return totalIncome.value - totalExpense.value;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return {
    totalIncome,
    totalExpense,
    availableBalance,
    formatCurrency
  };
}
