/**
 * Province/District/Ward API Service
 * API calls for location data with caching
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildApiUrl, getUserCredentials } from '../utils/apiHelper';
import {
  GetProvincesResponse,
  GetLocationsResponse,
  ProvinceRaw,
  Province,
  Location,
} from '../types/province';

const PROVINCE_CACHE_KEY = '@provinces_cache';
const LOCATION_CACHE_PREFIX = '@location_cache_';

// In-memory cache for faster access
let memoryCache: Province[] | null = null;
const locationMemoryCache: Map<string, Location[]> = new Map();

/**
 * Parse and transform raw API data to clean app format
 */
const parseProvince = (raw: ProvinceRaw): Province => {
  return {
    MaDiaBan: raw.MaDiaBan || '',
    TenDiaBan: raw.TenDiaBan || '',
    MaDiaBanCha: raw.MaDiaBanCha || '',
  };
};

export const provinceService = {
  /**
   * Get list of provinces/cities with caching
   * Uses /gettinhthanh API (has "Tất cả" option with empty MaDiaBan)
   * API: /gettinhthanh?storeid=xxx
   */
  getProvinces: async (forceRefresh: boolean = false): Promise<GetProvincesResponse> => {
    try {
      const cacheKey = PROVINCE_CACHE_KEY;

      // Check memory cache
      if (!forceRefresh && memoryCache) {
        return {
          status: true,
          list: memoryCache,
        };
      }

      // Check AsyncStorage cache
      if (!forceRefresh) {
        const cachedData = await AsyncStorage.getItem(cacheKey);
        if (cachedData) {
          const parsedCache: Province[] = JSON.parse(cachedData);
          if (parsedCache && parsedCache.length > 0) {
            memoryCache = parsedCache;
            return {
              status: true,
              list: parsedCache,
            };
          }
        }
      }

      // Fetch from API
      const credentials = getUserCredentials();
      const url = buildApiUrl('/gettinhthanh', {
        storeid: credentials.storeid,
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const result = await response.json();

      // API returns array directly
      const rawList: ProvinceRaw[] = Array.isArray(result) ? result : [];

      // Parse raw data
      const parsedList: Province[] = rawList.map(parseProvince);

      // Save to both caches
      if (parsedList.length > 0) {
        memoryCache = parsedList;
        await AsyncStorage.setItem(cacheKey, JSON.stringify(parsedList));
      }

      return {
        status: true,
        list: parsedList,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Không thể tải danh sách tỉnh thành. Vui lòng thử lại.');
    }
  },

  /**
   * Clear province cache
   * Call this after login to refresh province data
   */
  clearCache: async (): Promise<void> => {
    try {
      memoryCache = null;
      await AsyncStorage.removeItem(PROVINCE_CACHE_KEY);
      console.log('🗑️ Province cache cleared');
    } catch (error) {
      // Silently fail on clear
    }
  },

  /**
   * Refresh provinces and update cache
   * Call this after login
   */
  refreshProvinces: async (): Promise<GetProvincesResponse> => {
    return provinceService.getProvinces(true);
  },

  /**
   * Get locations (District/Ward) by parent code
   * API: /getdiaban?storeid=xxx&macha=yyy
   * - parentCode: MaDiaBan of parent (empty string for provinces)
   * - Uses memory cache for faster access
   * - Uses AsyncStorage for persistent cache
   */
  getLocations: async (
    parentCode: string = '',
    forceRefresh: boolean = false
  ): Promise<GetLocationsResponse> => {
    try {
      const cacheKey = `${LOCATION_CACHE_PREFIX}${parentCode}`;
      // Check memory cache
      if (!forceRefresh && locationMemoryCache.has(cacheKey)) {
        const cached = locationMemoryCache.get(cacheKey)!;
        return {
          status: true,
          list: cached,
        };
      }

      // Check AsyncStorage cache
      if (!forceRefresh) {
        const cachedData = await AsyncStorage.getItem(cacheKey);
        if (cachedData) {
          const parsedCache: Location[] = JSON.parse(cachedData);
          if (parsedCache && parsedCache.length > 0) {
            locationMemoryCache.set(cacheKey, parsedCache);
            return {
              status: true,
              list: parsedCache,
            };
          }
        }
      }

      // Fetch from API
      const credentials = getUserCredentials();
      const url = buildApiUrl('/getdiaban', {
        storeid: credentials.storeid,
        macha: parentCode,
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      // API returns array directly
      const rawList: ProvinceRaw[] = Array.isArray(result) ? result : [];

      // Parse raw data
      const parsedList: Location[] = rawList.map(parseProvince);

      // Save to both caches
      if (parsedList.length > 0) {
        locationMemoryCache.set(cacheKey, parsedList);
        await AsyncStorage.setItem(cacheKey, JSON.stringify(parsedList));
      }

      return {
        status: true,
        list: parsedList,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Không thể tải danh sách địa điểm. Vui lòng thử lại.');
    }
  },

  /**
   * Clear all location caches (including provinces, districts, wards)
   */
  clearAllCaches: async (): Promise<void> => {
    try {
      // Clear memory caches
      memoryCache = null;
      locationMemoryCache.clear();

      // Clear AsyncStorage - get all keys and remove location caches
      const allKeys = await AsyncStorage.getAllKeys();
      const locationKeys = allKeys.filter(
        (key) => key.startsWith(LOCATION_CACHE_PREFIX) || key === PROVINCE_CACHE_KEY
      );
      await AsyncStorage.multiRemove(locationKeys);
    } catch (error) {
      // Silently fail on clear
    }
  },
};
