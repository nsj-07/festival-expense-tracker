<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2 style="font-size: 1.25rem; font-weight: 600;">
          {{ isEditing ? 'Edit Festival' : 'Create Festival' }}
        </h2>
        <button class="btn-icon" @click="close">
          <XIcon size="20" />
        </button>
      </div>
      
      <form @submit.prevent="submit">
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="festival-name">Festival Name</label>
            <input 
              id="festival-name"
              v-model="name"
              class="form-control"
              type="text"
              placeholder="e.g., Diwali 2026"
              required
              autofocus
            />
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" @click="close">Cancel</button>
          <button type="submit" class="btn btn-primary" :disabled="!name.trim()">
            {{ isEditing ? 'Save Changes' : 'Create' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { X as XIcon } from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  initialName?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', name: string): void;
}>();

const name = ref(props.initialName || '');

const isEditing = computed(() => !!props.initialName);

import { computed } from 'vue';

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    name.value = props.initialName || '';
  }
});

const close = () => {
  emit('close');
};

const submit = () => {
  if (name.value.trim()) {
    emit('submit', name.value.trim());
    close();
  }
};
</script>
