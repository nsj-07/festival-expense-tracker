<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2 style="font-size: 1.25rem; font-weight: 600;">
          {{ isEditing ? 'Edit Transaction' : (type === 'income' ? 'Add Income' : 'Add Expense') }}
        </h2>
        <button class="btn-icon" @click="close">
          <XIcon size="20" />
        </button>
      </div>
      
      <form @submit.prevent="submit">
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="tx-date">Date <span class="text-danger">*</span></label>
            <input 
              id="tx-date"
              v-model="form.date"
              class="form-control"
              type="date"
              required
            />
          </div>
          
          <div class="form-group">
            <label class="form-label" for="tx-title">Title <span class="text-danger">*</span></label>
            <input 
              id="tx-title"
              v-model="form.title"
              class="form-control"
              type="text"
              placeholder="e.g., Salary, Decoration"
              required
            />
          </div>
          
          <div class="form-group">
            <label class="form-label" for="tx-amount">Amount (₹) <span class="text-danger">*</span></label>
            <input 
              id="tx-amount"
              v-model.number="form.amount"
              class="form-control"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>
          
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" for="tx-description">Description</label>
            <textarea 
              id="tx-description"
              v-model="form.description"
              class="form-control"
              placeholder="Optional notes..."
              rows="3"
            ></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" @click="close">Cancel</button>
          <button type="submit" class="btn btn-primary" :disabled="!isValid">
            {{ isEditing ? 'Save Changes' : 'Save' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { X as XIcon } from 'lucide-vue-next';
import type { Transaction } from '@/db/database';

const props = defineProps<{
  isOpen: boolean;
  type: 'income' | 'expense';
  initialData?: Partial<Transaction>;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'festivalId'>): void;
}>();

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const form = ref({
  type: props.type,
  date: getTodayDateString(),
  title: '',
  amount: '' as unknown as number,
  description: ''
});

const isEditing = computed(() => !!props.initialData?.id);

const isValid = computed(() => {
  return form.value.date && 
         form.value.title.trim() && 
         typeof form.value.amount === 'number' && 
         form.value.amount > 0;
});

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.initialData) {
      form.value = {
        type: props.initialData.type || props.type,
        date: props.initialData.date || getTodayDateString(),
        title: props.initialData.title || '',
        amount: props.initialData.amount || ('' as unknown as number),
        description: props.initialData.description || ''
      };
    } else {
      form.value = {
        type: props.type,
        date: getTodayDateString(),
        title: '',
        amount: '' as unknown as number,
        description: ''
      };
    }
  }
});

const close = () => {
  emit('close');
};

const submit = () => {
  if (isValid.value) {
    emit('submit', {
      type: form.value.type as 'income' | 'expense',
      date: form.value.date,
      title: form.value.title.trim(),
      amount: Number(form.value.amount),
      description: form.value.description?.trim() || undefined
    });
    close();
  }
};
</script>
