<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2 style="font-size: 1.25rem; font-weight: 600;">Add Collection</h2>
        <button class="btn-icon text-muted" @click="close">
          <XIcon size="20" />
        </button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label class="form-label" for="houseNumber">House Number</label>
            <input 
              id="houseNumber" 
              list="houseNumbersList"
              v-model="houseNumber" 
              class="form-control" 
              required
              placeholder="Search or Select House Number"
              autocomplete="off"
              style="padding: 0.5rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: transparent; color: inherit;"
            />
            <datalist id="houseNumbersList">
              <option v-for="house in predefinedHouseNumbers" :key="house" :value="house"></option>
            </datalist>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="amount">Amount (₹)</label>
            <input 
              id="amount" 
              type="number" 
              v-model="amount" 
              class="form-control" 
              required 
              min="1"
              placeholder="0.00"
              style="padding: 0.5rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: transparent; color: inherit;"
            />
          </div>
          
          <div class="modal-footer" style="padding: 1.5rem 0 0 0; border: none;">
            <button type="button" class="btn btn-outline" @click="close">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="!houseNumber || !amount">Add Entry</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { X as XIcon } from 'lucide-vue-next';
import { predefinedHouseNumbers } from '@/composables/useCollections';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', houseNumber: string, amount: number): void;
}>();

const houseNumber = ref('');
const amount = ref<number | ''>(1700);

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    houseNumber.value = '';
    amount.value = 1700;
  }
});

const close = () => {
  emit('close');
};

const submitForm = () => {
  const formattedHouse = houseNumber.value.trim().toUpperCase();
  if (formattedHouse && amount.value) {
    if (!predefinedHouseNumbers.includes(formattedHouse)) {
      alert('Please select a valid house number from the list.');
      return;
    }
    emit('submit', formattedHouse, Number(amount.value));
    close();
  }
};
</script>
