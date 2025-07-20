// Storage utility that provides tab-specific storage with automatic cleanup
// Uses sessionStorage for tab-specific data and localStorage for persistent settings

class StorageManager {
  private static instance: StorageManager;
  
  private constructor() {
    // Set up cleanup listener when the tab is closed
    this.setupCleanupListeners();
  }

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  private setupCleanupListeners() {
    // Clean up sessionStorage when tab is closed
    window.addEventListener('beforeunload', () => {
      console.log('Tab closing, cleaning up calculator data...');
      this.clearCalculatorData();
    });

    // Also clean up when the page is hidden (tab switched or minimized)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        console.log('Page hidden, saving calculator data...');
        // Data is already saved to sessionStorage automatically
      }
    });
  }

  // Clear all calculator-specific data (but keep user preferences)
  private clearCalculatorData() {
    const calculatorKeys = [
      'interestCalculator',
      'purityCalculator', 
      'amountCalculator'
    ];
    
    calculatorKeys.forEach(key => {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key); // Also clear from localStorage if it exists
    });
  }

  // Get data from sessionStorage (tab-specific)
  public getCalculatorData(key: string): any {
    try {
      const data = sessionStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting calculator data for ${key}:`, error);
      return null;
    }
  }

  // Set data to sessionStorage (tab-specific)
  public setCalculatorData(key: string, data: any): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
      console.log(`Saved calculator data for ${key}:`, data);
    } catch (error) {
      console.error(`Error saving calculator data for ${key}:`, error);
    }
  }

  // Remove specific calculator data
  public removeCalculatorData(key: string): void {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key); // Also remove from localStorage if it exists
    console.log(`Cleared calculator data for ${key}`);
  }

  // Get persistent user preferences (uses localStorage)
  public getUserPreference(key: string): any {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting user preference ${key}:`, error);
      return null;
    }
  }

  // Set persistent user preferences (uses localStorage)
  public setUserPreference(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`Saved user preference ${key}:`, data);
    } catch (error) {
      console.error(`Error saving user preference ${key}:`, error);
    }
  }

  // Clear all data (both session and persistent)
  public clearAllData(): void {
    sessionStorage.clear();
    // Only clear calculator data from localStorage, keep user preferences
    const calculatorKeys = [
      'interestCalculator',
      'purityCalculator', 
      'amountCalculator'
    ];
    
    calculatorKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('Cleared all calculator data');
  }

  // Migrate existing localStorage data to sessionStorage (for backward compatibility)
  public migrateExistingData(): void {
    const calculatorKeys = [
      'interestCalculator',
      'purityCalculator', 
      'amountCalculator'
    ];
    
    calculatorKeys.forEach(key => {
      const existingData = localStorage.getItem(key);
      if (existingData && !sessionStorage.getItem(key)) {
        // Move data from localStorage to sessionStorage
        sessionStorage.setItem(key, existingData);
        localStorage.removeItem(key);
        console.log(`Migrated ${key} from localStorage to sessionStorage`);
      }
    });
  }
}

// Export singleton instance
export const storage = StorageManager.getInstance();

// Export the class for direct access if needed
export { StorageManager };

// Helper functions for easier usage
export const getCalculatorData = (key: string) => storage.getCalculatorData(key);
export const setCalculatorData = (key: string, data: any) => storage.setCalculatorData(key, data);
export const removeCalculatorData = (key: string) => storage.removeCalculatorData(key);
export const getUserPreference = (key: string) => storage.getUserPreference(key);
export const setUserPreference = (key: string, data: any) => storage.setUserPreference(key, data);
