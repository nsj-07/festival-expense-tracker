<template>
  <div class="data-management card">
    <div class="flex items-center gap-2" style="margin-bottom: 1rem;">
      <DatabaseIcon size="20" class="text-primary" />
      <h3 style="font-size: 1.125rem; font-weight: 600;">Data Management</h3>
    </div>
    
    <p class="text-muted" style="font-size: 0.875rem; margin-bottom: 1.5rem;">
      Your data is stored locally in this browser. Export a backup to keep your data safe.
    </p>
    
    <div class="actions flex gap-4">
      <button class="btn btn-outline flex-1" @click="exportData" :disabled="isExporting">
        <DownloadIcon size="18" />
        {{ isExporting ? 'Exporting...' : 'Export Backup' }}
      </button>
      
      <label class="btn btn-outline flex-1" style="cursor: pointer; text-align: center;">
        <UploadIcon size="18" />
        Import Backup
        <input 
          type="file" 
          accept=".json" 
          style="display: none;" 
          @change="importData"
          :disabled="isImporting"
        />
      </label>
    </div>
    
    <div v-if="message" :class="`message ${messageType}`" style="margin-top: 1rem; font-size: 0.875rem; padding: 0.75rem; border-radius: var(--radius-md);">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Database as DatabaseIcon, Download as DownloadIcon, Upload as UploadIcon } from 'lucide-vue-next';
import { db } from '@/db/database';

const isExporting = ref(false);
const isImporting = ref(false);
const message = ref('');
const messageType = ref<'success' | 'error'>('success');

const showMessage = (msg: string, type: 'success' | 'error') => {
  message.value = msg;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
  }, 5000);
};

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

const exportData = async () => {
  isExporting.value = true;
  try {
    const festivals = await db.festivals.toArray();
    const transactions = await db.transactions.toArray();
    
    const data = {
      version: 1,
      timestamp: new Date().toISOString(),
      festivals,
      transactions
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `festival-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showMessage('Data exported successfully!', 'success');
  } catch (err) {
    console.error(err);
    showMessage('Failed to export data.', 'error');
  } finally {
    isExporting.value = false;
  }
};

const importData = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  
  if (!confirm('Importing data will replace any conflicting records. Do you want to proceed?')) {
    (event.target as HTMLInputElement).value = '';
    return;
  }
  
  isImporting.value = true;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    if (!data.festivals || !data.transactions) {
      throw new Error('Invalid backup file format');
    }
    
    await db.transaction('rw', db.festivals, db.transactions, async () => {
      // Upsert data to avoid duplicate key errors
      for (const festival of data.festivals) {
        await db.festivals.put(festival);
      }
      for (const transaction of data.transactions) {
        await db.transactions.put(transaction);
      }
    });
    
    showMessage('Data imported successfully!', 'success');
    emit('refresh');
  } catch (err: any) {
    console.error(err);
    showMessage(`Failed to import data: ${err.message || 'Invalid file'}`, 'error');
  } finally {
    isImporting.value = false;
    (event.target as HTMLInputElement).value = '';
  }
};
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
