/**
 * Storage Service
 * Handles all persistent data storage using AsyncStorage and SecureStore
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { Contact, User, CallUIData } from '@/types';
import { secureStorage } from './secure-storage.services';

// Storage Keys
const STORAGE_KEYS = {
  CONTACTS: '@flexcalling:contacts',
  CALL_LOGS: '@flexcalling:call_logs',
  USER_PROFILE: '@flexcalling:user_profile',
  CURRENT_USER_ID: '@flexcalling:current_user_id',
  THEME: '@flexcalling_theme', // Keep existing key for compatibility
} as const;

// Secure Storage Keys (for sensitive data)
const SECURE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_ID: 'user_id',
} as const;

// ============================================
// GENERIC STORAGE UTILITIES
// ============================================

/**
 * Store data in AsyncStorage
 */
async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    console.log(`✅ Stored ${key} successfully`);
  } catch (error) {
    console.error(`❌ Failed to store ${key}:`, error);
    throw new Error(`Storage error: ${error}`);
  }
}

/**
 * Get data from AsyncStorage
 */
async function getItem<T>(key: string): Promise<T | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    if (jsonValue === null) {
      console.log(`ℹ️ No data found for ${key}`);
      return null;
    }
    const parsed = JSON.parse(jsonValue) as T;
    console.log(`✅ Retrieved ${key} successfully`);
    return parsed;
  } catch (error) {
    console.error(`❌ Failed to retrieve ${key}:`, error);
    return null;
  }
}

/**
 * Remove data from AsyncStorage
 */
async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
    console.log(`✅ Removed ${key} successfully`);
  } catch (error) {
    console.error(`❌ Failed to remove ${key}:`, error);
    throw new Error(`Storage error: ${error}`);
  }
}

/**
 * Clear all AsyncStorage data (use with caution!)
 */
async function clearAll(): Promise<void> {
  try {
    await AsyncStorage.clear();
    console.log('✅ Cleared all AsyncStorage data');
  } catch (error) {
    console.error('❌ Failed to clear AsyncStorage:', error);
    throw new Error(`Storage error: ${error}`);
  }
}

// ============================================
// SECURE STORAGE UTILITIES
// ============================================

/**
 * Store sensitive data securely
 */
async function setSecureItem(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
    console.log(`🔐 Securely stored ${key}`);
  } catch (error) {
    console.error(`❌ Failed to securely store ${key}:`, error);
    throw new Error(`Secure storage error: ${error}`);
  }
}

/**
 * Get sensitive data securely
 */
async function getSecureItem(key: string): Promise<string | null> {
  try {
    const value = await SecureStore.getItemAsync(key);
    if (value) {
      console.log(`🔐 Retrieved ${key} securely`);
    }
    return value;
  } catch (error) {
    console.error(`❌ Failed to retrieve ${key} securely:`, error);
    return null;
  }
}

/**
 * Remove sensitive data
 */
async function removeSecureItem(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
    console.log(`🔐 Removed ${key} securely`);
  } catch (error) {
    console.error(`❌ Failed to remove ${key} securely:`, error);
    throw new Error(`Secure storage error: ${error}`);
  }
}

// ============================================
// CONTACTS STORAGE
// ============================================

export const ContactStorage = {
  /**
   * Save contacts array to storage
   */
  async save(contacts: Contact[]): Promise<void> {
    await setItem(STORAGE_KEYS.CONTACTS, contacts);
  },

  /**
   * Load contacts from storage
   */
  async load(): Promise<Contact[]> {
    const contacts = await getItem<Contact[]>(STORAGE_KEYS.CONTACTS);
    return contacts || [];
  },

  /**
   * Clear all contacts from storage
   */
  async clear(): Promise<void> {
    await removeItem(STORAGE_KEYS.CONTACTS);
  },
};

// ============================================
// CALL LOGS STORAGE
// ============================================

export const CallLogStorage = {
  /**
   * Save call logs to storage
   */
  async save(callLogs: CallUIData[]): Promise<void> {
    // Convert Date objects to ISO strings for storage
    const serializable = callLogs.map(log => ({
      ...log,
      callStartTime: log.callStartTime?.toISOString() || null,
    }));
    await setItem(STORAGE_KEYS.CALL_LOGS, serializable);
  },

  /**
   * Load call logs from storage
   */
  async load(): Promise<CallUIData[]> {
    const stored = await getItem<any[]>(STORAGE_KEYS.CALL_LOGS);
    if (!stored) return [];

    // Convert ISO strings back to Date objects
    return stored.map(log => ({
      ...log,
      callStartTime: log.callStartTime ? new Date(log.callStartTime) : null,
    }));
  },

  /**
   * Append a new call log (for efficiency)
   */
  async append(callLog: CallUIData): Promise<void> {
    const existing = await this.load();
    const updated = [callLog, ...existing];
    await this.save(updated);
  },

  /**
   * Clear all call logs from storage
   */
  async clear(): Promise<void> {
    await removeItem(STORAGE_KEYS.CALL_LOGS);
  },

  /**
   * Get call logs for a specific phone number
   */
  async getForContact(phoneNumber: string): Promise<CallUIData[]> {
    const allLogs = await this.load();
    return allLogs.filter(
      log => log.call?.to === phoneNumber || log.call?.from === phoneNumber
    );
  },
};

// ============================================
// USER STORAGE
// ============================================

export const UserStorage = {
  /**
   * Save user profile
   */
  async saveProfile(user: User): Promise<void> {
    await setItem(STORAGE_KEYS.USER_PROFILE, user);
  },

  /**
   * Load user profile
   */
  async loadProfile(): Promise<User | null> {
    return await getItem<User>(STORAGE_KEYS.USER_PROFILE);
  },

  /**
   * Update user balance
   */
  async updateBalance(userId: string, newBalance: number): Promise<void> {
    const user = await this.loadProfile();
    if (user && user.id === userId) {
      user.balance = newBalance;
      await this.saveProfile(user);
    }
  },

  /**
   * Get current user ID
   */
  async getCurrentUserId(): Promise<string | null> {
    return await getItem<string>(STORAGE_KEYS.CURRENT_USER_ID);
  },

  /**
   * Set current user ID
   */
  async setCurrentUserId(userId: string): Promise<void> {
    await setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  },

  /**
   * Clear user data
   */
  async clear(): Promise<void> {
    await removeItem(STORAGE_KEYS.USER_PROFILE);
    await removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  },
};

// ============================================
// AUTHENTICATION STORAGE (Secure)
// ============================================

export const AuthStorage = {
  /**
   * Store authentication token securely
   */
  async setAuthToken(token: string): Promise<void> {
    await setSecureItem(SECURE_KEYS.AUTH_TOKEN, token);
  },

  /**
   * Get authentication token
   */
  async getAuthToken(): Promise<string | null> {
    return await getSecureItem(SECURE_KEYS.AUTH_TOKEN);
  },

  /**
   * Store refresh token securely
   */
  async setRefreshToken(token: string): Promise<void> {
    await setSecureItem(SECURE_KEYS.REFRESH_TOKEN, token);
  },

  /**
   * Get refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    return await getSecureItem(SECURE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Store user ID securely
   */
  async setUserId(userId: string): Promise<void> {
    await setSecureItem(SECURE_KEYS.USER_ID, userId);
  },

  /**
   * Get user ID
   */
  async getUserId(): Promise<string | null> {
    return await getSecureItem(SECURE_KEYS.USER_ID);
  },

  /**
   * Check if user is authenticated (has valid token)
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken();
    return token !== null && token.length > 0;
  },

  /**
   * Clear all authentication data (logout)
   */
  async clearAuth(): Promise<void> {
    await removeSecureItem(SECURE_KEYS.AUTH_TOKEN);
    await removeSecureItem(SECURE_KEYS.REFRESH_TOKEN);
    await removeSecureItem(SECURE_KEYS.USER_ID);
    console.log('🔐 Cleared all authentication data');
  },
};

// ============================================
// THEME STORAGE (for compatibility with existing code)
// ============================================

export const ThemeStorage = {
  /**
   * Save theme preference
   */
  async save(theme: 'light' | 'dark' | 'auto'): Promise<void> {
    await setItem(STORAGE_KEYS.THEME, theme);
  },

  /**
   * Load theme preference
   */
  async load(): Promise<'light' | 'dark' | 'auto' | null> {
    return await getItem<'light' | 'dark' | 'auto'>(STORAGE_KEYS.THEME);
  },
};

// ============================================
// MIGRATION & INITIALIZATION
// ============================================

export const StorageService = {
  /**
   * Initialize storage - load all data on app startup
   */
  async initialize(): Promise<{
    contacts: Contact[];
    callLogs: CallUIData[];
    user: User | null;
    isAuthenticated: boolean;
  }> {
    console.log('🚀 Initializing storage...');

    const [contacts, callLogs, user, isAuthenticated] = await Promise.all([
      ContactStorage.load(),
      CallLogStorage.load(),
      UserStorage.loadProfile(),
      AuthStorage.isAuthenticated(),
    ]);

    console.log('✅ Storage initialized:', {
      contactsCount: contacts.length,
      callLogsCount: callLogs.length,
      hasUser: !!user,
      isAuthenticated,
    });

    return { contacts, callLogs, user, isAuthenticated };
  },

  /**
   * Clear all app data (for testing/logout)
   */
  async clearAllData(): Promise<void> {
    console.log('🗑️ Clearing all app data...');

    await Promise.all([
      ContactStorage.clear(),
      CallLogStorage.clear(),
      UserStorage.clear(),
      AuthStorage.clearAuth(),
    ]);

    console.log('✅ All app data cleared');
  },

  /**
   * Export all data (for backup/debugging)
   */
  async exportData(): Promise<{
    contacts: Contact[];
    callLogs: CallUIData[];
    user: User | null;
  }> {
    const [contacts, callLogs, user] = await Promise.all([
      ContactStorage.load(),
      CallLogStorage.load(),
      UserStorage.loadProfile(),
    ]);

    return { contacts, callLogs, user };
  },

  /**
   * Import data (for restore/testing)
   */
  async importData(data: {
    contacts?: Contact[];
    callLogs?: CallUIData[];
    user?: User;
  }): Promise<void> {
    console.log('📥 Importing data...');

    if (data.contacts) {
      await ContactStorage.save(data.contacts);
    }
    if (data.callLogs) {
      await CallLogStorage.save(data.callLogs);
    }
    if (data.user) {
      await UserStorage.saveProfile(data.user);
    }

    console.log('✅ Data imported successfully');
  },
};

// Export everything
export default {
  ContactStorage,
  CallLogStorage,
  UserStorage,
  AuthStorage,
  ThemeStorage,
  StorageService,
};
