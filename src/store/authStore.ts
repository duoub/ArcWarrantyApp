/**
 * Authentication Store - Zustand
 * Global state management for auth
 */

import { create } from 'zustand';
import { User } from '../types/auth';
import { storage, StorageKeys } from '../utils/storage';
import { authService } from '../api/authService';

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  initialize: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial State
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Setters
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => set({ token }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Login - Save token and user to storage
  login: (token, user) => {
    storage.set(StorageKeys.AUTH_TOKEN, token);
    storage.set(StorageKeys.USER_DATA, JSON.stringify(user));
    set({
      token,
      user,
      isAuthenticated: true,
      error: null,
    });
  },

  // Logout - Clear storage and state
  logout: async () => {
    try {
      // Call logout API
      await authService.logout();
    } catch (error) {
      // Continue logout even if API fails
      console.error('Logout API error:', error);
    } finally {
      // Clear storage
      storage.delete(StorageKeys.AUTH_TOKEN);
      storage.delete(StorageKeys.USER_DATA);

      // Clear state
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  // Initialize - Load auth state from storage on app start
  initialize: () => {
    try {
      const token = storage.getString(StorageKeys.AUTH_TOKEN);
      const userData = storage.getString(StorageKeys.USER_DATA);

      if (token && userData) {
        const user = JSON.parse(userData) as User;
        set({
          token,
          user,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      // Clear invalid storage
      storage.delete(StorageKeys.AUTH_TOKEN);
      storage.delete(StorageKeys.USER_DATA);
    }
  },
}));
