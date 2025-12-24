/**
 * Province API Service
 * API calls for province/city list with caching
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildApiUrl, getUserCredentials } from '../utils/apiHelper';
import {
  GetProvincesResponse,
  ProvinceRaw,
  Province,
} from '../types/province';

const PROVINCE_CACHE_KEY = '@provinces_cache';

// In-memory cache for faster access
let memoryCache: Province[] | null = null;

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
   * API: /gettinhthanh?storeid=xxx
   * - First checks memory cache
   * - Then checks AsyncStorage cache
   * - Finally fetches from API if no cache available
   */
  getProvinces: async (forceRefresh: boolean = false): Promise<GetProvincesResponse> => {
    try {
      // Return memory cache if available and not forcing refresh
      if (!forceRefresh && memoryCache && memoryCache.length > 0) {
        console.log('🌍 Using memory cached provinces:', memoryCache.length);
        return {
          status: true,
          list: memoryCache,
        };
      }

      // Check AsyncStorage cache if not forcing refresh
      if (!forceRefresh) {
        const cachedData = await AsyncStorage.getItem(PROVINCE_CACHE_KEY);
        if (cachedData) {
          const parsedCache: Province[] = JSON.parse(cachedData);
          if (parsedCache && parsedCache.length > 0) {
            console.log('🌍 Using AsyncStorage cached provinces:', parsedCache.length);
            // Update memory cache
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

      console.log('🌍 Fetching provinces from API:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      console.log('🌍 Provinces API response:', {
        isArray: Array.isArray(result),
        length: result?.length,
        firstItem: result?.[0],
      });

      // API returns array directly, not wrapped in object
      const rawList: ProvinceRaw[] = Array.isArray(result) ? result : [];

      // Parse raw data to clean format
      const parsedList: Province[] = rawList.map(parseProvince);

      console.log('✅ Parsed provinces count:', parsedList.length);

      // Save to both memory and AsyncStorage cache
      if (parsedList.length > 0) {
        memoryCache = parsedList;
        await AsyncStorage.setItem(PROVINCE_CACHE_KEY, JSON.stringify(parsedList));
        console.log('💾 Provinces cached successfully');
      }

      return {
        status: true,
        list: parsedList,
      };
    } catch (error) {
      console.error('❌ Provinces fetch error:', error);
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
      console.error('❌ Failed to clear province cache:', error);
    }
  },

  /**
   * Refresh provinces and update cache
   * Call this after login
   */
  refreshProvinces: async (): Promise<GetProvincesResponse> => {
    console.log('🔄 Refreshing provinces...');
    return provinceService.getProvinces(true);
  },
};
