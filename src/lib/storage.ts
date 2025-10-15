import { getSupabaseClient, isSupabaseConfigured } from './supabase-client';

// Storage utility with multiple fallback mechanisms for data persistence
class StorageManager {
  private storageAvailable: boolean;
  private storageType: 'localStorage' | 'sessionStorage' | 'memory';
  private memoryStorage: Map<string, string>;

  constructor() {
    this.memoryStorage = new Map();
    this.storageAvailable = this.checkStorageAvailability();
    this.storageType = this.determineStorageType();
    
    console.log(`[Storage] Using ${this.storageType} for data persistence`);
  }

  private checkStorageAvailability(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('[Storage] localStorage not available:', e);
      return false;
    }
  }

  private determineStorageType(): 'localStorage' | 'sessionStorage' | 'memory' {
    if (this.storageAvailable) {
      return 'localStorage';
    }
    
    try {
      const testKey = '__session_test__';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      return 'sessionStorage';
    } catch (e) {
      console.warn('[Storage] sessionStorage not available, using memory storage');
      return 'memory';
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    // Try Supabase first if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        if (supabase) {
          const { error } = await supabase
            .from('app_storage')
            .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
          
          if (!error) {
            console.log(`[Storage] Saved to Supabase: ${key}`);
            return;
          } else {
            console.warn(`[Storage] Supabase save failed, falling back to localStorage:`, error);
          }
        }
      } catch (e) {
        console.warn(`[Storage] Supabase error, falling back to localStorage:`, e);
      }
    }

    // Fallback to localStorage/sessionStorage/memory
    try {
      if (this.storageType === 'localStorage') {
        localStorage.setItem(key, value);
        console.log(`[Storage] Saved to localStorage: ${key}`);
      } else if (this.storageType === 'sessionStorage') {
        sessionStorage.setItem(key, value);
        console.log(`[Storage] Saved to sessionStorage: ${key}`);
      } else {
        this.memoryStorage.set(key, value);
        console.log(`[Storage] Saved to memory: ${key}`);
      }
    } catch (e) {
      console.error(`[Storage] Failed to save ${key}:`, e);
      this.memoryStorage.set(key, value);
    }
  }

  async getItem(key: string): Promise<string | null> {
    // Try Supabase first if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data, error } = await supabase
            .from('app_storage')
            .select('value')
            .eq('key', key)
            .single();
          
          if (!error && data) {
            console.log(`[Storage] Retrieved from Supabase: ${key}`, 'found');
            return data.value;
          } else if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
            console.warn(`[Storage] Supabase retrieve failed, falling back to localStorage:`, error);
          }
        }
      } catch (e) {
        console.warn(`[Storage] Supabase error, falling back to localStorage:`, e);
      }
    }

    // Fallback to localStorage/sessionStorage/memory
    try {
      if (this.storageType === 'localStorage') {
        const value = localStorage.getItem(key);
        console.log(`[Storage] Retrieved from localStorage: ${key}`, value ? 'found' : 'not found');
        return value;
      } else if (this.storageType === 'sessionStorage') {
        const value = sessionStorage.getItem(key);
        console.log(`[Storage] Retrieved from sessionStorage: ${key}`, value ? 'found' : 'not found');
        return value;
      } else {
        const value = this.memoryStorage.get(key) || null;
        console.log(`[Storage] Retrieved from memory: ${key}`, value ? 'found' : 'not found');
        return value;
      }
    } catch (e) {
      console.error(`[Storage] Failed to retrieve ${key}:`, e);
      return this.memoryStorage.get(key) || null;
    }
  }

  removeItem(key: string): void {
    try {
      if (this.storageType === 'localStorage') {
        localStorage.removeItem(key);
      } else if (this.storageType === 'sessionStorage') {
        sessionStorage.removeItem(key);
      } else {
        this.memoryStorage.delete(key);
      }
      console.log(`[Storage] Removed: ${key}`);
    } catch (e) {
      console.error(`[Storage] Failed to remove ${key}:`, e);
    }
  }

  clear(): void {
    try {
      if (this.storageType === 'localStorage') {
        localStorage.clear();
      } else if (this.storageType === 'sessionStorage') {
        sessionStorage.clear();
      } else {
        this.memoryStorage.clear();
      }
      console.log('[Storage] Cleared all data');
    } catch (e) {
      console.error('[Storage] Failed to clear:', e);
    }
  }

  // Helper method for JSON data
  async setJSON(key: string, value: any): Promise<void> {
    await this.setItem(key, JSON.stringify(value));
  }

  async getJSON<T>(key: string): Promise<T | null> {
    const value = await this.getItem(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch (e) {
      console.error(`[Storage] Failed to parse JSON for ${key}:`, e);
      return null;
    }
  }
}

// Export singleton instance
export const storage = new StorageManager();
