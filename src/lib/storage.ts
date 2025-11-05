// Simple localStorage wrapper for configuration values only
// DO NOT USE THIS FOR APP DATA - Use Supabase instead
class StorageManager {
  constructor() {
    console.log('[Storage] Config storage initialized - use Supabase for app data');
  }

  // Simple localStorage wrapper for config values only
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error(`[Storage] Failed to save config ${key}:`, e);
    }
  }

  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error(`[Storage] Failed to retrieve config ${key}:`, e);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`[Storage] Failed to remove config ${key}:`, e);
    }
  }

  // Helper for JSON config values
  setJSON(key: string, value: any): void {
    this.setItem(key, JSON.stringify(value));
  }

  getJSON<T>(key: string): T | null {
    const value = this.getItem(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch (e) {
      console.error(`[Storage] Failed to parse JSON config for ${key}:`, e);
      return null;
    }
  }
}

// Export singleton instance
export const storage = new StorageManager();
