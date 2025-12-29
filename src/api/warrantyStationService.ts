/**
 * Warranty Station API Service
 * API calls for warranty station list and management
 */

import { buildApiUrl, getUserCredentials } from '../utils/apiHelper';
import {
  GetWarrantyStationsRequest,
  GetWarrantyStationsResponse,
  WarrantyStationRaw,
  WarrantyStation,
} from '../types/warrantyStation';
import { API_CONFIG } from '../config/constants';

/**
 * Parse and transform raw API data to clean app format
 */
const parseWarrantyStation = (raw: WarrantyStationRaw): WarrantyStation => {
  return {
    id: raw.id,
    TenTram: raw.TenTram || '',
    SoDienThoai: raw.SoDienThoai || '',
    DiaChi: raw.DiaChi || '',
    TinhThanh: raw.TinhThanh || '',
  };
};

export const warrantyStationService = {
  /**
   * Get list of warranty stations
   * API: /getlisttram?storeid=xxx&page=1&tentinhthanh=xxx&keyword=
   */
  getWarrantyStations: async (
    params: GetWarrantyStationsRequest
  ): Promise<GetWarrantyStationsResponse> => {
    try {
      // const credentials = getUserCredentials();
      const { page, tentinhthanh, keyword = '' } = params;

      // Build API URL with query params
      const url = buildApiUrl('/getlisttram', {
        storeid: API_CONFIG.STORE_ID,
        page: page,
        tentinhthanh: tentinhthanh,
        keyword: keyword,
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      // API doesn't return status field, check if we have data
      const hasData = result.list !== undefined;

      if (!hasData && result.message) {
        throw new Error(result.message);
      }

      // Parse raw data to clean format
      const parsedList: WarrantyStation[] = (result.list || []).map(
        parseWarrantyStation
      );

      return {
        status: true,
        list: parsedList,
        count: result.count || 0,
        nextpage: result.nextpage || false,
        message: result.message,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  },
};
