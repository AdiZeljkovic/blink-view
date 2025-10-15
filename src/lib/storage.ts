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

  setItem(key: string, value: string): void {
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
      // Fallback to memory storage
      this.memoryStorage.set(key, value);
    }
  }

  getItem(key: string): string | null {
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
  setJSON(key: string, value: any): void {
    this.setItem(key, JSON.stringify(value));
  }

  getJSON<T>(key: string): T | null {
    const value = this.getItem(key);
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
