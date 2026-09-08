<template>
  <div class="data-management card">
    <div class="flex items-center gap-2" style="margin-bottom: 1rem;">
      <DatabaseIcon size="20" class="text-primary" />
      <h3 style="font-size: 1.125rem; font-weight: 600;">Data Management</h3>
    </div>
    
    <p class="text-muted" style="font-size: 0.875rem; margin-bottom: 1.5rem;">
      Your data is now securely stored and synced in the cloud via Firebase. Local backups are no longer necessary!
    </p>
    
    <div v-if="message" :class="`message ${messageType}`" style="margin-top: 1rem; font-size: 0.875rem; padding: 0.75rem; border-radius: var(--radius-md);">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { Database as DatabaseIcon } from 'lucide-vue-next';
</script>

<style scoped>
.actions {
  display: flex;
}
@media (max-width: 480px) {
  .actions {
    flex-direction: column;
  }
}

.message.success {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.message.error {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
  border: 1px solid rgba(239, 68, 68, 0.2);
}
</style>
