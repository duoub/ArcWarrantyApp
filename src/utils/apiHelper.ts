/**
 * API Helper Utilities
 * Common helpers for API calls
 */

import { storage, StorageKeys } from './storage';
import { API_CONFIG } from '../config/constants';

/**
 * Get user credentials from storage for API calls
 */
export const getUserCredentials = () => {
  try {
    const userData = storage.getString(StorageKeys.USER_DATA);
    if (!userData) {
      throw new Error('User not authenticated');
    }
    const user = JSON.parse(userData);
    return {
      storeid: API_CONFIG.STORE_ID,
      username: user.username,
      userid: user.username,
    };
  } catch (error) {
    throw new Error('Failed to get user credentials');
  }
};

/**
 * Build API URL with query parameters
 * @param endpoint - API endpoint path
 * @param params - Query parameters
 * @param baseUrl - Optional base URL (defaults to API_CONFIG.BASE_URL)
 */
export const buildApiUrl = (
  endpoint: string,
  params?: Record<string, string | number | boolean>,
  baseUrl?: string
): string => {
  const url = `${baseUrl || API_CONFIG.BASE_URL}${endpoint}`;

  if (!params || Object.keys(params).length === 0) {
    return url;
  }

  const queryString = new URLSearchParams(
    Object.entries(params).reduce((acc, [key, value]) => {
      acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  return `${url}?${queryString}`;
};

/**
 * Build Tracking API URL with query parameters
 */
export const buildTrackingApiUrl = (
  endpoint: string,
  params?: Record<string, string | number | boolean>
): string => {
  return buildApiUrl(endpoint, params, API_CONFIG.TRACKING_BASE_URL);
};

/**
 * Common fetch wrapper with error handling
 */
export const apiFetch = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};
