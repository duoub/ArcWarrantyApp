/**
 * Storage Utility
 * Simple wrapper for react-native-mmkv with error handling
 */

import { createMMKV } from 'react-native-mmkv';

// Create storage instance
export const storage = createMMKV({
  id: 'akito-warranty-app',
});

// Type-safe storage helpers
export const StorageKeys = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  BIOMETRIC_ENABLED: 'biometric_enabled',
} as const;
