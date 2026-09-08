<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2 style="font-size: 1.25rem; font-weight: 600;">Transfer to Festival</h2>
        <button class="btn-icon text-muted" @click="close">
          <XIcon size="20" />
        </button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label class="form-label">Available Balance</label>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-success); margin-bottom: 1rem;">
              {{ formatCurrency(availableBalance) }}
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="festivalSelect">Select Festival</label>
            <select 
              id="festivalSelect" 
              v-model="selectedFestivalId" 
              class="form-control" 
              required
              style="padding: 0.5rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: transparent; color: inherit;"
            >
              <option value="" disabled>Select a festival...</option>
              <option v-for="fest in festivals" :key="fest.id" :value="fest.id" style="background: var(--color-card-bg); color: inherit;">
                {{ fest.name }}
              </option>
            </select>
            <div v-if="festivals.length === 0" class="text-danger" style="font-size: 0.75rem; margin-top: 0.25rem;">
              You don't have any festivals created yet.
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="amount">Amount (₹)</label>
            <div style="display: flex; gap: 0.5rem;">
              <input 
                id="amount" 
                type="number" 
                v-model="amount" 
                class="form-control" 
                required 
                min="1"
                :max="availableBalance"
                placeholder="0.00"
                style="padding: 0.5rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: transparent; color: inherit; flex: 1;"
              />
              <button type="button" class="btn btn-outline" @click="setFullAmount">Max</button>
            </div>
            <div v-if="amount && amount > availableBalance" class="text-danger" style="font-size: 0.75rem; margin-top: 0.25rem;">
              Amount exceeds available balance.
            </div>
          </div>
          
          <div class="modal-footer" style="padding: 1.5rem 0 0 0; border: none;">
            <button type="button" class="btn btn-outline" @click="close">Cancel</button>
            <button 
              type="submit" 
              class="btn btn-primary" 
              :disabled="!selectedFestivalId || !amount || amount > availableBalance || amount <= 0"
            >
              Transfer Funds
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { X as XIcon } from 'lucide-vue-next';
import { useFestivals } from '@/composables/useFestivals';

const props = defineProps<{
  isOpen: boolean;
  availableBalance: number;
  formatCurrency: (val: number) => string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', festivalId: string, amount: number): void;
}>();

const { festivals, fetchFestivals } = useFestivals();

const selectedFestivalId = ref('');
const amount = ref<number | ''>('');

onMounted(() => {
  fetchFestivals();
});

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    selectedFestivalId.value = '';
    amount.value = '';
    fetchFestivals();
  }
});

const setFullAmount = () => {
  if (props.availableBalance > 0) {
    amount.value = props.availableBalance;
  }
};

const close = () => {
  emit('close');
};

const submitForm = () => {
  if (selectedFestivalId.value && amount.value && amount.value <= props.availableBalance) {
    emit('submit', selectedFestivalId.value, Number(amount.value));
    close();
  }
};
</script>
